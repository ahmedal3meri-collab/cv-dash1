import { describe, it, expect } from "vitest";

describe("Company Admin Demo User", () => {
  it("should exist in DEMO_USERS", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const admin = DEMO_USERS["admin@haad.ae"];
    expect(admin).toBeDefined();
    expect(admin.role).toBe("company_admin");
    expect(admin.companyId).toBe("1");
    expect(admin.hrId).toBeDefined();
  });

  it("should have required fields for company_admin", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const admin = DEMO_USERS["admin@haad.ae"];
    expect(admin.name).toBeTruthy();
    expect(admin.companyName).toBeTruthy();
    expect(admin.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("company_admin should not be confused with superadmin", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const admin = DEMO_USERS["admin@haad.ae"];
    expect(admin.role).not.toBe("superadmin");
    expect(admin.companyId).not.toBeNull();
  });
});

describe("Role-Based Access Control", () => {
  it("superadmin has no companyId (sees all data)", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    expect(DEMO_USERS["superadmin@smartcv.ae"].companyId).toBeNull();
  });

  it("company_admin is scoped to their company", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    expect(DEMO_USERS["admin@haad.ae"].companyId).toBe("1");
  });

  it("hr is scoped to their company", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    expect(DEMO_USERS["hr@company.ae"].companyId).toBe("1");
  });

  it("should have 3 distinct portals covered by demo users", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const roles = Object.values(DEMO_USERS).map((u) => u.role);
    expect(roles).toContain("superadmin");
    expect(roles).toContain("company_admin");
    expect(roles).toContain("hr");
  });
});

describe("Mock Applicants Data", () => {
  it("all applicants should have valid status", async () => {
    const { MOCK_APPLICANTS } = await import("@/lib/data");
    const validStatuses = ["مراجعة", "مقبول", "مرفوض"];
    MOCK_APPLICANTS.forEach((a) => {
      expect(validStatuses).toContain(a.status);
    });
  });

  it("all applicants should have valid rating (0-5)", async () => {
    const { MOCK_APPLICANTS } = await import("@/lib/data");
    MOCK_APPLICANTS.forEach((a) => {
      expect(a.rating).toBeGreaterThanOrEqual(0);
      expect(a.rating).toBeLessThanOrEqual(5);
    });
  });

  it("applicants should have array fields", async () => {
    const { MOCK_APPLICANTS } = await import("@/lib/data");
    MOCK_APPLICANTS.forEach((a) => {
      expect(Array.isArray(a.skills)).toBe(true);
      expect(Array.isArray(a.languages)).toBe(true);
      expect(Array.isArray(a.certifications)).toBe(true);
    });
  });
});
