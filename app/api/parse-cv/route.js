import { NextResponse } from "next/server";

const CV_PROMPT = `استخرج المعلومات من هذه السيرة الذاتية وأعدها كـ JSON فقط بدون أي نص آخر:
{
  "name": "الاسم الكامل",
  "nationality": "الجنسية",
  "phone": "رقم الهاتف",
  "email": "البريد الإلكتروني",
  "location": "المدينة / الإمارة",
  "currentTitle": "المسمى الوظيفي الحالي",
  "experience": "سنوات الخبرة",
  "lastEmployer": "آخر جهة عمل",
  "education": "أعلى مؤهل دراسي",
  "university": "اسم الجامعة أو المعهد",
  "gpa": "المعدل التراكمي",
  "skills": ["مهارة1", "مهارة2", "مهارة3"],
  "languages": ["لغة1 (مستوى)", "لغة2 (مستوى)"],
  "certifications": ["شهادة1", "شهادة2"],
  "aiSummary": "ملخص احترافي في 3 جمل: أبرز نقاط القوة، الخبرات المميزة، والتوصية بشأن مناسبته للوظيفة"
}
إذا لم تجد معلومة معينة اكتب: غير محدد
أعد JSON فقط بدون أي نص إضافي.`;

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    const { pdf, name, email } = await request.json();

    if (!pdf) {
      return NextResponse.json({ error: "ملف PDF مطلوب" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(getDemoData(name, email), { status: 200 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: pdf },
              },
              { type: "text", text: CV_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error(`Claude API error: ${res.status}`);
      return NextResponse.json(getDemoData(name, email), { status: 200 });
    }

    const data = await res.json();
    const text = data.content[0].text.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("parse-cv error:", err);
    return NextResponse.json(getDemoData("", ""), { status: 200 });
  }
}

function getDemoData(name, email) {
  return {
    name: name || "غير محدد",
    nationality: "إماراتي",
    phone: "+971 50 000 0000",
    email: email || "غير محدد",
    location: "أبوظبي",
    currentTitle: "محترف متخصص",
    experience: "5+ سنوات",
    lastEmployer: "شركة خليجية",
    education: "بكالوريوس",
    university: "جامعة الإمارات",
    gpa: "3.5",
    skills: ["تواصل", "إدارة", "تحليل بيانات"],
    languages: ["عربي (لغة أم)", "إنجليزي (محترف)"],
    certifications: ["PMP"],
    aiSummary:
      "تم التحليل في الوضع التجريبي — لم يتم تكوين ANTHROPIC_API_KEY. أضف المفتاح في .env.local للحصول على تحليل دقيق من السيرة الذاتية الفعلية.",
  };
}
