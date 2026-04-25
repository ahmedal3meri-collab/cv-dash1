"use client";
const G = "#C9A84C";
const S = { fontFamily:"'Cairo','Segoe UI',sans-serif", direction:"rtl" };

export default function Privacy() {
  return (
    <div style={{ ...S, minHeight:"100vh", background:"#0a0a0f", color:"#e8e0d0", padding:"40px 24px" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ width:60,height:60,background:`linear-gradient(135deg,${G},#8b6914)`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28 }}>🛡️</div>
          <h1 style={{ fontSize:28,fontWeight:900,background:`linear-gradient(135deg,${G},#ffe580)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 8px" }}>سياسة الخصوصية وحماية البيانات</h1>
          <p style={{ color:"#666",fontSize:14 }}>وفقاً لقانون حماية البيانات الشخصية الإماراتي (PDPL) 2023</p>
          <p style={{ color:"#444",fontSize:12,marginTop:6 }}>آخر تحديث: أبريل 2026</p>
        </div>

        {[
          {
            title:"1. من نحن",
            body:`Smart CV Dashboard منصة إدارة السير الذاتية وعمليات التوظيف، مصممة للجهات الحكومية والخاصة في الإمارات العربية المتحدة. نلتزم بالامتثال الكامل لقانون حماية البيانات الشخصية (PDPL) الصادر بموجب المرسوم بقانون الاتحادي رقم 45 لسنة 2021.`
          },
          {
            title:"2. البيانات التي نجمعها",
            items:[
              "المعلومات الشخصية: الاسم الكامل، الجنسية، رقم الهاتف، البريد الإلكتروني، الموقع الجغرافي",
              "البيانات المهنية: المسمى الوظيفي، سنوات الخبرة، جهة العمل الأخيرة، المؤهل الدراسي",
              "ملف السيرة الذاتية (PDF) الذي يتم تحليله بالذكاء الاصطناعي",
              "بيانات التقييم: الملاحظات، التقييمات، مواعيد المقابلات من قِبَل فريق الموارد البشرية",
            ]
          },
          {
            title:"3. الغرض من جمع البيانات",
            items:[
              "معالجة طلبات التوظيف وتقييم المرشحين",
              "تحليل السير الذاتية باستخدام الذكاء الاصطناعي لتسهيل عملية الاختيار",
              "التواصل مع المتقدمين بشأن حالة طلباتهم",
              "الامتثال للمتطلبات القانونية والتنظيمية",
            ]
          },
          {
            title:"4. الأساس القانوني للمعالجة",
            body:`نعالج بياناتك الشخصية بناءً على موافقتك الصريحة التي تُقدَّم عند رفع السيرة الذاتية. يحق لك سحب موافقتك في أي وقت دون أن يؤثر ذلك على مشروعية المعالجة السابقة.`
          },
          {
            title:"5. حقوقك بموجب قانون PDPL",
            items:[
              "حق الوصول: الاطلاع على بياناتك الشخصية المحفوظة لدينا",
              "حق التصحيح: تصحيح أي بيانات غير دقيقة",
              "حق الحذف: طلب حذف بياناتك نهائياً من أنظمتنا",
              "حق تقييد المعالجة: تحديد نطاق استخدام بياناتك",
              "حق الاعتراض: الاعتراض على معالجة بياناتك لأغراض معينة",
              "حق نقل البيانات: الحصول على بياناتك بصيغة قابلة للقراءة الآلية",
            ]
          },
          {
            title:"6. الاحتفاظ بالبيانات",
            body:`نحتفظ ببياناتك الشخصية لمدة 12 شهراً من تاريخ التقديم. بعد انتهاء هذه المدة، يتم حذف بياناتك تلقائياً. في حال رغبتك بالحذف المبكر، يمكنك التواصل معنا في أي وقت.`
          },
          {
            title:"7. مشاركة البيانات",
            body:`لا نشارك بياناتك الشخصية مع أي طرف ثالث خارج المنظومة، باستثناء الجهة المُعلِنة عن الوظيفة التي تقدمت إليها. يتم عزل بيانات كل شركة تقنياً عن غيرها بشكل كامل (Row Level Security).`
          },
          {
            title:"8. أمان البيانات",
            items:[
              "تشفير جميع البيانات أثناء النقل باستخدام HTTPS/TLS",
              "تخزين آمن في Supabase مع عزل تام بين بيانات الشركات",
              "مصادقة ثنائية المستوى (JWT) لجميع الموظفين",
              "سجل تدقيق شامل لجميع العمليات (Audit Log)",
            ]
          },
          {
            title:"9. التواصل معنا",
            body:`لممارسة أي من حقوقك أو للاستفسار عن بياناتك، يُرجى التواصل مع فريق حماية البيانات عبر البريد الإلكتروني. سيتم الرد على طلبك خلال 5 أيام عمل وفقاً لمتطلبات قانون PDPL.`
          },
        ].map((sec, i) => (
          <div key={i} style={{ background:"#12121a", border:"1px solid #1e1e2e", borderRadius:14, padding:24, marginBottom:16 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:G, margin:"0 0 14px" }}>{sec.title}</h2>
            {sec.body && <p style={{ fontSize:14, color:"#aaa", lineHeight:1.8, margin:0 }}>{sec.body}</p>}
            {sec.items && (
              <ul style={{ margin:0, padding:0, listStyle:"none" }}>
                {sec.items.map((item, j) => (
                  <li key={j} style={{ fontSize:14, color:"#aaa", lineHeight:1.8, padding:"6px 0", borderBottom:j<sec.items.length-1?"1px solid #1e1e2e":"none", display:"flex", gap:10 }}>
                    <span style={{ color:G, flexShrink:0 }}>◈</span>{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div style={{ background:`${G}11`, border:`1px solid ${G}33`, borderRadius:14, padding:20, textAlign:"center", marginTop:8 }}>
          <div style={{ fontSize:22, marginBottom:8 }}>🔒</div>
          <div style={{ fontSize:14, color:G, fontWeight:700 }}>ملتزمون بحماية بياناتك وفق أعلى معايير الأمان</div>
          <div style={{ fontSize:12, color:"#666", marginTop:6 }}>قانون PDPL 2023 — المرسوم بقانون الاتحادي رقم 45 لسنة 2021</div>
        </div>

        <div style={{ textAlign:"center", marginTop:24 }}>
          <a href="/" style={{ color:"#444", fontSize:13, textDecoration:"none" }}>← العودة للرئيسية</a>
        </div>
      </div>
    </div>
  );
}
