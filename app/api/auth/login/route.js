export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie } from "../../../../lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { DEMO_USERS } from "../../../../lib/data";

// HR portal allows both hr and hr_manager roles
function roleAllowed(expectedRole, actualRole) {
  if (!expectedRole) return true;
  if (expectedRole === "hr") return ["hr", "hr_manager"].includes(actualRole);
  return actualRole === expectedRole;
}

export async function POST(request) {
  try {
    const { email, password, expectedRole } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
    }

    // Super admin — always checked via env variables
    if (expectedRole === "superadmin" || !expectedRole) {
      const adminEmail = process.env.ADMIN_EMAIL || "superadmin@smartcv.ae";
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2024!";
      if (email === adminEmail && password === adminPassword) {
        const token = await signToken({ email, role: "superadmin", name: "Super Admin" });
        const response = NextResponse.json({ success: true, role: "superadmin", name: "Super Admin" });
        setAuthCookie(response, token);
        return response;
      }
      if (expectedRole === "superadmin") {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      }
    }

    // Company Admin + HR — check Supabase hr_accounts if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: hrUser, error: dbError } = await supabase
          .from("hr_accounts")
          .select("*, companies(name, primary_color)")
          .eq("email", email)
          .eq("is_active", true)
          .single();

        if (dbError && dbError.code !== "PGRST116") {
          // PGRST116 = row not found, which is expected; other errors fall through to demo
          console.error("Supabase query error:", dbError.message);
        }

        if (hrUser) {
          if (!roleAllowed(expectedRole, hrUser.role)) {
            return NextResponse.json({ error: "لا تملك صلاحية الوصول لهذه البوابة" }, { status: 403 });
          }
          const valid = await bcrypt.compare(password, hrUser.password_hash);
          if (!valid) {
            return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
          }
          const token = await signToken({
            email,
            role: hrUser.role,
            companyId: hrUser.company_id,
            hrId: hrUser.id,
            name: hrUser.name,
            companyName: hrUser.companies?.name,
            primaryColor: hrUser.companies?.primary_color || "#C9A84C",
          });
          // fire-and-forget: update last_login and audit log
          supabase.from("hr_accounts").update({ last_login: new Date().toISOString() }).eq("id", hrUser.id).then(() => {});
          supabase.from("audit_log").insert({
            action: "LOGIN",
            target_id: hrUser.id,
            performed_by: hrUser.name,
            company_id: hrUser.company_id,
            details: { role: hrUser.role },
          }).then(() => {});
          const response = NextResponse.json({
            success: true,
            role: hrUser.role,
            name: hrUser.name,
            companyName: hrUser.companies?.name,
          });
          setAuthCookie(response, token);
          return response;
        }
      } catch (supabaseErr) {
        console.error("Supabase login error:", supabaseErr);
        // Fall through to demo users
      }
    }

    // Fallback to DEMO_USERS
    const user = DEMO_USERS[email];
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }
    if (!roleAllowed(expectedRole, user.role)) {
      return NextResponse.json({ error: "لا تملك صلاحية الوصول لهذه البوابة" }, { status: 403 });
    }

    const token = await signToken({
      email,
      role: user.role,
      companyId: user.companyId,
      hrId: user.hrId || null,
      name: user.name,
      companyName: user.companyName,
      primaryColor: user.primaryColor,
    });
    const response = NextResponse.json({ success: true, role: user.role, name: user.name, companyName: user.companyName });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
