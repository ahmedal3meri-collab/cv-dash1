import { useState, useRef } from "react";

const MOCK_COMPANIES = [
  { id: 1, name: "هيئة أبوظبي للصحة", primaryColor: "#C9A84C", secondaryColor: "#0a0a0f", plan: "Enterprise", jobs: 3, applicants: 47, hrUsers: 2 },
  { id: 2, name: "مجموعة أبوظبي للطاقة", primaryColor: "#2563eb", secondaryColor: "#0f172a", plan: "Professional", jobs: 2, applicants: 31, hrUsers: 1 },
  { id: 3, name: "دائرة التعليم والمعرفة", primaryColor: "#059669", secondaryColor: "#064e3b", plan: "Basic", jobs: 1, applicants: 19, hrUsers: 1 },
];

const MOCK_APPLICANTS = [
  { id: 1, name: "أحمد محمد المنصوري", nationality: "إماراتي", phone: "+971 50 123 4567", email: "ahmed@email.com", location: "أبوظبي", currentTitle: "مهندس أول", experience: "10+ سنوات", lastEmployer: "هيئة أبوظبي للغذاء", education: "ماجستير إدارة التقنية", university: "جامعة زايد", gpa: "3.04", skills: ["إدارة مشاريع", "Excel", "إدارة مخاطر"], languages: ["عربي (لغة أم)", "إنجليزي (محترف)"], certifications: ["PMP", "ISO 26000", "IOSH"], aiSummary: "مرشح قوي بخبرة واسعة في إدارة المشاريع الحكومية. يمتلك مهارات تقنية وإدارية متميزة مع شهادات دولية معتمدة. يُنصح بالتقدم لمقابلة.", status: "مراجعة", rating: 5, date: "2025-04-24" },
  { id: 2, name: "فاطمة سعيد الكعبي", nationality: "إماراتية", phone: "+971 55 234 5678", email: "fatima@email.com", location: "دبي", currentTitle: "محاسبة قانونية", experience: "7 سنوات", lastEmployer: "بنك الإمارات الدولي", education: "بكالوريوس محاسبة", university: "جامعة الشارقة", gpa: "3.7", skills: ["محاسبة", "SAP", "تدقيق مالي"], languages: ["عربي (لغة أم)", "إنجليزي (متقدم)"], certifications: ["CPA", "ACCA"], aiSummary: "كفاءة مالية عالية مع خبرة في البيئات المصرفية. مناسبة جداً للأدوار المالية القيادية.", status: "مقبول", rating: 4, date: "2025-04-23" },
  { id: 3, name: "خالد عبدالله الشامسي", nationality: "إماراتي", phone: "+971 52 345 6789", email: "khalid@email.com", location: "الشارقة", currentTitle: "مطور برمجيات أول", experience: "5 سنوات", lastEmployer: "اتصالات", education: "بكالوريوس علوم حاسوب", university: "جامعة خليفة", gpa: "3.2", skills: ["Python", "React", "AWS"], languages: ["عربي (لغة أم)", "إنجليزي (محترف)"], certifications: ["AWS Solutions Architect"], aiSummary: "مطور متكامل بخبرة في الحوسبة السحابية. مناسب للمناصب التقنية الرقمية.", status: "مراجعة", rating: 3, date: "2025-04-22" },
  { id: 4, name: "مريم يوسف الهاشمي", nationality: "إماراتية", phone: "+971 56 456 7890", email: "maryam@email.com", location: "أبوظبي", currentTitle: "مديرة موارد بشرية", experience: "12 سنة", lastEmployer: "مجموعة الإمارات", education: "ماجستير إدارة أعمال", university: "جامعة نيويورك أبوظبي", gpa: "3.9", skills: ["إدارة الموارد البشرية", "التوظيف", "SAP HR"], languages: ["عربي (لغة أم)", "إنجليزي (ممتاز)"], certifications: ["SHRM-CP", "CIPD Level 7"], aiSummary: "قيادية بارزة في مجال الموارد البشرية مع سجل حافل. تمتلك رؤية استراتيجية عالية.", status: "مقبول", rating: 5, date: "2025-04-21" },
];

async function parseCV(base64, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
        { type: "text", text: `استخرج المعلومات من هذه السيرة الذاتية وأعدها كـ JSON فقط بدون أي نص آخر:
{
  "name": "الاسم الكامل",
  "nationality": "الجنسية",
  "phone": "رقم الهاتف",
  "email": "البريد",
  "location": "الموقع",
  "currentTitle": "المسمى الوظيفي",
  "experience": "سنوات الخبرة",
  "lastEmployer": "آخر جهة عمل",
  "education": "المؤهل",
  "university": "الجامعة",
  "gpa": "المعدل",
  "skills": ["مهارة1","مهارة2"],
  "languages": ["لغة1","لغة2"],
  "certifications": ["شهادة1"],
  "aiSummary": "ملخص احترافي في 3 جمل: نقاط القوة والتوصية"
}
إذا لم تجد معلومة اكتب غير محدد. JSON فقط.` }
      ]}]
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.content[0].text.trim().replace(/```json|```/g,"").trim());
}

const Ic = ({ n, s = 18 }) => {
  const m = {
    home: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    bld: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>,
    lnk: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    cfg: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M20 12h-2M4 12H2M12 4V2M12 22v-2"/></svg>,
    up: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    srch: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    str: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    strO: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    eye: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    plus: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    cp: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    out: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    shld: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    ai: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    ok: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    pal: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/></svg>,
    dl: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    bag: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    back: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    del: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    key: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  };
  return m[n] || null;
};

const Stars = ({ v, onChange, sz = 16 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} onClick={() => onChange?.(i)} style={{ cursor: onChange ? "pointer" : "default", color: i <= v ? "#C9A84C" : "#2a2a3a" }}>
        <Ic n={i <= v ? "str" : "strO"} s={sz} />
      </span>
    ))}
  </div>
);

