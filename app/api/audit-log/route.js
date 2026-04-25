import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";

export async function GET(request) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
    const payload = await verifyToken(token);

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Company admin sees only their company logs
    if (payload.role === "company_admin" && payload.companyId) {
      query = query.eq("company_id", payload.companyId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
