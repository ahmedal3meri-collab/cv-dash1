"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Icon from "../../../components/shared/Icon";
import Sidebar from "../../../components/shared/Sidebar";
import Stars from "../../../components/shared/Stars";
import Badge from "../../../components/shared/Badge";
import { MOCK_APPLICANTS } from "../../../lib/data";
import { createTheme } from "../../../lib/theme";

const PRIMARY = "#C9A84C";
const COMPANY_NAME = "هيئة أبوظبي للصحة";

const T = {
  ar: {
    portal: "HR DASHBOARD",
    applicants: "المتقدمون",
    jobs: "الوظائف",
    reports: "التقارير",
    interviews: "المقابلات",
    settings: "الإعدادات",
    logout: "خروج",
    applyLink: "رابط التقديم",
    exportExcel: "تصدير Excel",
    total: "إجمالي",
    review: "مراجعة",
    accepted: "مقبول",
    rejected: "مرفوض",
    search: "بحث بالاسم، المهارة، الجنسية...",
    all: "الكل",
    name: "المتقدم",
    title: "التخصص",
    experience: "الخبرة",
    languages: "اللغات",
    rating: "التقييم",
    status: "الحالة",
    view: "عرض",
    noResults: "لا توجد نتائج",
    back: "العودة",
    aiSummary: "ملخص الذكاء الاصطناعي",
    fullInfo: "المعلومات الكاملة",
    skills: "المهارات",
    langs: "اللغات",
    certs: "الشهادات",
    decision: "التقييم والقرار",
    notes: "ملاحظات",
    addNote: "أضف ملاحظة...",
    save: "حفظ",
    downloadCV: "تحميل السيرة الذاتية",
    deleteApplicant: "حذف المتقدم",
    scheduleInterview: "جدولة مقابلة",
    interviewDate: "تاريخ المقابلة",
    interviewTime: "وقت المقابلة",
    interviewNotes: "ملاحظات المقابلة",
    saveInterview: "حفظ الموعد",
    cancel: "إلغاء",
    scheduled: "مجدولة",
    statusDist: "توزيع الحالات",
    avgRating: "متوسط التقييم",
    avgRatingAll: "متوسط تقييم جميع المتقدمين",
    scheduledInterviews: "المقابلات المجدولة",
    noInterviews: "لا توجد مقابلات مجدولة",
    nationality: "الجنسية",
    location: "الموقع",
    phone: "الهاتف",
    email: "البريد",
    jobTitle: "المسمى",
    exp: "الخبرة",
    lastEmployer: "آخر جهة عمل",
    education: "التعليم",
    university: "المؤسسة",
    gpa: "GPA",
  },
  en: {
    portal: "HR DASHBOARD",
    applicants: "Applicants",
    jobs: "Jobs",
    reports: "Reports",
    interviews: "Interviews",
    settings: "Settings",
    logout: "Logout",
    applyLink: "Apply Link",
    exportExcel: "Export Excel",
    total: "Total",
    review: "Under Review",
    accepted: "Accepted",
    rejected: "Rejected",
    search: "Search by name, skill, nationality...",
    all: "All",
    name: "Applicant",
    title: "Specialization",
    experience: "Experience",
    languages: "Languages",
    rating: "Rating",
    status: "Status",
    view: "View",
    noResults: "No results found",
    back: "Back",
    aiSummary: "AI Summary",
    fullInfo: "Full Information",
    skills: "Skills",
    langs: "Languages",
    certs: "Certifications",
    decision: "Rating & Decision",
    notes: "Notes",
    addNote: "Add a note...",
    save: "Save",
    downloadCV: "Download CV",
    deleteApplicant: "Delete Applicant",
    scheduleInterview: "Schedule Interview",
    interviewDate: "Interview Date",
    interviewTime: "Interview Time",
    interviewNotes: "Interview Notes",
    saveInterview: "Save Schedule",
    cancel: "Cancel",
    scheduled: "Scheduled",
    statusDist: "Status Distribution",
    avgRating: "Average Rating",
    avgRatingAll: "Average rating of all applicants",
    scheduledInterviews: "Scheduled Interviews",
    noInterviews: "No scheduled interviews",
    nationality: "Nationality",
    location: "Location",
    phone: "Phone",
    email: "Email",
    jobTitle: "Job Title",
    exp: "Experience",
    lastEmployer: "Last Employer",
    education: "Education",
    university: "University",
    gpa: "GPA",
  },
};

