"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../components/shared/Icon";
import Sidebar from "../../../components/shared/Sidebar";
import { createTheme } from "../../../lib/theme";

const PRIMARY = "#C9A84C";

export default function AdminDashboard() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const $ = createTheme(PRIMARY, dark);
  const G = PRIMARY;

  const [companies, setCompanies] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aTab, setATab] = useState("overview");
  const [copied, setCopied] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCo, setNewCo] = useState({ name: "", plan: "Basic" });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/applicants").then((r) => r.json()),
    ])
      .then(([cos, apps]) => {
        setCompanies(Array.isArray(cos) ? cos : []);
        setApplicants(Array.isArray(apps) ? apps : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const addCompany = async () => {
    if (!newCo.name) return;
    setAddLoading(true);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCo.name, plan: newCo.plan, primaryColor: G }),
    });
    const data = await res.json();
    if (res.ok) {
      setCompanies((p) => [data, ...p]);
      setShowAdd(false);
      setNewCo({ name: "", plan: "Basic" });
    }
    setAddLoading(false);
  };

  const deleteCompany = async (id) => {
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanies((p) => p.filter((c) => c.id !== id));
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/applicant/apply/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const sidebarItems = [
    { k: "overview", ic: "home", l: "نظرة عامة" },
    { k: "companies", ic: "bld", l: "الشركات" },
    { k: "links", ic: "lnk", l: "روابط التقديم" },
    { k: "analytics", ic: "chart", l: "التحليلات" },
  ];

  if (loading) {
    return (
      <div style={{ ...$.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: $.muted }}>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...$.app, display: "flex" }}>
      <Sidebar
        items={sidebarItems}
        active={aTab}
        go={setATab}
        primaryColor={PRIMARY}
        dark={dark}
        foot={[
          { k: "theme", ic: dark ? "sun" : "moon", l: dark ? "وضع فاتح" : "وضع داكن", fn: () => setDark((d) => !d) },
          { k: "lo", ic: "out", l: "تسجيل الخروج", fn: logout },
        ]}
      />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, color: G, fontWeight: 900, letterSpacing: 3, marginBottom: 4 }}>SUPER ADMIN</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>لوحة التحكم الرئيسية</h1>
            <p style={{ margin: "4px 0 0", color: $.muted, fontSize: 13 }}>إدارة كاملة للنظام والشركات</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setDark((d) => !d)}
              style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
            >
              {dark ? "☀️ فاتح" : "🌙 داكن"}
            </button>
            <span style={$.tg("#34d399")}>🟢 النظام يعمل</span>
          </div>
        </div>

        {aTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { l: "الشركات", v: companies.length, c: G },
                { l: "المتقدمون", v: applicants.length, c: "#60a5fa" },
                { l: "الوظائف", v: companies.reduce((a, c) => a + (c.jobs || 0), 0), c: "#34d399" },
                { l: "هامش الربح", v: "98%+", c: "#a78bfa" },
              ].map((s, i) => (
                <div key={i} style={$.st(s.c)}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: $.muted, marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>🏢 الشركات المسجلة</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["الشركة", "الخطة", "المتقدمون", "HR", "إجراءات"].map((h) => <th key={h} style={$.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...$.td, textAlign: "center", color: $.muted, padding: 40 }}>لا توجد شركات بعد</td></tr>
                  ) : companies.map((c) => (
                    <tr key={c.id} onMouseEnter={(e) => e.currentTarget.style.background = $.surface3} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={$.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${c.primaryColor || G}33`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: c.primaryColor || G, fontSize: 15 }}>{(c.name || "?")[0]}</div>
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={$.td}><span style={$.tg(c.plan === "Enterprise" ? G : c.plan === "Professional" ? "#60a5fa" : "#34d399")}>{c.plan}</span></td>
                      <td style={$.td}><strong>{c.applicants || 0}</strong></td>
                      <td style={$.td}>{c.hrUsers || 1}</td>
                      <td style={$.td}>
                        <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12 }} onClick={() => router.push("/hr/login")}>HR Dashboard</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {aTab === "companies" && (
          <div style={$.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>إدارة الشركات</h3>
              <button style={$.btn("p")} onClick={() => setShowAdd((v) => !v)}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon n="plus" s={15} />إضافة</span>
              </button>
            </div>
            {showAdd && (
              <div style={{ background: $.surface2, borderRadius: 12, padding: 18, marginBottom: 18, border: `1px solid ${G}33` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input style={$.inp} placeholder="اسم الشركة" value={newCo.name} onChange={(e) => setNewCo((p) => ({ ...p, name: e.target.value }))} />
                  <select style={$.inp} value={newCo.plan} onChange={(e) => setNewCo((p) => ({ ...p, plan: e.target.value }))}>
                    <option>Basic</option><option>Professional</option><option>Enterprise</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={$.btn("p")} onClick={addCompany} disabled={addLoading}>{addLoading ? "⏳ جاري الحفظ..." : "حفظ"}</button>
                  <button style={$.btn("s")} onClick={() => setShowAdd(false)}>إلغاء</button>
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {companies.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", color: $.muted, padding: 40 }}>لا توجد شركات. أضف أول شركة!</div>
              )}
              {companies.map((c) => (
                <div key={c.id} style={{ background: $.surface2, borderRadius: 14, padding: 18, border: `1px solid ${$.border}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, left: 0, height: 3, background: `linear-gradient(90deg,${c.primaryColor || G},transparent)` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.primaryColor || G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: c.primaryColor || G, fontSize: 17 }}>{(c.name || "?")[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                      <span style={$.tg(c.plan === "Enterprise" ? G : "#60a5fa")}>{c.plan}</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[{ l: "وظائف", v: c.jobs || 0 }, { l: "متقدمون", v: c.applicants || 0 }].map((s) => (
                      <div key={s.l} style={{ background: $.surface, borderRadius: 8, padding: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: c.primaryColor || G }}>{s.v}</div>
                        <div style={{ fontSize: 11, color: $.muted }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...$.btn("g"), flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => router.push("/hr/login")}>عرض HR</button>
                    <button style={{ ...$.btn("d"), padding: "8px 12px", fontSize: 12 }} onClick={() => deleteCompany(c.id)}><Icon n="del" s={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aTab === "links" && (
          <div style={$.card}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>🔗 روابط التقديم</h3>
            <p style={{ color: $.muted, fontSize: 13, marginBottom: 22 }}>شارك هذه الروابط عبر LinkedIn أو البريد الإلكتروني</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {companies.length === 0 && (
                <div style={{ textAlign: "center", color: $.muted, padding: 40 }}>لا توجد شركات مسجلة</div>
              )}
              {companies.map((c) => (
                <div key={c.id} style={{ background: $.surface2, borderRadius: 12, padding: 16, border: `1px solid ${$.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${c.primaryColor || G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: c.primaryColor || G }}>{(c.name || "?")[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa", background: $.surface3, padding: "3px 10px", borderRadius: 6, display: "inline-block" }}>
                        {typeof window !== "undefined" ? window.location.origin : "https://smartcv.ae"}/applicant/apply/{c.id}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...$.btn("g"), padding: "8px 12px", fontSize: 12 }} onClick={() => copyLink(c.id)}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon n={copied === c.id ? "ok" : "cp"} s={14} />{copied === c.id ? "تم!" : "نسخ"}
                      </span>
                    </button>
                    <button style={{ ...$.btn("p"), padding: "8px 12px", fontSize: 12 }} onClick={() => router.push(`/applicant/apply/${c.id}`)}>معاينة</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>📊 حالات المتقدمين</h3>
              {[{ l: "مراجعة", c: "#60a5fa" }, { l: "مقبول", c: "#34d399" }, { l: "مرفوض", c: "#f87171" }].map((s) => {
                const n = applicants.filter((a) => a.status === s.l).length;
                return (
                  <div key={s.l} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                      <span style={{ color: s.c }}>{s.l}</span>
                      <span style={{ color: $.muted }}>{n}</span>
                    </div>
                    <div style={{ height: 7, background: $.surface3, borderRadius: 4 }}>
                      <div style={{ height: "100%", background: s.c, borderRadius: 4, width: `${applicants.length ? (n / applicants.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>💰 الإيرادات التقديرية</h3>
              {[{ p: "Enterprise", pr: "50,000+", c: G }, { p: "Professional", pr: "28,000", c: "#60a5fa" }, { p: "Basic", pr: "15,000", c: "#34d399" }].map((r) => (
                <div key={r.p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${$.border}` }}>
                  <span style={$.tg(r.c)}>{r.p}</span>
                  <span style={{ color: r.c, fontWeight: 900, fontSize: 15 }}>{r.pr} <span style={{ fontSize: 11 }}>درهم</span></span>
                </div>
              ))}
              <div style={{ marginTop: 14, background: `${G}0d`, borderRadius: 10, padding: 14, border: `1px solid ${G}22` }}>
                <div style={{ fontSize: 11, color: $.muted }}>هامش الربح</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: G }}>98%+</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
