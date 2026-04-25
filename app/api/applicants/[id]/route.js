import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id, ...body });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applicants")
      .update({
        status: body.status,
        rating: body.rating,
        interview_date: body.interviewDate,
        interview_time: body.interviewTime,
        interview_notes: body.interviewNotes,
        notes: body.notes,
      })
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
