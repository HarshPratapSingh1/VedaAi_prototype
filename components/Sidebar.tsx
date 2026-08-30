"use client";

const NAV_ITEMS = [
  { label: "Home", icon: "grid", disabled: true },
  { label: "My Classroom", icon: "screen", disabled: true },
  { label: "Assignments", icon: "doc", disabled: true },
  { label: "Exams", icon: "clipboard", active: true },
  { label: "My Library", icon: "chart", disabled: true },
];

function NavIcon({ icon }: { icon: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" };
  switch (icon) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "screen":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M6 2h9l5 5v15H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="9" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 3v9l7 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <aside
        style={{
          width: 72,
          minWidth: 72,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 0",
          gap: 22,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          V
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--dark)",
            border: "2px solid var(--orange)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <SparkleIcon color="#fff" size={18} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 6, color: "var(--ink-soft)" }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              title={item.disabled ? `${item.label} — not part of this demo` : item.label}
              style={{
                color: item.active ? "var(--ink)" : item.disabled ? "#d5d5da" : "var(--ink-soft)",
                cursor: item.disabled ? "not-allowed" : "default",
              }}
            >
              <NavIcon icon={item.icon} />
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        />
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingLeft: 4 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "var(--dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          V
        </div>
        <span style={{ fontWeight: 800, fontSize: 19 }}>VedaAI</span>
      </div>

      <button
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "var(--dark)",
          border: "1.5px solid var(--orange)",
          color: "#fff",
          borderRadius: 999,
          padding: "10px 14px",
          fontWeight: 700,
          fontSize: 13.5,
          marginBottom: 22,
          cursor: "default",
        }}
      >
        <SparkleIcon color="var(--orange)" size={14} />
        AI Teacher&apos;s Toolkit
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            title={item.disabled ? "Not part of this demo" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: item.active ? "var(--bg)" : "transparent",
              color: item.active ? "var(--ink)" : item.disabled ? "#c2c2c8" : "var(--ink-soft)",
              fontWeight: item.active ? 600 : 500,
              fontSize: 14.5,
              cursor: item.disabled ? "not-allowed" : "default",
            }}
          >
            <NavIcon icon={item.icon} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.disabled && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#b5b5bc",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 999,
                  padding: "2px 7px",
                  letterSpacing: 0.3,
                }}
              >
                SOON
              </span>
            )}
          </div>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--bg)",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid var(--border)",
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Delhi Public School</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>Bokaro Steel City</div>
        </div>
      </div>
    </aside>
  );
}

export function SparkleIcon({ color = "var(--orange)", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
        fill={color}
      />
    </svg>
  );
}