export default function HRDashboard() {
  const router = useRouter();
  const $ = createTheme(PRIMARY);
  const G = PRIMARY;

  const [lang, setLang] = useState("ar");
  const t = (k) => T[lang][k] || k;

  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [selApplicant, setSelApplicant] = useState(null);
  const [hTab, setHTab] = useState("applicants");
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState(lang === "ar" ? "الكل" : "All");
  const [noteIn, setNoteIn] = useState("");
  const [showInterview, setShowInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: "", time: "", notes: "" });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/hr/login");
  };

  const exportToExcel = () => {
    const data = applicants.map((a) => ({
      الاسم: a.name,
      البريد: a.email,
      الهاتف: a.phone,
      الجنسية: a.nationality,
      الموقع: a.location,
      "المسمى الوظيفي": a.currentTitle,
      "سنوات الخبرة": a.experience,
      "آخر جهة عمل": a.lastEmployer,
      التعليم: a.education,
      الجامعة: a.university,
      "المعدل GPA": a.gpa,
      الحالة: a.status,
      التقييم: a.rating,
      "تاريخ التقديم": a.date,
      "موعد المقابلة": a.interviewDate || "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المتقدمون");
    XLSX.writeFile(wb, `applicants_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const saveInterview = () => {
    if (!interviewForm.date || !interviewForm.time) return;
    setApplicants((p) =>
      p.map((a) =>
        a.id === selApplicant.id
          ? { ...a, interviewDate: interviewForm.date, interviewTime: interviewForm.time, interviewNotes: interviewForm.notes }
          : a
      )
    );
    setSelApplicant((p) => ({ ...p, interviewDate: interviewForm.date, interviewTime: interviewForm.time, interviewNotes: interviewForm.notes }));
    setShowInterview(false);
  };

  const statusValues = lang === "ar"
    ? ["مراجعة", "مقبول", "مرفوض"]
    : ["Under Review", "Accepted", "Rejected"];

  const arStatus = { "Under Review": "مراجعة", "Accepted": "مقبول", "Rejected": "مرفوض" };

  const filtered = applicants.filter((a) => {
    const q = search.toLowerCase();
    const matches = a.name?.toLowerCase().includes(q) || a.skills?.some((s) => s.toLowerCase().includes(q)) || a.nationality?.includes(search) || a.currentTitle?.toLowerCase().includes(q);
    if (!matches) return false;
    if (fStatus === "الكل" || fStatus === "All") return true;
    const arF = arStatus[fStatus] || fStatus;
    return a.status === arF;
  });

  const sidebarItems = [
    { k: "applicants", ic: "users", l: t("applicants") },
    { k: "interviews", ic: "cal", l: t("interviews") },
    { k: "reports", ic: "chart", l: t("reports") },
  ];

  const scheduledInterviews = applicants.filter((a) => a.interviewDate);

  if (selApplicant) return (
    <div style={{ ...$.app, direction: lang === "en" ? "ltr" : "rtl" }}>
      <div style={{ background: "#0d0d15", borderBottom: `1px solid ${G}22`, padding: "13px 26px", display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ ...$.btn("g"), padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }} onClick={() => setSelApplicant(null)}>
          <Icon n="back" s={15} />{t("back")}
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{selApplicant.name}</h2>
          <span style={{ fontSize: 12, color: "#555" }}>{selApplicant.currentTitle}</span>
        </div>
        <Badge s={selApplicant.status} />
      </div>

      {showInterview && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...$.card, width: 440, boxShadow: "0 30px 60px #000000cc" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 16, color: G }}>📅 {t("scheduleInterview")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>{t("interviewDate")}</label>
                <input type="date" style={$.inp} value={interviewForm.date} onChange={(e) => setInterviewForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>{t("interviewTime")}</label>
                <input type="time" style={$.inp} value={interviewForm.time} onChange={(e) => setInterviewForm((p) => ({ ...p, time: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>{t("interviewNotes")}</label>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 22, padding: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...$.card, border: `1px solid ${G}33`, background: `linear-gradient(135deg,${G}08,#12121a)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ color: G }}><Icon n="ai" s={19} /></div>
              <h3 style={{ margin: 0, color: G, fontSize: 15 }}>{t("aiSummary")}</h3>
            </div>
            <p style={{ margin: 0, color: "#bbb", lineHeight: 1.8, fontSize: 14 }}>{selApplicant.aiSummary}</p>
          </div>
          <div style={$.card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>{t("fullInfo")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                [t("nationality"), selApplicant.nationality],
                [t("location"), selApplicant.location],
                [t("phone"), selApplicant.phone],
                [t("email"), selApplicant.email],
                [t("jobTitle"), selApplicant.currentTitle],
                [t("exp"), selApplicant.experience],
                [t("lastEmployer"), selApplicant.lastEmployer],
                [t("education"), selApplicant.education],
                [t("university"), selApplicant.university],
                [t("gpa"), selApplicant.gpa],
              ].map(([l, v]) => (
                <div key={l} style={{ background: "#0d0d15", borderRadius: 9, padding: 11 }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[
              { t: t("skills"), items: selApplicant.skills, c: "#60a5fa" },
              { t: t("langs"), items: selApplicant.languages, c: "#34d399" },
              { t: t("certs"), items: selApplicant.certifications, c: G },
            ].map((sec) => (
              <div key={sec.t} style={$.card}>
                <h4 style={{ margin: "0 0 10px", color: sec.c, fontSize: 13 }}>{sec.t}</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(sec.items || []).map((i) => <span key={i} style={$.tg(sec.c)}>{i}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={$.card}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>{t("decision")}</h4>
            <Stars v={selApplicant.rating} sz={22} onChange={(r) => {
              setApplicants((p) => p.map((a) => a.id === selApplicant.id ? { ...a, rating: r } : a));
              setSelApplicant((p) => ({ ...p, rating: r }));
            }} />
            <select style={{ ...$.inp, marginTop: 12 }} value={selApplicant.status} onChange={(e) => {
              const s = e.target.value;
              setApplicants((p) => p.map((a) => a.id === selApplicant.id ? { ...a, status: s } : a));
              setSelApplicant((p) => ({ ...p, status: s }));
            }}>
              <option>مراجعة</option>
              <option>مقبول</option>
              <option>مرفوض</option>
            </select>
          </div>
          <div style={$.card}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14 }}>{t("notes")}</h4>
            <textarea style={{ ...$.inp, minHeight: 85, resize: "vertical" }} placeholder={t("addNote")} value={noteIn} onChange={(e) => setNoteIn(e.target.value)} />
            <button style={{ ...$.btn("p"), width: "100%", marginTop: 9, fontSize: 13 }} onClick={() => setNoteIn("")}>{t("save")}</button>
          </div>
          {selApplicant.interviewDate ? (
            <div style={{ ...$.card, border: `1px solid ${G}33` }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 14, color: G }}>📅 {t("scheduled")}</h4>
              <div style={{ fontSize: 13 }}>{selApplicant.interviewDate} — {selApplicant.interviewTime}</div>
              {selApplicant.interviewNotes && <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{selApplicant.interviewNotes}</div>}
              <button style={{ ...$.btn("g"), width: "100%", marginTop: 10, fontSize: 13 }} onClick={() => { setInterviewForm({ date: selApplicant.interviewDate, time: selApplicant.interviewTime, notes: selApplicant.interviewNotes || "" }); setShowInterview(true); }}>
                تعديل الموعد
              </button>
            </div>
          ) : (
            <button style={{ ...$.btn("g"), padding: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }} onClick={() => { setInterviewForm({ date: "", time: "", notes: "" }); setShowInterview(true); }}>
              <Icon n="cal" s={15} />{t("scheduleInterview")}
            </button>
          )}
          <button style={{ ...$.btn("d"), padding: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }} onClick={() => { setApplicants((p) => p.filter((a) => a.id !== selApplicant.id)); setSelApplicant(null); }}>
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
        primaryColor={PRIMARY}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
        foot={[
          { k: "s", ic: "cfg", l: t("settings"), fn: () => {} },
          { k: "o", ic: "out", l: t("logout"), fn: logout },
        ]}
      />
      <div style={{ flex: 1, padding: 26, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div>
            <div style={{ fontSize: 10, color: G, fontWeight: 900, letterSpacing: 3 }}>{t("portal")}</div>
            <h1 style={{ margin: "4px 0 0", fontSize: 21, fontWeight: 900 }}>{COMPANY_NAME}</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...$.btn("g"), fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => router.push("/applicant/apply/1")}>
              <Icon n="lnk" s={15} />{t("applyLink")}
            </button>
            <button style={{ ...$.btn("p"), fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={exportToExcel}>
              <Icon n="dl" s={15} />{t("exportExcel")}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
          {[
            { l: t("total"), v: applicants.length, c: G },
            { l: t("review"), v: applicants.filter((a) => a.status === "مراجعة").length, c: "#60a5fa" },
            { l: t("accepted"), v: applicants.filter((a) => a.status === "مقبول").length, c: "#34d399" },
            { l: t("rejected"), v: applicants.filter((a) => a.status === "مرفوض").length, c: "#f87171" },
          ].map((s, i) => (
            <div key={i} style={$.st(s.c)}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {hTab === "applicants" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#444" }}><Icon n="srch" s={16} /></div>
                <input style={{ ...$.inp, paddingRight: 38 }} placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select style={{ ...$.inp, width: 150 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="الكل">{t("all")}</option>
                <option value="مراجعة">{t("review")}</option>
                <option value="مقبول">{t("accepted")}</option>
                <option value="مرفوض">{t("rejected")}</option>
              </select>
            </div>
            <div style={$.card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[t("name"), t("title"), t("experience"), t("languages"), t("rating"), t("status"), ""].map((h) => (
                      <th key={h} style={$.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...$.td, textAlign: "center", color: "#444", padding: 40 }}>{t("noResults")}</td></tr>
                  ) : filtered.map((a) => (
                    <tr key={a.id} onMouseEnter={(e) => e.currentTarget.style.background = "#1a1a2a"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} style={{ cursor: "pointer" }}>
                      <td style={$.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 35, height: 35, borderRadius: 9, background: `${G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: G, fontSize: 15 }}>{(a.name || "؟")[0]}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: "#444" }}>{a.nationality} · {a.date}</div>
                          </div>
                          {a.interviewDate && <span style={{ ...$.tg(G), fontSize: 10 }}>📅</span>}
                        </div>
                      </td>
                      <td style={$.td}><div style={{ fontSize: 13 }}>{a.currentTitle}</div><div style={{ fontSize: 11, color: "#444" }}>{a.lastEmployer}</div></td>
                      <td style={$.td}><span style={$.tg()}>{a.experience}</span></td>
                      <td style={$.td}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{(a.languages || []).slice(0, 2).map((l) => <span key={l} style={$.tg("#60a5fa")}>{l.split(" ")[0]}</span>)}</div></td>
                      <td style={$.td}><Stars v={a.rating} onChange={(r) => setApplicants((p) => p.map((x) => x.id === a.id ? { ...x, rating: r } : x))} /></td>
                      <td style={$.td}><Badge s={a.status} /></td>
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
          </>
        )}

        {hTab === "interviews" && (
          <div style={$.card}>
            <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>📅 {t("scheduledInterviews")}</h3>
            {scheduledInterviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#444", fontSize: 14 }}>{t("noInterviews")}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scheduledInterviews.map((a) => (
                  <div key={a.id} style={{ background: "#0d0d15", borderRadius: 12, padding: 16, border: `1px solid ${G}22`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: `${G}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: G, fontSize: 16 }}>{a.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{a.currentTitle}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: G }}>{a.interviewDate}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{a.interviewTime}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Badge s={a.status} />
                      <button style={{ ...$.btn("g"), padding: "6px 12px", fontSize: 12 }} onClick={() => setSelApplicant(a)}>{t("view")}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hTab === "reports" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>📊 {t("statusDist")}</h3>
              {[{ l: "مراجعة", c: "#60a5fa" }, { l: "مقبول", c: "#34d399" }, { l: "مرفوض", c: "#f87171" }].map((s) => {
                const n = applicants.filter((a) => a.status === s.l).length;
                return (
                  <div key={s.l} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                      <span style={{ color: s.c }}>{s.l}</span>
                      <span style={{ color: "#555" }}>{n}</span>
                    </div>
                    <div style={{ height: 7, background: "#1a1a2a", borderRadius: 4 }}>
                      <div style={{ height: "100%", background: s.c, borderRadius: 4, width: `${applicants.length ? (n / applicants.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={$.card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 16 }}>⭐ {t("avgRating")}</h3>
              <div style={{ fontSize: 50, fontWeight: 900, color: G, textAlign: "center", padding: "20px 0" }}>
                {applicants.filter((a) => a.rating > 0).length > 0
                  ? (applicants.filter((a) => a.rating > 0).reduce((s, a) => s + a.rating, 0) / applicants.filter((a) => a.rating > 0).length).toFixed(1)
                  : "—"}
              </div>
              <div style={{ textAlign: "center", color: "#555", fontSize: 13 }}>{t("avgRatingAll")}</div>
              <div style={{ marginTop: 16, padding: "12px", background: "#0d0d15", borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>المقابلات المجدولة</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: G }}>{scheduledInterviews.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
