"use client";

import { useCallback, useRef, useState } from "react";

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(mb >= 10 ? 0 : 1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export default function UploadCard({
  label,
  file,
  onFile,
  pageCount,
}: {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
  pageCount?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const isPdf = file?.type === "application/pdf";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${dragOver ? "var(--orange)" : "#d3d3d8"}`,
        borderRadius: 14,
        padding: file ? 20 : "40px 20px",
        background: "var(--surface)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 132,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--bg)",
            borderRadius: 10,
            padding: "12px 14px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 34,
              height: 40,
              borderRadius: 5,
              background: "#e0392b",
              color: "#fff",
              fontSize: 9,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isPdf ? "PDF" : "IMG"}
          </div>
          <div style={{ textAlign: "left", overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {formatSize(file.size)}
              {pageCount ? ` • ${pageCount} Page${pageCount > 1 ? "s" : ""}` : ""}
            </div>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            aria-label="Replace file"
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#3a3a3e",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4M7 9l5-5 5 5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            Upload <span style={{ color: "var(--orange)" }}>{label}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Max 10MB</div>
        </>
      )}
    </div>
  );
}
