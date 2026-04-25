import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-fallback-secret-change-in-prod"
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin/* except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "superadmin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect /hr/* except login
  if (pathname.startsWith("/hr") && pathname !== "/hr/login") {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/hr/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "hr") {
        return NextResponse.redirect(new URL("/hr/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/hr/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hr/:path*"],
};
