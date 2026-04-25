export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";

export async function GET() {
  const configured = isSupabaseConfigured();
  let dbConnected = false;
  let dbError = null;
  let companiesCount = null;

  if (configured) {
    try {
      const supabase = getSupabaseAdmin();
      const { count, error } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });

      if (error) {
        dbError = error.message;
      } else {
        dbConnected = true;
        companiesCount = count;
      }
    } catch (e) {
      dbError = e.message;
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    configured,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + "...",
    dbConnected,
    dbError,
    companiesCount,
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
    },
  });
}
