export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";

function mapJob(j) {
  return {
    id: j.id,
    companyId: j.company_id,
    title: j.title,
    description: j.description,
    requirements: j.requirements,
    location: j.location,
    jobType: j.job_type,
    isActive: j.is_active,
    applyToken: j.apply_token,
    expiresAt: j.expires_at,
    createdAt: j.created_at,
  };
}

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return verifyToken(token).catch(() => null);
}

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || session.companyId;

  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data || []).map(mapJob));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: "عنوان الوظيفة مطلوب" }, { status: 400 });

    const companyId = body.companyId || session.companyId;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        id: Date.now(),
        companyId,
        title: body.title,
        description: body.description || "",
        requirements: body.requirements || "",
        location: body.location || "",
        jobType: body.jobType || "دوام كامل",
        isActive: true,
        applyToken: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      }, { status: 201 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        company_id: companyId,
        title: body.title,
        description: body.description || null,
        requirements: body.requirements || null,
        location: body.location || null,
        job_type: body.jobType || "دوام كامل",
        is_active: true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update company jobs count
    await supabase.rpc("increment_company_jobs", { cid: companyId })
      .catch(() => supabase.from("companies").select("jobs").eq("id", companyId).single()
        .then(({ data: co }) => co && supabase.from("companies").update({ jobs: (co.jobs || 0) + 1 }).eq("id", companyId))
        .catch(() => {}));

    return NextResponse.json(mapJob(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
