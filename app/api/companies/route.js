import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";
import { MOCK_COMPANIES } from "@/lib/data";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(MOCK_COMPANIES);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: "اسم الشركة مطلوب" }, { status: 400 });

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id: Date.now(), ...body });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: body.name,
        plan: body.plan || "Basic",
        primary_color: body.primaryColor || "#C9A84C",
        secondary_color: body.secondaryColor || "#0a0a0f",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
