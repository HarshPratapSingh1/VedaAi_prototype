"use client";

import { SparkleIcon } from "./Sidebar";

export default function TopBar({ onReset }: { onReset?: () => void }) {
    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 28px",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                    onClick={onReset}
                    aria-label="Back"
                    style={{
                        background: "none",
                        border: "none",
                        cursor: onReset ? "pointer" : "default",
                        display: "flex",
                        color: "var(--ink)",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "var(--ink-soft)" }}>
                    <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <rect x="9" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span style={{ color: "var(--ink-soft)", fontWeight: 600, fontSize: 15 }}>Exams</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <IconCircle>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M9.5 9.5a2.5 2.5 0 114 2c-.6.6-1.5.9-1.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="17" r="0.9" fill="currentColor" />
                    </svg>
                </IconCircle>
                <div style={{ position: "relative" }}>
                    <IconCircle>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                            <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </IconCircle>
                    <span
                        style={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--orange)",
                            border: "1.5px solid var(--surface)",
                        }}
                    />
                </div>
                <SparkleIcon color="var(--ink)" size={18} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #f6a24a, #e8541f)",
                        }}
                    />
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>Madhur Rastogi</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--ink-soft)" }}>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </header>
    );
}

function IconCircle({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink)",
            }}
        >
            {children}
        </div>
    );
}
