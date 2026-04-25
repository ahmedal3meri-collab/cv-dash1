import Icon from "./Icon";

export default function Stars({ v, onChange, sz = 16 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={() => onChange?.(i)}
          style={{
            cursor: onChange ? "pointer" : "default",
            color: i <= v ? "#C9A84C" : "#2a2a3a",
          }}
        >
          <Icon n={i <= v ? "str" : "strO"} s={sz} />
        </span>
      ))}
    </div>
  );
}
