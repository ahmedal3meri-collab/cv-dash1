"use client";
import Icon from "./Icon";

export default function Sidebar({ items, active, go, foot, primaryColor = "#C9A84C", lang = "ar", onLangToggle }) {
  const G = primaryColor;
  const ni = (a) => ({
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
  });

  return (
    <div style={{ width: 240, background: "#0d0d15", borderLeft: `1px solid ${G}22`, minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px", borderBottom: `1px solid ${G}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${G},${G}88)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon n="shld" s={18} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: G }}>Smart CV</div>
            <div style={{ fontSize: 10, color: "#444" }}>Dashboard</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {items.map((it) => (
          <div key={it.k} style={ni(active === it.k)} onClick={() => go(it.k)}>
            <Icon n={it.ic} s={17} />
            <span>{it.l}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding: "12px 0", borderTop: `1px solid ${G}22` }}>
        {onLangToggle && (
          <div style={ni(false)} onClick={onLangToggle}>
            <Icon n="globe" s={17} />
            <span>{lang === "ar" ? "English" : "عربي"}</span>
          </div>
        )}
        {foot?.map((it) => (
          <div key={it.k} style={ni(false)} onClick={it.fn}>
            <Icon n={it.ic} s={17} />
            <span>{it.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
