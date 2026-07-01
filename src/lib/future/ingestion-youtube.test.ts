import { describe, expect, it } from "vitest";
import {
  MockYouTubeTranscriptProvider,
  createCitationRefsFromSegments,
  formatTimestamp,
  ingestYouTubeSource,
  isIngestionError,
  normalizeTranscriptSegments,
  parseYouTubeUrl,
  secondsToDisplayTime,
} from "@/lib/future/ingestion-youtube";
import type { RawTranscriptSegment, SourceMetadata } from "@/lib/types/workspace";

const sampleUrl = "https://www.youtube.com/watch?v=511ctokiROU";

function expectIngestionError(error: unknown, code: string) {
  expect(isIngestionError(error)).toBe(true);
  if (isIngestionError(error)) {
    expect(error.code).toBe(code);
    expect(error.recoverable).toBe(true);
  }
}

describe("parseYouTubeUrl", () => {
  it.each([
    ["watch URL", "https://www.youtube.com/watch?v=511ctokiROU"],
    ["bare host watch URL", "https://youtube.com/watch?v=511ctokiROU"],
    ["short URL", "https://youtu.be/511ctokiROU"],
    ["shorts URL", "https://www.youtube.com/shorts/511ctokiROU"],
    ["embed URL", "https://www.youtube.com/embed/511ctokiROU"],
    ["watch URL with extra params", "https://www.youtube.com/watch?v=511ctokiROU&t=123s&ab_channel=Code"],
  ])("parses %s", (_label, url) => {
    expect(parseYouTubeUrl(url)).toEqual({
      videoId: "511ctokiROU",
      canonicalUrl: sampleUrl,
      originalUrl: url,
    });
  });

  it("rejects invalid URLs", () => {
    expect(() => parseYouTubeUrl("not a url")).toThrowError();
    try {
      parseYouTubeUrl("not a url");
    } catch (error) {
      expectIngestionError(error, "INVALID_URL");
    }
  });

  it("rejects non-YouTube URLs", () => {
    try {
      parseYouTubeUrl("https://example.com/watch?v=511ctokiROU");
    } catch (error) {
      expectIngestionError(error, "UNSUPPORTED_SOURCE");
    }
  });

  it("rejects missing video IDs", () => {
    try {
      parseYouTubeUrl("https://www.youtube.com/watch?v=");
    } catch (error) {
      expectIngestionError(error, "INVALID_URL");
    }
  });
});

