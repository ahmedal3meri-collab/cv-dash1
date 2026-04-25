import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, deleted: id });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id, ...body });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companies")
      .update({
        name: body.name,
        plan: body.plan,
        primary_color: body.primaryColor,
        secondary_color: body.secondaryColor,
        is_active: body.isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
