import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-fallback-secret-change-in-prod"
);

async function getPayload(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Super Admin
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
    const payload = await getPayload(token);
    if (!payload || payload.role !== "superadmin")
      return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Company Admin
  if (pathname.startsWith("/company-admin") && pathname !== "/company-admin/login") {
    if (!token) return NextResponse.redirect(new URL("/company-admin/login", request.url));
    const payload = await getPayload(token);
    if (!payload || payload.role !== "company_admin")
      return NextResponse.redirect(new URL("/company-admin/login", request.url));
  }

  // HR
  if (pathname.startsWith("/hr") && pathname !== "/hr/login") {
    if (!token) return NextResponse.redirect(new URL("/hr/login", request.url));
    const payload = await getPayload(token);
    if (!payload || !["hr", "hr_manager"].includes(payload.role))
      return NextResponse.redirect(new URL("/hr/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/company-admin/:path*", "/hr/:path*"],
};
