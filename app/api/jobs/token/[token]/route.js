export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../../lib/supabase-server";

export async function GET(request, { params }) {
  const { token } = params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      id: "demo",
      title: "وظيفة متاحة",
      companyName: "الشركة",
      primaryColor: "#C9A84C",
      companyId: "1",
      isActive: true,
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("jobs")
      .select("*, companies(name, primary_color)")
      .eq("apply_token", token)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "الرابط غير صالح أو انتهت صلاحيته" }, { status: 404 });
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية رابط التقديم" }, { status: 410 });
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      location: data.location,
      jobType: data.job_type,
      companyId: data.company_id,
      companyName: data.companies?.name || "الشركة",
      primaryColor: data.companies?.primary_color || "#C9A84C",
      isActive: data.is_active,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
