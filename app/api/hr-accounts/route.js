export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";

export async function GET(request) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);

  const { searchParams } = new URL(request.url);
  const filterCompanyId = searchParams.get("companyId");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("hr_accounts")
    .select("id, name, email, role, is_active, last_login, created_at, company_id, companies(name, primary_color)")
    .order("created_at", { ascending: false });

  if (filterCompanyId) query = query.eq("company_id", filterCompanyId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, companyId, role, callerRole } = body;

    if (!name || !email || !password || !companyId) {
      return NextResponse.json({ error: "الاسم والبريد وكلمة المرور والشركة مطلوبة" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
    }

    // فقط Super Admin يمكنه إنشاء company_admin
    if (role === "company_admin" && callerRole !== "superadmin") {
      return NextResponse.json({ error: "إنشاء Company Admin مخصص للسوبر أدمن فقط" }, { status: 403 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id: Date.now(), name, email, role: role || "hr", companyId });
    }

    const supabase = getSupabaseAdmin();

    // تحقق من عدم تكرار الإيميل
    const { data: existing } = await supabase
      .from("hr_accounts")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("hr_accounts")
      .insert({ name, email, password_hash, company_id: companyId, role: role || "hr" })
      .select("id, name, email, role, company_id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
