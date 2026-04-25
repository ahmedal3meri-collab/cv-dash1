"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const G = "#6366f1";

export default function CompanyAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const $ = {
    app: { fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center" },
    inp: { background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "10px 14px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, expectedRole: "company_admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في تسجيل الدخول");
      router.push("/company-admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={$.app}>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse at 30% 20%,${G}0d 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,#1a1a2e55 0%,#0a0a0f 100%)` }} />
      <div style={{ position: "relative", zIndex: 1, width: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, background: `linear-gradient(135deg,${G},#4f46e5)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 50px ${G}33`, fontSize: 32 }}>
            🏢
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#e8e0d0" }}>بوابة أدمن الشركة</h1>
          <p style={{ color: "#444", margin: "8px 0 0", fontSize: 13 }}>إدارة فريق HR وصلاحياتهم ومراقبة النشاط</p>
        </div>
        <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 28, boxShadow: "0 40px 80px #00000099" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>البريد الإلكتروني</label>
              <input style={$.inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.ae" autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>كلمة المرور</label>
              <input style={$.inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && (
              <div style={{ background: "#4c051933", borderRadius: 10, padding: 12, border: "1px solid #dc262644", color: "#f87171", fontSize: 13 }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{ padding: 14, borderRadius: 10, border: "none", cursor: loading ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg,${G},#4f46e5)`, color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "⏳ جاري التحقق..." : "🔐 دخول"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 11, color: "#2a2a3a", marginTop: 14 }}>🔒 محمي بـ JWT · PDPL 2023</p>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, display: "flex", justifyContent: "center", gap: 20 }}>
          <a href="/admin/login" style={{ color: "#444", fontSize: 12, textDecoration: "none" }}>بوابة السوبر أدمن</a>
          <a href="/hr/login" style={{ color: "#444", fontSize: 12, textDecoration: "none" }}>بوابة HR</a>
        </div>
      </div>
    </div>
  );
}
