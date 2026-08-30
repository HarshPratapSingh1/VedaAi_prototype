"use client";

import { SparkleIcon } from "./Sidebar";

export function TeacherIllustration() {
    return (
        <div
            style={{
                width: 168,
                height: 168,
                borderRadius: "50%",
                background: "radial-gradient(circle, #fbdcc9 0%, #fce6d8 65%, transparent 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                margin: "0 auto",
            }}
        >
            <div
                style={{
                    width: 108,
                    height: 108,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid var(--orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="22" r="12" fill="#2c2c30" />
                    <path d="M14 58c0-12 8-20 18-20s18 8 18 20" fill="#2c2c30" />
                    <rect x="24" y="40" width="16" height="18" rx="2" fill="#fff" />
                </svg>
            </div>

            {[
                { top: -2, left: "50%", icon: "clock" },
                { top: "50%", left: -2, icon: "book" },
                { top: "50%", right: -2, icon: "cloud" },
                { bottom: -2, left: "50%", icon: "gear" },
            ].map((pos, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: pos.top,
                        left: "left" in pos ? pos.left : undefined,
                        right: "right" in pos ? pos.right : undefined,
                        bottom: "bottom" in pos ? pos.bottom : undefined,
                        transform: "translate(-50%, -50%)",
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "var(--orange)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #fff",
                    }}
                >
                    <BadgeIcon icon={pos.icon} />
                </div>
            ))}
        </div>
    );
}

function BadgeIcon({ icon }: { icon: string }) {
    const common = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 2 } as const;
    if (icon === "clock")
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" />
            </svg>
        );
    if (icon === "book")
        return (
            <svg {...common}>
                <path d="M4 5h7v14H4zM13 5h7v14h-7z" />
            </svg>
        );
    if (icon === "cloud")
        return (
            <svg {...common}>
                <path d="M6 17a4 4 0 010-8 5 5 0 019.5-2A4.5 4.5 0 0118 17H6z" />
            </svg>
        );
    return (
        <svg {...common}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" strokeLinecap="round" />
        </svg>
    );
}

export function ExtractingScreen() {
    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                minHeight: "60vh",
            }}
        >
            <div style={{ position: "relative", width: 90, height: 90 }}>
                <div style={{ position: "absolute", top: 6, left: 30 }}>
                    <SparkleIcon color="var(--orange)" size={64} />
                </div>
                <div style={{ position: "absolute", bottom: 4, left: 6, opacity: 0.75 }}>
                    <SparkleIcon color="var(--orange)" size={30} />
                </div>
                <div style={{ position: "absolute", top: 2, left: 8, opacity: 0.9 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)" }} />
                </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 22 }}>Extracting...</div>
            <div style={{ color: "var(--ink-soft)", fontSize: 14.5 }}>This may take a while</div>
        </div>
    );
}
