const STATUS_COLORS = {
  مراجعة: ["#1e3a5f", "#60a5fa", "#2563eb"],
  مقبول: ["#064e3b", "#34d399", "#059669"],
  مرفوض: ["#4c0519", "#f87171", "#dc2626"],
  // English variants
  review: ["#1e3a5f", "#60a5fa", "#2563eb"],
  accepted: ["#064e3b", "#34d399", "#059669"],
  rejected: ["#4c0519", "#f87171", "#dc2626"],
};

export default function Badge({ s }) {
  const [bg, c, b] = STATUS_COLORS[s] || STATUS_COLORS["مراجعة"];
  return (
    <span
      style={{
        background: bg,
        color: c,
        border: `1px solid ${b}`,
        borderRadius: 20,
        padding: "3px 12px",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {s}
    </span>
  );
}
