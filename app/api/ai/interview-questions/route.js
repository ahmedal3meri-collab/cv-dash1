export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { getAnthropicClient, isAiConfigured } from "../../../../lib/anthropic";
import { MOCK_APPLICANTS } from "../../../../lib/data";

const SYSTEM = `أنت خبير موارد بشرية متخصص في إجراء المقابلات. مهمتك توليد أسئلة مقابلة مخصصة للمتقدم بناءً على سيرته الذاتية. أعد JSON فقط بدون markdown.

هيكل JSON:
{
  "technical": [
    { "q": "السؤال", "hint": "تلميح للإجابة المتوقعة" }
  ],
  "behavioral": [
    { "q": "السؤال", "hint": "تلميح" }
  ],
  "cultural": [
    { "q": "السؤال", "hint": "تلميح" }
  ]
}

القواعد:
- technical: 4 أسئلة تقنية بناءً على مهاراته وخبرته
- behavioral: 3 أسئلة سلوكية (ابدأ بـ "صف موقفاً..." أو "كيف تعاملت مع...")
- cultural: 3 أسئلة عن التوافق الثقافي والقيم
- الأسئلة بالعربية وعملية ومحددة لهذا المتقدم`;

export async function POST(request) {
  try {
    const { applicantId } = await request.json();

    if (!isAiConfigured()) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY غير مُعدّ" }, { status: 400 });
    }

    let applicant = null;

    if (!isSupabaseConfigured()) {
      applicant = MOCK_APPLICANTS.find((a) => String(a.id) === String(applicantId));
      if (!applicant) applicant = MOCK_APPLICANTS[0];
    } else {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("applicants").select("*").eq("id", applicantId).single();
      if (error || !data) return NextResponse.json({ error: "المتقدم غير موجود" }, { status: 404 });
      applicant = data;
    }

    const prompt = `بيانات المتقدم:
الاسم: ${applicant.name}
المسمى الحالي: ${applicant.current_title || applicant.currentTitle || "غير محدد"}
الخبرة: ${applicant.experience || "غير محدد"}
آخر جهة عمل: ${applicant.last_employer || applicant.lastEmployer || "غير محدد"}
التعليم: ${applicant.education || "غير محدد"}
المهارات: ${(applicant.skills || []).join("، ")}
اللغات: ${(applicant.languages || []).join("، ")}
الشهادات: ${(applicant.certifications || []).join("، ")}
ملخص AI: ${applicant.ai_summary || applicant.aiSummary || "غير متوفر"}

ولّد 10 أسئلة مقابلة مخصصة لهذا المتقدم.`;

    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].text.trim().replace(/```json|```/g, "").trim();
    const questions = JSON.parse(text);
    return NextResponse.json(questions);
  } catch (err) {
    console.error("interview-questions error:", err);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
