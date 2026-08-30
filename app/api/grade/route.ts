import { NextRequest, NextResponse } from "next/server";
// import { generateJSON } from "@/lib/gemini";
import { generateJSON } from "@/lib/groq";
import type { Question, AnswerBlock, MappingEntry, GradeEntry } from "@/lib/types";

function buildPrompt(
  questions: Question[],
  answerBlocks: AnswerBlock[],
  mapping: MappingEntry[]
) {
  const items = questions.map((q) => {
    const m = mapping.find((mm) => mm.questionId === q.id);
    const answerText = (m?.answerBlockIds ?? [])
      .map((id) => answerBlocks.find((a) => a.id === id)?.text)
      .filter(Boolean)
      .join("\n");
    return {
      questionId: q.id,
      displayLabel: q.displayLabel,
      questionText: q.text,
      studentAnswer: answerText || "(no answer found)",
    };
  });

  return `You are a teacher grading student answers. For each question below, assess the student's answer against the question. Assume a default max of 5 marks per question unless the question text implies otherwise. If there is no answer, marks = 0 and isCorrect = false.

ITEMS:
${JSON.stringify(items, null, 2)}

Return ONLY valid JSON, no markdown fences, no commentary:
{
  "grades": [
    {
      "questionId": "string",
      "marks": 0,
      "maxMarks": 5,
      "isCorrect": true,
      "feedback": "string, 1-2 sentences, specific and constructive"
    }
  ]
}
isCorrect can be true, false, or the string "partial".`;
}

export async function POST(req: NextRequest) {
  try {
    const { questions, answerBlocks, mapping } = (await req.json()) as {
      questions: Question[];
      answerBlocks: AnswerBlock[];
      mapping: MappingEntry[];
    };

    const result = await generateJSON<{ grades: GradeEntry[] }>({
      prompt: buildPrompt(questions, answerBlocks ?? [], mapping ?? []),
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("grade error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to grade" },
      { status: 500 }
    );
  }
}
