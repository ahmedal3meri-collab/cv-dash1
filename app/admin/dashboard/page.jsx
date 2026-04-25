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
  const [hrAccounts, setHrAccounts] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [aTab, setATab] = useState("overview");
  const [copied, setCopied] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCo, setNewCo] = useState({ name: "", plan: "Basic" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editingColor, setEditingColor] = useState(null);
  const [companySearch, setCompanySearch] = useState("");
  const [companyPlanFilter, setCompanyPlanFilter] = useState("الكل");

  // HR account form state
  const [showAddHR, setShowAddHR] = useState(false);
  const [newHR, setNewHR] = useState({ name: "", email: "", password: "", companyId: "", role: "hr" });
  const [hrLoading, setHrLoading] = useState(false);
  const [hrError, setHrError] = useState("");
  const [hrSearch, setHrSearch] = useState("");
  const [hrRoleFilter, setHrRoleFilter] = useState("الكل");

  useEffect(() => {
    Promise.all([
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/applicants").then((r) => r.json()),
      fetch("/api/hr-accounts").then((r) => r.json()),
    ])
      .then(([cos, apps, hrs]) => {
        const cosList = Array.isArray(cos) ? cos : [];
        setCompanies(cosList);
        setApplicants(Array.isArray(apps) ? apps : []);
        setHrAccounts(Array.isArray(hrs) ? hrs : []);
        if (!Array.isArray(cos) && cos?.error) setLoadError(cos.error);
        // fetch jobs for all companies
        return Promise.all(cosList.map((c) => fetch(`/api/jobs?companyId=${c.id}`).then((r) => r.json()).catch(() => [])));
      })
      .then((jobsPerCompany) => {
        if (Array.isArray(jobsPerCompany)) setAllJobs(jobsPerCompany.flat().filter(Boolean));
      })
      .catch(() => setLoadError("تعذر الاتصال بالخادم — تحقق من إعدادات Supabase"))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const addCompany = async () => {
    if (!newCo.name) return;
    setAddLoading(true);
    setAddError("");
    try {
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
      } else {
        setAddError(data.error || "فشل في إضافة الشركة");
      }
    } catch {
      setAddError("خطأ في الاتصال بالخادم");
    }
    setAddLoading(false);
  };

  const deleteCompany = async (id) => {
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanies((p) => p.filter((c) => c.id !== id));
  };

  const addHRAccount = async () => {
    setHrError("");
    if (!newHR.name || !newHR.email || !newHR.password || !newHR.companyId) {
      setHrError("جميع الحقول مطلوبة");
      return;
    }
    setHrLoading(true);
    const res = await fetch("/api/hr-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newHR, callerRole: "superadmin" }),
    });
    const data = await res.json();
    if (res.ok) {
      const company = companies.find((c) => c.id === newHR.companyId);
      setHrAccounts((p) => [{ ...data, companies: { name: company?.name, primary_color: company?.primaryColor } }, ...p]);
      setShowAddHR(false);
      setNewHR({ name: "", email: "", password: "", companyId: "", role: "hr" });
    } else {
      setHrError(data.error || "حدث خطأ");
    }
    setHrLoading(false);
  };

  const toggleHRStatus = async (id, current) => {
    await fetch(`/api/hr-accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setHrAccounts((p) => p.map((h) => h.id === id ? { ...h, is_active: !current } : h));
  };

  const deleteHRAccount = async (id) => {
    await fetch(`/api/hr-accounts/${id}`, { method: "DELETE" });
    setHrAccounts((p) => p.filter((h) => h.id !== id));
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/applicant/apply/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const filteredCompanies = companies.filter((c) => {
    const q = companySearch.toLowerCase();
    if (q && !c.name?.toLowerCase().includes(q)) return false;
    if (companyPlanFilter !== "الكل" && c.plan !== companyPlanFilter) return false;
    return true;
  });

  const filteredHR = hrAccounts.filter((h) => {
    const q = hrSearch.toLowerCase();
    if (q && !h.name?.toLowerCase().includes(q) && !h.email?.toLowerCase().includes(q)) return false;
    if (hrRoleFilter !== "الكل" && h.role !== hrRoleFilter) return false;
    return true;
  });

  const sidebarItems = [
    { k: "overview",  ic: "home",  l: "نظرة عامة" },
    { k: "companies", ic: "bld",   l: "الشركات" },
    { k: "hr",        ic: "users", l: "حسابات HR" },
    { k: "links",     ic: "lnk",   l: "روابط التقديم" },
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

  if (loadError) {
    return (
      <div style={{ ...$.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 8 }}>خطأ في الاتصال بقاعدة البيانات</div>
          <div style={{ color: $.muted, fontSize: 13, marginBottom: 20, background: "#4c051922", padding: "10px 14px", borderRadius: 8, border: "1px solid #dc262633" }}>{loadError}</div>
          <div style={{ color: $.muted, fontSize: 12 }}>تحقق من متغيرات Supabase في Vercel Dashboard</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "10px 20px", background: `linear-gradient(135deg,${G},${G}bb)`, color: "#0a0a0f", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>إعادة المحاولة</button>
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
                { l: "الوظائف", v: allJobs.length, c: "#34d399" },
                { l: "حسابات HR", v: hrAccounts.length, c: "#a78bfa" },
              ].map((s, i) => (
                <div key={i} style={$.st(s.c)}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: $.muted, marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
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
                        <td style={$.td}><strong>{applicants.filter((a) => a.companyId === c.id || a.companyId === String(c.id)).length}</strong></td>
                        <td style={$.td}>{hrAccounts.filter((h) => h.company_id === c.id || h.company_id === String(c.id)).length}</td>
                        <td style={$.td}>
                          <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12 }} onClick={() => router.push("/hr/login")}>HR Dashboard</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={$.card}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>📈 حالة المتقدمين</h3>
                {[{ l: "مراجعة", c: "#60a5fa" }, { l: "مقبول", c: "#34d399" }, { l: "مرفوض", c: "#f87171" }].map((s) => {
                  const n = applicants.filter((a) => a.status === s.l).length;
                  return (
                    <div key={s.l} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                        <span style={{ color: s.c }}>{s.l}</span>
                        <span style={{ color: $.muted }}>{n} ({applicants.length ? Math.round(n / applicants.length * 100) : 0}%)</span>
                      </div>
                      <div style={{ height: 6, background: $.surface3, borderRadius: 3 }}>
                        <div style={{ height: "100%", background: s.c, borderRadius: 3, width: `${applicants.length ? (n / applicants.length) * 100 : 0}%`, transition: "width 1s" }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 10, fontWeight: 700 }}>⚡ إجراءات سريعة</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button style={{ ...$.btn("g"), padding: "8px 0", fontSize: 13, width: "100%" }} onClick={() => setATab("companies")}>+ إضافة شركة</button>
                    <button style={{ ...$.btn("g"), padding: "8px 0", fontSize: 13, width: "100%" }} onClick={() => setATab("hr")}>+ إضافة HR</button>
                    <button style={{ ...$.btn("g"), padding: "8px 0", fontSize: 13, width: "100%" }} onClick={() => setATab("analytics")}>📊 التحليلات</button>
                  </div>
                </div>
              </div>
            </div>
            {applicants.length > 0 && (
              <div style={$.card}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>🕐 آخر المتقدمين</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["الاسم", "الشركة", "الوظيفة", "الحالة", "التاريخ"].map((h) => <th key={h} style={$.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {applicants.slice(0, 8).map((a) => {
                      const co = companies.find((c) => c.id === a.companyId || String(c.id) === String(a.companyId));
                      const job = allJobs.find((j) => j.id === a.jobId);
                      return (
                        <tr key={a.id} onMouseEnter={(e) => e.currentTarget.style.background = $.surface3} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                          <td style={$.td}><span style={{ fontWeight: 600 }}>{a.name}</span></td>
                          <td style={$.td}><span style={$.tg(co?.primaryColor || G)}>{co?.name || "—"}</span></td>
                          <td style={{ ...$.td, color: $.muted, fontSize: 12 }}>{job?.title || "—"}</td>
                          <td style={$.td}>
                            <span style={$.tg(a.status === "مقبول" ? "#34d399" : a.status === "مرفوض" ? "#f87171" : "#60a5fa")}>{a.status}</span>
                          </td>
                          <td style={{ ...$.td, color: $.muted, fontSize: 12 }}>{a.date || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
                {addError && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#4c051933", border: "1px solid #dc262644", borderRadius: 8, color: "#f87171", fontSize: 13 }}>
                    {addError}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={$.btn("p")} onClick={addCompany} disabled={addLoading}>{addLoading ? "⏳ جاري الحفظ..." : "حفظ"}</button>
                  <button style={$.btn("s")} onClick={() => { setShowAdd(false); setAddError(""); }}>إلغاء</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                style={{ ...$.inp, maxWidth: 260, flex: 1 }}
                placeholder="🔍 بحث باسم الشركة..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
              />
              <select style={{ ...$.inp, maxWidth: 160 }} value={companyPlanFilter} onChange={(e) => setCompanyPlanFilter(e.target.value)}>
                <option>الكل</option>
                <option>Basic</option>
                <option>Professional</option>
                <option>Enterprise</option>
              </select>
              {(companySearch || companyPlanFilter !== "الكل") && (
                <button style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13 }} onClick={() => { setCompanySearch(""); setCompanyPlanFilter("الكل"); }}>
                  مسح التصفية
                </button>
              )}
              <span style={{ fontSize: 12, color: $.muted, alignSelf: "center", marginRight: "auto" }}>
                {filteredCompanies.length} من {companies.length} شركة
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {filteredCompanies.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", color: $.muted, padding: 40 }}>
                  {companies.length === 0 ? "لا توجد شركات. أضف أول شركة!" : "لا توجد نتائج مطابقة"}
                </div>
              )}
              {filteredCompanies.map((c) => (
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
                    {[
                      { l: "وظائف", v: allJobs.filter((j) => j.companyId === c.id).length },
                      { l: "متقدمون", v: applicants.filter((a) => a.companyId === c.id || a.companyId === String(c.id)).length },
                    ].map((s) => (
                      <div key={s.l} style={{ background: $.surface, borderRadius: 8, padding: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: c.primaryColor || G }}>{s.v}</div>
                        <div style={{ fontSize: 11, color: $.muted }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button style={{ ...$.btn("g"), flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => router.push("/hr/login")}>عرض HR</button>
                    <button title="تغيير اللون" style={{ padding: "8px 10px", borderRadius: 8, border: `2px solid ${c.primaryColor || G}`, background: `${c.primaryColor || G}22`, cursor: "pointer", fontSize: 16 }} onClick={() => setEditingColor(editingColor === c.id ? null : c.id)}>🎨</button>
                    <button style={{ ...$.btn("d"), padding: "8px 12px", fontSize: 12 }} onClick={() => deleteCompany(c.id)}><Icon n="del" s={14} /></button>
                  </div>
                  {editingColor === c.id && (
                    <div style={{ background: $.surface, borderRadius: 10, padding: 10, border: `1px solid ${$.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {["#C9A84C", "#2563eb", "#059669", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#db2777"].map((col) => (
                        <button key={col} title={col} onClick={async () => {
                          await fetch(`/api/companies/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ primaryColor: col }) });
                          setCompanies((p) => p.map((co) => co.id === c.id ? { ...co, primaryColor: col } : co));
                          setEditingColor(null);
                        }} style={{ width: 24, height: 24, borderRadius: "50%", background: col, border: (c.primaryColor || G) === col ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                      ))}
                      <input type="color" defaultValue={c.primaryColor || G} style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", background: "none" }}
                        onChange={async (e) => {
                          const col = e.target.value;
                          await fetch(`/api/companies/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ primaryColor: col }) });
                          setCompanies((p) => p.map((co) => co.id === c.id ? { ...co, primaryColor: col } : co));
                        }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {aTab === "hr" && (
          <div style={$.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>👥 حسابات HR</h3>
                <p style={{ margin: "4px 0 0", color: $.muted, fontSize: 13 }}>إضافة وإدارة مستخدمي الموارد البشرية لكل شركة</p>
              </div>
              <button style={$.btn("p")} onClick={() => { setShowAddHR((v) => !v); setHrError(""); }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon n="plus" s={15} />إضافة HR</span>
              </button>
            </div>

            {showAddHR && (
              <div style={{ background: $.surface2, borderRadius: 12, padding: 20, marginBottom: 20, border: `1px solid ${G}33` }}>
                <h4 style={{ margin: "0 0 16px", color: G, fontSize: 15 }}>➕ حساب HR جديد</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>الاسم الكامل *</label>
                    <input style={$.inp} placeholder="سارة المطيري" value={newHR.name} onChange={(e) => setNewHR((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>البريد الإلكتروني *</label>
                    <input style={$.inp} type="email" placeholder="hr@company.ae" value={newHR.email} onChange={(e) => setNewHR((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>كلمة المرور * (8 أحرف على الأقل)</label>
                    <input style={$.inp} type="password" placeholder="••••••••" value={newHR.password} onChange={(e) => setNewHR((p) => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>الشركة *</label>
                    <select style={$.inp} value={newHR.companyId} onChange={(e) => setNewHR((p) => ({ ...p, companyId: e.target.value }))}>
                      <option value="">— اختر شركة —</option>
                      {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>الصلاحية</label>
                    <select style={$.inp} value={newHR.role} onChange={(e) => setNewHR((p) => ({ ...p, role: e.target.value }))}>
                      <option value="hr">HR Officer</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="company_admin">Company Admin (أدمن الشركة)</option>
                    </select>
                  </div>
                </div>
                {hrError && <div style={{ marginTop: 10, color: "#f87171", fontSize: 13 }}>⚠️ {hrError}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button style={$.btn("p")} onClick={addHRAccount} disabled={hrLoading}>{hrLoading ? "⏳ جاري الحفظ..." : "حفظ الحساب"}</button>
                  <button style={$.btn("s")} onClick={() => { setShowAddHR(false); setHrError(""); }}>إلغاء</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                style={{ ...$.inp, maxWidth: 260, flex: 1 }}
                placeholder="🔍 بحث بالاسم أو البريد..."
                value={hrSearch}
                onChange={(e) => setHrSearch(e.target.value)}
              />
              <select style={{ ...$.inp, maxWidth: 180 }} value={hrRoleFilter} onChange={(e) => setHrRoleFilter(e.target.value)}>
                <option>الكل</option>
                <option value="hr">HR Officer</option>
                <option value="hr_manager">HR Manager</option>
                <option value="company_admin">Company Admin</option>
              </select>
              {(hrSearch || hrRoleFilter !== "الكل") && (
                <button style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13 }} onClick={() => { setHrSearch(""); setHrRoleFilter("الكل"); }}>
                  مسح التصفية
                </button>
              )}
              <span style={{ fontSize: 12, color: $.muted, alignSelf: "center", marginRight: "auto" }}>
                {filteredHR.length} من {hrAccounts.length} حساب
              </span>
            </div>

            {hrAccounts.length === 0 ? (
              <div style={{ textAlign: "center", color: $.muted, padding: 40 }}>لا توجد حسابات HR. أضف أول حساب!</div>
            ) : filteredHR.length === 0 ? (
              <div style={{ textAlign: "center", color: $.muted, padding: 40 }}>لا توجد نتائج مطابقة</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["الاسم", "البريد", "الشركة", "الصلاحية", "الحالة", "آخر دخول", "إجراءات"].map((h) => <th key={h} style={$.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredHR.map((h) => (
                    <tr key={h.id} onMouseEnter={(e) => e.currentTarget.style.background = $.surface3} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={$.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: G, fontSize: 14 }}>{(h.name || "?")[0]}</div>
                          <span style={{ fontWeight: 600 }}>{h.name}</span>
                        </div>
                      </td>
                      <td style={{ ...$.td, color: $.muted, fontSize: 13 }}>{h.email}</td>
                      <td style={$.td}>
                        <span style={$.tg(h.companies?.primary_color || G)}>{h.companies?.name || "—"}</span>
                      </td>
                      <td style={$.td}>
                        <span style={$.tg(h.role === "company_admin" ? "#f59e0b" : h.role === "hr_manager" ? "#a78bfa" : "#60a5fa")}>
                          {h.role === "company_admin" ? "Company Admin" : h.role === "hr_manager" ? "HR Manager" : "HR Officer"}
                        </span>
                      </td>
                      <td style={$.td}>
                        <span style={$.tg(h.is_active ? "#34d399" : "#f87171")}>
                          {h.is_active ? "✓ فعّال" : "✗ موقوف"}
                        </span>
                      </td>
                      <td style={{ ...$.td, color: $.muted, fontSize: 12 }}>
                        {h.last_login ? new Date(h.last_login).toLocaleDateString("ar-AE") : "لم يسجل بعد"}
                      </td>
                      <td style={$.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            style={{ ...$.btn(h.is_active ? "s" : "g"), padding: "5px 10px", fontSize: 11 }}
                            onClick={() => toggleHRStatus(h.id, h.is_active)}
                          >
                            {h.is_active ? "إيقاف" : "تفعيل"}
                          </button>
                          <button style={{ ...$.btn("d"), padding: "5px 10px", fontSize: 11 }} onClick={() => deleteHRAccount(h.id)}>
                            <Icon n="del" s={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {aTab === "links" && (
          <div>
            <div style={{ ...$.card, marginBottom: 18 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>🔗 روابط التقديم</h3>
              <p style={{ color: $.muted, fontSize: 13, margin: 0 }}>كل وظيفة لها رابط فريد — تُدار من بوابة HR → تبويب الوظائف</p>
            </div>
            {allJobs.length === 0 ? (
              <div style={{ ...$.card, textAlign: "center", padding: 48, color: $.muted }}>
                لا توجد وظائف منشورة بعد — أضفها من بوابة HR
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {allJobs.map((job) => {
                  const company = companies.find((c) => c.id === job.companyId);
                  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/applicant/apply/${job.applyToken}`;
                  return (
                    <div key={job.id} style={{ background: $.surface, border: `1px solid ${$.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: job.isActive ? 1 : 0.5 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${company?.primaryColor || G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: company?.primaryColor || G, flexShrink: 0 }}>
                        {(company?.name || "?")[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: $.muted, marginBottom: 4 }}>{company?.name} {!job.isActive && "· متوقفة"}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#60a5fa", background: $.surface3, padding: "3px 10px", borderRadius: 6, display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button style={{ ...$.btn("g"), padding: "7px 12px", fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(link); setCopied(job.id); setTimeout(() => setCopied(null), 2000); }}>
                          {copied === job.id ? "✓ تم!" : "نسخ"}
                        </button>
                        <a href={link} target="_blank" rel="noreferrer" style={{ ...$.btn("s"), padding: "7px 12px", fontSize: 12, textDecoration: "none" }}>معاينة</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {aTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Status breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={$.card}>
                <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>📊 حالات المتقدمين</h3>
                {[{ l: "مراجعة", c: "#60a5fa" }, { l: "مقبول", c: "#34d399" }, { l: "مرفوض", c: "#f87171" }].map((s) => {
                  const n = applicants.filter((a) => a.status === s.l).length;
                  return (
                    <div key={s.l} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                        <span style={{ color: s.c }}>{s.l}</span>
                        <span style={{ color: $.muted }}>{n} ({applicants.length ? Math.round(n / applicants.length * 100) : 0}%)</span>
                      </div>
                      <div style={{ height: 7, background: $.surface3, borderRadius: 4 }}>
                        <div style={{ height: "100%", background: s.c, borderRadius: 4, width: `${applicants.length ? (n / applicants.length) * 100 : 0}%`, transition: "width 1s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={$.card}>
                <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>💰 الإيرادات التقديرية</h3>
                {[{ p: "Enterprise", pr: "50,000+", c: G }, { p: "Professional", pr: "28,000", c: "#60a5fa" }, { p: "Basic", pr: "15,000", c: "#34d399" }].map((r) => {
                  const count = companies.filter((c) => c.plan === r.p).length;
                  return (
                    <div key={r.p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${$.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={$.tg(r.c)}>{r.p}</span>
                        <span style={{ fontSize: 12, color: $.muted }}>{count} شركة</span>
                      </div>
                      <span style={{ color: r.c, fontWeight: 900 }}>{r.pr} <span style={{ fontSize: 11 }}>درهم</span></span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 14, background: `${G}0d`, borderRadius: 10, padding: 14, border: `1px solid ${G}22` }}>
                  <div style={{ fontSize: 11, color: $.muted }}>إجمالي الشركات النشطة</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: G }}>{companies.length}</div>
                </div>
              </div>
            </div>

            {/* Per-company breakdown */}
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>🏢 المتقدمون بحسب الشركة</h3>
              {companies.length === 0 ? (
                <div style={{ textAlign: "center", color: $.muted, padding: 24 }}>لا توجد شركات</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {companies.map((c) => {
                    const coApps = applicants.filter((a) => a.companyId === c.id || a.companyId === String(c.id));
                    const accepted = coApps.filter((a) => a.status === "مقبول").length;
                    const coJobs = allJobs.filter((j) => j.companyId === c.id).length;
                    const coHR = hrAccounts.filter((h) => h.company_id === c.id || h.company_id === String(c.id)).length;
                    const maxApps = Math.max(...companies.map((co) => applicants.filter((a) => a.companyId === co.id || a.companyId === String(co.id)).length), 1);
                    return (
                      <div key={c.id} style={{ background: $.surface2, borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.primaryColor || G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: c.primaryColor || G, fontSize: 14 }}>{(c.name || "?")[0]}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: $.muted }}>{coJobs} وظيفة · {coHR} HR</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                            <span style={{ color: "#60a5fa" }}>{coApps.length} متقدم</span>
                            <span style={{ color: "#34d399" }}>{accepted} مقبول</span>
                            <span style={$.tg(c.primaryColor || G)}>{c.plan}</span>
                          </div>
                        </div>
                        <div style={{ height: 5, background: $.surface3, borderRadius: 3 }}>
                          <div style={{ height: "100%", background: c.primaryColor || G, borderRadius: 3, width: `${(coApps.length / maxApps) * 100}%`, transition: "width 1s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HR accounts activity */}
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>👥 نشاط حسابات HR</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[{ l: "إجمالي الحسابات", v: hrAccounts.length, c: G },
                  { l: "حسابات نشطة", v: hrAccounts.filter((h) => h.is_active !== false).length, c: "#34d399" },
                  { l: "مديرو HR", v: hrAccounts.filter((h) => h.role === "hr_manager").length, c: "#818cf8" },
                ].map((s) => (
                  <div key={s.l} style={{ background: $.surface2, borderRadius: 10, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: $.muted, marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
