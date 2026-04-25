import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";
import { MOCK_APPLICANTS } from "../../../lib/data";

function mapApplicant(a) {
  return {
    id: a.id,
    name: a.name,
    nationality: a.nationality,
    phone: a.phone,
    email: a.email,
    location: a.location,
    currentTitle: a.current_title,
    experience: a.experience,
    lastEmployer: a.last_employer,
    education: a.education,
    university: a.university,
    gpa: a.gpa,
    skills: a.skills || [],
    languages: a.languages || [],
    certifications: a.certifications || [],
    aiSummary: a.ai_summary,
    status: a.status,
    rating: a.rating,
    notes: a.notes,
    interviewDate: a.interview_date,
    interviewTime: a.interview_time,
    interviewNotes: a.interview_notes,
    companyId: a.company_id,
    date: a.created_at?.split("T")[0],
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!isSupabaseConfigured()) {
    const filtered = companyId
      ? MOCK_APPLICANTS.filter((a) => String(a.companyId) === String(companyId))
      : MOCK_APPLICANTS;
    return NextResponse.json(filtered);
  }

  const supabase = getSupabaseAdmin();
  let query = supabase.from("applicants").select("*").order("created_at", { ascending: false });
  if (companyId) query = query.eq("company_id", companyId);
  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data || []).map(mapApplicant));
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id: Date.now(), ...body });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applicants")
      .insert({
        name: body.name,
        nationality: body.nationality,
        phone: body.phone,
        email: body.email,
        location: body.location,
        current_title: body.currentTitle,
        experience: body.experience,
        last_employer: body.lastEmployer,
        education: body.education,
        university: body.university,
        gpa: body.gpa,
        skills: body.skills,
        languages: body.languages,
        certifications: body.certifications,
        ai_summary: body.aiSummary,
        status: body.status || "مراجعة",
        rating: body.rating || 0,
        company_id: body.companyId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapApplicant(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
