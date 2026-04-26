"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Icon from "../../../components/shared/Icon";
import Sidebar from "../../../components/shared/Sidebar";
import Stars from "../../../components/shared/Stars";
import Badge from "../../../components/shared/Badge";
import { AiScore } from "../../../components/shared/AiScore";
import { createTheme } from "../../../lib/theme";

const T = {
  ar: {
    portal: "HR DASHBOARD", applicants: "المتقدمون", jobs: "الوظائف",
    reports: "التقارير", interviews: "المقابلات", settings: "الإعدادات",
    logout: "خروج", applyLink: "رابط التقديم", exportExcel: "تصدير Excel",
    total: "إجمالي", review: "مراجعة", accepted: "مقبول", rejected: "مرفوض",
    search: "بحث بالاسم، المهارة، الجنسية...", all: "الكل",
    name: "المتقدم", title: "التخصص", experience: "الخبرة",
    languages: "اللغات", rating: "التقييم", status: "الحالة", view: "عرض",
    noResults: "لا توجد نتائج", back: "العودة", aiSummary: "ملخص الذكاء الاصطناعي",
    fullInfo: "المعلومات الكاملة", skills: "المهارات", langs: "اللغات",
    certs: "الشهادات", decision: "التقييم والقرار", notes: "ملاحظات",
    addNote: "أضف ملاحظة...", save: "حفظ", downloadCV: "تحميل السيرة الذاتية",
    deleteApplicant: "حذف المتقدم", scheduleInterview: "جدولة مقابلة",
    interviewDate: "تاريخ المقابلة", interviewTime: "وقت المقابلة",
    interviewNotes: "ملاحظات المقابلة", saveInterview: "حفظ الموعد",
    cancel: "إلغاء", scheduled: "مجدولة", statusDist: "توزيع الحالات",
    avgRating: "متوسط التقييم", avgRatingAll: "متوسط تقييم جميع المتقدمين",
    scheduledInterviews: "المقابلات المجدولة", noInterviews: "لا توجد مقابلات مجدولة",
    nationality: "الجنسية", location: "الموقع", phone: "الهاتف",
    email: "البريد", jobTitle: "المسمى", exp: "الخبرة",
    lastEmployer: "آخر جهة عمل", education: "التعليم", university: "المؤسسة", gpa: "GPA",
    loading: "جاري التحميل...", darkMode: "وضع داكن", lightMode: "وضع فاتح",
    date: "التاريخ",
  },
  en: {
    portal: "HR DASHBOARD", applicants: "Applicants", jobs: "Jobs",
    reports: "Reports", interviews: "Interviews", settings: "Settings",
    logout: "Logout", applyLink: "Apply Link", exportExcel: "Export Excel",
    total: "Total", review: "Under Review", accepted: "Accepted", rejected: "Rejected",
    search: "Search by name, skill, nationality...", all: "All",
    name: "Applicant", title: "Specialization", experience: "Experience",
    languages: "Languages", rating: "Rating", status: "Status", view: "View",
    noResults: "No results found", back: "Back", aiSummary: "AI Summary",
    fullInfo: "Full Information", skills: "Skills", langs: "Languages",
    certs: "Certifications", decision: "Rating & Decision", notes: "Notes",
    addNote: "Add a note...", save: "Save", downloadCV: "Download CV",
    deleteApplicant: "Delete Applicant", scheduleInterview: "Schedule Interview",
    interviewDate: "Interview Date", interviewTime: "Interview Time",
    interviewNotes: "Interview Notes", saveInterview: "Save Schedule",
    cancel: "Cancel", scheduled: "Scheduled", statusDist: "Status Distribution",
    avgRating: "Average Rating", avgRatingAll: "Average rating of all applicants",
    scheduledInterviews: "Scheduled Interviews", noInterviews: "No scheduled interviews",
    nationality: "Nationality", location: "Location", phone: "Phone",
    email: "Email", jobTitle: "Job Title", exp: "Experience",
    lastEmployer: "Last Employer", education: "Education", university: "University", gpa: "GPA",
    loading: "Loading...", darkMode: "Dark Mode", lightMode: "Light Mode",
    date: "Date",
  },
};

