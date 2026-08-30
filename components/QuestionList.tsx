"use client";

import { useState } from "react";
import type { Question, MappingEntry, GradeEntry } from "@/lib/types";

function scoreStyle(grade: GradeEntry | undefined) {
  if (!grade) return { bg: "var(--bg)", text: "var(--ink-soft)" };
  const ratio = grade.maxMarks > 0 ? grade.marks / grade.maxMarks : 0;
  if (ratio >= 0.75) return { bg: "var(--green-bg)", text: "var(--green-text)" };
  if (ratio <= 0.25) return { bg: "var(--red-bg)", text: "var(--red-text)" };
  return { bg: "var(--amber-bg)", text: "var(--amber-text)" };
}

export default function QuestionList({
  questions,
  mapping,
  grades,
  selectedId,
  onSelect,
}: {
  questions: Question[];
  mapping: MappingEntry[];
  grades: GradeEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    onSelect(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {questions.map((q) => {
        const m = mapping.find((mm) => mm.questionId === q.id);
        const grade = grades.find((g) => g.questionId === q.id);
        const isExpanded = expanded.has(q.id);
        const isSelected = selectedId === q.id;
        const { bg, text } = scoreStyle(grade);
        const scoreLabel = grade ? `${grade.marks}/${grade.maxMarks}` : m?.answerBlockIds.length ? "—" : "0/0";

        return (
          <div
            key={q.id}
            style={{
              border: `1.5px solid ${isSelected ? "var(--orange)" : "var(--border)"}`,
              borderRadius: 12,
              background: "var(--surface)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => toggle(q.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isSelected ? "var(--orange)" : "#e9e9ec",
                  color: isSelected ? "#fff" : "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {q.subpart ? q.number : q.displayLabel.replace(/\.$/, "")}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, lineHeight: 1.4 }}>{q.text}</div>
                {!grade && (
                  <div style={{ fontSize: 11.5, color: m?.answerBlockIds.length ? "var(--green-text)" : "var(--red-text)", marginTop: 4, fontWeight: 600 }}>
                    {m?.answerBlockIds.length ? "Answered" : "Unanswered"}
                  </div>
                )}
              </div>

              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: bg,
                  color: text,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {scoreLabel}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  flexShrink: 0,
                  marginTop: 4,
                  transform: isExpanded ? "rotate(180deg)" : "none",
                  transition: "transform 120ms ease",
                  color: "var(--ink-soft)",
                }}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isExpanded && (
              <div style={{ padding: "0 16px 16px 54px", display: "flex", flexDirection: "column", gap: 10 }}>
                {m?.note && (
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{m.note}</div>
                )}
                {grade && (
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>AI Feedback</div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                      {grade.feedback}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
