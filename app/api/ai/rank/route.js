export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { scoreApplicantWithClaude } from "../../../../lib/ai-scoring";
import { isAiConfigured } from "../../../../lib/anthropic";
import { MOCK_APPLICANTS } from "../../../../lib/data";

export async function POST(request) {
  try {
    const { jobId, companyId } = await request.json();

    if (!isAiConfigured()) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY غير مُعدّ" }, { status: 400 });
    }

    let job = null;
    let applicants = [];

    if (!isSupabaseConfigured()) {
      applicants = companyId
        ? MOCK_APPLICANTS.filter((a) => String(a.companyId) === String(companyId))
        : MOCK_APPLICANTS;
    } else {
      const supabase = getSupabaseAdmin();

      if (jobId) {
        const { data: jobData } = await supabase.from("jobs").select("*").eq("id", jobId).single();
        job = jobData;
      }

      let q = supabase.from("applicants").select("*");
      if (jobId) q = q.eq("job_id", jobId);
      else if (companyId) q = q.eq("company_id", companyId);
      const { data: appData, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      applicants = appData || [];
    }

    // Sequential scoring loop to avoid rate limits
    const results = [];
    for (const applicant of applicants) {
      const scored = await scoreApplicantWithClaude(applicant, job);
      const entry = {
        id: applicant.id,
        name: applicant.name,
        currentTitle: applicant.current_title || applicant.currentTitle,
        experience: applicant.experience,
        aiScore: scored.score,
        aiMatchReasons: scored.matchReasons,
        aiGaps: scored.gaps,
        aiRecommendation: scored.recommendation,
      };
      results.push(entry);

      // Persist to DB if configured
      if (isSupabaseConfigured() && scored.score !== null) {
        const supabase = getSupabaseAdmin();
        await supabase.from("applicants").update({
          ai_score: scored.score,
          ai_match_reasons: JSON.stringify(scored.matchReasons || []),
          ai_gaps: JSON.stringify(scored.gaps || []),
          ai_recommendation: scored.recommendation || null,
          ai_scored_at: new Date().toISOString(),
        }).eq("id", applicant.id).catch(() => {});
      }
    }

    results.sort((a, b) => (b.aiScore ?? -1) - (a.aiScore ?? -1));
    return NextResponse.json({ ranked: results, total: results.length });
  } catch (err) {
    console.error("ai/rank error:", err);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
