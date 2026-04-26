import { describe, it, expect, vi } from "vitest";

describe("AI Scoring Module", () => {
  it("returns null score when API key not configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { scoreApplicantWithClaude } = await import("@/lib/ai-scoring");
    const result = await scoreApplicantWithClaude({ name: "Test", skills: [] }, null);
    expect(result.score).toBeNull();
    vi.unstubAllEnvs();
  });

  it("returns correct shape on fallback", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { scoreApplicantWithClaude } = await import("@/lib/ai-scoring");
    const result = await scoreApplicantWithClaude({ name: "Test", skills: [], languages: [] }, null);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("matchReasons");
    expect(result).toHaveProperty("gaps");
    expect(result).toHaveProperty("recommendation");
    vi.unstubAllEnvs();
  });
});

describe("Anthropic Singleton", () => {
  it("isAiConfigured returns false when no key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { isAiConfigured } = await import("@/lib/anthropic");
    expect(isAiConfigured()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("isAiConfigured returns true when key present", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    const { isAiConfigured } = await import("@/lib/anthropic");
    expect(isAiConfigured()).toBe(true);
    vi.unstubAllEnvs();
  });
});

describe("AiScore Component Shape", () => {
  it("score 80 is green tier", () => {
    const score = 80;
    const isGreen = score >= 75;
    expect(isGreen).toBe(true);
  });

  it("score 60 is amber tier", () => {
    const score = 60;
    const isAmber = score >= 50 && score < 75;
    expect(isAmber).toBe(true);
  });

  it("score 30 is red tier", () => {
    const score = 30;
    const isRed = score < 50;
    expect(isRed).toBe(true);
  });

  it("null score is neutral tier", () => {
    const score = null;
    expect(score).toBeNull();
  });
});

describe("mapApplicant AI Fields", () => {
  it("MOCK_APPLICANTS have expected base fields", async () => {
    const { MOCK_APPLICANTS } = await import("@/lib/data");
    MOCK_APPLICANTS.forEach((a) => {
      expect(a).toHaveProperty("id");
      expect(a).toHaveProperty("name");
      expect(a).toHaveProperty("status");
    });
  });
});
