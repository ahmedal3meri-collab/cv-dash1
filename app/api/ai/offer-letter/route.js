export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { getAnthropicClient, isAiConfigured } from "../../../../lib/anthropic";
import { MOCK_APPLICANTS } from "../../../../lib/data";

const SYSTEM = `أنت متخصص في كتابة خطابات العروض الوظيفية الرسمية للجهات الحكومية الإماراتية. اكتب خطاباً رسمياً احترافياً باللغة العربية الفصحى.

الخطاب يجب أن يتضمن:
1. رأسية الخطاب (التاريخ، المرجع)
2. تحية رسمية بالاسم
3. العرض الرسمي للوظيفة
4. المزايا والراتب (اذكر "يُحدد بعد المفاوضة" إذا لم تُذكر)
5. شروط الانضمام
6. طلب الرد خلال 5 أيام عمل
7. خاتمة رسمية

أسلوب: رسمي، واضح، موجز. لا تضف محتوى خارج الخطاب.`;

export async function POST(request) {
  try {
    const { applicantId } = await request.json();

    if (!isAiConfigured()) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY غير مُعدّ" }, { status: 400 });
    }

    let applicant = null;
    let company = null;

    if (!isSupabaseConfigured()) {
      applicant = MOCK_APPLICANTS.find((a) => String(a.id) === String(applicantId));
      if (!applicant) applicant = MOCK_APPLICANTS[0];
      if (applicant.status !== "مقبول") {
        return NextResponse.json({ error: "يمكن إصدار خطاب العرض للمتقدمين المقبولين فقط" }, { status: 400 });
      }
      company = { name: "هيئة أبوظبي للصحة" };
    } else {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("applicants").select("*, companies(name)").eq("id", applicantId).single();
      if (error || !data) return NextResponse.json({ error: "المتقدم غير موجود" }, { status: 404 });
      if (data.status !== "مقبول") {
        return NextResponse.json({ error: "يمكن إصدار خطاب العرض للمتقدمين المقبولين فقط" }, { status: 400 });
      }
      applicant = data;
      company = data.companies;
    }

    const today = new Date().toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" });
    const prompt = `أصدر خطاب عرض وظيفي رسمي بالتفاصيل التالية:

المؤسسة: ${company?.name || "الجهة المعنية"}
التاريخ: ${today}
اسم المتقدم: ${applicant.name}
المسمى الوظيفي المعروض: ${applicant.current_title || applicant.currentTitle || "وظيفة متخصص"}
خبرته: ${applicant.experience || "غير محدد"}
تعليمه: ${applicant.education || "غير محدد"}`;

    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({ letter: msg.content[0].text.trim() });
  } catch (err) {
    console.error("offer-letter error:", err);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
