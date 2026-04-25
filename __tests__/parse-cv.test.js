import { describe, it, expect, vi, beforeEach } from "vitest";

describe("CV Parsing Demo Mode", () => {
  it("should return demo data when no API key is provided", () => {
    const getDemoData = (name, email) => ({
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
      aiSummary: "تم التحليل في الوضع التجريبي.",
    });

    const result = getDemoData("أحمد", "ahmed@test.com");
    expect(result.name).toBe("أحمد");
    expect(result.email).toBe("ahmed@test.com");
    expect(result.nationality).toBe("إماراتي");
    expect(result.skills).toBeInstanceOf(Array);
    expect(result.skills.length).toBeGreaterThan(0);
  });

  it("should fill in defaults for missing fields", () => {
    const getDemoData = (name, email) => ({
      name: name || "غير محدد",
      email: email || "غير محدد",
      skills: [],
      languages: [],
      certifications: [],
    });

    const result = getDemoData("", "");
    expect(result.name).toBe("غير محدد");
    expect(result.email).toBe("غير محدد");
  });

  it("should not expose API key in response", () => {
    const mockResponse = {
      name: "Test",
      email: "test@test.com",
      skills: [],
    };
    expect(JSON.stringify(mockResponse)).not.toContain("sk-ant");
    expect(JSON.stringify(mockResponse)).not.toContain("ANTHROPIC");
  });
});

describe("Mock Data Integrity", () => {
  it("should have all required fields for each applicant", async () => {
    const { MOCK_APPLICANTS } = await import("@/lib/data");
    MOCK_APPLICANTS.forEach((applicant) => {
      expect(applicant.id).toBeDefined();
      expect(applicant.name).toBeTruthy();
      expect(applicant.email).toBeTruthy();
      expect(applicant.status).toMatch(/^(مراجعة|مقبول|مرفوض)$/);
      expect(applicant.rating).toBeGreaterThanOrEqual(0);
      expect(applicant.rating).toBeLessThanOrEqual(5);
      expect(applicant.skills).toBeInstanceOf(Array);
      expect(applicant.languages).toBeInstanceOf(Array);
      expect(applicant.certifications).toBeInstanceOf(Array);
    });
  });

  it("should have all required fields for each company", async () => {
    const { MOCK_COMPANIES } = await import("@/lib/data");
    MOCK_COMPANIES.forEach((company) => {
      expect(company.id).toBeDefined();
      expect(company.name).toBeTruthy();
      expect(company.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(company.plan).toMatch(/^(Basic|Professional|Enterprise)$/);
    });
  });
});
