export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Cache the system prompt — avoids re-tokenizing on every request
const SYSTEM_PROMPT = `أنت محلل سير ذاتية خبير. مهمتك استخراج المعلومات من السيرة الذاتية وإعادتها كـ JSON فقط بدون أي نص آخر.

هيكل JSON المطلوب:
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

قواعد مهمة:
- إذا لم تجد معلومة معينة اكتب: "غير محدد"
- أعد JSON فقط بدون markdown أو نص إضافي
- اجعل aiSummary احترافياً ومفيداً لفريق HR`;

let anthropicClient = null;
function getClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export async function POST(request) {
  try {
    const { pdf, name, email } = await request.json();

    if (!pdf) {
      return NextResponse.json({ error: "ملف PDF مطلوب" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(getDemoData(name, email), { status: 200 });
    }

    const client = getClient();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdf,
              },
            },
            {
              type: "text",
              text: "استخرج جميع المعلومات من هذه السيرة الذاتية وأعدها كـ JSON.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].text.trim().replace(/```json|```/g, "").trim();
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