export default function HRDashboard() {
  const router = useRouter();

  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("ar");
  const t = (k) => T[lang][k] || k;
  const $ = createTheme("#C9A84C", dark);
  const G = "#C9A84C";

  const [user, setUser] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({ title: "", description: "", requirements: "", location: "", jobType: "دوام كامل" });
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [copiedJob, setCopiedJob] = useState(null);

  const [selApplicant, setSelApplicant] = useState(null);
  const [hTab, setHTab] = useState("applicants");
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("الكل");
  const [noteIn, setNoteIn] = useState("");
  const [showInterview, setShowInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: "", time: "", notes: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCopied, setSettingsCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", ok: false });
  const [fJob, setFJob] = useState("all");
  const [fRating, setFRating] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [aiTab, setAiTab] = useState("rank");
  const [rankLoading, setRankLoading] = useState(false);
  const [rankedList, setRankedList] = useState([]);
  const [rankJobId, setRankJobId] = useState("all");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [interviewQs, setInterviewQs] = useState(null);
  const [interviewQsLoading, setInterviewQsLoading] = useState(false);
  const [offerLetter, setOfferLetter] = useState(null);
  const [offerLetterLoading, setOfferLetterLoading] = useState(false);
  const [aiModal, setAiModal] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((me) => {
        if (me.error) { router.push("/hr/login"); return; }
        setUser(me);
        const companyId = me.companyId;
        const url = companyId ? `/api/applicants?companyId=${companyId}` : "/api/applicants";
        return Promise.all([
          fetch(url).then((r) => r.json()),
          fetch(`/api/jobs?companyId=${me.companyId}`).then((r) => r.json()),
        ]);
      })
      .then(([apps, jbs]) => {
        if (Array.isArray(apps)) setApplicants(apps);
        if (Array.isArray(jbs)) setJobs(jbs);
      })
      .finally(() => setLoading(false));
  }, []);

  const primaryColor = user?.primaryColor || G;
  const companyName = user?.companyName || "لوحة الموارد البشرية";
  const companyId = user?.companyId;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/hr/login");
  };

  const updateApplicant = async (id, updates) => {
    setSaving(true);
    await fetch(`/api/applicants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
    setApplicants((p) => p.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    if (selApplicant?.id === id) setSelApplicant((p) => ({ ...p, ...updates }));
    setSaving(false);
  };

  const deleteApplicant = async (id, name) => {
    const msg = lang === "ar"
      ? `هل تريد حذف بيانات "${name}" نهائياً؟\n\nهذا الإجراء لا يمكن التراجع عنه وفقاً لقانون PDPL 2023.`
      : `Permanently delete all data for "${name}"?\n\nThis action cannot be undone (PDPL 2023).`;
    if (!confirm(msg)) return;
    await fetch(`/api/applicants/${id}`, { method: "DELETE" }).catch(() => {});
    setApplicants((p) => p.filter((a) => a.id !== id));
    setSelApplicant(null);
  };

  const exportToExcel = (source) => {
    const list = source === "selected" && selectedIds.length > 0
      ? applicants.filter((a) => selectedIds.includes(a.id))
      : source === "filtered" ? sortedFiltered : applicants;
    const data = list.map((a) => ({
      الاسم: a.name, البريد: a.email, الهاتف: a.phone,
      الجنسية: a.nationality, الموقع: a.location,
      "المسمى الوظيفي": a.currentTitle, "سنوات الخبرة": a.experience,
      "آخر جهة عمل": a.lastEmployer, التعليم: a.education,
      الجامعة: a.university, "المعدل GPA": a.gpa,
      الحالة: a.status, التقييم: a.rating,
      "تاريخ التقديم": a.date, "موعد المقابلة": a.interviewDate || "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المتقدمون");
    XLSX.writeFile(wb, `applicants_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const saveInterview = async () => {
    if (!interviewForm.date || !interviewForm.time) return;
    await updateApplicant(selApplicant.id, {
      interviewDate: interviewForm.date,
      interviewTime: interviewForm.time,
      interviewNotes: interviewForm.notes,
    });
    setShowInterview(false);
  };

  const saveNote = async () => {
    if (!noteIn.trim()) return;
    await updateApplicant(selApplicant.id, { notes: noteIn });
    setNoteIn("");
  };

  const [refreshing, setRefreshing] = useState(false);
  const refreshApplicants = async () => {
    if (!companyId || refreshing) return;
    setRefreshing(true);
    try {
      const [apps, jbs] = await Promise.all([
        fetch(`/api/applicants?companyId=${companyId}`).then((r) => r.json()),
        fetch(`/api/jobs?companyId=${companyId}`).then((r) => r.json()),
      ]);
      if (Array.isArray(apps)) setApplicants(apps);
      if (Array.isArray(jbs)) setJobs(jbs);
    } finally {
      setRefreshing(false);
    }
  };

  const changeOwnPassword = async () => {
    setPwMsg({ text: "", ok: false });
    if (!pwForm.next || pwForm.next.length < 8) { setPwMsg({ text: "كلمة المرور الجديدة 8 أحرف على الأقل", ok: false }); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ text: "كلمتا المرور غير متطابقتين", ok: false }); return; }
    if (!user?.hrId) { setPwMsg({ text: "لا يمكن تحديد الحساب", ok: false }); return; }
    const res = await fetch(`/api/hr-accounts/${user.hrId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwForm.next }),
    });
    if (res.ok) {
      setPwMsg({ text: "✓ تم تغيير كلمة المرور بنجاح", ok: true });
      setPwForm({ current: "", next: "", confirm: "" });
    } else {
      const d = await res.json();
      setPwMsg({ text: d.error || "حدث خطأ", ok: false });
    }
  };

  const arStatus = { "Under Review": "مراجعة", "Accepted": "مقبول", "Rejected": "مرفوض" };

  const filtered = applicants.filter((a) => {
    const q = search.toLowerCase();
    const matches =
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.skills?.some((s) => s.toLowerCase().includes(q)) ||
      a.nationality?.includes(search) ||
      a.currentTitle?.toLowerCase().includes(q);
    if (!matches) return false;
    if (fStatus !== "الكل" && fStatus !== "All") {
      const arF = arStatus[fStatus] || fStatus;
      if (a.status !== arF) return false;
    }
    if (fJob !== "all" && a.jobId !== fJob) return false;
    if (fRating > 0 && (a.rating || 0) < fRating) return false;
    return true;
  });
  const hasActiveFilter = fStatus !== "الكل" || fJob !== "all" || fRating > 0 || search;

  const sortedFiltered = [...filtered].sort((a, b) => {
    let va, vb;
    if (sortBy === "rating") { va = a.rating || 0; vb = b.rating || 0; }
    else if (sortBy === "name") { va = a.name || ""; vb = b.name || ""; }
    else if (sortBy === "date") { va = a.date || ""; vb = b.date || ""; }
    else if (sortBy === "experience") { va = parseInt(a.experience) || 0; vb = parseInt(b.experience) || 0; }
    else if (sortBy === "aiScore") { va = a.aiScore ?? -1; vb = b.aiScore ?? -1; }
    else { va = ""; vb = ""; }
    if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };
  const sortArrow = (col) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  const totalPages = Math.ceil(sortedFiltered.length / PAGE_SIZE);
  const pagedApplicants = sortedFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const scheduledInterviews = applicants.filter((a) => a.interviewDate);

  const addJob = async () => {
    if (!jobForm.title) return;
    setJobLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...jobForm, companyId }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobs((p) => [data, ...p]);
        setShowJobForm(false);
        setJobForm({ title: "", description: "", requirements: "", location: "", jobType: "دوام كامل" });
      }
    } finally {
      setJobLoading(false);
    }
  };

  const toggleJob = async (job) => {
    await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !job.isActive }),
    });
    setJobs((p) => p.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)));
  };

  const deleteJob = async (id) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs((p) => p.filter((j) => j.id !== id));
  };

  const saveEditJob = async () => {
    if (!editingJob?.title) return;
    setJobLoading(true);
    const res = await fetch(`/api/jobs/${editingJob.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingJob.title, description: editingJob.description, requirements: editingJob.requirements, location: editingJob.location, jobType: editingJob.jobType }),
    });
    if (res.ok) {
      setJobs((p) => p.map((j) => j.id === editingJob.id ? { ...j, ...editingJob } : j));
      setEditingJob(null);
    }
    setJobLoading(false);
  };

  const copyJobLink = (token) => {
    const link = `${window.location.origin}/applicant/apply/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedJob(token);
    setTimeout(() => setCopiedJob(null), 2000);
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const bulkUpdateStatus = async (status) => {
    await Promise.all(selectedIds.map((id) =>
      fetch(`/api/applicants/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    ));
    setApplicants((p) => p.map((a) => selectedIds.includes(a.id) ? { ...a, status } : a));
    setSelectedIds([]);
  };

  const reviewCount = applicants.filter((a) => a.status === "مراجعة").length;
  const sidebarItems = [
    { k: "applicants", ic: "users", l: t("applicants"), badge: reviewCount || null },
    { k: "jobs", ic: "bag", l: t("jobs"), badge: jobs.length || null },
    { k: "interviews", ic: "cal", l: t("interviews"), badge: scheduledInterviews.length || null },
    { k: "reports", ic: "chart", l: t("reports") },
    { k: "ai", ic: "ai", l: "ذكاء اصطناعي" },
  ];

  if (loading) {
    return (
      <div style={{ ...$.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: $.muted }}>{t("loading")}</div>
        </div>
      </div>
    );
  }

  if (selApplicant) return (
    <div style={{ ...$.app, direction: lang === "en" ? "ltr" : "rtl" }}>
      <style>{`@media print { button, a[href="/hr/login"] { display:none!important } body { background:#fff!important; color:#000!important } }`}</style>
      <div style={{ background: $.surface2, borderBottom: `1px solid ${primaryColor}22`, padding: "13px 26px", display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ ...$.btn("g"), padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }} onClick={() => setSelApplicant(null)}>
          <Icon n="back" s={15} />{t("back")}
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{selApplicant.name}</h2>
          <span style={{ fontSize: 12, color: $.muted }}>{selApplicant.currentTitle}</span>
        </div>
        <Badge s={selApplicant.status} />
        {saving && <span style={{ fontSize: 12, color: $.muted }}>💾 جاري الحفظ...</span>}
        <button style={{ ...$.btn("g"), padding: "8px 14px", fontSize: 13 }} onClick={() => window.print()}>🖨️ طباعة / PDF</button>
      </div>

      {showInterview && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...$.card, width: 440, boxShadow: "0 30px 60px #000000cc" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 16, color: primaryColor }}>📅 {t("scheduleInterview")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>{t("interviewDate")}</label>
                <input type="date" style={$.inp} value={interviewForm.date} onChange={(e) => setInterviewForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>{t("interviewTime")}</label>
                <input type="time" style={$.inp} value={interviewForm.time} onChange={(e) => setInterviewForm((p) => ({ ...p, time: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: $.muted, display: "block", marginBottom: 5 }}>{t("interviewNotes")}</label>
                <textarea style={{ ...$.inp, minHeight: 70, resize: "vertical" }} value={interviewForm.notes} onChange={(e) => setInterviewForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button style={{ ...$.btn("p"), flex: 1 }} onClick={saveInterview}>{t("saveInterview")}</button>
                <button style={$.btn("s")} onClick={() => setShowInterview(false)}>{t("cancel")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Questions Modal */}
      {aiModal === "interview" && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "auto", padding: "32px 16px" }}>
          <div style={{ background: $.surface, border: `1px solid ${$.border}`, borderRadius: 18, width: "100%", maxWidth: 700, boxShadow: "0 40px 80px #000000cc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${$.border}` }}>
              <h3 style={{ margin: 0, fontSize: 17, color: "#6366f1" }}>🎤 أسئلة المقابلة — {selApplicant?.name}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...$.btn("g"), padding: "7px 14px", fontSize: 12 }} onClick={() => window.print()}>🖨️ طباعة</button>
                <button style={{ background: "none", border: "none", color: $.muted, cursor: "pointer", fontSize: 22 }} onClick={() => setAiModal(null)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {interviewQsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: $.muted }}>⏳ جاري توليد الأسئلة...</div>
              ) : interviewQs ? (
                [["technical", "🔧 أسئلة تقنية", "#60a5fa"], ["behavioral", "💬 أسئلة سلوكية", "#f59e0b"], ["cultural", "🤝 أسئلة ثقافية", "#22c55e"]].map(([key, label, color]) => (
                  <div key={key} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 12 }}>{label}</div>
                    {(interviewQs[key] || []).map((q, i) => (
                      <div key={i} style={{ background: $.surface2, borderRadius: 10, padding: 14, marginBottom: 8, borderRight: `3px solid ${color}` }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{i + 1}. {q.q}</div>
                        <div style={{ fontSize: 11, color: $.muted }}>💡 {q.hint}</div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#f87171" }}>تعذّر توليد الأسئلة — تحقق من ANTHROPIC_API_KEY</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offer Letter Modal */}
      {aiModal === "offer" && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "auto", padding: "32px 16px" }}>
          <div style={{ background: $.surface, border: `1px solid ${$.border}`, borderRadius: 18, width: "100%", maxWidth: 680, boxShadow: "0 40px 80px #000000cc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${$.border}` }}>
              <h3 style={{ margin: 0, fontSize: 17, color: primaryColor }}>📄 خطاب العرض — {selApplicant?.name}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {offerLetter && (
                  <button style={{ ...$.btn("p"), padding: "7px 14px", fontSize: 12 }} onClick={() => navigator.clipboard.writeText(offerLetter)}>📋 نسخ</button>
                )}
                <button style={{ ...$.btn("g"), padding: "7px 14px", fontSize: 12 }} onClick={() => window.print()}>🖨️ طباعة</button>
                <button style={{ background: "none", border: "none", color: $.muted, cursor: "pointer", fontSize: 22 }} onClick={() => setAiModal(null)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {offerLetterLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: $.muted }}>⏳ جاري توليد خطاب العرض...</div>
              ) : offerLetter ? (
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 2, color: $.text, fontFamily: "inherit", direction: "rtl", margin: 0 }}>{offerLetter}</pre>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#f87171" }}>تعذّر توليد الخطاب — تحقق من ANTHROPIC_API_KEY</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 22, padding: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...$.card, border: `1px solid ${primaryColor}33`, background: dark ? `linear-gradient(135deg,${primaryColor}08,${$.surface})` : `linear-gradient(135deg,${primaryColor}08,#fff)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ color: primaryColor }}><Icon n="ai" s={19} /></div>
              <h3 style={{ margin: 0, color: primaryColor, fontSize: 15 }}>{t("aiSummary")}</h3>
            </div>
            <p style={{ margin: 0, color: $.muted, lineHeight: 1.8, fontSize: 14 }}>{selApplicant.aiSummary || "—"}</p>
          </div>

          {selApplicant.aiScore !== null && selApplicant.aiScore !== undefined && (
            <div style={{ ...$.card, border: `1px solid #6366f133` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <h3 style={{ margin: 0, color: "#6366f1", fontSize: 15 }}>تقييم الذكاء الاصطناعي</h3>
                <AiScore score={selApplicant.aiScore} />
              </div>
              {(selApplicant.aiMatchReasons || []).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 5 }}>✓ نقاط القوة</div>
                  {(selApplicant.aiMatchReasons || []).map((r, i) => (
                    <div key={i} style={{ fontSize: 12, color: $.muted, padding: "3px 0", paddingRight: 12, borderRight: "2px solid #22c55e44" }}>{r}</div>
                  ))}
                </div>
              )}
              {(selApplicant.aiGaps || []).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginBottom: 5 }}>⚠ الفجوات</div>
                  {(selApplicant.aiGaps || []).map((g, i) => (
                    <div key={i} style={{ fontSize: 12, color: $.muted, padding: "3px 0", paddingRight: 12, borderRight: "2px solid #f59e0b44" }}>{g}</div>
                  ))}
                </div>
              )}
              {selApplicant.aiRecommendation && (
                <div style={{ fontSize: 12, color: "#6366f1", background: "#6366f111", borderRadius: 8, padding: "8px 12px", marginTop: 6 }}>
                  💡 {selApplicant.aiRecommendation}
                </div>
              )}
            </div>
          )}

          <div style={$.card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>{t("fullInfo")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                [t("nationality"), selApplicant.nationality, null],
                [t("location"), selApplicant.location, null],
                [t("phone"), selApplicant.phone, selApplicant.phone ? `tel:${selApplicant.phone.replace(/\s/g, "")}` : null],
                [t("email"), selApplicant.email, selApplicant.email ? `mailto:${selApplicant.email}` : null],
                [t("jobTitle"), selApplicant.currentTitle, null],
                [t("exp"), selApplicant.experience, null],
                [t("lastEmployer"), selApplicant.lastEmployer, null],
                [t("education"), selApplicant.education, null],
                [t("university"), selApplicant.university, null],
                [t("gpa"), selApplicant.gpa, null],
              ].map(([l, v, href]) => (
                <div key={l} style={{ background: $.surface2, borderRadius: 9, padding: 11 }}>
                  <div style={{ fontSize: 11, color: $.muted2, marginBottom: 3 }}>{l}</div>
                  {href ? (
                    <a href={href} style={{ fontSize: 13, fontWeight: 600, color: primaryColor, textDecoration: "none" }}>{v}</a>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v || "—"}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[
              { t: t("skills"), items: selApplicant.skills, c: "#60a5fa" },
              { t: t("langs"), items: selApplicant.languages, c: "#34d399" },
              { t: t("certs"), items: selApplicant.certifications, c: primaryColor },
            ].map((sec) => (
              <div key={sec.t} style={$.card}>
                <h4 style={{ margin: "0 0 10px", color: sec.c, fontSize: 13 }}>{sec.t}</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(sec.items || []).map((i) => <span key={i} style={$.tg(sec.c)}>{i}</span>)}
                </div>
              </div>
            ))}
          </div>
          {selApplicant.notes && (
            <div style={$.card}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, color: $.muted }}>📝 {t("notes")}</h4>
              <p style={{ margin: 0, fontSize: 13, color: $.text, lineHeight: 1.7 }}>{selApplicant.notes}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={$.card}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>{t("decision")}</h4>
            <Stars v={selApplicant.rating} sz={22} onChange={(r) => updateApplicant(selApplicant.id, { rating: r })} />
            <select style={{ ...$.inp, marginTop: 12 }} value={selApplicant.status} onChange={(e) => updateApplicant(selApplicant.id, { status: e.target.value })}>
              <option>مراجعة</option>
              <option>مقبول</option>
              <option>مرفوض</option>
            </select>
          </div>
          <div style={$.card}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14 }}>{t("notes")}</h4>
            <textarea style={{ ...$.inp, minHeight: 85, resize: "vertical" }} placeholder={t("addNote")} value={noteIn} onChange={(e) => setNoteIn(e.target.value)} />
            <button style={{ ...$.btn("p"), width: "100%", marginTop: 9, fontSize: 13 }} onClick={saveNote}>{t("save")}</button>
          </div>
          {selApplicant.interviewDate ? (
            <div style={{ ...$.card, border: `1px solid ${primaryColor}33` }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 14, color: primaryColor }}>📅 {t("scheduled")}</h4>
              <div style={{ fontSize: 13 }}>{selApplicant.interviewDate} — {selApplicant.interviewTime}</div>
              {selApplicant.interviewNotes && <div style={{ fontSize: 12, color: $.muted, marginTop: 6 }}>{selApplicant.interviewNotes}</div>}
              <button style={{ ...$.btn("g"), width: "100%", marginTop: 10, fontSize: 13 }} onClick={() => { setInterviewForm({ date: selApplicant.interviewDate, time: selApplicant.interviewTime, notes: selApplicant.interviewNotes || "" }); setShowInterview(true); }}>
                تعديل الموعد
              </button>
            </div>
          ) : (
            <button style={{ ...$.btn("g"), padding: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }} onClick={() => { setInterviewForm({ date: "", time: "", notes: "" }); setShowInterview(true); }}>
              <Icon n="cal" s={15} />{t("scheduleInterview")}
            </button>
          )}
          <button
            style={{ ...$.btn("g"), padding: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}
            onClick={async () => {
              setInterviewQsLoading(true); setAiModal("interview"); setInterviewQs(null);
              const res = await fetch("/api/ai/interview-questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicantId: selApplicant.id }) });
              const d = await res.json();
              setInterviewQs(res.ok ? d : null);
              setInterviewQsLoading(false);
            }}
          >
            🎤 أسئلة المقابلة
          </button>
          {selApplicant.status === "مقبول" && (
            <button
              style={{ ...$.btn("g"), padding: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}
              onClick={async () => {
                setOfferLetterLoading(true); setAiModal("offer"); setOfferLetter(null);
                const res = await fetch("/api/ai/offer-letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicantId: selApplicant.id }) });
                const d = await res.json();
                setOfferLetter(res.ok ? d.letter : null);
                setOfferLetterLoading(false);
              }}
            >
              📄 خطاب العرض
            </button>
          )}
          {selApplicant.phone && (
            <a href={`https://wa.me/${selApplicant.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
              style={{ ...$.btn("g"), padding: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, textDecoration: "none" }}>
              💬 واتساب
            </a>
          )}
          <button style={{ ...$.btn("d"), padding: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }} onClick={() => deleteApplicant(selApplicant.id, selApplicant.name)}>
            <Icon n="del" s={14} />{t("deleteApplicant")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ ...$.app, display: "flex", direction: lang === "en" ? "ltr" : "rtl" }}>
      <Sidebar
        items={sidebarItems}
        active={hTab}
        go={setHTab}
        primaryColor={primaryColor}
        dark={dark}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
        foot={[
          { k: "s", ic: "cfg", l: t("settings"), fn: () => setShowSettings(true) },
          { k: "o", ic: "out", l: t("logout"), fn: logout },
        ]}
      />

      <div style={{ flex: 1, padding: 26, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div>
            <div style={{ fontSize: 10, color: primaryColor, fontWeight: 900, letterSpacing: 3 }}>{t("portal")}</div>
            <h1 style={{ margin: "4px 0 0", fontSize: 21, fontWeight: 900 }}>{companyName}</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setDark((d) => !d)} style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13 }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={refreshApplicants} disabled={refreshing} style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13 }} title="تحديث البيانات">
              {refreshing ? "⏳" : "🔄"}
            </button>
            <button style={{ ...$.btn("g"), fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setHTab("jobs")}>
              <Icon n="lnk" s={15} />{t("applyLink")}
            </button>
            <button style={{ ...$.btn("p"), fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => exportToExcel(selectedIds.length > 0 ? "selected" : "filtered")}
              title={selectedIds.length > 0 ? `تصدير ${selectedIds.length} محدد` : `تصدير ${sortedFiltered.length} ظاهر`}
            >
              <Icon n="dl" s={15} />
              {selectedIds.length > 0 ? `تصدير (${selectedIds.length})` : t("exportExcel")}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
          {[
            { l: t("total"), v: applicants.length, c: primaryColor },
            { l: t("review"), v: applicants.filter((a) => a.status === "مراجعة").length, c: "#60a5fa" },
            { l: t("accepted"), v: applicants.filter((a) => a.status === "مقبول").length, c: "#34d399" },
            { l: t("rejected"), v: applicants.filter((a) => a.status === "مرفوض").length, c: "#f87171" },
          ].map((s, i) => (
            <div key={i} style={$.st(s.c)}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: $.muted, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {hTab === "applicants" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: $.muted }}><Icon n="srch" s={16} /></div>
                <input style={{ ...$.inp, paddingRight: 38 }} placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select style={{ ...$.inp, width: 140 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="الكل">{t("all")}</option>
                <option value="مراجعة">{t("review")}</option>
                <option value="مقبول">{t("accepted")}</option>
                <option value="مرفوض">{t("rejected")}</option>
              </select>
              {jobs.length > 0 && (
                <select style={{ ...$.inp, width: 160 }} value={fJob} onChange={(e) => setFJob(e.target.value)}>
                  <option value="all">كل الوظائف</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              )}
              <select style={{ ...$.inp, width: 140 }} value={fRating} onChange={(e) => setFRating(Number(e.target.value))}>
                <option value={0}>كل التقييمات</option>
                <option value={1}>★ فأكثر</option>
                <option value={2}>★★ فأكثر</option>
                <option value={3}>★★★ فأكثر</option>
                <option value={4}>★★★★ فأكثر</option>
                <option value={5}>★★★★★ فقط</option>
              </select>
              {hasActiveFilter && (
                <button style={{ ...$.btn("s"), padding: "8px 14px", fontSize: 13 }} onClick={() => { setSearch(""); setFStatus("الكل"); setFJob("all"); setFRating(0); setPage(1); }}>
                  ✕ مسح
                </button>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: $.muted }}>{filtered.length} من {applicants.length} متقدم</div>
              {selectedIds.length > 0 && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: primaryColor, fontWeight: 700 }}>{selectedIds.length} محدد</span>
                  {selectedIds.length === 2 && (
                    <button style={{ ...$.btn("p"), padding: "6px 14px", fontSize: 12 }} onClick={() => setShowCompare(true)}>⚖️ مقارنة</button>
                  )}
                  <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12 }} onClick={() => bulkUpdateStatus("مقبول")}>✓ قبول الكل</button>
                  <button style={{ ...$.btn("d"), padding: "6px 12px", fontSize: 12 }} onClick={() => bulkUpdateStatus("مرفوض")}>✗ رفض الكل</button>
                  <button style={{ ...$.btn("s"), padding: "6px 10px", fontSize: 12 }} onClick={() => setSelectedIds([])}>✕ إلغاء</button>
                </div>
              )}
            </div>
            <div style={$.card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={$.th}>
                    <input type="checkbox"
                      checked={sortedFiltered.length > 0 && sortedFiltered.every((a) => selectedIds.includes(a.id))}
                      onChange={() => {
                        const allSelected = sortedFiltered.every((a) => selectedIds.includes(a.id));
                        setSelectedIds(allSelected ? [] : sortedFiltered.map((a) => a.id));
                      }}
                      style={{ cursor: "pointer", accentColor: primaryColor }}
                    />
                  </th>
                  {[
                    { l: t("name"), k: "name" },
                    { l: t("title"), k: null },
                    { l: t("experience"), k: "experience" },
                    { l: t("languages"), k: null },
                    { l: t("rating"), k: "rating" },
                    { l: t("status"), k: null },
                    { l: "AI", k: "aiScore" },
                    { l: t("date"), k: "date" },
                    { l: "", k: null },
                  ].map(({ l, k }) => (
                    <th key={l} style={{ ...$.th, cursor: k ? "pointer" : "default", userSelect: "none" }} onClick={() => k && toggleSort(k)}>
                      {l}{k ? sortArrow(k) : ""}
                    </th>
                  ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.length === 0 ? (
                    <tr><td colSpan={10} style={{ ...$.td, textAlign: "center", color: $.muted, padding: 40 }}>{applicants.length === 0 ? "لا يوجد متقدمون بعد" : t("noResults")}</td></tr>
                  ) : pagedApplicants.map((a) => (
                    <tr key={a.id} onMouseEnter={(e) => e.currentTarget.style.background = $.surface3} onMouseLeave={(e) => e.currentTarget.style.background = selectedIds.includes(a.id) ? `${primaryColor}11` : "transparent"} style={{ cursor: "pointer", background: selectedIds.includes(a.id) ? `${primaryColor}11` : "transparent" }}>
                      <td style={{ ...$.td, width: 36 }}>
                        <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelected(a.id)} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", accentColor: primaryColor }} />
                      </td>
                      <td style={$.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 35, height: 35, borderRadius: 9, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: primaryColor, fontSize: 15 }}>{(a.name || "؟")[0]}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: $.muted }}>
                              {a.nationality} · {a.date}
                              {a.jobId && jobs.find((j) => j.id === a.jobId) && (
                                <span style={{ color: primaryColor }}> · {jobs.find((j) => j.id === a.jobId)?.title}</span>
                              )}
                            </div>
                          </div>
                          {a.interviewDate && <span style={{ ...$.tg(primaryColor), fontSize: 10 }}>📅</span>}
                        </div>
                      </td>
                      <td style={$.td}><div style={{ fontSize: 13 }}>{a.currentTitle}</div><div style={{ fontSize: 11, color: $.muted }}>{a.lastEmployer}</div></td>
                      <td style={$.td}><span style={$.tg()}>{a.experience}</span></td>
                      <td style={$.td}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{(a.languages || []).slice(0, 2).map((l) => <span key={l} style={$.tg("#60a5fa")}>{l.split(" ")[0]}</span>)}</div></td>
                      <td style={$.td}><Stars v={a.rating} onChange={(r) => updateApplicant(a.id, { rating: r })} /></td>
                      <td style={$.td}><Badge s={a.status} /></td>
                      <td style={$.td}><AiScore score={a.aiScore} /></td>
                      <td style={{ ...$.td, color: $.muted, fontSize: 12 }}>{a.date || "—"}</td>
                      <td style={$.td}>
                        <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={() => setSelApplicant(a)}>
                          <Icon n="eye" s={14} />{t("view")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
                <button style={{ ...$.btn("s"), padding: "6px 12px", fontSize: 13 }} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← السابق</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} style={{ ...$.btn(p === page ? "p" : "s"), padding: "6px 10px", fontSize: 13, minWidth: 36 }} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button style={{ ...$.btn("s"), padding: "6px 12px", fontSize: 13 }} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>التالي →</button>
              </div>
            )}
          </>
        )}

        {hTab === "jobs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>💼 {t("jobs")}</h3>
              <button style={$.btn("p")} onClick={() => setShowJobForm(true)}>+ إضافة وظيفة</button>
            </div>
            {showJobForm && (
              <div style={{ ...$.card, marginBottom: 18, border: `1px solid ${primaryColor}44` }}>
                <h4 style={{ margin: "0 0 14px", color: primaryColor }}>وظيفة جديدة</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input style={$.inp} placeholder="عنوان الوظيفة *" value={jobForm.title} onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))} />
                  <input style={$.inp} placeholder="الموقع (أبوظبي، دبي...)" value={jobForm.location} onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))} />
                  <select style={$.inp} value={jobForm.jobType} onChange={(e) => setJobForm((p) => ({ ...p, jobType: e.target.value }))}>
                    <option>دوام كامل</option><option>دوام جزئي</option><option>عن بُعد</option><option>عقد مؤقت</option>
                  </select>
                </div>
                <textarea style={{ ...$.inp, marginTop: 10, minHeight: 70, resize: "vertical" }} placeholder="وصف الوظيفة (اختياري)" value={jobForm.description} onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))} />
                <textarea style={{ ...$.inp, marginTop: 10, minHeight: 70, resize: "vertical" }} placeholder="متطلبات الوظيفة (اختياري)" value={jobForm.requirements} onChange={(e) => setJobForm((p) => ({ ...p, requirements: e.target.value }))} />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={$.btn("p")} onClick={addJob} disabled={jobLoading || !jobForm.title}>{jobLoading ? "⏳ جاري الحفظ..." : "حفظ الوظيفة"}</button>
                  <button style={$.btn("s")} onClick={() => setShowJobForm(false)}>إلغاء</button>
                </div>
              </div>
            )}
            {jobs.length === 0 ? (
              <div style={{ ...$.card, textAlign: "center", padding: 48, color: $.muted }}>لا توجد وظائف. أضف أول وظيفة!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {jobs.map((job) => (
                  <div key={job.id} style={{ ...$.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", opacity: job.isActive ? 1 : 0.6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: job.isActive ? "#05966922" : "#44444422", color: job.isActive ? "#34d399" : $.muted, border: `1px solid ${job.isActive ? "#05966944" : "#44444444"}` }}>
                          {job.isActive ? "نشطة" : "متوقفة"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: $.muted }}>
                        {job.location && `📍 ${job.location} · `}{job.jobType}
                        {" · "}{applicants.filter((a) => a.jobId === job.id).length} متقدم
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        style={{ ...$.btn("g"), padding: "7px 14px", fontSize: 12, color: copiedJob === job.applyToken ? "#34d399" : primaryColor }}
                        onClick={() => copyJobLink(job.applyToken)}
                      >
                        {copiedJob === job.applyToken ? "✓ تم النسخ!" : "🔗 رابط التقديم"}
                      </button>
                      <button style={{ ...$.btn("s"), padding: "7px 12px", fontSize: 12 }} onClick={() => setEditingJob({ ...job })}>✏️ تعديل</button>
                      <button style={{ ...$.btn("s"), padding: "7px 12px", fontSize: 12 }} onClick={() => toggleJob(job)}>
                        {job.isActive ? "إيقاف" : "تفعيل"}
                      </button>
                      <button style={{ ...$.btn("d"), padding: "7px 12px", fontSize: 12 }} onClick={() => deleteJob(job.id)}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hTab === "interviews" && (() => {
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = scheduledInterviews
            .filter((a) => a.interviewDate >= today)
            .sort((a, b) => (a.interviewDate + a.interviewTime) > (b.interviewDate + b.interviewTime) ? 1 : -1);
          const past = scheduledInterviews
            .filter((a) => a.interviewDate < today)
            .sort((a, b) => (a.interviewDate + a.interviewTime) > (b.interviewDate + b.interviewTime) ? -1 : 1);

          const daysLeft = (dateStr) => {
            const diff = Math.ceil((new Date(dateStr) - new Date(today)) / 86400000);
            if (diff === 0) return { l: lang === "ar" ? "اليوم" : "Today", c: "#f59e0b" };
            if (diff === 1) return { l: lang === "ar" ? "غداً" : "Tomorrow", c: "#34d399" };
            if (diff > 0) return { l: `+${diff} ${lang === "ar" ? "يوم" : "days"}`, c: primaryColor };
            return { l: lang === "ar" ? "انتهت" : "Past", c: "#555" };
          };

          const InterviewCard = ({ a, dimmed }) => {
            const dl = daysLeft(a.interviewDate);
            return (
              <div style={{ background: $.surface2, borderRadius: 12, padding: 16, border: `1px solid ${dimmed ? $.border : primaryColor + "33"}`, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: dimmed ? 0.6 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: primaryColor, fontSize: 16 }}>{(a.name || "؟")[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: $.muted }}>{a.currentTitle}</div>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: primaryColor }}>{a.interviewDate}</div>
                  <div style={{ fontSize: 12, color: $.muted }}>{a.interviewTime}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: dl.c, background: `${dl.c}18`, border: `1px solid ${dl.c}33`, borderRadius: 20, padding: "2px 10px" }}>{dl.l}</span>
                  <Badge s={a.status} />
                  <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12 }} onClick={() => setSelApplicant(a)}>{t("view")}</button>
                </div>
              </div>
            );
          };

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { l: lang === "ar" ? "إجمالي المقابلات" : "Total", v: scheduledInterviews.length, c: primaryColor },
                  { l: lang === "ar" ? "قادمة" : "Upcoming", v: upcoming.length, c: "#34d399" },
                  { l: lang === "ar" ? "اليوم" : "Today", v: scheduledInterviews.filter((a) => a.interviewDate === today).length, c: "#f59e0b" },
                ].map((s) => (
                  <div key={s.l} style={$.st(s.c)}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: $.muted, marginTop: 5 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {upcoming.length > 0 && (
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>📅 {lang === "ar" ? "المقابلات القادمة" : "Upcoming Interviews"} ({upcoming.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {upcoming.map((a) => <InterviewCard key={a.id} a={a} dimmed={false} />)}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 16, color: $.muted }}>🕐 {lang === "ar" ? "مقابلات سابقة" : "Past Interviews"} ({past.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {past.map((a) => <InterviewCard key={a.id} a={a} dimmed={true} />)}
                  </div>
                </div>
              )}

              {scheduledInterviews.length === 0 && (
                <div style={{ ...$.card, textAlign: "center", padding: 48, color: $.muted }}>
                  {t("noInterviews")}
                </div>
              )}
            </div>
          );
        })()}

        {hTab === "reports" && (() => {
          const ratedApps = applicants.filter((a) => a.rating > 0);
          const avgRating = ratedApps.length > 0
            ? (ratedApps.reduce((s, a) => s + a.rating, 0) / ratedApps.length).toFixed(1)
            : "—";

          // Top nationalities
          const natMap = {};
          applicants.forEach((a) => { if (a.nationality) natMap[a.nationality] = (natMap[a.nationality] || 0) + 1; });
          const topNat = Object.entries(natMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

          // Top skills
          const skillMap = {};
          applicants.forEach((a) => a.skills?.forEach((s) => { skillMap[s] = (skillMap[s] || 0) + 1; }));
          const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

          // Per-job stats
          const jobStats = jobs.map((j) => {
            const ja = applicants.filter((a) => a.jobId === j.id);
            return { title: j.title, total: ja.length, accepted: ja.filter((a) => a.status === "مقبول").length };
          }).filter((j) => j.total > 0).sort((a, b) => b.total - a.total);

          const maxNat = topNat[0]?.[1] || 1;
          const maxSkill = topSkills[0]?.[1] || 1;
          const maxJob = jobStats[0]?.total || 1;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Status breakdown */}
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>📊 {t("statusDist")}</h3>
                  {[{ l: "مراجعة", c: "#60a5fa" }, { l: "مقبول", c: "#34d399" }, { l: "مرفوض", c: "#f87171" }].map((s) => {
                    const n = applicants.filter((a) => a.status === s.l).length;
                    return (
                      <div key={s.l} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                          <span style={{ color: s.c }}>{s.l}</span>
                          <span style={{ color: $.muted }}>{n} ({applicants.length ? Math.round(n / applicants.length * 100) : 0}%)</span>
                        </div>
                        <div style={{ height: 7, background: $.surface3, borderRadius: 4 }}>
                          <div style={{ height: "100%", background: s.c, borderRadius: 4, width: `${applicants.length ? (n / applicants.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Rating + summary */}
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>⭐ {t("avgRating")}</h3>
                  <div style={{ fontSize: 54, fontWeight: 900, color: primaryColor, textAlign: "center", padding: "14px 0 10px" }}>{avgRating}</div>
                  <div style={{ textAlign: "center", color: $.muted, fontSize: 13, marginBottom: 16 }}>{t("avgRatingAll")}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { l: lang === "ar" ? "إجمالي المتقدمين" : "Total Applicants", v: applicants.length, c: primaryColor },
                      { l: lang === "ar" ? "مقابلات مجدولة" : "Scheduled Interviews", v: scheduledInterviews.length, c: "#60a5fa" },
                      { l: lang === "ar" ? "تم التقييم" : "Rated", v: ratedApps.length, c: "#f59e0b" },
                      { l: lang === "ar" ? "معدل القبول" : "Acceptance Rate", v: applicants.length ? Math.round(applicants.filter((a) => a.status === "مقبول").length / applicants.length * 100) + "%" : "—", c: "#34d399" },
                    ].map((s) => (
                      <div key={s.l} style={{ textAlign: "center", padding: 12, background: $.surface2, borderRadius: 10 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: 11, color: $.muted, marginTop: 3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Nationality breakdown */}
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>🌍 {lang === "ar" ? "توزيع الجنسيات" : "Nationality Breakdown"}</h3>
                  {topNat.length === 0 ? (
                    <div style={{ textAlign: "center", color: $.muted, padding: 24 }}>{lang === "ar" ? "لا توجد بيانات" : "No data"}</div>
                  ) : topNat.map(([nat, count]) => (
                    <div key={nat} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                        <span>{nat}</span>
                        <span style={{ color: $.muted }}>{count} ({Math.round(count / applicants.length * 100)}%)</span>
                      </div>
                      <div style={{ height: 6, background: $.surface3, borderRadius: 3 }}>
                        <div style={{ height: "100%", background: primaryColor, borderRadius: 3, width: `${(count / maxNat) * 100}%`, opacity: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top skills */}
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>💡 {lang === "ar" ? "أبرز المهارات" : "Top Skills"}</h3>
                  {topSkills.length === 0 ? (
                    <div style={{ textAlign: "center", color: $.muted, padding: 24 }}>{lang === "ar" ? "لا توجد بيانات" : "No data"}</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {topSkills.map(([skill, count]) => (
                        <div key={skill} style={{ display: "flex", alignItems: "center", gap: 6, background: `${primaryColor}15`, border: `1px solid ${primaryColor}33`, borderRadius: 20, padding: "5px 12px" }}>
                          <span style={{ fontSize: 13, color: $.text }}>{skill}</span>
                          <span style={{ fontSize: 11, fontWeight: 900, color: primaryColor, background: `${primaryColor}22`, borderRadius: 10, padding: "1px 6px" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 14, height: 1, background: $.border }} />
                  <div style={{ marginTop: 12 }}>
                    {topSkills.slice(0, 5).map(([skill, count]) => (
                      <div key={skill} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, width: 120, color: $.text }}>{skill}</span>
                        <div style={{ flex: 1, height: 5, background: $.surface3, borderRadius: 3 }}>
                          <div style={{ height: "100%", background: `linear-gradient(90deg,${primaryColor},${primaryColor}88)`, borderRadius: 3, width: `${(count / maxSkill) * 100}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: $.muted, width: 20, textAlign: "left" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Per-job stats */}
              {jobStats.length > 0 && (
                <div style={$.card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>💼 {lang === "ar" ? "المتقدمون بحسب الوظيفة" : "Applicants by Job"}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {jobStats.map((j) => (
                      <div key={j.title} style={{ background: $.surface2, borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{j.title}</span>
                          <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
                            <span style={{ color: "#60a5fa" }}>{j.total} {lang === "ar" ? "متقدم" : "applicants"}</span>
                            <span style={{ color: "#34d399" }}>{j.accepted} {lang === "ar" ? "مقبول" : "accepted"}</span>
                          </div>
                        </div>
                        <div style={{ height: 5, background: $.surface3, borderRadius: 3 }}>
                          <div style={{ height: "100%", background: primaryColor, borderRadius: 3, width: `${(j.total / maxJob) * 100}%`, opacity: 0.7 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={{ ...$.btn("g"), padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                  onClick={() => exportToExcel("all")}>
                  <Icon n="dl" s={15} />
                  {lang === "ar" ? "تصدير كامل التقرير Excel" : "Export Full Report to Excel"}
                </button>
              </div>
            </div>
          );
        })()}

        {hTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 0, background: $.surface2, borderRadius: 12, padding: 4, border: `1px solid ${$.border}`, width: "fit-content" }}>
              {[["rank", "🤖 ترتيب المتقدمين"], ["analytics", "📊 تحليل المجموعة"]].map(([k, l]) => (
                <button key={k} onClick={() => setAiTab(k)}
                  style={{ padding: "8px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: aiTab === k ? primaryColor : "transparent", color: aiTab === k ? "#000" : $.muted, transition: "all .2s" }}>
                  {l}
                </button>
              ))}
            </div>

            {aiTab === "rank" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ ...$.card, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13, color: $.muted }}>اختر الوظيفة:</div>
                  <select style={{ ...$.inp, width: 220 }} value={rankJobId} onChange={(e) => setRankJobId(e.target.value)}>
                    <option value="all">جميع المتقدمين</option>
                    {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                  <button
                    style={{ ...$.btn("p"), padding: "9px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                    disabled={rankLoading}
                    onClick={async () => {
                      setRankLoading(true); setRankedList([]);
                      const res = await fetch("/api/ai/rank", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ jobId: rankJobId === "all" ? null : rankJobId, companyId }),
                      });
                      const d = await res.json();
                      if (res.ok) {
                        setRankedList(d.ranked || []);
                        setApplicants((prev) => prev.map((a) => {
                          const r = (d.ranked || []).find((x) => x.id === a.id);
                          return r ? { ...a, aiScore: r.aiScore, aiMatchReasons: r.aiMatchReasons, aiGaps: r.aiGaps, aiRecommendation: r.aiRecommendation } : a;
                        }));
                      }
                      setRankLoading(false);
                    }}
                  >
                    {rankLoading ? "⏳ جاري التقييم..." : "🚀 رتّب الآن"}
                  </button>
                  {!rankLoading && rankedList.length === 0 && (
                    <span style={{ fontSize: 12, color: $.muted }}>اضغط &quot;رتّب الآن&quot; لتقييم المتقدمين بالذكاء الاصطناعي</span>
                  )}
                </div>
                {rankedList.length > 0 && (
                  <div style={$.card}>
                    <div style={{ fontSize: 13, color: $.muted, marginBottom: 14 }}>
                      تم تقييم {rankedList.length} متقدم — مرتبون من الأعلى إلى الأدنى
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {rankedList.map((r, idx) => (
                        <div key={r.id} style={{ background: $.surface2, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: idx === 0 ? `1px solid ${primaryColor}44` : `1px solid ${$.border}` }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: idx === 0 ? primaryColor : $.surface3, color: idx === 0 ? "#000" : $.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15 }}>
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                            <div style={{ fontSize: 12, color: $.muted }}>{r.currentTitle} · {r.experience}</div>
                            {r.aiRecommendation && <div style={{ fontSize: 11, color: "#6366f1", marginTop: 4 }}>💡 {r.aiRecommendation}</div>}
                          </div>
                          <AiScore score={r.aiScore} />
                          <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12 }}
                            onClick={() => { const a = applicants.find((x) => x.id === r.id); if (a) setSelApplicant(a); }}>
                            عرض
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiTab === "analytics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ ...$.card, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: $.muted }}>تحليل شامل لمجموعة المتقدمين ({applicants.length} متقدم)</div>
                  <button
                    style={{ ...$.btn("p"), padding: "9px 20px", fontSize: 13 }}
                    disabled={analyticsLoading}
                    onClick={async () => {
                      setAnalyticsLoading(true); setAnalytics(null);
                      const res = await fetch("/api/ai/analytics", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ companyId }),
                      });
                      const d = await res.json();
                      if (res.ok) setAnalytics(d);
                      setAnalyticsLoading(false);
                    }}
                  >
                    {analyticsLoading ? "⏳ جاري التحليل..." : "🔍 حلّل المجموعة"}
                  </button>
                </div>

                {analytics && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ ...$.card, border: `1px solid ${primaryColor}33` }}>
                      <div style={{ fontSize: 11, color: $.muted, fontWeight: 700, marginBottom: 8 }}>جودة المجموعة</div>
                      <div style={{ fontSize: 40, fontWeight: 900, color: analytics.poolQualityScore >= 70 ? "#22c55e" : analytics.poolQualityScore >= 50 ? "#f59e0b" : "#ef4444" }}>{analytics.poolQualityScore}/100</div>
                      <div style={{ fontSize: 13, color: $.muted, marginTop: 8, lineHeight: 1.7 }}>{analytics.poolQualitySummary}</div>
                    </div>
                    <div style={$.card}>
                      <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginBottom: 10 }}>⚠ فجوات المهارات</div>
                      {(analytics.skillsGapAnalysis || []).map((g, i) => (
                        <div key={i} style={{ fontSize: 12, color: $.muted, padding: "4px 0", borderBottom: `1px solid ${$.border}` }}>{g}</div>
                      ))}
                    </div>
                    <div style={$.card}>
                      <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 10 }}>⭐ أفضل المتقدمين</div>
                      {(analytics.topPerformers || []).map((p, i) => (
                        <div key={i} style={{ fontSize: 12, color: $.muted, padding: "4px 0" }}>• {p}</div>
                      ))}
                    </div>
                    <div style={$.card}>
                      <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 10 }}>📋 توصيات التوظيف</div>
                      {(analytics.hiringRecommendations || []).map((r, i) => (
                        <div key={i} style={{ fontSize: 12, color: $.muted, padding: "4px 0" }}>• {r}</div>
                      ))}
                    </div>
                    <div style={{ ...$.card, gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginBottom: 10 }}>🚨 إجراءات عاجلة</div>
                      {(analytics.urgentActions || []).map((a, i) => (
                        <div key={i} style={{ fontSize: 12, color: $.muted, padding: "4px 0", background: "#ef444411", borderRadius: 6, padding: "6px 10px", marginBottom: 5 }}>• {a}</div>
                      ))}
                      {analytics.diversityInsights && (
                        <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 10 }}>🌍 {analytics.diversityInsights}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {editingJob && (
          <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...$.card, width: 520, boxShadow: "0 30px 60px #000000cc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, color: primaryColor }}>✏️ تعديل الوظيفة</h3>
                <button style={{ background: "none", border: "none", color: $.muted, cursor: "pointer", fontSize: 20 }} onClick={() => setEditingJob(null)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input style={$.inp} placeholder="عنوان الوظيفة *" value={editingJob.title} onChange={(e) => setEditingJob((p) => ({ ...p, title: e.target.value }))} />
                  <input style={$.inp} placeholder="الموقع" value={editingJob.location || ""} onChange={(e) => setEditingJob((p) => ({ ...p, location: e.target.value }))} />
                  <select style={$.inp} value={editingJob.jobType || "دوام كامل"} onChange={(e) => setEditingJob((p) => ({ ...p, jobType: e.target.value }))}>
                    <option>دوام كامل</option><option>دوام جزئي</option><option>عن بُعد</option><option>عقد مؤقت</option>
                  </select>
                </div>
                <textarea style={{ ...$.inp, minHeight: 70, resize: "vertical" }} placeholder="وصف الوظيفة" value={editingJob.description || ""} onChange={(e) => setEditingJob((p) => ({ ...p, description: e.target.value }))} />
                <textarea style={{ ...$.inp, minHeight: 70, resize: "vertical" }} placeholder="متطلبات الوظيفة" value={editingJob.requirements || ""} onChange={(e) => setEditingJob((p) => ({ ...p, requirements: e.target.value }))} />
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button style={{ ...$.btn("p"), flex: 1 }} onClick={saveEditJob} disabled={jobLoading || !editingJob.title}>{jobLoading ? "⏳..." : "حفظ التعديلات"}</button>
                  <button style={$.btn("s")} onClick={() => setEditingJob(null)}>إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCompare && selectedIds.length === 2 && (() => {
          const [a1, a2] = selectedIds.map((id) => applicants.find((a) => a.id === id)).filter(Boolean);
          if (!a1 || !a2) return null;
          const fields = [
            ["الجنسية", "nationality"], ["الموقع", "location"], ["المسمى", "currentTitle"],
            ["الخبرة", "experience"], ["آخر جهة عمل", "lastEmployer"],
            ["التعليم", "education"], ["الجامعة", "university"], ["GPA", "gpa"],
          ];
          return (
            <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 250, display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "auto", padding: "32px 16px" }}>
              <div style={{ background: $.surface, border: `1px solid ${$.border}`, borderRadius: 18, width: "100%", maxWidth: 820, boxShadow: "0 40px 80px #000000cc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${$.border}` }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: primaryColor }}>⚖️ مقارنة المتقدمين</h3>
                  <button style={{ background: "none", border: "none", color: $.muted, cursor: "pointer", fontSize: 22 }} onClick={() => setShowCompare(false)}>✕</button>
                </div>
                <div style={{ padding: 24 }}>
                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div />
                    {[a1, a2].map((a) => (
                      <div key={a.id} style={{ background: `${primaryColor}11`, border: `1px solid ${primaryColor}33`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: primaryColor, fontSize: 18, margin: "0 auto 8px" }}>{a.name[0]}</div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: $.muted, marginTop: 3 }}>{a.currentTitle}</div>
                        <div style={{ marginTop: 8 }}><Stars v={a.rating} sz={14} /></div>
                        <div style={{ marginTop: 6 }}><Badge s={a.status} /></div>
                      </div>
                    ))}
                  </div>
                  {/* Field rows */}
                  {fields.map(([label, key]) => (
                    <div key={key} style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: $.muted, fontWeight: 700, paddingRight: 4 }}>{label}</div>
                      {[a1, a2].map((a) => (
                        <div key={a.id} style={{ background: $.surface2, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: a[key] ? $.text : $.muted2 }}>
                          {a[key] || "—"}
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* Skills */}
                  {["skills", "languages", "certifications"].map((key) => {
                    const labels = { skills: "المهارات", languages: "اللغات", certifications: "الشهادات" };
                    const colors = { skills: "#60a5fa", languages: "#34d399", certifications: primaryColor };
                    return (
                      <div key={key} style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 12, marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", fontSize: 12, color: $.muted, fontWeight: 700, paddingRight: 4, paddingTop: 8 }}>{labels[key]}</div>
                        {[a1, a2].map((a) => (
                          <div key={a.id} style={{ background: $.surface2, borderRadius: 8, padding: "9px 12px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {(a[key] || []).length === 0 ? <span style={{ color: $.muted2, fontSize: 12 }}>—</span> : (a[key] || []).map((i) => <span key={i} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: `${colors[key]}22`, color: colors[key], border: `1px solid ${colors[key]}33` }}>{i}</span>)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {/* Actions */}
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 12, marginTop: 16 }}>
                    <div />
                    {[a1, a2].map((a) => (
                      <button key={a.id} style={{ ...$.btn("p"), padding: "10px 0", fontSize: 13 }} onClick={() => { setShowCompare(false); setSelApplicant(a); }}>
                        عرض الملف الكامل
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {showSettings && (
          <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...$.card, width: 460, boxShadow: "0 30px 60px #000000cc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontSize: 17, color: primaryColor }}>⚙️ {t("settings")}</h3>
                <button style={{ background: "none", border: "none", color: $.muted, cursor: "pointer", fontSize: 20 }} onClick={() => setShowSettings(false)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div style={{ padding: 14, background: $.surface2, borderRadius: 10, border: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 8, fontWeight: 700 }}>🎨 {lang === "ar" ? "المظهر" : "Appearance"}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[true, false].map((d) => (
                      <button key={String(d)} onClick={() => setDark(d)}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: dark === d ? `2px solid ${primaryColor}` : `1px solid ${$.border}`, background: dark === d ? `${primaryColor}22` : "transparent", color: dark === d ? primaryColor : $.muted, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                        {d ? "🌙 داكن" : "☀️ فاتح"}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 14, background: $.surface2, borderRadius: 10, border: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 8, fontWeight: 700 }}>🌐 {lang === "ar" ? "اللغة" : "Language"}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["ar", "en"].map((l) => (
                      <button key={l} onClick={() => setLang(l)}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: lang === l ? `2px solid ${primaryColor}` : `1px solid ${$.border}`, background: lang === l ? `${primaryColor}22` : "transparent", color: lang === l ? primaryColor : $.muted, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                        {l === "ar" ? "العربية" : "English"}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 14, background: $.surface2, borderRadius: 10, border: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 8, fontWeight: 700 }}>🔗 {lang === "ar" ? "روابط التقديم" : "Apply Links"}</div>
                  {jobs.length === 0 ? (
                    <div style={{ fontSize: 12, color: $.muted }}>
                      {lang === "ar" ? "لا توجد وظائف — أضف وظيفة من تبويب الوظائف للحصول على رابط تقديم" : "No jobs yet — add a job from the Jobs tab to get an apply link"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {jobs.slice(0, 3).map((j) => {
                        const link = `${typeof window !== "undefined" ? window.location.origin : ""}/applicant/apply/${j.applyToken}`;
                        return (
                          <div key={j.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ flex: 1, fontSize: 11, color: $.muted, background: $.surface3, borderRadius: 6, padding: "5px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {j.title}: {link}
                            </div>
                            <button style={{ ...$.btn("p"), padding: "5px 10px", fontSize: 11, whiteSpace: "nowrap" }}
                              onClick={() => { navigator.clipboard.writeText(link); setSettingsCopied(j.id); setTimeout(() => setSettingsCopied(false), 2000); }}>
                              {settingsCopied === j.id ? "✓" : (lang === "ar" ? "نسخ" : "Copy")}
                            </button>
                          </div>
                        );
                      })}
                      {jobs.length > 3 && <div style={{ fontSize: 11, color: $.muted }}>+{jobs.length - 3} {lang === "ar" ? "وظائف أخرى في تبويب الوظائف" : "more in Jobs tab"}</div>}
                    </div>
                  )}
                </div>

                <div style={{ padding: 14, background: $.surface2, borderRadius: 10, border: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 4, fontWeight: 700 }}>🏢 {lang === "ar" ? "الشركة" : "Company"}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: primaryColor }}>{companyName}</div>
                  <div style={{ fontSize: 11, color: $.muted2, marginTop: 4 }}>{user?.role === "hr_manager" ? "HR Manager" : "HR Officer"}</div>
                </div>

                <div style={{ padding: 14, background: $.surface2, borderRadius: 10, border: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 8, fontWeight: 700 }}>📊 {lang === "ar" ? "إحصاءات سريعة" : "Quick Stats"}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      { l: lang === "ar" ? "إجمالي" : "Total", v: applicants.length, c: primaryColor },
                      { l: lang === "ar" ? "مقبول" : "Accepted", v: applicants.filter((a) => a.status === "مقبول").length, c: "#34d399" },
                      { l: lang === "ar" ? "مجدولة" : "Scheduled", v: scheduledInterviews.length, c: "#60a5fa" },
                    ].map((s) => (
                      <div key={s.l} style={{ textAlign: "center", padding: 10, background: $.surface, borderRadius: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: 10, color: $.muted2, marginTop: 3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 14, background: $.surface2, borderRadius: 10, border: `1px solid ${$.border}` }}>
                  <div style={{ fontSize: 11, color: $.muted, marginBottom: 10, fontWeight: 700 }}>🔑 {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input style={{ ...$.inp, fontSize: 13 }} type="password" placeholder={lang === "ar" ? "كلمة المرور الجديدة (8+ أحرف)" : "New password (8+ chars)"} value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} />
                    <input style={{ ...$.inp, fontSize: 13 }} type="password" placeholder={lang === "ar" ? "تأكيد كلمة المرور" : "Confirm password"} value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
                    {pwMsg.text && <div style={{ fontSize: 12, color: pwMsg.ok ? "#34d399" : "#f87171" }}>{pwMsg.text}</div>}
                    <button style={{ ...$.btn("g"), padding: "8px 0", fontSize: 13 }} onClick={changeOwnPassword}>
                      {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                    </button>
                  </div>
                </div>

                <button style={{ ...$.btn("p"), padding: 12, fontSize: 14 }} onClick={() => setShowSettings(false)}>
                  {lang === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
