export type Question = {
  id: string; // e.g. "q11a"
  number: string; // printed label, e.g. "11"
  subpart?: string; // e.g. "a"
  displayLabel: string; // e.g. "11 (a)"
  text: string;
  pageNumber: number; // 1-indexed, page in question paper
};

export type BoundingBox = {
  // normalized 0-1000 scale (Gemini convention), [ymin, xmin, ymax, xmax]
  yMin: number;
  xMin: number;
  yMax: number;
  xMax: number;
};

export type AnswerBlock = {
  id: string; // e.g. "a1"
  detectedLabel: string | null; // what the student wrote, e.g. "Q3", "11(a)", or null if no label found
  text: string; // transcribed handwritten text
  pageNumber: number; // 1-indexed, page in answer sheet
  boundingBox: BoundingBox;
};

export type MappingEntry = {
  questionId: string | null; // null if this answer block matches no known question
  answerBlockIds: string[]; // can be multiple (answer spans blocks/pages), empty if unanswered
  confidence: "high" | "medium" | "low";
  note?: string; // e.g. "answered out of order", "no matching question found"
};

export type GradeEntry = {
  questionId: string;
  marks: number;
  maxMarks: number;
  isCorrect: boolean | "partial";
  feedback: string;
};

export type ExtractionResult = {
  questions: Question[];
  answerBlocks: AnswerBlock[];
  mapping: MappingEntry[];
};
