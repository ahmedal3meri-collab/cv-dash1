export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { getAnthropicClient, isAiConfigured } from "../../../../lib/anthropic";
import { MOCK_APPLICANTS } from "../../../../lib/data";

const SYSTEM = `أنت محلل بيانات توظيف خبير. حلّل مجموعة المتقدمين وأعد تقريراً شاملاً كـ JSON فقط بدون markdown.

هيكل JSON:
{
  "poolQualityScore": <0-100>,
  "poolQualitySummary": "ملخص جودة المجموعة في جملتين",
  "skillsGapAnalysis": ["فجوة مهارية 1", "فجوة مهارية 2", "فجوة مهارية 3"],
  "topPerformers": ["اسم 1 — السبب", "اسم 2 — السبب"],
  "hiringRecommendations": ["توصية 1", "توصية 2", "توصية 3"],
  "diversityInsights": "ملاحظة واحدة عن تنوع المجموعة",
  "urgentActions": ["إجراء عاجل 1", "إجراء عاجل 2"]
}`;

export async function POST(request) {
  try {
    const { companyId } = await request.json();

    if (!isAiConfigured()) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY غير مُعدّ" }, { status: 400 });
    }

    let applicants = [];

    if (!isSupabaseConfigured()) {
      applicants = companyId
        ? MOCK_APPLICANTS.filter((a) => String(a.companyId) === String(companyId))
        : MOCK_APPLICANTS;
    } else {
      const supabase = getSupabaseAdmin();
      let q = supabase.from("applicants").select("*");
      if (companyId) q = q.eq("company_id", companyId);
      const { data, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      applicants = data || [];
    }

    if (applicants.length === 0) {
      return NextResponse.json({ error: "لا يوجد متقدمون للتحليل" }, { status: 400 });
    }

    const summary = applicants.map((a) => ({
      name: a.name,
      title: a.current_title || a.currentTitle,
      exp: a.experience,
      edu: a.education,
      skills: (a.skills || []).slice(0, 5),
      status: a.status,
      rating: a.rating,
      aiScore: a.ai_score ?? null,
    }));

    const prompt = `لديك ${applicants.length} متقدم في المجموعة. إليك ملخص بياناتهم:

${JSON.stringify(summary, null, 2)}

حلّل هذه المجموعة وأعد تقريراً شاملاً.`;

    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].text.trim().replace(/```json|```/g, "").trim();
    const analytics = JSON.parse(text);
    return NextResponse.json(analytics);
  } catch (err) {
    console.error("ai/analytics error:", err);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
