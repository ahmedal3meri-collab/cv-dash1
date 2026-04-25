import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase-server";

export async function GET() {
  const configured = isSupabaseConfigured();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasJwt = !!process.env.JWT_SECRET;

  if (!configured) {
    return NextResponse.json({
      configured: false,
      url: url ? url.substring(0, 30) + "..." : "NOT SET",
      hasServiceKey: hasKey,
      hasJwt,
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companies")
      .select("count", { count: "exact", head: true });

    return NextResponse.json({
      configured: true,
      url: url.substring(0, 30) + "...",
      hasServiceKey: hasKey,
      hasJwt,
      dbConnected: !error,
      dbError: error ? error.message : null,
      companiesCount: data,
    });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      url: url.substring(0, 30) + "...",
      hasServiceKey: hasKey,
      hasJwt,
      dbConnected: false,
      exception: err.message,
    });
  }
}
