"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTheme } from "../../../lib/theme";

const ACCENT = "#6366f1";

const ACTION_LABELS = {
  LOGIN:            { l: "تسجيل دخول",       e: "🔐" },
  UPDATE_APPLICANT: { l: "تعديل متقدم",        e: "✏️" },
  DELETE_APPLICANT: { l: "حذف متقدم",          e: "🗑️" },
  CHANGE_PASSWORD:  { l: "تغيير كلمة مرور",    e: "🔑" },
  CREATE_HR:        { l: "إنشاء حساب HR",       e: "➕" },
  DELETE_HR:        { l: "حذف حساب HR",         e: "❌" },
  TOGGLE_HR:        { l: "تغيير حالة HR",       e: "🔄" },
};

export default function CompanyAdminDashboard() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const $ = createTheme(ACCENT, dark);
  const G = ACCENT;

  const [user, setUser]           = useState(null);
  const [hrAccounts, setHrAccounts] = useState([]);
  const [auditLog, setAuditLog]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("hr");

  // HR form
  const [showAddHR, setShowAddHR] = useState(false);
  const [newHR, setNewHR]         = useState({ name: "", email: "", password: "", role: "hr" });
  const [hrLoading, setHrLoading] = useState(false);
  const [hrError, setHrError]     = useState("");

  // Password reset modal
  const [pwModal, setPwModal]     = useState(null); // { id, name }
  const [newPw, setNewPw]         = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Edit role modal
  const [editModal, setEditModal] = useState(null); // { id, name, role }
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((me) => {
        if (me.error) { router.push("/company-admin/login"); return; }
        setUser(me);
        return Promise.all([
          fetch(`/api/hr-accounts?companyId=${me.companyId}`).then((r) => r.json()),
          fetch("/api/audit-log?limit=200").then((r) => r.json()),
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [hrs, logs] = results;
        setHrAccounts(Array.isArray(hrs) ? hrs : []);
        setAuditLog(Array.isArray(logs) ? logs : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/company-admin/login");
  };

  const primaryColor = user?.primaryColor || ACCENT;
  const companyName  = user?.companyName  || "شركة";
  const companyId    = user?.companyId;

  // ─── HR CRUD ──────────────────────────────────────────────
  const addHR = async () => {
    setHrError("");
    if (!newHR.name || !newHR.email || !newHR.password) { setHrError("جميع الحقول مطلوبة"); return; }
    if (newHR.password.length < 8) { setHrError("كلمة المرور 8 أحرف على الأقل"); return; }
    setHrLoading(true);
    const res = await fetch("/api/hr-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newHR, companyId }),
    });
    const data = await res.json();
    if (res.ok) {
      setHrAccounts((p) => [{ ...data, companies: { name: companyName, primary_color: primaryColor } }, ...p]);
      setShowAddHR(false);
      setNewHR({ name: "", email: "", password: "", role: "hr" });
      addLog("CREATE_HR", data.name);
    } else { setHrError(data.error || "حدث خطأ"); }
    setHrLoading(false);
  };

  const toggleHR = async (id, name, current) => {
    await fetch(`/api/hr-accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setHrAccounts((p) => p.map((h) => h.id === id ? { ...h, is_active: !current } : h));
    addLog("TOGGLE_HR", name, !current ? "تفعيل" : "إيقاف");
  };

  const deleteHR = async (id, name) => {
    if (!confirm(`هل تريد حذف حساب "${name}"؟`)) return;
    await fetch(`/api/hr-accounts/${id}`, { method: "DELETE" });
    setHrAccounts((p) => p.filter((h) => h.id !== id));
    addLog("DELETE_HR", name);
  };

  const changePassword = async () => {
    setPwError("");
    if (!newPw || newPw.length < 8) { setPwError("كلمة المرور 8 أحرف على الأقل"); return; }
    setPwLoading(true);
    const res = await fetch(`/api/hr-accounts/${pwModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPw }),
    });
    const data = await res.json();
    if (res.ok) {
      setPwSuccess(true);
      addLog("CHANGE_PASSWORD", pwModal.name);
      setTimeout(() => { setPwModal(null); setPwSuccess(false); setNewPw(""); }, 1500);
    } else { setPwError(data.error || "حدث خطأ"); }
    setPwLoading(false);
  };

  const changeRole = async () => {
    setEditLoading(true);
    await fetch(`/api/hr-accounts/${editModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editModal.role }),
    });
    setHrAccounts((p) => p.map((h) => h.id === editModal.id ? { ...h, role: editModal.role } : h));
    setEditModal(null);
    setEditLoading(false);
  };

  const addLog = (action, name, extra) => {
    setAuditLog((p) => [{
      id: Date.now(),
      action,
      performed_by: user?.name || "Company Admin",
      details: { target: name, extra },
      created_at: new Date().toISOString(),
    }, ...p]);
  };

  // ─── Helpers ──────────────────────────────────────────────
  const roleLabel = (r) => ({ hr: "HR Officer", hr_manager: "HR Manager", company_admin: "Company Admin" }[r] || r);
  const roleColor = (r) => ({ hr: "#60a5fa", hr_manager: "#a78bfa", company_admin: G }[r] || "#555");
  const fmtDate = (d) => d ? new Date(d).toLocaleString("ar-AE", { dateStyle: "short", timeStyle: "short" }) : "—";

  const stats = [
    { l: "إجمالي HR", v: hrAccounts.length, c: G },
    { l: "حسابات فعّالة", v: hrAccounts.filter((h) => h.is_active).length, c: "#34d399" },
    { l: "موقوفة", v: hrAccounts.filter((h) => !h.is_active).length, c: "#f87171" },
    { l: "أحداث النشاط", v: auditLog.length, c: "#fbbf24" },
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
      {/* ── Sidebar ── */}
      <div style={{ ...$.sb, borderLeft: `1px solid ${G}22` }}>
        <div style={{ padding: "22px 20px 16px" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${G},#4f46e5)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 10 }}>🏢</div>
          <div style={{ fontSize: 10, color: G, fontWeight: 900, letterSpacing: 3, marginBottom: 2 }}>COMPANY ADMIN</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: $.text }}>{companyName}</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {[
            { k: "hr",    ic: "👥", l: "إدارة HR" },
            { k: "audit", ic: "📋", l: "سجل النشاط" },
          ].map((item) => (
            <div key={item.k} onClick={() => setTab(item.k)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", margin: "2px 10px", borderRadius: 10, cursor: "pointer", background: tab === item.k ? `${G}1a` : "transparent", color: tab === item.k ? G : $.muted, borderRight: tab === item.k ? `3px solid ${G}` : "3px solid transparent", fontWeight: tab === item.k ? 700 : 400, fontSize: 14, transition: "all .2s" }}>
              <span>{item.ic}</span>{item.l}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${$.border}` }}>
          <div onClick={() => setDark((d) => !d)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: $.muted, fontSize: 13 }}>
            <span>{dark ? "☀️" : "🌙"}</span>{dark ? "وضع فاتح" : "وضع داكن"}
          </div>
          <div onClick={logout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: "#f87171", fontSize: 13 }}>
            <span>🚪</span>تسجيل الخروج
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>لوحة تحكم الشركة</h1>
            <p style={{ margin: "4px 0 0", color: $.muted, fontSize: 13 }}>مرحباً {user?.name} — {companyName}</p>
          </div>
          <button onClick={() => setDark((d) => !d)} style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13 }}>
            {dark ? "☀️ فاتح" : "🌙 داكن"}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 26 }}>
          {stats.map((s) => (
            <div key={s.l} style={$.st(s.c)}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 12, color: $.muted, marginTop: 5 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── Tab: HR Management ── */}
        {tab === "hr" && (
          <div style={$.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>👥 فريق الموارد البشرية</h3>
                <p style={{ margin: "4px 0 0", color: $.muted, fontSize: 13 }}>إدارة الحسابات والصلاحيات وكلمات المرور</p>
              </div>
              <button style={$.btn("p")} onClick={() => { setShowAddHR((v) => !v); setHrError(""); }}>
                ➕ إضافة HR
              </button>
            </div>

            {showAddHR && (
              <div style={{ background: $.surface2, borderRadius: 12, padding: 20, marginBottom: 20, border: `1px solid ${G}33` }}>
                <h4 style={{ margin: "0 0 16px", color: G, fontSize: 15 }}>حساب HR جديد</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>الاسم الكامل *</label>
                    <input style={$.inp} placeholder="محمد العلي" value={newHR.name} onChange={(e) => setNewHR((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>البريد الإلكتروني *</label>
                    <input style={$.inp} type="email" placeholder="hr@company.ae" value={newHR.email} onChange={(e) => setNewHR((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>كلمة المرور * (8 أحرف+)</label>
                    <input style={$.inp} type="password" placeholder="••••••••" value={newHR.password} onChange={(e) => setNewHR((p) => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>الصلاحية</label>
                    <select style={$.inp} value={newHR.role} onChange={(e) => setNewHR((p) => ({ ...p, role: e.target.value }))}>
                      <option value="hr">HR Officer — يشتغل على المتقدمين</option>
                      <option value="hr_manager">HR Manager — يدير الفريق</option>
                    </select>
                  </div>
                </div>
                {hrError && <div style={{ marginTop: 10, color: "#f87171", fontSize: 13 }}>⚠️ {hrError}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button style={$.btn("p")} onClick={addHR} disabled={hrLoading}>{hrLoading ? "⏳ جاري الحفظ..." : "حفظ الحساب"}</button>
                  <button style={$.btn("s")} onClick={() => { setShowAddHR(false); setHrError(""); }}>إلغاء</button>
                </div>
              </div>
            )}

            {hrAccounts.length === 0 ? (
              <div style={{ textAlign: "center", color: $.muted, padding: 50 }}>لا يوجد حسابات HR بعد. أضف أول عضو!</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["الاسم", "البريد", "الصلاحية", "الحالة", "آخر دخول", "إجراءات"].map((h) => <th key={h} style={$.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {hrAccounts.map((h) => (
                    <tr key={h.id} onMouseEnter={(e) => e.currentTarget.style.background = $.surface3} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={$.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${roleColor(h.role)}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: roleColor(h.role), fontSize: 14 }}>{(h.name || "?")[0]}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                            {!h.is_active && <div style={{ fontSize: 10, color: "#f87171" }}>موقوف</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...$.td, color: $.muted, fontSize: 13 }}>{h.email}</td>
                      <td style={$.td}><span style={$.tg(roleColor(h.role))}>{roleLabel(h.role)}</span></td>
                      <td style={$.td}><span style={$.tg(h.is_active ? "#34d399" : "#f87171")}>{h.is_active ? "✓ فعّال" : "✗ موقوف"}</span></td>
                      <td style={{ ...$.td, color: $.muted, fontSize: 12 }}>{fmtDate(h.last_login)}</td>
                      <td style={$.td}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {/* تغيير الصلاحية */}
                          <button style={{ ...$.btn("g"), padding: "5px 9px", fontSize: 11 }}
                            onClick={() => setEditModal({ id: h.id, name: h.name, role: h.role })}
                            title="تغيير الصلاحية">
                            🎭 صلاحية
                          </button>
                          {/* تغيير كلمة المرور */}
                          <button style={{ ...$.btn("s"), padding: "5px 9px", fontSize: 11 }}
                            onClick={() => { setPwModal({ id: h.id, name: h.name }); setNewPw(""); setPwError(""); setPwSuccess(false); }}
                            title="تغيير كلمة المرور">
                            🔑 باسورد
                          </button>
                          {/* إيقاف/تفعيل */}
                          <button style={{ ...$.btn(h.is_active ? "s" : "g"), padding: "5px 9px", fontSize: 11 }}
                            onClick={() => toggleHR(h.id, h.name, h.is_active)}>
                            {h.is_active ? "⏸ إيقاف" : "▶ تفعيل"}
                          </button>
                          {/* حذف */}
                          <button style={{ ...$.btn("d"), padding: "5px 9px", fontSize: 11 }}
                            onClick={() => deleteHR(h.id, h.name)}>
                            🗑️
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

        {/* ── Tab: Audit Log ── */}
        {tab === "audit" && (
          <div style={$.card}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>📋 سجل النشاط</h3>
              <p style={{ margin: "4px 0 0", color: $.muted, fontSize: 13 }}>مراقبة جميع العمليات — من عدّل، من حذف، من سجّل دخول</p>
            </div>
            {auditLog.length === 0 ? (
              <div style={{ textAlign: "center", color: $.muted, padding: 50 }}>لا يوجد نشاط مسجّل بعد</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {auditLog.map((log, i) => {
                  const meta = ACTION_LABELS[log.action] || { l: log.action, e: "📌" };
                  const details = typeof log.details === "string" ? JSON.parse(log.details || "{}") : (log.details || {});
                  return (
                    <div key={log.id || i} style={{ background: $.surface2, borderRadius: 10, padding: "12px 16px", border: `1px solid ${$.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontSize: 22, width: 36, textAlign: "center", flexShrink: 0 }}>{meta.e}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{meta.l}</span>
                          {details.target && <span style={$.tg(G)}>{details.target}</span>}
                          {details.extra && <span style={{ fontSize: 11, color: $.muted }}>— {details.extra}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: $.muted, marginTop: 3 }}>
                          بواسطة: <strong style={{ color: $.text }}>{log.performed_by || "—"}</strong>
                          {details.role && <span style={{ color: $.muted2 }}> ({details.role})</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: $.muted2, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {fmtDate(log.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Password Modal ── */}
      {pwModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...$.card, width: 400, boxShadow: "0 30px 60px #000000cc" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, color: G }}>🔑 تغيير كلمة المرور</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: $.muted }}>الحساب: <strong style={{ color: $.text }}>{pwModal.name}</strong></p>
            {pwSuccess ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <div style={{ color: "#34d399", fontWeight: 700 }}>تم تغيير كلمة المرور بنجاح</div>
              </div>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>كلمة المرور الجديدة</label>
                  <input style={$.inp} type="password" placeholder="8 أحرف على الأقل" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoFocus />
                </div>
                {pwError && <div style={{ marginTop: 8, color: "#f87171", fontSize: 13 }}>⚠️ {pwError}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button style={{ ...$.btn("p"), flex: 1 }} onClick={changePassword} disabled={pwLoading}>{pwLoading ? "⏳..." : "حفظ"}</button>
                  <button style={$.btn("s")} onClick={() => setPwModal(null)}>إلغاء</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Role Modal ── */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...$.card, width: 380, boxShadow: "0 30px 60px #000000cc" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, color: G }}>🎭 تغيير الصلاحية</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: $.muted }}>الحساب: <strong style={{ color: $.text }}>{editModal.name}</strong></p>
            <div>
              <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>الصلاحية الجديدة</label>
              <select style={$.inp} value={editModal.role} onChange={(e) => setEditModal((p) => ({ ...p, role: e.target.value }))}>
                <option value="hr">HR Officer — يشتغل على المتقدمين فقط</option>
                <option value="hr_manager">HR Manager — يدير الفريق ويرى التقارير</option>
              </select>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: $.surface2, borderRadius: 8, border: `1px solid ${$.border}` }}>
              <div style={{ fontSize: 12, color: $.muted, marginBottom: 6, fontWeight: 700 }}>الفرق بين الصلاحيات:</div>
              <div style={{ fontSize: 12, color: $.muted }}>
                <div style={{ marginBottom: 4 }}>• <strong style={{ color: "#60a5fa" }}>HR Officer</strong>: عرض وتقييم المتقدمين، جدولة المقابلات</div>
                <div>• <strong style={{ color: "#a78bfa" }}>HR Manager</strong>: كل ما فوق + تصدير التقارير + مشاهدة الإحصاءات الكاملة</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button style={{ ...$.btn("p"), flex: 1 }} onClick={changeRole} disabled={editLoading}>{editLoading ? "⏳..." : "حفظ التغيير"}</button>
              <button style={$.btn("s")} onClick={() => setEditModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
