# AssessAI — Question & Answer Mapper

Upload a question paper and a student's handwritten answer sheet. The app extracts
every question (including labelled sub-parts like 11(a)/11(b)), transcribes the
student's handwritten answers, maps each answer to its question, highlights the
exact answer region on the sheet when a question is clicked, and optionally grades
each answer with AI feedback.

## Approach

- **Stack:** Next.js 15 (App Router) + TypeScript, no database — everything lives in
  React state for the session (in-memory per the assignment's constraints).
- **AI model:** Google Gemini 2.0 Flash (`gemini-2.0-flash`), used for three
  separate structured-JSON calls:
  1. **Question extraction** — reads the question paper (PDF/image sent directly,
     no OCR pre-processing needed) and returns each question/sub-part in printed
     order.
  2. **Answer extraction** — reads the handwritten answer sheet and returns each
     answer block's transcribed text, any label the student wrote, and a bounding
     box normalized to a 0–1000 scale per page.
  3. **Answer mapping** — a text-only reasoning call that matches answer blocks to
     questions by label first, falling back to content similarity, and flags
     unanswered questions and orphaned answer blocks.
  4. **Grading (optional)** — a fourth call scores each answer and returns
     structured feedback.
- **Highlighting:** the answer sheet's PDF pages are rasterized client-side with
  `pdf.js` purely for display. The bounding boxes returned by Gemini (0–1000
  normalized) are converted straight to CSS percentages and drawn as an absolutely
  positioned overlay `<div>` on top of the page image — no separate OCR/vision
  library needed for localization.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then paste your Gemini API key
npm run dev
```

Get a free Gemini API key at https://aistudio.google.com/apikey (no card required).

## Assumptions & limitations

- Assumes each question paper page and answer sheet page fits in a single Gemini
  vision call (works well for typical multi-page A4 scans; extremely long papers
  may need chunking).
- Answer-to-question matching relies on the student having written some
  identifiable numbering near their answer; when no label exists at all, the model
  falls back to content similarity, which is inherently less reliable and is
  surfaced to the teacher via a "medium/low confidence" note rather than hidden.
- Grading assumes a default of 5 marks per question when the paper doesn't specify
  marks — this is clearly a placeholder heuristic, not a real rubric.
- No authentication, no persistence — refreshing the page clears the session, per
  the assignment's "in-memory storage is sufficient" constraint.
