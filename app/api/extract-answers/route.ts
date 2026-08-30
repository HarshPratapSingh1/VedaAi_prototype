import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/groq";
import type { AnswerBlock } from "@/lib/types";

const PROMPT = `You are analyzing ONE PAGE of a STUDENT'S HANDWRITTEN ANSWER SHEET (image provided).

Find every distinct answer block written by the student on THIS PAGE and transcribe it, PLUS locate exactly where it is.

Rules:
- A "block" is a contiguous chunk of handwriting that answers one question (or one sub-part).
- "detectedLabel": look for any number/label the student wrote near the answer (e.g. "Q3", "11(a)", "Ans 2", "4."). If you cannot find any label near a block, set this to null — do not guess.
- "text": transcribe the handwriting as accurately as possible. If illegible, write your best guess and prefix with "[illegible?] ".
- "boundingBox": the tight rectangle around ONLY that answer block's handwriting, normalized to a 0-1000 scale where (0,0) is the top-left corner of the image and (1000,1000) is the bottom-right corner. Format: yMin, xMin, yMax, xMax.
- Include blocks even if you can't match them to a label — mark detectedLabel as null. Do not skip messy or crossed-out content.
- Do not merge unrelated answers into a single block just because they're close together.
- If there are no answers on this page, return an empty array.

Return ONLY valid JSON matching exactly this shape, no markdown fences, no commentary:
{
  "answerBlocks": [
    {
      "id": "string, short unique slug like a1, a2",
      "detectedLabel": "string or null",
      "text": "string, transcribed handwriting",
      "boundingBox": { "yMin": 0, "xMin": 0, "yMax": 0, "xMax": 0 }
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType, pageNumber } = await req.json();
    if (!base64 || !mimeType) {
      return NextResponse.json(
        { error: "Missing file data" },
        { status: 400 }
      );
    }

    const result = await generateJSON<{
      answerBlocks: Omit<AnswerBlock, "pageNumber">[];
    }>({
      prompt: PROMPT,
      image: { base64, mimeType },
    });

    const answerBlocks: AnswerBlock[] = (result.answerBlocks ?? []).map(
      (a) => ({
        ...a,
        pageNumber: pageNumber ?? 1,
      })
    );

    return NextResponse.json({ answerBlocks });
  } catch (err: any) {
    console.error("extract-answers error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to extract answers" },
      { status: 500 }
    );
  }
}