import { NextRequest, NextResponse } from "next/server";
// import { generateJSON } from "@/lib/gemini";
import { generateJSON } from "@/lib/groq";
import type { Question, AnswerBlock, MappingEntry } from "@/lib/types";

function buildPrompt(questions: Question[], answerBlocks: AnswerBlock[]) {
  return `You are matching a student's handwritten answer blocks to the correct questions from a question paper.

QUESTIONS (in printed order):
${JSON.stringify(
    questions.map((q) => ({
      id: q.id,
      displayLabel: q.displayLabel,
      text: q.text.slice(0, 300),
    })),
    null,
    2
  )}

ANSWER BLOCKS (extracted from the student's answer sheet, in the order they were found):
${JSON.stringify(
    answerBlocks.map((a) => ({
      id: a.id,
      detectedLabel: a.detectedLabel,
      text: a.text.slice(0, 300),
      pageNumber: a.pageNumber,
    })),
    null,
    2
  )}

Task:
- For EVERY question in the list, decide which answer block(s) correspond to it. Match primarily on detectedLabel (e.g. "11(a)" should match question displayLabel "11 (a)"), and fall back to matching on content/topic similarity when labels are missing, ambiguous, or the student numbered things inconsistently.
- A question can map to zero answer blocks (student left it unanswered), one block, or multiple blocks (answer spans multiple pages/blocks).
- Students sometimes answer out of the printed order — that's fine, still match by label/content, not by position.
- Any answer block that does not clearly correspond to any question in the list should still be accounted for: you don't need a mapping entry for it, but do not force it onto a question it doesn't match. Set confidence "low" and add a note if you're unsure, and prefer leaving a question unanswered over guessing wrongly.
- confidence should be "high" when the label matches exactly, "medium" when matched by content only, "low" when uncertain.

Return ONLY valid JSON matching exactly this shape, no markdown fences, no commentary:
{
  "mapping": [
    {
      "questionId": "string, must be one of the question ids above",
      "answerBlockIds": ["array of answer block ids, can be empty"],
      "confidence": "high | medium | low",
      "note": "string or omit"
    }
  ],
  "unmatchedAnswerBlockIds": ["array of answer block ids that don't correspond to any question"]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { questions, answerBlocks } = (await req.json()) as {
      questions: Question[];
      answerBlocks: AnswerBlock[];
    };

    if (!questions?.length) {
      return NextResponse.json(
        { error: "Missing questions" },
        { status: 400 }
      );
    }

    const result = await generateJSON<{
      mapping: MappingEntry[];
      unmatchedAnswerBlockIds: string[];
    }>({
      prompt: buildPrompt(questions, answerBlocks ?? []),
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("map-answers error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to map answers" },
      { status: 500 }
    );
  }
}
