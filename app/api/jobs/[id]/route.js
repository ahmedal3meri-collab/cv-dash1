import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return verifyToken(token).catch(() => null);
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = params;
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = getSupabaseAdmin();
    const updates = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.requirements !== undefined) updates.requirements = body.requirements;
    if (body.location !== undefined) updates.location = body.location;
    if (body.jobType !== undefined) updates.job_type = body.jobType;
    if (body.isActive !== undefined) updates.is_active = body.isActive;
    if (body.expiresAt !== undefined) updates.expires_at = body.expiresAt;

    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      id: data.id, title: data.title, isActive: data.is_active,
      applyToken: data.apply_token, jobType: data.job_type,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
