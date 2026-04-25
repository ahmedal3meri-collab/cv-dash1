export function createTheme(primaryColor = "#C9A84C", dark = true) {
  const G = primaryColor;
  const bg       = dark ? "#0a0a0f" : "#f8fafc";
  const surface  = dark ? "#12121a" : "#ffffff";
  const surface2 = dark ? "#0d0d15" : "#f1f5f9";
  const surface3 = dark ? "#1a1a2a" : "#e8edf4";
  const border   = dark ? "#1e1e2e" : "#e2e8f0";
  const text     = dark ? "#e8e0d0" : "#1e293b";
  const muted    = dark ? "#666"    : "#64748b";
  const muted2   = dark ? "#444"    : "#94a3b8";

  return {
    G, dark,
    bg, surface, surface2, surface3, border, text, muted, muted2,
    app: {
      fontFamily: "'Cairo','Segoe UI',sans-serif",
      direction: "rtl",
      minHeight: "100vh",
      background: bg,
      color: text,
    },
    card: {
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: 24,
    },
    inp: {
      background: surface3,
      border: `1px solid ${border}`,
      borderRadius: 10,
      padding: "10px 14px",
      color: text,
      fontFamily: "inherit",
      fontSize: 14,
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    btn: (v = "p") => ({
      padding: "10px 20px",
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: 700,
      fontSize: 14,
      transition: "all .2s",
      ...(v === "p"
        ? { background: `linear-gradient(135deg,${G},${G}bb)`, color: dark ? "#0a0a0f" : "#fff" }
        : v === "g"
        ? { background: "transparent", color: G, border: `1px solid ${G}44` }
        : v === "d"
        ? { background: dark ? "#4c0519" : "#fee2e2", color: "#f87171", border: "1px solid #dc2626" }
        : { background: surface3, color: text, border: `1px solid ${border}` }),
    }),
    sb: {
      width: 240,
      background: surface2,
      borderLeft: `1px solid ${G}22`,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    },
    ni: (a) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      borderRadius: 10,
      margin: "2px 10px",
      cursor: "pointer",
      transition: "all .2s",
      background: a ? `${G}1a` : "transparent",
      color: a ? G : muted,
      borderRight: a ? `3px solid ${G}` : "3px solid transparent",
      fontWeight: a ? 700 : 400,
      fontSize: 14,
    }),
    tg: (c = G) => ({
      background: `${c}15`,
      color: c,
      border: `1px solid ${c}33`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 700,
      display: "inline-block",
    }),
    th: {
      padding: "12px 16px",
      textAlign: "right",
      color: muted,
      fontSize: 13,
      borderBottom: `1px solid ${border}`,
      fontWeight: 600,
    },
    td: { padding: "13px 16px", borderBottom: `1px solid ${dark ? "#111" : "#f0f4f8"}`, fontSize: 14 },
    st: (c = G) => ({
      background: surface,
      border: `1px solid ${c}22`,
      borderRadius: 16,
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }),
  };
}
