export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id, ...body });
    }

    const supabase = getSupabaseAdmin();
    const updates = {};
    if (body.status !== undefined)        updates.status = body.status;
    if (body.rating !== undefined)        updates.rating = body.rating;
    if (body.notes !== undefined)         updates.notes = body.notes;
    if (body.interviewDate !== undefined) updates.interview_date = body.interviewDate;
    if (body.interviewTime !== undefined) updates.interview_time = body.interviewTime;
    if (body.interviewNotes !== undefined) updates.interview_notes = body.interviewNotes;
    if (body.aiScore !== undefined)        updates.ai_score = body.aiScore;
    if (body.aiMatchReasons !== undefined) updates.ai_match_reasons = JSON.stringify(body.aiMatchReasons);
    if (body.aiGaps !== undefined)         updates.ai_gaps = JSON.stringify(body.aiGaps);
    if (body.aiRecommendation !== undefined) updates.ai_recommendation = body.aiRecommendation;
    if (body.aiScoredAt !== undefined)     updates.ai_scored_at = body.aiScoredAt;
    if (Object.keys(updates).length === 0) return NextResponse.json({ success: true, id });

    const { data, error } = await supabase
      .from("applicants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAudit(supabase, "UPDATE_APPLICANT", id, body);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, deleted: id });
  }

  const supabase = getSupabaseAdmin();
  await logAudit(supabase, "DELETE_APPLICANT", id, {});

  const { error } = await supabase.from("applicants").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

async function logAudit(supabase, action, targetId, details) {
  await supabase.from("audit_log").insert({
    action,
    target_id: String(targetId),
    details: JSON.stringify(details),
  }).catch(() => {});
}
