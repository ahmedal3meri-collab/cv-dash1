export function createTheme(primaryColor = "#C9A84C") {
  const G = primaryColor;
  return {
    G,
    app: {
      fontFamily: "'Cairo','Segoe UI',sans-serif",
      direction: "rtl",
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e0d0",
    },
    card: {
      background: "#12121a",
      border: "1px solid #1e1e2e",
      borderRadius: 16,
      padding: 24,
    },
    inp: {
      background: "#1a1a2a",
      border: "1px solid #2a2a3a",
      borderRadius: 10,
      padding: "10px 14px",
      color: "#e8e0d0",
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
        ? { background: `linear-gradient(135deg,${G},${G}bb)`, color: "#0a0a0f" }
        : v === "g"
        ? { background: "transparent", color: G, border: `1px solid ${G}44` }
        : v === "d"
        ? { background: "#4c0519", color: "#f87171", border: "1px solid #dc2626" }
        : { background: "#1e1e2e", color: "#e8e0d0", border: "1px solid #2a2a3a" }),
    }),
    sb: {
      width: 240,
      background: "#0d0d15",
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
      color: a ? G : "#666",
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
      color: "#555",
      fontSize: 13,
      borderBottom: "1px solid #1e1e2e",
      fontWeight: 600,
    },
    td: { padding: "13px 16px", borderBottom: "1px solid #111", fontSize: 14 },
    st: (c = G) => ({
      background: "#12121a",
      border: `1px solid ${c}22`,
      borderRadius: 16,
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }),
  };
}