describe("YouTube ingestion normalization", () => {
  const sourceMetadata: SourceMetadata = {
    sourceId: "src-youtube-511ctokiROU",
    kind: "youtube",
    title: "People Losing Everything to AI vs People Whose Time Becomes Infinite",
    creator: "Code Factory",
    language: "ko",
    canonicalUrl: sampleUrl,
  };

  const rawSegments: RawTranscriptSegment[] = [
    {
      index: 0,
      startSeconds: 0,
      endSeconds: 6,
      text: "지금 AI에 대한 지식이 굉장히 부족한데...",
      language: "ko",
      translationText: "AI knowledge is severely lacking right now...",
    },
    {
      index: 1,
      startSeconds: 72,
      endSeconds: 84,
      text: "반대로 이해도가 높은 사람들은 시간을 확장하고 있어요.",
      language: "ko",
    },
  ];

  it("formats timestamps consistently", () => {
    expect(formatTimestamp(0)).toBe("00:00");
    expect(formatTimestamp(72)).toBe("01:12");
    expect(formatTimestamp(754)).toBe("12:34");
    expect(formatTimestamp(3723)).toBe("01:02:03");
    expect(secondsToDisplayTime(72.8)).toBe("01:12");
  });

  it("normalizes transcript segments with stable IDs and timestamped source URLs", () => {
    const segments = normalizeTranscriptSegments(sourceMetadata, rawSegments);

    expect(segments).toEqual([
      expect.objectContaining({
        id: "seg-src-youtube-511ctokiROU-000",
        sourceId: "src-youtube-511ctokiROU",
        index: 0,
        displayTime: "00:00",
        citationId: "cite-src-youtube-511ctokiROU-001",
        sourceUrl: "https://www.youtube.com/watch?v=511ctokiROU&t=0s",
        translationText: "AI knowledge is severely lacking right now...",
      }),
      expect.objectContaining({
        id: "seg-src-youtube-511ctokiROU-001",
        displayTime: "01:12",
        citationId: "cite-src-youtube-511ctokiROU-002",
        sourceUrl: "https://www.youtube.com/watch?v=511ctokiROU&t=72s",
      }),
    ]);
  });

  it("creates stable citation references from normalized segments", () => {
    const segments = normalizeTranscriptSegments(sourceMetadata, rawSegments);
    const citations = createCitationRefsFromSegments(segments);

    expect(citations).toEqual([
      {
        id: "cite-src-youtube-511ctokiROU-001",
        sourceId: "src-youtube-511ctokiROU",
        segmentId: "seg-src-youtube-511ctokiROU-000",
        label: "[1]",
        displayTime: "00:00",
        url: "https://www.youtube.com/watch?v=511ctokiROU&t=0s",
      },
      {
        id: "cite-src-youtube-511ctokiROU-002",
        sourceId: "src-youtube-511ctokiROU",
        segmentId: "seg-src-youtube-511ctokiROU-001",
        label: "[2]",
        displayTime: "01:12",
        url: "https://www.youtube.com/watch?v=511ctokiROU&t=72s",
      },
    ]);
  });

  it("returns an empty transcript warning instead of crashing", async () => {
    const result = await ingestYouTubeSource(
      { kind: "youtube", url: sampleUrl },
      {
        provider: {
          name: "empty-test-provider",
          async fetchTranscript() {
            return {
              sourceMetadata,
              rawSegments: [],
              provider: "empty-test-provider",
              fetchedAt: "2026-07-01T00:00:00.000Z",
            };
          },
        },
      },
    );

    expect(result.segments).toEqual([]);
    expect(result.citations).toEqual([]);
    expect(result.warnings).toContainEqual({
      code: "EMPTY_TRANSCRIPT",
      message: "Transcript provider returned no segments.",
      severity: "warning",
    });
  });
});

describe("MockYouTubeTranscriptProvider", () => {
  it("returns deterministic Korean transcript data for the sample source", async () => {
    const provider = new MockYouTubeTranscriptProvider();
    const result = await provider.fetchTranscript({ kind: "youtube", url: sampleUrl });

    expect(result.provider).toBe("mock-youtube-transcript");
    expect(result.fetchedAt).toBe("2026-07-01T00:00:00.000Z");
    expect(result.sourceMetadata).toMatchObject({
      sourceId: "src-youtube-511ctokiROU",
      title: "AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들",
      language: "ko",
      canonicalUrl: sampleUrl,
    });
    expect(result.rawSegments.length).toBeGreaterThanOrEqual(6);
    expect(result.rawSegments.some((segment) => segment.translationText)).toBe(true);
  });

  it("builds a full mock ingestion result compatible with the UI pipeline", async () => {
    const result = await ingestYouTubeSource({ kind: "youtube", url: sampleUrl });

    expect(result.sourceMetadata.sourceId).toBe("src-youtube-511ctokiROU");
    expect(result.segments).toHaveLength(result.citations.length);
    expect(result.segments[0]).toMatchObject({
      id: "seg-src-youtube-511ctokiROU-000",
      displayTime: "00:00",
      citationId: "cite-src-youtube-511ctokiROU-001",
      language: "ko",
    });
    expect(result.citations[0]).toMatchObject({
      label: "[1]",
      displayTime: "00:00",
      url: "https://www.youtube.com/watch?v=511ctokiROU&t=0s",
    });
    expect(result.warnings).toContainEqual({
      code: "TRANSLATION_UNAVAILABLE",
      message: "Some transcript segments do not include translated text.",
      severity: "info",
    });
  });
});
