import { NextResponse } from "next/server";
import { signToken, setAuthCookie } from "../../../../lib/auth";
import { DEMO_USERS } from "../../../../lib/data";

export async function POST(request) {
  try {
    const { email, password, expectedRole } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const user = DEMO_USERS[email];
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    if (expectedRole && user.role !== expectedRole) {
      return NextResponse.json({ error: "لا تملك صلاحية الوصول لهذه البوابة" }, { status: 403 });
    }

    const token = await signToken({
      email,
      role: user.role,
      companyId: user.companyId,
      name: user.name,
      companyName: user.companyName,
      primaryColor: user.primaryColor,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
      companyName: user.companyName,
    });

    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
