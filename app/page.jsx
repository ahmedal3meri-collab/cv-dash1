"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const portals = [
  {
    title: "Super Admin",
    subtitle: "إدارة المنظومة الكاملة",
    color: "#C9A84C",
    href: "/admin/login",
    icon: "🛡️",
    badge: "SYSTEM",
    features: ["إدارة الشركات والخطط", "تحليلات النظام الكاملة", "إعدادات الألوان والروابط"],
  },
  {
    title: "Company Admin",
    subtitle: "إدارة الشركة وفريق HR",
    color: "#6366f1",
    href: "/company-admin/login",
    icon: "🏢",
    badge: "COMPANY",
    features: ["إدارة حسابات HR", "إعدادات الشركة", "عرض تقارير التوظيف"],
  },
  {
    title: "بوابة HR",
    subtitle: "إدارة المتقدمين والوظائف",
    color: "#059669",
    href: "/hr/login",
    icon: "👥",
    badge: "HR",
    features: ["مراجعة السير الذاتية بالذكاء الاصطناعي", "إدارة الوظائف والروابط", "جدولة المقابلات"],
  },
];

export default function Home() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse,#C9A84C0a 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div style={{ width: 68, height: 68, background: "linear-gradient(135deg,#C9A84C,#8b6914)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 32, boxShadow: "0 0 40px #C9A84C33" }}>
          🤖
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, background: "linear-gradient(135deg,#C9A84C,#ffe580)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 8px" }}>
          Smart CV Dashboard
        </h1>
        <p style={{ color: "#555", fontSize: 14, margin: 0 }}>منصة إدارة التوظيف بالذكاء الاصطناعي — اختر بوابتك</p>
      </div>

      {/* Portal cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 900, width: "100%" }}>
        {portals.map((p, i) => (
          <div
            key={i}
            onClick={() => router.push(p.href)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i ? "#14141e" : "#12121a",
              border: `1px solid ${hovered === i ? p.color + "55" : "#1e1e2e"}`,
              borderRadius: 18,
              padding: "28px 24px",
              width: 260,
              cursor: "pointer",
              transition: "all .25s",
              transform: hovered === i ? "translateY(-4px)" : "none",
              boxShadow: hovered === i ? `0 12px 40px ${p.color}22` : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${p.color},transparent)`, opacity: hovered === i ? 1 : 0.3, transition: "opacity .25s" }} />

            {/* Badge */}
            <div style={{ display: "inline-block", background: `${p.color}18`, border: `1px solid ${p.color}33`, borderRadius: 6, padding: "2px 8px", fontSize: 10, color: p.color, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
              {p.badge}
            </div>

            {/* Icon + Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, background: `linear-gradient(135deg,${p.color},${p.color}88)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {p.icon}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: p.color }}>{p.title}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{p.subtitle}</div>
              </div>
            </div>

            {/* Features */}
            <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
              {p.features.map((f, j) => (
                <li key={j} style={{ fontSize: 12, color: "#666", padding: "5px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: p.color, flexShrink: 0, marginTop: 1 }}>◈</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div style={{ marginTop: 20, padding: "9px 0", background: `${p.color}14`, border: `1px solid ${p.color}22`, borderRadius: 10, textAlign: "center", fontSize: 13, color: p.color, fontWeight: 700, transition: "background .25s", ...(hovered === i ? { background: `${p.color}22` } : {}) }}>
              دخول ←
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, textAlign: "center" }}>
        <a href="/privacy" style={{ fontSize: 12, color: "#333", textDecoration: "none" }}>🔒 سياسة الخصوصية — PDPL 2023</a>
        <span style={{ color: "#222", margin: "0 12px" }}>·</span>
        <span style={{ fontSize: 12, color: "#222" }}>Smart CV Dashboard © 2026</span>
      </div>
    </div>
  );
}
