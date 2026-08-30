"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import UploadCard from "@/components/UploadCard";
import QuestionList from "@/components/QuestionList";
import AnswerSheetViewer from "@/components/AnswerSheetViewer";
import { TeacherIllustration, ExtractingScreen } from "@/components/Illustrations";
import { fileToPageImages, PageImage } from "@/lib/file-client-utils";
import type {
  Question,
  AnswerBlock,
  MappingEntry,
  GradeEntry,
} from "@/lib/types";

type Stage = "idle" | "processing" | "done" | "error";

export default function Home() {
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [questionPageCount, setQuestionPageCount] = useState<number | undefined>();
  const [answerPageCount, setAnswerPageCount] = useState<number | undefined>();

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerBlocks, setAnswerBlocks] = useState<AnswerBlock[]>([]);
  const [mapping, setMapping] = useState<MappingEntry[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [answerPages, setAnswerPages] = useState<PageImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"questions" | "answer">("questions");

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const canProcess = questionFile && answerFile && stage !== "processing";

  async function postJSON<T>(url: string, body: any): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Request to ${url} failed`);
    return data;
  }

  async function handleQuestionFile(f: File) {
    setQuestionFile(f);
    setQuestionPageCount(f.type === "application/pdf" ? (await fileToPageImages(f)).length : 1);
  }

  async function handleAnswerFile(f: File) {
    setAnswerFile(f);
    setAnswerPageCount(f.type === "application/pdf" ? (await fileToPageImages(f)).length : 1);
  }

  async function handleProcess() {
    if (!questionFile || !answerFile) return;
    setStage("processing");
    setError(null);

    try {
      const [qPages, aPages] = await Promise.all([
        fileToPageImages(questionFile),
        fileToPageImages(answerFile),
      ]);
      setAnswerPages(aPages);

      const allQuestions: Question[] = [];
      for (const page of qPages) {
        const base64 = page.dataUrl.split(",")[1];
        const result = await postJSON<{ questions: Question[] }>(
          "/api/extract-questions",
          { base64, mimeType: "image/png", pageNumber: page.pageNumber }
        );
        allQuestions.push(...result.questions);
      }
      setQuestions(allQuestions);

      const allAnswerBlocks: AnswerBlock[] = [];
      for (const page of aPages) {
        const base64 = page.dataUrl.split(",")[1];
        const result = await postJSON<{ answerBlocks: AnswerBlock[] }>(
          "/api/extract-answers",
          { base64, mimeType: "image/png", pageNumber: page.pageNumber }
        );
        allAnswerBlocks.push(...result.answerBlocks);
      }
      setAnswerBlocks(allAnswerBlocks);

      const mResult = await postJSON<{ mapping: MappingEntry[] }>(
        "/api/map-answers",
        { questions: allQuestions, answerBlocks: allAnswerBlocks }
      );
      setMapping(mResult.mapping);

      try {
        const gResult = await postJSON<{ grades: GradeEntry[] }>(
          "/api/grade",
          {
            questions: allQuestions,
            answerBlocks: allAnswerBlocks,
            mapping: mResult.mapping,
          }
        );
        setGrades(gResult.grades);
      } catch {
        setGrades([]);
      }

      setSelectedId(allQuestions[0]?.id ?? null);
      setStage("done");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setStage("error");
    }
  }

  function handleReset() {
    setStage("idle");
    setQuestionFile(null);
    setAnswerFile(null);
    setQuestionPageCount(undefined);
    setAnswerPageCount(undefined);
    setQuestions([]);
    setAnswerBlocks([]);
    setMapping([]);
    setGrades([]);
    setAnswerPages([]);
    setError(null);
  }

  const selectedMapping = mapping.find((m) => m.questionId === selectedId);
  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null;
  const highlightedBlocks = answerBlocks.filter((b) =>
    selectedMapping?.answerBlockIds.includes(b.id)
  );

  const showSidebarExpanded = stage === "idle" || stage === "error";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {!isMobile && <Sidebar collapsed={!showSidebarExpanded} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar onReset={stage === "done" ? handleReset : undefined} />

        <main style={{ flex: 1, padding: isMobile ? "0" : "40px 40px 60px", display: "flex", flexDirection: "column" }}>
          {(stage === "idle" || stage === "error") && (
            <div style={{ maxWidth: 720, margin: "20px auto 0", textAlign: "center", padding: isMobile ? "24px 20px" : 0, width: "100%" }}>
              <h1 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                Upload{" "}
                <span style={{ background: "var(--orange-soft)", color: "var(--orange)", padding: "2px 10px", borderRadius: 6 }}>
                  Question Paper &amp; Answer Sheets
                </span>
              </h1>
              <p style={{ color: "var(--ink-soft)", fontSize: 15.5, marginTop: 14 }}>
                Upload both files to get started
              </p>

              <div style={{ margin: "28px 0" }}>
                <TeacherIllustration />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 18,
                  marginBottom: 28,
                }}
              >
                <UploadCard
                  label="Question Paper"
                  file={questionFile}
                  onFile={handleQuestionFile}
                  pageCount={questionPageCount}
                />
                <UploadCard
                  label="Answer Sheet"
                  file={answerFile}
                  onFile={handleAnswerFile}
                  pageCount={answerPageCount}
                />
              </div>

              <button
                onClick={handleProcess}
                disabled={!canProcess}
                style={{
                  background: canProcess ? "var(--dark)" : "#d8d8dc",
                  color: "#fff",
                  border: "none",
                  padding: "13px 30px",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canProcess ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Start Mapping
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 16 }}>
                Once both files are uploaded, you&apos;ll able to map answers with questions
              </p>

              {stage === "error" && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 14,
                    borderRadius: 10,
                    background: "var(--red-bg)",
                    color: "var(--red-text)",
                    fontSize: 13.5,
                    textAlign: "left",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {stage === "processing" && <ExtractingScreen />}

          {stage === "done" && (
            <>
              {isMobile && (
                <div style={{ display: "flex", padding: "16px 20px 0" }}>
                  <div style={{ display: "flex", background: "var(--bg)", borderRadius: 999, padding: 4, width: "100%" }}>
                    {(["questions", "answer"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setMobileTab(tab)}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: 999,
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 13.5,
                          background: mobileTab === tab ? "var(--dark)" : "transparent",
                          color: mobileTab === tab ? "#fff" : "var(--ink-soft)",
                        }}
                      >
                        {tab === "questions" ? "Questions" : "Answer Sheet"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="results-grid" style={{ padding: isMobile ? "16px 20px 40px" : 0 }}>
                {(!isMobile || mobileTab === "questions") && (
                  <div>
                    {!isMobile && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                          Extracted Questions (from question paper)
                        </span>
                        <span style={{ color: "var(--orange)", fontWeight: 600, fontSize: 13.5, cursor: "default" }}>
                          Expand All
                        </span>
                      </div>
                    )}
                    <QuestionList
                      questions={questions}
                      mapping={mapping}
                      grades={grades}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </div>
                )}

                {(!isMobile || mobileTab === "answer") && (
                  <AnswerSheetViewer
                    pages={answerPages}
                    highlightedBlocks={highlightedBlocks}
                    activeQuestion={selectedQuestion}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
