export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return NextResponse.json({ success: true });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("hr_accounts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    if (!isSupabaseConfigured()) return NextResponse.json({ success: true });

    const supabase = getSupabaseAdmin();
    const updates = {};

    if (typeof body.isActive === "boolean") updates.is_active = body.isActive;
    if (body.name) updates.name = body.name;
    if (body.role) updates.role = body.role;
    if (body.password) {
      if (body.password.length < 8) return NextResponse.json({ error: "كلمة المرور قصيرة جداً" }, { status: 400 });
      updates.password_hash = await bcrypt.hash(body.password, 10);
    }

    const { data, error } = await supabase
      .from("hr_accounts")
      .update(updates)
      .eq("id", id)
      .select("id, name, email, role, is_active")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
