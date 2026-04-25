"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/shared/Icon";

const G = "#C9A84C";

export default function HRLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("hr@company.ae");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inp = { background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "10px 14px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, expectedRole: "hr" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في تسجيل الدخول");
      router.push("/hr/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 70% 20%,#2563eb0a 0%,transparent 55%),radial-gradient(ellipse at 20% 80%,#1a1a2e55 0%,#0a0a0f 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, width: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, background: `linear-gradient(135deg,${G},#8b6914)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 50px ${G}33` }}>
            <Icon n="users" s={34} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, background: `linear-gradient(135deg,${G},#fffa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            بوابة الموارد البشرية
          </h1>
          <p style={{ color: "#444", margin: "8px 0 0", fontSize: 13 }}>إدارة المتقدمين وتحليل السير الذاتية</p>
        </div>
        <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 28, boxShadow: "0 40px 80px #00000099" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>البريد الإلكتروني</label>
              <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>كلمة المرور</label>
              <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" />
            </div>
            {error && (
              <div style={{ background: "#4c051933", borderRadius: 10, padding: 12, border: "1px solid #dc262644", color: "#f87171", fontSize: 13 }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{ padding: 14, borderRadius: 10, border: "none", cursor: loading ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg,${G},${G}bb)`, color: "#0a0a0f", opacity: loading ? 0.7 : 1 }}>
              {loading ? "⏳ جاري التحقق..." : "🔐 دخول"}
            </button>
          </form>
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#0d0d15", borderRadius: 10, border: `1px solid ${G}22` }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 6, fontWeight: 700 }}>بيانات التجربة:</div>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>
              البريد: hr@company.ae<br />كلمة المرور: HR@2024!
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "#2a2a3a", marginTop: 14 }}>🔒 PDPL 2023 — حماية بيانات المتقدمين</p>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/admin/login" style={{ color: "#444", fontSize: 12, textDecoration: "none" }}>← بوابة Super Admin</a>
        </div>
      </div>
    </div>
  );
}
