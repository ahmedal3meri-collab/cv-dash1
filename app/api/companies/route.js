export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";
import { MOCK_COMPANIES } from "../../../lib/data";

function mapCompany(c) {
  return {
    id: c.id,
    name: c.name,
    plan: c.plan,
    primaryColor: c.primary_color,
    secondaryColor: c.secondary_color,
    jobs: c.jobs || 0,
    applicants: c.applicants_count || 0,
    hrUsers: c.hr_users_count || 1,
    isActive: c.is_active,
    createdAt: c.created_at,
  };
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(MOCK_COMPANIES);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET companies error:", error.message, error.code);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
    return NextResponse.json((data || []).map(mapCompany));
  } catch (err) {
    console.error("Companies GET exception:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: "اسم الشركة مطلوب" }, { status: 400 });

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        id: Date.now(),
        name: body.name,
        plan: body.plan || "Basic",
        primaryColor: body.primaryColor || "#C9A84C",
        secondaryColor: body.secondaryColor || "#0a0a0f",
        jobs: 0,
        applicants: 0,
        hrUsers: 1,
      }, { status: 201 });
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

    if (error) {
      console.error("Supabase POST companies error:", error.message, error.code);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(mapCompany(data), { status: 201 });
  } catch (err) {
    console.error("Companies POST exception:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
