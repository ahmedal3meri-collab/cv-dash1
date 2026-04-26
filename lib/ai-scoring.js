import { getAnthropicClient, isAiConfigured } from "./anthropic";

const SCORING_SYSTEM = `أنت محلل توظيف خبير. مهمتك تقييم مدى ملاءمة المتقدم للوظيفة وإعادة النتيجة كـ JSON فقط.

هيكل JSON المطلوب:
{
  "score": <رقم من 0 إلى 100>,
  "matchReasons": ["سبب 1", "سبب 2", "سبب 3"],
  "gaps": ["فجوة 1", "فجوة 2"],
  "recommendation": "توصية مختصرة في جملة واحدة"
}

معايير التقييم:
- الخبرة المهنية وملاءمتها للوظيفة (30%)
- المهارات التقنية المطلوبة (25%)
- التعليم والمؤهلات (20%)
- اللغات المطلوبة (15%)
- الشهادات والاعتمادات (10%)

قواعد:
- أعد JSON فقط بدون markdown
- matchReasons: نقاط القوة المحددة (2-4 نقاط)
- gaps: النقاط الناقصة (1-3 نقاط)، فارغة إذا لم توجد
- recommendation: جملة قصيرة بالعربية`;

export async function scoreApplicantWithClaude(applicant, job) {
  if (!isAiConfigured()) {
    return { score: null, matchReasons: [], gaps: [], recommendation: "يتطلب ANTHROPIC_API_KEY" };
  }

  const client = getAnthropicClient();
  const prompt = `الوظيفة: ${job?.title || "غير محدد"}
متطلبات الوظيفة: ${job?.requirements || "غير محدد"}
الموقع: ${job?.location || "غير محدد"}

بيانات المتقدم:
الاسم: ${applicant.name}
المسمى الحالي: ${applicant.currentTitle || "غير محدد"}
الخبرة: ${applicant.experience || "غير محدد"}
آخر جهة عمل: ${applicant.lastEmployer || "غير محدد"}
التعليم: ${applicant.education || "غير محدد"} — ${applicant.university || ""}
المعدل: ${applicant.gpa || "غير محدد"}
المهارات: ${(applicant.skills || []).join("، ")}
اللغات: ${(applicant.languages || []).join("، ")}
الشهادات: ${(applicant.certifications || []).join("، ")}

قيّم هذا المتقدم للوظيفة المذكورة.`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: [{ type: "text", text: SCORING_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].text.trim().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch {
    return { score: null, matchReasons: [], gaps: [], recommendation: "تعذّر التقييم" };
  }
}
