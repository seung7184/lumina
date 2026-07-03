import { beforeEach, describe, expect, it, vi } from "vitest";

const geminiMock = vi.hoisted(() => ({
  generateContent: vi.fn(),
  getFallbackModelNames: vi.fn(() => ["primary-model", "fallback-model"]),
  getGenerativeModel: vi.fn(() => ({
    generateContent: vi.fn(),
  })),
}));

vi.mock("@/lib/ai/gemini", () => ({
  getFallbackModelNames: geminiMock.getFallbackModelNames,
  getGenerativeModel: geminiMock.getGenerativeModel,
  isAIConfigured: () => true,
  isRetryableAIError: (error: unknown) => error instanceof Error && error.message.includes("503"),
}));

import { POST } from "./route";

describe("/api/generate prompt contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    geminiMock.getFallbackModelNames.mockReturnValue(["primary-model", "fallback-model"]);
  });

  it("requires source-limited executive briefs with citations on every sentence", async () => {
    geminiMock.getGenerativeModel.mockReturnValueOnce({
      generateContent: geminiMock.generateContent,
    });
    geminiMock.generateContent.mockResolvedValueOnce({
      response: {
        text: () => "ok",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          segments: [
            { index: 0, text: "Lumina turns source material into cited briefs.", startSeconds: 0 },
            { index: 1, text: "Teams use Lumina to study, decide, and write from source evidence.", startSeconds: 5 },
          ],
          sourceTitle: "Smoke Source",
          sourceKind: "text",
          template: "executive-brief",
          language: "en",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const prompt = geminiMock.generateContent.mock.calls[0]?.[0] as string;
    expect(prompt).toContain("Every sentence in the Overview must end with a source citation like [0]");
    expect(prompt).toContain("Every Source Confidence rating must cite the segment that supports the rated claim");
    expect(prompt).toContain("Only include implications that are explicitly stated in the source");
    expect(prompt).toContain("Do not write broad productivity, research, business, or workflow benefits unless the source says them");
    expect(prompt).toContain("Do not infer product category, design intent, utility, audience, or purpose unless those words are in the source");
    expect(prompt).toContain("Prefer extractive wording from the source over abstract paraphrases");
  });

  it("falls back to the next Gemini model after a transient provider error", async () => {
    const primaryGenerateContent = vi.fn().mockRejectedValueOnce(
      new Error("[GoogleGenerativeAI Error]: [503 Service Unavailable] high demand"),
    );
    const fallbackGenerateContent = vi.fn().mockResolvedValueOnce({
      response: {
        text: () => "fallback ok",
      },
    });
    geminiMock.getGenerativeModel
      .mockReturnValueOnce({ generateContent: primaryGenerateContent })
      .mockReturnValueOnce({ generateContent: fallbackGenerateContent });

    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          segments: [{ index: 0, text: "Lumina turns source material into cited briefs.", startSeconds: 0 }],
          sourceTitle: "Smoke Source",
          sourceKind: "text",
          template: "executive-brief",
          language: "en",
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({ content: "fallback ok" });
    expect(geminiMock.getGenerativeModel).toHaveBeenNthCalledWith(1, "primary-model");
    expect(geminiMock.getGenerativeModel).toHaveBeenNthCalledWith(2, "fallback-model");
  });
});
