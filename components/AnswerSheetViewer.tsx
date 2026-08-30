"use client";

import { useEffect, useRef, useState } from "react";
import type { PageImage } from "@/lib/file-client-utils";
import type { AnswerBlock, Question } from "@/lib/types";

export default function AnswerSheetViewer({
  pages,
  highlightedBlocks,
  activeQuestion,
}: {
  pages: PageImage[];
  highlightedBlocks: AnswerBlock[];
  activeQuestion: Question | null;
}) {
  const [zoom, setZoom] = useState(100);
  const [pageIndex, setPageIndex] = useState(0);
  const activeRef = useRef<HTMLDivElement>(null);

  // Jump to the page containing the first highlighted block whenever the
  // selected question changes.
  useEffect(() => {
    if (highlightedBlocks.length && pages.length) {
      const target = pages.findIndex((p) => p.pageNumber === highlightedBlocks[0].pageNumber);
      if (target >= 0) setPageIndex(target);
    }
  }, [highlightedBlocks, pages]);

  useEffect(() => {
    const t = setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => clearTimeout(t);
  }, [pageIndex, highlightedBlocks]);

  if (!pages.length) return null;
  const page = pages[pageIndex];
  const blocksOnPage = highlightedBlocks.filter((b) => b.pageNumber === page.pageNumber);
  const label = activeQuestion ? activeQuestion.displayLabel.split(" ")[0].replace(/[().]/g, "") : null;

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div
        style={{
          background: "var(--dark)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>Answer Sheet</span>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#2b2b2e", borderRadius: 999, padding: "5px 10px" }}>
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} style={zoomBtnStyle}>
              −
            </button>
            <span style={{ fontSize: 12.5, minWidth: 36, textAlign: "center" }}>{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} style={zoomBtnStyle}>
              +
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#2b2b2e", borderRadius: 999, padding: "5px 12px" }}>
            <button
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              style={{ ...zoomBtnStyle, opacity: pageIndex === 0 ? 0.4 : 1 }}
            >
              ‹
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
              Page {pageIndex + 1} of {pages.length}
            </span>
            <button
              onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
              disabled={pageIndex === pages.length - 1}
              style={{ ...zoomBtnStyle, opacity: pageIndex === pages.length - 1 ? 0.4 : 1 }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "#efefef", padding: 20, overflow: "auto", maxHeight: "78vh" }}>
        <div
          style={{
            width: `${zoom}%`,
            margin: "0 auto",
            position: "relative",
            background: "#fff",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <img src={page.dataUrl} alt={`Answer sheet page ${page.pageNumber}`} style={{ display: "block", width: "100%", height: "auto" }} />

          {blocksOnPage.map((b) => {
            const { yMin, xMin, yMax, xMax } = b.boundingBox;
            return (
              <div
                key={b.id}
                ref={activeRef}
                title={b.text}
                style={{
                  position: "absolute",
                  top: `${yMin / 10}%`,
                  left: `${xMin / 10}%`,
                  width: `${(xMax - xMin) / 10}%`,
                  height: `${(yMax - yMin) / 10}%`,
                }}
              >
                {label && (
                  <span
                    style={{
                      position: "absolute",
                      top: -22,
                      left: -2,
                      background: "#1f8a3d",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "2.5px solid #1f8a3d",
                    borderRadius: 6,
                    background: "rgba(31, 138, 61, 0.08)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const zoomBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: 15,
  cursor: "pointer",
  width: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
