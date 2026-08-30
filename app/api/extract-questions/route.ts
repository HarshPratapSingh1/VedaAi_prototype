import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/groq";
import type { Question } from "@/lib/types";

const PROMPT = `You are analyzing ONE PAGE of a QUESTION PAPER (image provided).

Extract every question printed on THIS PAGE, in the exact order they appear. Rules:
- If a question has labelled sub-parts (e.g. "11 (a)", "11 (b)", "Q3 i)", "Q3 ii)"), treat EACH sub-part as its own separate entry. Do not merge sub-parts into one question.
- Preserve the original printed numbering exactly as written (e.g. "11", "Q3", "3", "iv").
- "text" should be the full question text for that entry (excluding the number/label itself).
- If a question visibly continues onto the next page (cut off at the bottom), still capture what's on this page as a complete entry.
- Do not invent questions that aren't in the image. Do not skip any. If there are no questions on this page, return an empty array.

Return ONLY valid JSON matching exactly this shape, no markdown fences, no commentary:
{
  "questions": [
    {
      "id": "string, a short unique slug like q1 or q11a",
      "number": "string, the base printed number e.g. '11'",
      "subpart": "string or null, e.g. 'a'",
      "displayLabel": "string, human readable e.g. '11 (a)'",
      "text": "string, the question text"
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

    const result = await generateJSON<{ questions: Omit<Question, "pageNumber">[] }>({
      prompt: PROMPT,
      image: { base64, mimeType },
    });

    const questions: Question[] = (result.questions ?? []).map((q) => ({
      ...q,
      pageNumber: pageNumber ?? 1,
    }));

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error("extract-questions error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to extract questions" },
      { status: 500 }
    );
  }
}