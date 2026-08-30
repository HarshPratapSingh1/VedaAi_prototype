# AssessAI — Question & Answer Mapper

Upload a question paper and a student's handwritten answer sheet. The app extracts
every question (including labelled sub-parts like 11(a)/11(b)), transcribes the
student's handwritten answers, maps each answer to its question, highlights the
exact answer region on the sheet when a question is clicked, and optionally grades
each answer with AI feedback.

## Approach

- **Stack:** Next.js 15 (App Router) + TypeScript, no database — everything lives in
  React state for the session (in-memory per the assignment's constraints).
- **AI model:** Groq's free tier, using `qwen/qwen3.6-27b` (Groq's current
  vision-capable model, served in preview). No credit card required for the
  free tier — this was chosen specifically to avoid billing/card requirements.
  Used for four structured-JSON calls:
  1. **Question extraction** — runs once per page of the question paper (Groq's
     vision endpoint takes images, not raw PDFs, so PDF pages are rasterized
     client-side first via `pdf.js`). Returns each question/sub-part in printed
     order for that page; results are merged client-side across pages.
  2. **Answer extraction** — same per-page approach on the answer sheet. Returns
     each answer block's transcribed text, any label the student wrote, and a
     bounding box normalized to a 0–1000 scale per page.
  3. **Answer mapping** — a text-only reasoning call that matches answer blocks to
     questions by label first, falling back to content similarity, and flags
     unanswered questions and orphaned answer blocks.
  4. **Grading (optional)** — a fourth call scores each answer and returns
     structured feedback.
- **Highlighting:** the uploaded PDF/image pages are rasterized client-side with
  `pdf.js` purely for display. The bounding boxes returned by the model (0–1000
  normalized per page) are converted straight to CSS percentages and drawn as an
  absolutely positioned overlay `<div>` on top of the page image.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then paste your Groq API key
npm run dev
```

Get a free Groq API key (no card required) at https://console.groq.com/keys.

## Assumptions & limitations

- `qwen/qwen3.6-27b` is Groq's vision model as of writing but is served as a
  "preview" model — Groq's multimodal lineup changes fairly often. If extraction
  calls start failing, check https://console.groq.com/docs/vision for the current
  model id and update `VISION_MODEL` in `lib/groq.ts`.
- Extraction runs one page at a time (Groq's vision endpoint takes images, not
  PDFs, and caps image count per request), so a paper with many pages means more
  API calls — free-tier rate limits (requests/minute) may need a short pause
  between very large documents.
- Answer-to-question matching relies on the student having written some
  identifiable numbering near their answer; when no label exists at all, the model
  falls back to content similarity, which is inherently less reliable and is
  surfaced to the teacher via a "medium/low confidence" note rather than hidden.
- Bounding-box highlighting is generally accurate but not pixel-perfect on real
  photographed handwriting (as opposed to clean, typed/scanned documents) — general
  vision-language models are inherently less precise at spatial grounding than a
  purpose-built OCR/detection pipeline would be. The prompt explicitly instructs
  the model to hug the ink tightly, but on uneven, tilted, or unevenly-lit photos
  the highlighted region can be slightly offset from the exact line.
- Grading assumes a default of 5 marks per question when the paper doesn't specify
  marks — this is clearly a placeholder heuristic, not a real rubric.
- No authentication, no persistence — refreshing the page clears the session, per
  the assignment's "in-memory storage is sufficient" constraint.