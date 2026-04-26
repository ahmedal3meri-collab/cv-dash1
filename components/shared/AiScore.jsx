export function AiScore({ score }) {
  if (score === null || score === undefined) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "#1e1e2e", border: "1px solid #333", borderRadius: 8,
        padding: "2px 8px", fontSize: 11, color: "#555", fontWeight: 700,
      }}>
        — AI
      </span>
    );
  }
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const bg = score >= 75 ? "#052e16" : score >= 50 ? "#451a03" : "#450a0a";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: bg, border: `1px solid ${color}44`, borderRadius: 8,
      padding: "2px 8px", fontSize: 11, color, fontWeight: 800,
      minWidth: 52, justifyContent: "center",
    }}>
      {score}
      <span style={{ fontSize: 9, opacity: 0.8 }}>AI</span>
    </span>
  );
}