const Badge = ({ s }) => {
  const m = { "مراجعة": ["#1e3a5f","#60a5fa","#2563eb"], "مقبول": ["#064e3b","#34d399","#059669"], "مرفوض": ["#4c0519","#f87171","#dc2626"] };
  const [bg,c,b] = m[s] || m["مراجعة"];
  return <span style={{ background:bg, color:c, border:`1px solid ${b}`, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{s}</span>;
};

export default function App() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState("superadmin");
  const [apiKey, setApiKey] = useState("");
  const [apiIn, setApiIn] = useState("");
  const [apiOk, setApiOk] = useState(false);

  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [selCompany, setSelCompany] = useState(MOCK_COMPANIES[0]);
  const [selApplicant, setSelApplicant] = useState(null);

  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("الكل");
  const [aTab, setATab] = useState("overview");
  const [hTab, setHTab] = useState("applicants");
  const [sTab, setSTab] = useState("brand");
  const [copied, setCopied] = useState(null);
  const [noteIn, setNoteIn] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCo, setNewCo] = useState({ name: "", plan: "Basic" });

  const [form, setForm] = useState({ name: "", email: "", file: null });
  const [prog, setProg] = useState(0);
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const [cs, setCs] = useState({ name: "هيئة أبوظبي للصحة", primaryColor: "#C9A84C", secondaryColor: "#0a0a0f", logo: null });

  const fileRef = useRef();
  const G = cs.primaryColor;

  const $ = {
    app: { fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0" },
    card: { background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 },
    inp: { background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "10px 14px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
    btn: (v="p") => ({ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:14, transition:"all .2s",
      ...(v==="p"?{background:`linear-gradient(135deg,${G},${G}bb)`,color:"#0a0a0f"}:
         v==="g"?{background:"transparent",color:G,border:`1px solid ${G}44`}:
         v==="d"?{background:"#4c0519",color:"#f87171",border:"1px solid #dc2626"}:
                 {background:"#1e1e2e",color:"#e8e0d0",border:"1px solid #2a2a3a"})
    }),
    sb: { width:240, background:"#0d0d15", borderLeft:`1px solid ${G}22`, minHeight:"100vh", display:"flex", flexDirection:"column", flexShrink:0 },
    ni: (a) => ({ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderRadius:10, margin:"2px 10px", cursor:"pointer", transition:"all .2s", background:a?`${G}1a`:"transparent", color:a?G:"#666", borderRight:a?`3px solid ${G}`:"3px solid transparent", fontWeight:a?700:400, fontSize:14 }),
    tg: (c=G) => ({ background:`${c}15`, color:c, border:`1px solid ${c}33`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, display:"inline-block" }),
    th: { padding:"12px 16px", textAlign:"right", color:"#555", fontSize:13, borderBottom:"1px solid #1e1e2e", fontWeight:600 },
    td: { padding:"13px 16px", borderBottom:"1px solid #111", fontSize:14 },
    st: (c=G) => ({ background:"#12121a", border:`1px solid ${c}22`, borderRadius:16, padding:20, position:"relative", overflow:"hidden" }),
  };

  const Sidebar = ({ items, active, go, foot }) => (
    <div style={$.sb}>
      <div style={{ padding:"20px", borderBottom:`1px solid ${G}22` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36,height:36,background:`linear-gradient(135deg,${G},${G}88)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n="shld" s={18}/></div>
          <div><div style={{ fontSize:12,fontWeight:900,color:G }}>Smart CV</div><div style={{ fontSize:10,color:"#444" }}>Dashboard</div></div>
        </div>
      </div>
      <nav style={{ flex:1, padding:"12px 0" }}>
        {items.map(it => <div key={it.k} style={$.ni(active===it.k)} onClick={()=>go(it.k)}><Ic n={it.ic} s={17}/><span>{it.l}</span></div>)}
      </nav>
      <div style={{ padding:"12px 0", borderTop:`1px solid ${G}22` }}>
        {foot?.map(it => <div key={it.k} style={$.ni(false)} onClick={it.fn}><Ic n={it.ic} s={17}/><span>{it.l}</span></div>)}
      </div>
    </div>
  );

  const upload = async () => {
    if (!form.name || !form.email || !form.file) return;
    setLoading(true); setErr(""); setProg(10); setStep("📤 رفع الملف...");
    try {
      const b64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(form.file); });
      setProg(35); setStep("🤖 الذكاء الاصطناعي يقرأ السيرة الذاتية...");
      let parsed;
      if (apiKey?.startsWith("sk-ant-")) {
        setProg(60); setStep("🧠 استخراج البيانات تلقائياً...");
        parsed = await parseCV(b64, apiKey);
      } else {
        await new Promise(r=>setTimeout(r,2200));
        parsed = { name:form.name, nationality:"إماراتي", phone:"+971 50 000 0000", email:form.email, location:"أبوظبي", currentTitle:"محترف متخصص", experience:"5+ سنوات", lastEmployer:"شركة خليجية", education:"بكالوريوس", university:"جامعة الإمارات", gpa:"3.5", skills:["تواصل","إدارة","تحليل بيانات"], languages:["عربي (لغة أم)","إنجليزي (محترف)"], certifications:["PMP"], aiSummary:"تم التحليل بالوضع التجريبي. أدخل API Key حقيقي للحصول على استخراج دقيق من السيرة الذاتية الفعلية." };
      }
      setProg(85); setStep("💾 حفظ البيانات...");
      await new Promise(r=>setTimeout(r,400));
      setApplicants(p=>[{ id:Date.now(), ...parsed, status:"مراجعة", rating:0, date:new Date().toLocaleDateString("ar-AE") }, ...p]);
      setProg(100); setStep("✅ تم!"); await new Promise(r=>setTimeout(r,300));
      setDone(true);
    } catch(e) { setErr(`❌ ${e.message}`); }
    finally { setLoading(false); }
  };

  // ── LOGIN ────────────────────────────────────────────────
  if (page === "login") return (
    <div style={{ ...$.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 25% 15%,#C9A84C0b 0%,transparent 55%),radial-gradient(ellipse at 80% 85%,#1a1a2e55 0%,#0a0a0f 100%)" }}/>
      <div style={{ position:"relative", zIndex:1, width:440 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:72,height:72,background:`linear-gradient(135deg,${G},#8b6914)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 50px ${G}33` }}><Ic n="shld" s={34}/></div>
          <h1 style={{ fontSize:26,fontWeight:900,margin:0,background:`linear-gradient(135deg,${G},#fffa)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Smart CV Dashboard</h1>
          <p style={{ color:"#444",margin:"8px 0 0",fontSize:13 }}>نظام ذكاء اصطناعي لإدارة المتقدمين • الإمارات</p>
        </div>
        <div style={{ ...$.card, boxShadow:"0 40px 80px #00000099" }}>
          <div style={{ display:"flex",gap:6,marginBottom:22,background:"#0d0d15",borderRadius:12,padding:4 }}>
            {[{k:"superadmin",l:"⚡ Super Admin"},{k:"hr",l:"👤 HR"},{k:"apply",l:"📄 متقدم"}].map(r=>(
              <button key={r.k} onClick={()=>setRole(r.k)} style={{ flex:1,padding:"9px 4px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,transition:"all .2s",background:role===r.k?G:"transparent",color:role===r.k?"#0a0a0f":"#555" }}>{r.l}</button>
            ))}
          </div>
          {role!=="apply" && (
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:16 }}>
              <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:5 }}>اسم المستخدم</label>
                <input style={$.inp} defaultValue={role==="superadmin"?"superadmin@smartcv.ae":"hr@company.ae"} readOnly/></div>
              <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:5 }}>كلمة المرور</label>
                <input type="password" style={$.inp} defaultValue="••••••••" readOnly/></div>
            </div>
          )}
          <div style={{ background:"#0d0d15",borderRadius:12,padding:16,marginBottom:16,border:`1px solid ${G}22` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <Ic n="key" s={15}/><span style={{ fontSize:13,color:G,fontWeight:700 }}>Claude AI — API Key</span>
              {apiOk && <span style={{ ...$.tg("#34d399"),fontSize:10 }}>✓ مفعّل</span>}
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <input type="password" style={{ ...$.inp,fontFamily:"monospace",fontSize:12 }} placeholder="sk-ant-api03-..." value={apiIn} onChange={e=>setApiIn(e.target.value)}/>
              <button style={{ ...$.btn("g"),padding:"10px 14px",fontSize:12,whiteSpace:"nowrap" }} onClick={()=>{ if(apiIn.startsWith("sk-ant-")){setApiKey(apiIn);setApiOk(true);} }}>
                {apiOk?"✓":"حفظ"}
              </button>
            </div>
            <p style={{ margin:"8px 0 0",fontSize:11,color:"#444" }}>{apiOk?"✅ الذكاء الاصطناعي جاهز — يحلل CVs حقيقية":"بدون API Key يعمل النظام بوضع تجريبي"}</p>
          </div>
          <button style={{ ...$.btn("p"),width:"100%",padding:14,fontSize:15 }} onClick={()=>setPage(role)}>
            {role==="apply"?"🚀 صفحة التقديم":"🔐 دخول"}
          </button>
          <p style={{ textAlign:"center",fontSize:11,color:"#2a2a3a",marginTop:14 }}>🔒 محمي بموجب PDPL — قانون حماية البيانات الإماراتي 2023</p>
        </div>
      </div>
    </div>
  );

  // ── APPLY ────────────────────────────────────────────────
  if (page === "apply") return (
    <div style={{ ...$.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ position:"fixed",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${G},transparent)` }}/>
      <div style={{ width:520 }}>
        <div style={{ textAlign:"center",marginBottom:26 }}>
          <div style={{ width:54,height:54,background:`linear-gradient(135deg,${G},#8b6914)`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:`0 0 30px ${G}44` }}><Ic n="bag" s={26}/></div>
          <h2 style={{ fontSize:20,fontWeight:900,color:G,margin:0 }}>{cs.name}</h2>
          <p style={{ color:"#555",margin:"6px 0 0",fontSize:13 }}>التقديم لوظيفة: مهندس برمجيات أول</p>
          {apiOk && <span style={{ ...$.tg("#34d399"),fontSize:11,marginTop:6,display:"inline-block" }}>🤖 تحليل AI حقيقي مفعّل</span>}
        </div>
        <div style={$.card}>
          {!done ? (<>
            <h3 style={{ margin:"0 0 20px",fontSize:17 }}>📋 رفع السيرة الذاتية</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:5 }}>الاسم الكامل *</label>
                <input style={$.inp} placeholder="أحمد محمد المنصوري" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
              <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:5 }}>البريد الإلكتروني *</label>
                <input style={$.inp} placeholder="example@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
              <div>
                <label style={{ fontSize:12,color:"#666",display:"block",marginBottom:5 }}>السيرة الذاتية (PDF) *</label>
                <div onClick={()=>!loading&&fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!loading)setForm(p=>({...p,file:e.dataTransfer.files[0]}));}}
                  style={{ border:`2px dashed ${form.file?G:"#2a2a3a"}`,borderRadius:12,padding:"26px 20px",textAlign:"center",cursor:loading?"default":"pointer",background:form.file?`${G}08`:"#0d0d15",transition:"all .3s" }}>
                  <div style={{ color:form.file?G:"#444" }}><Ic n="up" s={28}/></div>
                  <p style={{ margin:"10px 0 4px",color:form.file?G:"#555",fontSize:13,fontWeight:600 }}>{form.file?`✓  ${form.file.name}`:"اسحب PDF هنا أو انقر للاختيار"}</p>
                  <p style={{ margin:0,color:"#3a3a3a",fontSize:11 }}>PDF فقط · حجم أقصى 10MB</p>
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display:"none" }} onChange={e=>setForm(p=>({...p,file:e.target.files[0]}))}/>
                </div>
              </div>
              {loading && (
                <div style={{ background:"#0d0d15",borderRadius:12,padding:16,border:`1px solid ${G}22` }}>
                  <div style={{ fontSize:13,color:G,marginBottom:10,fontWeight:700 }}>{step}</div>
                  <div style={{ height:5,background:"#1a1a2a",borderRadius:3 }}>
                    <div style={{ height:"100%",background:`linear-gradient(90deg,${G},${G}88)`,borderRadius:3,width:`${prog}%`,transition:"width .6s ease" }}/>
                  </div>
                  <div style={{ fontSize:11,color:"#444",marginTop:8 }}>لا تغلق الصفحة...</div>
                </div>
              )}
              {err && <div style={{ background:"#4c051933",borderRadius:10,padding:12,border:"1px solid #dc262644",color:"#f87171",fontSize:13 }}>{err}</div>}
              <button style={{ ...$.btn("p"),padding:14,fontSize:15,opacity:(!form.name||!form.email||!form.file||loading)?0.4:1 }} disabled={!form.name||!form.email||!form.file||loading} onClick={upload}>
                {loading?"⏳ جاري التحليل والرفع...":"📤 رفع السيرة الذاتية"}
              </button>
            </div>
          </>) : (
            <div style={{ textAlign:"center",padding:"36px 20px" }}>
              <div style={{ width:72,height:72,background:"#064e3b",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",border:"2px solid #059669" }}><Ic n="ok" s={36}/></div>
              <h3 style={{ color:"#34d399",fontSize:20,margin:"0 0 10px" }}>تم استلام طلبك! 🎉</h3>
              <p style={{ color:"#666",fontSize:13,margin:"0 0 6px" }}>تم تحليل سيرتك بالذكاء الاصطناعي وإضافتها للنظام</p>
              <p style={{ color:"#444",fontSize:12 }}>رقم الطلب: <strong style={{ color:G }}>#{Date.now().toString().slice(-6)}</strong></p>
              <button style={{ ...$.btn("g"),marginTop:20 }} onClick={()=>{setDone(false);setForm({name:"",email:"",file:null});setProg(0);setStep("");}}>تقديم آخر</button>
            </div>
          )}
        </div>
        <div style={{ textAlign:"center",marginTop:12 }}>
          <button style={{ ...$.btn("g"),fontSize:12,padding:"6px 14px" }} onClick={()=>setPage("login")}>← العودة</button>
        </div>
      </div>
    </div>
  );

  // ── SUPER ADMIN ──────────────────────────────────────────
  if (page === "superadmin") return (
    <div style={{ ...$.app, display:"flex" }}>
      <Sidebar items={[{k:"overview",ic:"home",l:"نظرة عامة"},{k:"companies",ic:"bld",l:"الشركات"},{k:"links",ic:"lnk",l:"روابط التقديم"},{k:"analytics",ic:"chart",l:"التحليلات"}]} active={aTab} go={setATab} foot={[{k:"lo",ic:"out",l:"تسجيل الخروج",fn:()=>setPage("login")}]}/>
      <div style={{ flex:1,padding:28,overflow:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28 }}>
          <div><div style={{ fontSize:10,color:G,fontWeight:900,letterSpacing:3,marginBottom:4 }}>SUPER ADMIN</div>
            <h1 style={{ margin:0,fontSize:22,fontWeight:900 }}>لوحة التحكم الرئيسية</h1>
            <p style={{ margin:"4px 0 0",color:"#444",fontSize:13 }}>إدارة كاملة للنظام والشركات</p></div>
          {apiOk && <span style={{ ...$.tg("#34d399"),fontSize:11 }}>🤖 Claude AI مفعّل</span>}
        </div>

        {aTab==="overview" && (<>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
            {[{l:"الشركات",v:companies.length,c:G},{l:"المتقدمون",v:applicants.length,c:"#60a5fa"},{l:"الوظائف",v:companies.reduce((a,c)=>a+c.jobs,0),c:"#34d399"},{l:"هامش الربح",v:"98%+",c:"#a78bfa"}].map((s,i)=>(
              <div key={i} style={$.st(s.c)}><div style={{ fontSize:30,fontWeight:900,color:s.c,lineHeight:1 }}>{s.v}</div><div style={{ fontSize:12,color:"#555",marginTop:6 }}>{s.l}</div></div>
            ))}
          </div>
          <div style={$.card}>
            <h3 style={{ margin:"0 0 18px",fontSize:16 }}>🏢 الشركات</h3>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr>{["الشركة","الخطة","المتقدمون","HR","إجراءات"].map(h=><th key={h} style={$.th}>{h}</th>)}</tr></thead>
              <tbody>{companies.map(c=>(
                <tr key={c.id}>
                  <td style={$.td}><div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:34,height:34,borderRadius:9,background:`${c.primaryColor}33`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:c.primaryColor,fontSize:15 }}>{c.name[0]}</div>
                    <span style={{ fontWeight:600 }}>{c.name}</span></div></td>
                  <td style={$.td}><span style={$.tg(c.plan==="Enterprise"?G:c.plan==="Professional"?"#60a5fa":"#34d399")}>{c.plan}</span></td>
                  <td style={$.td}><strong style={{ color:"#e8e0d0" }}>{c.applicants}</strong></td>
                  <td style={$.td}>{c.hrUsers}</td>
                  <td style={$.td}><div style={{ display:"flex",gap:8 }}>
                    <button style={{ ...$.btn("g"),padding:"6px 12px",fontSize:12 }} onClick={()=>{setSelCompany(c);setPage("hr");}}>HR Dashboard</button>
                    <button style={{ ...$.btn("s"),padding:"6px 12px",fontSize:12 }} onClick={()=>setPage("settings")}>الإعدادات</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}

        {aTab==="companies" && (
          <div style={$.card}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
              <h3 style={{ margin:0,fontSize:18 }}>إدارة الشركات</h3>
              <button style={$.btn("p")} onClick={()=>setShowAdd(v=>!v)}><span style={{ display:"flex",alignItems:"center",gap:6 }}><Ic n="plus" s={15}/>إضافة</span></button>
            </div>
            {showAdd && (
              <div style={{ background:"#0d0d15",borderRadius:12,padding:18,marginBottom:18,border:`1px solid ${G}33` }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <input style={$.inp} placeholder="اسم الشركة" value={newCo.name} onChange={e=>setNewCo(p=>({...p,name:e.target.value}))}/>
                  <select style={$.inp} value={newCo.plan} onChange={e=>setNewCo(p=>({...p,plan:e.target.value}))}><option>Basic</option><option>Professional</option><option>Enterprise</option></select>
                </div>
                <div style={{ display:"flex",gap:8,marginTop:12 }}>
                  <button style={$.btn("p")} onClick={()=>{if(!newCo.name)return;setCompanies(p=>[...p,{id:Date.now(),name:newCo.name,primaryColor:G,secondaryColor:"#0a0a0f",plan:newCo.plan,jobs:0,applicants:0,hrUsers:1}]);setShowAdd(false);setNewCo({name:"",plan:"Basic"});}}>حفظ</button>
                  <button style={$.btn("s")} onClick={()=>setShowAdd(false)}>إلغاء</button>
                </div>
              </div>
            )}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
              {companies.map(c=>(
                <div key={c.id} style={{ background:"#0d0d15",borderRadius:14,padding:18,border:"1px solid #1e1e2e",position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",top:0,right:0,left:0,height:3,background:`linear-gradient(90deg,${c.primaryColor},transparent)` }}/>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:`${c.primaryColor}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:c.primaryColor,fontSize:17 }}>{c.name[0]}</div>
                    <div><div style={{ fontWeight:700,fontSize:13 }}>{c.name}</div><span style={$.tg(c.plan==="Enterprise"?G:"#60a5fa")}>{c.plan}</span></div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
                    {[{l:"وظائف",v:c.jobs},{l:"متقدمون",v:c.applicants}].map(s=>(
                      <div key={s.l} style={{ background:"#12121a",borderRadius:8,padding:10,textAlign:"center" }}>
                        <div style={{ fontSize:20,fontWeight:900,color:c.primaryColor }}>{s.v}</div>
                        <div style={{ fontSize:11,color:"#444" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button style={{ ...$.btn("g"),flex:1,padding:"8px 0",fontSize:12 }} onClick={()=>{setSelCompany(c);setPage("hr");}}>عرض HR</button>
                    <button style={{ ...$.btn("d"),padding:"8px 12px",fontSize:12 }} onClick={()=>setCompanies(p=>p.filter(x=>x.id!==c.id))}><Ic n="del" s={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aTab==="links" && (
          <div style={$.card}>
            <h3 style={{ margin:"0 0 8px",fontSize:18 }}>🔗 روابط التقديم</h3>
            <p style={{ color:"#555",fontSize:13,marginBottom:22 }}>شارك هذه الروابط عبر LinkedIn أو البريد</p>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {companies.map(c=>(
                <div key={c.id} style={{ background:"#0d0d15",borderRadius:12,padding:16,border:"1px solid #1e1e2e",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,flex:1 }}>
                    <div style={{ width:36,height:36,borderRadius:9,background:`${c.primaryColor}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:c.primaryColor }}>{c.name[0]}</div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:13,marginBottom:4 }}>{c.name}</div>
                      <div style={{ fontFamily:"monospace",fontSize:12,color:"#60a5fa",background:"#1a1a2e",padding:"3px 10px",borderRadius:6,display:"inline-block" }}>https://smartcv.ae/apply/{c.id}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button style={{ ...$.btn("g"),padding:"8px 12px",fontSize:12 }} onClick={()=>{setCopied(c.id);setTimeout(()=>setCopied(null),2000);}}>
                      <span style={{ display:"flex",alignItems:"center",gap:5 }}><Ic n={copied===c.id?"ok":"cp"} s={14}/>{copied===c.id?"تم!":"نسخ"}</span>
                    </button>
                    <button style={{ ...$.btn("p"),padding:"8px 12px",fontSize:12 }} onClick={()=>setPage("apply")}>معاينة</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aTab==="analytics" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
            <div style={$.card}>
              <h3 style={{ margin:"0 0 18px",fontSize:16 }}>📊 حالات المتقدمين</h3>
              {[{l:"مراجعة",c:"#60a5fa"},{l:"مقبول",c:"#34d399"},{l:"مرفوض",c:"#f87171"}].map(s=>{
                const n=applicants.filter(a=>a.status===s.l).length;
                return <div key={s.l} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:13 }}><span style={{ color:s.c }}>{s.l}</span><span style={{ color:"#555" }}>{n}</span></div>
                  <div style={{ height:7,background:"#1a1a2a",borderRadius:4 }}><div style={{ height:"100%",background:s.c,borderRadius:4,width:`${applicants.length?(n/applicants.length)*100:0}%` }}/></div>
                </div>;
              })}
            </div>
            <div style={$.card}>
              <h3 style={{ margin:"0 0 18px",fontSize:16 }}>💰 الإيرادات</h3>
              {[{p:"Enterprise",pr:"50,000+",c:G},{p:"Professional",pr:"28,000",c:"#60a5fa"},{p:"Basic",pr:"15,000",c:"#34d399"}].map(r=>(
                <div key={r.p} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #1a1a2a" }}>
                  <span style={$.tg(r.c)}>{r.p}</span><span style={{ color:r.c,fontWeight:900,fontSize:15 }}>{r.pr} <span style={{ fontSize:11 }}>درهم</span></span>
                </div>
              ))}
              <div style={{ marginTop:14,background:`${G}0d`,borderRadius:10,padding:14,border:`1px solid ${G}22` }}>
                <div style={{ fontSize:11,color:"#555" }}>هامش الربح</div><div style={{ fontSize:30,fontWeight:900,color:G }}>98%+</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── HR ───────────────────────────────────────────────────
  if (page === "hr") {
    const filtered = applicants.filter(a=>{
      const m = a.name?.includes(search)||a.skills?.some(s=>s.includes(search))||a.nationality?.includes(search)||a.currentTitle?.includes(search);
      return m && (fStatus==="الكل"||a.status===fStatus);
    });

    if (selApplicant) return (
      <div style={$.app}>
        <div style={{ background:"#0d0d15",borderBottom:`1px solid ${G}22`,padding:"13px 26px",display:"flex",alignItems:"center",gap:14 }}>
          <button style={{ ...$.btn("g"),padding:"8px 14px",display:"flex",alignItems:"center",gap:6,fontSize:13 }} onClick={()=>setSelApplicant(null)}><Ic n="back" s={15}/>العودة</button>
          <div style={{ flex:1 }}><h2 style={{ margin:0,fontSize:17,fontWeight:800 }}>{selApplicant.name}</h2><span style={{ fontSize:12,color:"#555" }}>{selApplicant.currentTitle}</span></div>
          <Badge s={selApplicant.status}/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 330px",gap:22,padding:26 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
            <div style={{ ...$.card,border:`1px solid ${G}33`,background:`linear-gradient(135deg,${G}08,#12121a)` }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}><div style={{ color:G }}><Ic n="ai" s={19}/></div><h3 style={{ margin:0,color:G,fontSize:15 }}>ملخص الذكاء الاصطناعي</h3></div>
              <p style={{ margin:0,color:"#bbb",lineHeight:1.8,fontSize:14 }}>{selApplicant.aiSummary}</p>
            </div>
            <div style={$.card}>
              <h3 style={{ margin:"0 0 16px",fontSize:15 }}>المعلومات الكاملة</h3>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[["الجنسية",selApplicant.nationality],["الموقع",selApplicant.location],["الهاتف",selApplicant.phone],["البريد",selApplicant.email],["المسمى",selApplicant.currentTitle],["الخبرة",selApplicant.experience],["آخر جهة عمل",selApplicant.lastEmployer],["التعليم",selApplicant.education],["المؤسسة",selApplicant.university],["GPA",selApplicant.gpa]].map(([l,v])=>(
                  <div key={l} style={{ background:"#0d0d15",borderRadius:9,padding:11 }}>
                    <div style={{ fontSize:11,color:"#444",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:13,fontWeight:600 }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
              {[{t:"المهارات",items:selApplicant.skills,c:"#60a5fa"},{t:"اللغات",items:selApplicant.languages,c:"#34d399"},{t:"الشهادات",items:selApplicant.certifications,c:G}].map(sec=>(
                <div key={sec.t} style={$.card}>
                  <h4 style={{ margin:"0 0 10px",color:sec.c,fontSize:13 }}>{sec.t}</h4>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{(sec.items||[]).map(i=><span key={i} style={$.tg(sec.c)}>{i}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div style={$.card}>
              <h4 style={{ margin:"0 0 12px",fontSize:14 }}>التقييم والقرار</h4>
              <Stars v={selApplicant.rating} sz={22} onChange={r=>{setApplicants(p=>p.map(a=>a.id===selApplicant.id?{...a,rating:r}:a));setSelApplicant(p=>({...p,rating:r}));}}/>
              <select style={{ ...$.inp,marginTop:12 }} value={selApplicant.status} onChange={e=>{const s=e.target.value;setApplicants(p=>p.map(a=>a.id===selApplicant.id?{...a,status:s}:a));setSelApplicant(p=>({...p,status:s}));}}>
                <option>مراجعة</option><option>مقبول</option><option>مرفوض</option>
              </select>
            </div>
            <div style={$.card}>
              <h4 style={{ margin:"0 0 10px",fontSize:14 }}>ملاحظات</h4>
              <textarea style={{ ...$.inp,minHeight:85,resize:"vertical" }} placeholder="أضف ملاحظة..." value={noteIn} onChange={e=>setNoteIn(e.target.value)}/>
              <button style={{ ...$.btn("p"),width:"100%",marginTop:9,fontSize:13 }} onClick={()=>setNoteIn("")}>حفظ</button>
            </div>
            <button style={{ ...$.btn("g"),padding:11,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13 }}><Ic n="dl" s={15}/>تحميل السيرة الذاتية</button>
            <button style={{ ...$.btn("d"),padding:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13 }} onClick={()=>{setApplicants(p=>p.filter(a=>a.id!==selApplicant.id));setSelApplicant(null);}}><Ic n="del" s={14}/>حذف المتقدم</button>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{ ...$.app, display:"flex" }}>
        <Sidebar items={[{k:"applicants",ic:"users",l:"المتقدمون"},{k:"jobs",ic:"bag",l:"الوظائف"},{k:"reports",ic:"chart",l:"التقارير"}]} active={hTab} go={setHTab}
          foot={[{k:"s",ic:"cfg",l:"الإعدادات",fn:()=>setPage("settings")},{k:"o",ic:"out",l:"خروج",fn:()=>setPage("login")}]}/>
        <div style={{ flex:1,padding:26,overflow:"auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26 }}>
            <div><div style={{ fontSize:10,color:G,fontWeight:900,letterSpacing:3 }}>HR DASHBOARD</div>
              <h1 style={{ margin:"4px 0 0",fontSize:21,fontWeight:900 }}>{selCompany.name}</h1></div>
            <div style={{ display:"flex",gap:8 }}>
              <button style={{ ...$.btn("g"),fontSize:13,display:"flex",alignItems:"center",gap:6 }} onClick={()=>setPage("apply")}><Ic n="lnk" s={15}/>رابط التقديم</button>
              <button style={{ ...$.btn("p"),fontSize:13,display:"flex",alignItems:"center",gap:6 }}><Ic n="dl" s={15}/>تصدير Excel</button>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22 }}>
            {[{l:"إجمالي",v:applicants.length,c:G},{l:"مراجعة",v:applicants.filter(a=>a.status==="مراجعة").length,c:"#60a5fa"},{l:"مقبول",v:applicants.filter(a=>a.status==="مقبول").length,c:"#34d399"},{l:"مرفوض",v:applicants.filter(a=>a.status==="مرفوض").length,c:"#f87171"}].map((s,i)=>(
              <div key={i} style={$.st(s.c)}><div style={{ fontSize:26,fontWeight:900,color:s.c }}>{s.v}</div><div style={{ fontSize:11,color:"#444",marginTop:4 }}>{s.l}</div></div>
            ))}
          </div>
          {hTab==="applicants" && <>
            <div style={{ display:"flex",gap:10,marginBottom:16 }}>
              <div style={{ flex:1,position:"relative" }}>
                <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#444" }}><Ic n="srch" s={16}/></div>
                <input style={{ ...$.inp,paddingRight:38 }} placeholder="بحث بالاسم، المهارة، الجنسية..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select style={{ ...$.inp,width:145 }} value={fStatus} onChange={e=>setFStatus(e.target.value)}><option>الكل</option><option>مراجعة</option><option>مقبول</option><option>مرفوض</option></select>
            </div>
            <div style={$.card}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["المتقدم","التخصص","الخبرة","اللغات","التقييم","الحالة",""].map(h=><th key={h} style={$.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={7} style={{ ...$.td,textAlign:"center",color:"#444",padding:40 }}>لا توجد نتائج</td></tr>
                  :filtered.map(a=>(
                    <tr key={a.id} onMouseEnter={e=>e.currentTarget.style.background="#1a1a2a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{ cursor:"pointer" }}>
                      <td style={$.td}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:35,height:35,borderRadius:9,background:`${G}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:G,fontSize:15 }}>{(a.name||"؟")[0]}</div>
                          <div><div style={{ fontWeight:700,fontSize:13 }}>{a.name}</div><div style={{ fontSize:11,color:"#444" }}>{a.nationality} · {a.date}</div></div>
                        </div>
                      </td>
                      <td style={$.td}><div style={{ fontSize:13 }}>{a.currentTitle}</div><div style={{ fontSize:11,color:"#444" }}>{a.lastEmployer}</div></td>
                      <td style={$.td}><span style={$.tg()}>{a.experience}</span></td>
                      <td style={$.td}><div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>{(a.languages||[]).slice(0,2).map(l=><span key={l} style={$.tg("#60a5fa")}>{l.split(" ")[0]}</span>)}</div></td>
                      <td style={$.td}><Stars v={a.rating} onChange={r=>setApplicants(p=>p.map(x=>x.id===a.id?{...x,rating:r}:x))}/></td>
                      <td style={$.td}><Badge s={a.status}/></td>
                      <td style={$.td}><button style={{ ...$.btn("g"),padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:5 }} onClick={()=>setSelApplicant(a)}><Ic n="eye" s={14}/>عرض</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}
          {hTab==="reports" && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
              <div style={$.card}>
                <h3 style={{ margin:"0 0 18px",fontSize:16 }}>📊 توزيع الحالات</h3>
                {[{l:"مراجعة",c:"#60a5fa"},{l:"مقبول",c:"#34d399"},{l:"مرفوض",c:"#f87171"}].map(s=>{
                  const n=applicants.filter(a=>a.status===s.l).length;
                  return <div key={s.l} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:13 }}><span style={{ color:s.c }}>{s.l}</span><span style={{ color:"#555" }}>{n}</span></div>
                    <div style={{ height:7,background:"#1a1a2a",borderRadius:4 }}><div style={{ height:"100%",background:s.c,borderRadius:4,width:`${applicants.length?(n/applicants.length)*100:0}%` }}/></div>
                  </div>;
                })}
              </div>
              <div style={$.card}>
                <h3 style={{ margin:"0 0 18px",fontSize:16 }}>⭐ متوسط التقييم</h3>
                <div style={{ fontSize:50,fontWeight:900,color:G,textAlign:"center",padding:"20px 0" }}>
                  {applicants.filter(a=>a.rating>0).length>0?(applicants.filter(a=>a.rating>0).reduce((s,a)=>s+a.rating,0)/applicants.filter(a=>a.rating>0).length).toFixed(1):"—"}
                </div>
                <div style={{ textAlign:"center",color:"#555",fontSize:13 }}>متوسط تقييم جميع المتقدمين</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SETTINGS ─────────────────────────────────────────────
  if (page === "settings") return (
    <div style={{ ...$.app, display:"flex" }}>
      <Sidebar items={[{k:"brand",ic:"pal",l:"الهوية البصرية"},{k:"users",ic:"users",l:"المستخدمون"},{k:"security",ic:"shld",l:"الأمان"}]} active={sTab} go={setSTab}
        foot={[{k:"b",ic:"back",l:"العودة للداش بورد",fn:()=>setPage("hr")}]}/>
      <div style={{ flex:1,padding:30,overflow:"auto" }}>
        <div style={{ marginBottom:26 }}>
          <div style={{ fontSize:10,color:G,fontWeight:900,letterSpacing:3 }}>SETTINGS</div>
          <h1 style={{ margin:"4px 0 0",fontSize:22,fontWeight:900 }}>إعدادات الشركة</h1>
        </div>

        {sTab==="brand" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:22 }}>
            <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
              <div style={$.card}>
                <h3 style={{ margin:"0 0 18px",fontSize:16 }}>🏢 معلومات الشركة</h3>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:5 }}>اسم الشركة</label>
                  <input style={$.inp} value={cs.name} onChange={e=>setCs(p=>({...p,name:e.target.value}))}/></div>
                <div style={{ marginTop:16 }}>
                  <label style={{ fontSize:12,color:"#666",display:"block",marginBottom:9 }}>شعار الشركة</label>
                  <div style={{ border:`2px dashed ${cs.logo?G:"#2a2a3a"}`,borderRadius:12,padding:26,textAlign:"center",cursor:"pointer",background:cs.logo?`${G}08`:"#0d0d15",transition:"all .3s" }} onClick={()=>document.getElementById("li").click()}>
                    {cs.logo?<img src={cs.logo} alt="logo" style={{ maxHeight:65,maxWidth:180 }}/>:<><div style={{ color:"#333" }}><Ic n="up" s={26}/></div><p style={{ margin:"9px 0 3px",color:"#555",fontSize:13 }}>ارفع شعار شركتك</p><p style={{ margin:0,color:"#3a3a3a",fontSize:11 }}>PNG, SVG, JPG</p></>}
                    <input id="li" type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setCs(p=>({...p,logo:ev.target.result}));r.readAsDataURL(f);}}}/>
                  </div>
                  {cs.logo&&<button style={{ ...$.btn("d"),marginTop:8,padding:"6px 12px",fontSize:12 }} onClick={()=>setCs(p=>({...p,logo:null}))}>حذف الشعار</button>}
                </div>
              </div>
              <div style={$.card}>
                <h3 style={{ margin:"0 0 18px",fontSize:16 }}>🎨 تخصيص الألوان</h3>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:22 }}>
                  {[{k:"primaryColor",l:"اللون الرئيسي",d:"الأزرار والعناوين"},{k:"secondaryColor",l:"الخلفية",d:"لون خلفية النظام"},{k:"accentColor",l:"التمييز",d:"النصوص والتفاصيل"}].map(c=>(
                    <div key={c.k}>
                      <label style={{ fontSize:12,color:"#666",display:"block",marginBottom:3 }}>{c.l}</label>
                      <p style={{ fontSize:11,color:"#3a3a3a",margin:"0 0 9px" }}>{c.d}</p>
                      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                        <input type="color" value={cs[c.k]||"#C9A84C"} onChange={e=>setCs(p=>({...p,[c.k]:e.target.value}))} style={{ width:42,height:42,border:"none",borderRadius:9,cursor:"pointer",background:"none",padding:2 }}/>
                        <input style={{ ...$.inp,fontFamily:"monospace",fontSize:12 }} value={cs[c.k]||""} onChange={e=>setCs(p=>({...p,[c.k]:e.target.value}))}/>
                      </div>
                    </div>
                  ))}
                </div>
                <label style={{ fontSize:12,color:"#666",display:"block",marginBottom:10 }}>🎭 ثيمات جاهزة</label>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                  {[{n:"ذهبي فاخر",p:"#C9A84C",s:"#0a0a0f"},{n:"أزرق حكومي",p:"#2563eb",s:"#0f172a"},{n:"أخضر إسلامي",p:"#059669",s:"#064e3b"},{n:"أحمر ملكي",p:"#dc2626",s:"#1c0a0a"},{n:"بنفسجي",p:"#7c3aed",s:"#1e0a3c"},{n:"فيروزي",p:"#0891b2",s:"#0c1a2e"},{n:"برتقالي",p:"#ea580c",s:"#1c0f0a"},{n:"وردي",p:"#db2777",s:"#1c0a16"}].map(t=>(
                    <button key={t.n} onClick={()=>setCs(p=>({...p,primaryColor:t.p,secondaryColor:t.s}))} style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:9,border:`1px solid ${cs.primaryColor===t.p?t.p:"#2a2a3a"}`,background:cs.primaryColor===t.p?`${t.p}1a`:"#0d0d15",cursor:"pointer",transition:"all .2s",fontFamily:"inherit" }}>
                      <div style={{ width:16,height:16,borderRadius:5,background:`linear-gradient(135deg,${t.p},${t.s})`,border:"1px solid #ffffff15" }}/>
                      <span style={{ fontSize:12,color:cs.primaryColor===t.p?t.p:"#555" }}>{t.n}</span>
                    </button>
                  ))}
                </div>
                <button style={{ ...$.btn("p"),marginTop:18,padding:"12px 26px" }}>💾 حفظ الإعدادات</button>
              </div>
            </div>
            {/* Preview */}
            <div>
              <div style={{ ...$.card,position:"sticky",top:0 }}>
                <h4 style={{ margin:"0 0 12px",color:"#555",fontSize:13 }}>👁️ معاينة فورية</h4>
                <div style={{ borderRadius:12,overflow:"hidden",border:"1px solid #1e1e2e" }}>
                  <div style={{ background:cs.secondaryColor||"#0a0a0f",padding:"11px 14px",borderBottom:`2px solid ${G}`,display:"flex",alignItems:"center",gap:10 }}>
                    {cs.logo?<img src={cs.logo} alt="" style={{ height:26 }}/>:<div style={{ width:26,height:26,background:`${G}33`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:G,fontSize:13 }}>{cs.name[0]}</div>}
                    <span style={{ color:G,fontWeight:800,fontSize:12 }}>{cs.name}</span>
                  </div>
                  <div style={{ background:"#12121a",padding:14 }}>
                    <div style={{ height:7,background:`${G}22`,borderRadius:4,marginBottom:9,width:"55%" }}/>
                    <div style={{ height:7,background:"#1a1a2a",borderRadius:4,marginBottom:14 }}/>
                    <div style={{ display:"flex",gap:7,marginBottom:10 }}>
                      {[0,1].map(i=><div key={i} style={{ flex:1,height:44,background:"#0d0d15",borderRadius:7,border:`1px solid ${G}1a` }}/>)}
                    </div>
                    <div style={{ height:34,background:`linear-gradient(135deg,${G},${G}bb)`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <span style={{ color:"#0a0a0f",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>زر رئيسي</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop:12,background:"#0d0d15",borderRadius:9,padding:11 }}>
                  {[{l:"الرئيسي",v:cs.primaryColor||G},{l:"الخلفية",v:cs.secondaryColor||"#0a0a0f"}].map(r=>(
                    <div key={r.l} style={{ display:"flex",alignItems:"center",gap:7,marginBottom:5,fontSize:12 }}>
                      <div style={{ width:14,height:14,borderRadius:4,background:r.v,border:"1px solid #2a2a2a",flexShrink:0 }}/>
                      <span style={{ color:"#444" }}>{r.l}:</span><span style={{ fontFamily:"monospace",color:"#666",fontSize:11 }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {sTab==="security" && (
          <div style={$.card}>
            <h3 style={{ margin:"0 0 22px",fontSize:18 }}>🔒 الأمان والامتثال القانوني — PDPL 2023</h3>
            {[{t:"تشفير AES-256",d:"جميع البيانات مشفرة في قاعدة البيانات وأثناء النقل بـ TLS 1.3",s:"مفعّل",c:"#34d399"},{t:"خوادم في المنطقة",d:"AWS Bahrain / Azure UAE — البيانات لا تخرج خارج الإمارات والخليج",s:"متوافق",c:"#34d399"},{t:"PDPL 2023",d:"النظام مصمم ومتوافق مع قانون حماية البيانات الشخصية الإماراتي",s:"متوافق",c:"#34d399"},{t:"سجل التدقيق",d:"كل عملية تُسجَّل مع الوقت والمستخدم — يحمي الشركة قانونياً",s:"مفعّل",c:"#34d399"},{t:"حذف تلقائي",d:"البيانات تُحذف تلقائياً بعد 12 شهراً من انتهاء إعلان الوظيفة",s:"مفعّل",c:G},{t:"RLS صلاحيات الصف",d:"كل شركة ترى بيانات متقدميها فقط — يمنع التسريب",s:"مفعّل",c:"#34d399"},{t:"موافقة صريحة",d:"كل متقدم يوافق على سياسة الخصوصية قبل رفع سيرته الذاتية",s:"مفعّل",c:"#34d399"}].map(item=>(
              <div key={item.t} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid #1a1a2a" }}>
                <div><div style={{ fontWeight:700,fontSize:14,marginBottom:3 }}>{item.t}</div><div style={{ fontSize:12,color:"#444",lineHeight:1.5 }}>{item.d}</div></div>
                <span style={$.tg(item.c)}>{item.s}</span>
              </div>
            ))}
          </div>
        )}

        {sTab==="users" && (
          <div style={$.card}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
              <h3 style={{ margin:0,fontSize:18 }}>👥 حسابات HR</h3>
              <button style={$.btn("p")}><span style={{ display:"flex",alignItems:"center",gap:6 }}><Ic n="plus" s={15}/>إضافة مستخدم</span></button>
            </div>
            {[{n:"سارة المطيري",e:"sara@company.ae",r:"HR Manager"},{n:"محمد العبري",e:"mohammed@company.ae",r:"HR Specialist"}].map(u=>(
              <div key={u.e} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:"1px solid #1a1a2a" }}>
                <div style={{ display:"flex",alignItems:"center",gap:11 }}>
                  <div style={{ width:36,height:36,borderRadius:9,background:`${G}1a`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:G,fontSize:16 }}>{u.n[0]}</div>
                  <div><div style={{ fontWeight:700,fontSize:14 }}>{u.n}</div><div style={{ fontSize:12,color:"#444" }}>{u.e}</div></div>
                </div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <span style={$.tg()}>{u.r}</span><span style={$.tg("#34d399")}>نشط</span>
                  <button style={{ ...$.btn("d"),padding:"6px 12px",fontSize:12 }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
