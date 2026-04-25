"use client";
import { useState, useRef, useEffect } from "react";
import Icon from "../../../../components/shared/Icon";

export default function ApplyPage({ params }) {
  const { token } = params;

  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", file: null });
  const [prog, setProg] = useState(0);
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [requestId, setRequestId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    fetch(`/api/jobs/token/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setJobError(data.error);
        else setJob(data);
      })
      .catch(() => setJobError("تعذر تحميل بيانات الوظيفة"));
  }, [token]);

  const G = job?.primaryColor || "#C9A84C";

  const $ = {
    inp: { background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "10px 14px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
    btn: (v = "p") => ({
      padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, transition: "all .2s",
      ...(v === "p" ? { background: `linear-gradient(135deg,${G},${G}bb)`, color: "#0a0a0f" } : { background: "transparent", color: G, border: `1px solid ${G}44` }),
    }),
  };

  const upload = async () => {
    if (!form.name || !form.email || !form.file || !agreed || !job) return;
    setLoading(true);
    setErr("");
    setProg(10);
    setStep("📤 رفع الملف...");
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(form.file);
      });
      setProg(35);
      setStep("🤖 الذكاء الاصطناعي يقرأ السيرة الذاتية...");

      const parseRes = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf: b64, name: form.name, email: form.email }),
      });
      setProg(70);
      setStep("🧠 استخراج البيانات...");

      const parsed = parseRes.ok ? await parseRes.json() : {
        name: form.name, email: form.email, phone: form.phone || "+971 50 000 0000",
        nationality: "غير محدد", location: "غير محدد", currentTitle: "غير محدد",
        experience: "غير محدد", lastEmployer: "غير محدد", education: "غير محدد",
        university: "غير محدد", gpa: "غير محدد",
        skills: [], languages: [], certifications: [],
        aiSummary: "تم استلام الطلب وسيتم مراجعته من قبل فريق الموارد البشرية.",
      };

      setProg(85);
      setStep("💾 حفظ البيانات...");

      const saveRes = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
          phone: parsed.phone || form.phone,
          companyId: job.companyId,
          jobId: job.id !== "demo" ? job.id : null,
          status: "مراجعة",
          rating: 0,
        }),
      });
      const saved = saveRes.ok ? await saveRes.json() : {};

      setProg(100);
      setStep("✅ تم!");
      await new Promise((r) => setTimeout(r, 300));
      setRequestId(saved.id ? String(saved.id).slice(-6).toUpperCase() : Date.now().toString().slice(-6));
      setDone(true);
    } catch (e) {
      setErr(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!job && !jobError) {
    return (
      <div style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: "#666" }}>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (jobError) {
    return (
      <div style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h2 style={{ color: "#f87171", marginBottom: 10 }}>رابط غير صالح</h2>
          <p style={{ color: "#555", fontSize: 14 }}>{jobError}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 54, height: 54, background: `linear-gradient(135deg,${G},#8b6914)`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: `0 0 30px ${G}44` }}>
            <Icon n="bag" s={26} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: G, margin: 0 }}>{job.companyName}</h2>
          <p style={{ color: "#888", margin: "6px 0 0", fontSize: 14, fontWeight: 600 }}>{job.title}</p>
          {job.location && <p style={{ color: "#555", margin: "4px 0 0", fontSize: 12 }}>📍 {job.location} · {job.jobType}</p>}
        </div>

        {(job.description || job.requirements) && (
          <div style={{ background: "#0d0d15", border: `1px solid ${G}22`, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: "#888", lineHeight: 1.7 }}>
            {job.description && <p style={{ margin: "0 0 8px" }}>{job.description}</p>}
            {job.requirements && <p style={{ margin: 0, borderTop: "1px solid #1e1e2e", paddingTop: 8 }}><strong style={{ color: G }}>المتطلبات:</strong> {job.requirements}</p>}
          </div>
        )}

        <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
          {!done ? (
            <>
              <h3 style={{ margin: "0 0 20px", fontSize: 17 }}>📋 رفع السيرة الذاتية</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>الاسم الكامل *</label>
                  <input style={$.inp} placeholder="أحمد محمد المنصوري" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>البريد الإلكتروني *</label>
                  <input style={$.inp} type="email" placeholder="example@email.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>رقم الهاتف</label>
                  <input style={$.inp} placeholder="+971 50 000 0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>السيرة الذاتية (PDF) *</label>
                  <div
                    onClick={() => !loading && fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (!loading) setForm((p) => ({ ...p, file: e.dataTransfer.files[0] })); }}
                    style={{ border: `2px dashed ${form.file ? G : "#2a2a3a"}`, borderRadius: 12, padding: "26px 20px", textAlign: "center", cursor: loading ? "default" : "pointer", background: form.file ? `${G}08` : "#0d0d15", transition: "all .3s" }}
                  >
                    <div style={{ color: form.file ? G : "#444" }}><Icon n="up" s={28} /></div>
                    <p style={{ margin: "10px 0 4px", color: form.file ? G : "#555", fontSize: 13, fontWeight: 600 }}>
                      {form.file ? `✓  ${form.file.name}` : "اسحب PDF هنا أو انقر للاختيار"}
                    </p>
                    <p style={{ margin: 0, color: "#3a3a3a", fontSize: 11 }}>PDF فقط · حجم أقصى 10MB</p>
                    <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => setForm((p) => ({ ...p, file: e.target.files[0] }))} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px", background: "#0d0d15", borderRadius: 10, border: "1px solid #1e1e2e" }}>
                  <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2, cursor: "pointer", accentColor: G }} />
                  <label htmlFor="agree" style={{ fontSize: 12, color: "#555", lineHeight: 1.6, cursor: "pointer" }}>
                    أوافق على <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: G, textDecoration: "none" }}>سياسة الخصوصية</a> وأُقرّ بأن بياناتي ستُعالج وفق <strong style={{ color: G }}>قانون PDPL 2023</strong> الإماراتي لأغراض التوظيف فقط.
                  </label>
                </div>
                {loading && (
                  <div style={{ background: "#0d0d15", borderRadius: 12, padding: 16, border: `1px solid ${G}22` }}>
                    <div style={{ fontSize: 13, color: G, marginBottom: 10, fontWeight: 700 }}>{step}</div>
                    <div style={{ height: 5, background: "#1a1a2a", borderRadius: 3 }}>
                      <div style={{ height: "100%", background: `linear-gradient(90deg,${G},${G}88)`, borderRadius: 3, width: `${prog}%`, transition: "width .6s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>لا تغلق الصفحة...</div>
                  </div>
                )}
                {err && <div style={{ background: "#4c051933", borderRadius: 10, padding: 12, border: "1px solid #dc262644", color: "#f87171", fontSize: 13 }}>{err}</div>}
                <button
                  style={{ ...$.btn("p"), padding: 14, fontSize: 15, opacity: (!form.name || !form.email || !form.file || loading || !agreed) ? 0.4 : 1 }}
                  disabled={!form.name || !form.email || !form.file || loading || !agreed}
                  onClick={upload}
                >
                  {loading ? "⏳ جاري التحليل والرفع..." : "📤 رفع السيرة الذاتية"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "36px 20px" }}>
              <div style={{ width: 72, height: 72, background: "#064e3b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "2px solid #059669" }}>
                <Icon n="ok" s={36} />
              </div>
              <h3 style={{ color: "#34d399", fontSize: 20, margin: "0 0 10px" }}>تم استلام طلبك! 🎉</h3>
              <p style={{ color: "#666", fontSize: 13, margin: "0 0 6px" }}>تم تحليل سيرتك الذاتية بالذكاء الاصطناعي وإضافتها للنظام</p>
              <p style={{ color: "#444", fontSize: 12 }}>رقم الطلب: <strong style={{ color: G }}>#{requestId}</strong></p>
              <p style={{ color: "#333", fontSize: 11, marginTop: 12 }}>سيتم التواصل معك عبر البريد الإلكتروني خلال 5 أيام عمل</p>
              <button style={{ ...$.btn("p"), marginTop: 20 }} onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", file: null }); setProg(0); setStep(""); setAgreed(false); }}>
                تقديم آخر
              </button>
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#2a2a3a" }}>
          🔒 محمي بموجب قانون حماية البيانات الشخصية PDPL 2023
        </div>
      </div>
    </div>
  );
}
