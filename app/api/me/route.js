import { NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
    const payload = await verifyToken(token);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "جلسة منتهية" }, { status: 401 });
  }
}
