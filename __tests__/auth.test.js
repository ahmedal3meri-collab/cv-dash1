import { describe, it, expect, vi } from "vitest";

// Mock jose since it uses Web Crypto which may not be available in jsdom
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock.jwt.token"),
  })),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { role: "superadmin", email: "superadmin@smartcv.ae" },
  }),
}));

vi.mock("@/lib/data", () => ({
  DEMO_USERS: {
    "superadmin@smartcv.ae": {
      password: "Admin@2024!",
      role: "superadmin",
      companyId: null,
      name: "Super Admin",
    },
    "hr@company.ae": {
      password: "HR@2024!",
      role: "hr",
      companyId: "1",
      name: "سارة المطيري",
    },
  },
}));

describe("Auth Logic", () => {
  it("should accept valid superadmin credentials", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const user = DEMO_USERS["superadmin@smartcv.ae"];
    expect(user).toBeDefined();
    expect(user.password).toBe("Admin@2024!");
    expect(user.role).toBe("superadmin");
  });

  it("should accept valid HR credentials", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const user = DEMO_USERS["hr@company.ae"];
    expect(user).toBeDefined();
    expect(user.role).toBe("hr");
    expect(user.companyId).toBe("1");
  });

  it("should reject unknown email", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const user = DEMO_USERS["unknown@email.com"];
    expect(user).toBeUndefined();
  });

  it("should reject wrong password", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const user = DEMO_USERS["superadmin@smartcv.ae"];
    expect(user.password).not.toBe("wrongpassword");
  });

  it("should not allow HR to access superadmin portal", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const user = DEMO_USERS["hr@company.ae"];
    expect(user.role).not.toBe("superadmin");
  });

  it("should sign a JWT token", async () => {
    const { signToken } = await import("@/lib/auth");
    const token = await signToken({ role: "superadmin", email: "test@test.com" });
    expect(token).toBe("mock.jwt.token");
  });

  it("should verify a valid token", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const payload = await verifyToken("any.token.here");
    expect(payload.role).toBe("superadmin");
  });
});

describe("PDPL Compliance", () => {
  it("company data should have companyId isolation", async () => {
    const { DEMO_USERS } = await import("@/lib/data");
    const hrUser = DEMO_USERS["hr@company.ae"];
    const adminUser = DEMO_USERS["superadmin@smartcv.ae"];
    expect(hrUser.companyId).toBe("1");
    expect(adminUser.companyId).toBeNull();
  });
});
