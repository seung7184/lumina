import { beforeEach, describe, expect, it, vi } from "vitest";

const geminiMock = vi.hoisted(() => ({
  getFallbackModelNames: vi.fn(() => ["primary-model", "fallback-model"]),
  getGenerativeModel: vi.fn(),
  sendMessage: vi.fn(),
  startChat: vi.fn(),
}));

vi.mock("@/lib/ai/gemini", () => ({
  getFallbackModelNames: geminiMock.getFallbackModelNames,
  getGenerativeModel: geminiMock.getGenerativeModel,
  isAIConfigured: () => true,
  isRetryableAIError: (error: unknown) => error instanceof Error && error.message.includes("503"),
}));

import { POST } from "./route";

describe("/api/chat prompt contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    geminiMock.getFallbackModelNames.mockReturnValue(["primary-model", "fallback-model"]);
  });

  it("uses segment-index citations instead of timestamp citations", async () => {
    geminiMock.getGenerativeModel.mockReturnValueOnce({
      startChat: geminiMock.startChat,
    });
    geminiMock.sendMessage.mockResolvedValueOnce({
      response: {
        text: () => "ok",
      },
    });
    geminiMock.startChat.mockReturnValueOnce({
      sendMessage: geminiMock.sendMessage,
    });

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "What does Lumina do?",
          history: [],
          segments: [
            { index: 0, text: "Lumina turns source material into cited briefs.", startSeconds: 0 },
            { index: 1, text: "Teams use Lumina to study, decide, and write from source evidence.", startSeconds: 5 },
          ],
          sourceTitle: "Smoke Source",
          language: "en",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const history = geminiMock.startChat.mock.calls[0]?.[0]?.history;
    const systemPrompt = history[0].parts[0].text as string;
    expect(systemPrompt).toContain("Use segment-index citations like [0], not timestamp citations like [0:05]");
    expect(systemPrompt).toContain("Segment [0]");
    expect(systemPrompt).not.toContain("[0:00] Segment 0");
  });
});
