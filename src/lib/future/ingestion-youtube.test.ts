import { describe, expect, it } from "vitest";
import {
  buildManualTranscriptSourceMetadata,
  buildRawSegmentsFromManualTranscript,
  MockYouTubeTranscriptProvider,
  createCitationRefsFromSegments,
  createDefaultYouTubeIngestionPipeline,
  formatTimestamp,
  getYouTubeTranscriptProviderById,
  ingestManualTranscriptSource,
  ingestYouTubeSource,
  isIngestionError,
  listYouTubeTranscriptProviders,
  normalizeTranscriptSegments,
  parseManualTranscriptText,
  parseYouTubeUrl,
  secondsToDisplayTime,
  selectYouTubeTranscriptProvider,
} from "@/lib/future/ingestion-youtube";
import type { ManualTranscriptInput, RawTranscriptSegment, SourceMetadata } from "@/lib/types/workspace";

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

describe("YouTube transcript provider registry", () => {
  it("lists the mock provider and future placeholders without selecting real providers", () => {
    const providers = listYouTubeTranscriptProviders();

    expect(providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mock-youtube-transcript",
          name: "Mock YouTube Transcript",
          capabilities: ["mock"],
          requiresNetwork: false,
          requiresApiKey: false,
          reliability: "demo",
        }),
        expect.objectContaining({
          id: "future-youtube-captions",
          capabilities: expect.arrayContaining(["official-captions"]),
          requiresNetwork: true,
          reliability: "experimental",
        }),
      ]),
    );
  });

  it("selects the local mock provider by default with fallback metadata", () => {
    const selection = selectYouTubeTranscriptProvider({ kind: "youtube", url: sampleUrl });

    expect(selection).toEqual({
      providerId: "mock-youtube-transcript",
      reason: "Defaulting to the local deterministic mock provider until approved caption providers are configured.",
      fallbackProviderIds: ["manual-transcript", "audio-transcription-fallback"],
    });
  });

  it("resolves known providers and leaves unknown provider IDs undefined", async () => {
    const provider = getYouTubeTranscriptProviderById("mock-youtube-transcript");

    expect(provider?.name).toBe("Mock YouTube Transcript");
    await expect(provider?.fetchTranscript({ kind: "youtube", url: sampleUrl })).resolves.toMatchObject({
      provider: "mock-youtube-transcript",
    });
    expect(getYouTubeTranscriptProviderById("missing-provider")).toBeUndefined();
  });

  it("creates a default mock ingestion pipeline with selection metadata", async () => {
    const pipeline = createDefaultYouTubeIngestionPipeline();
    const result = await ingestYouTubeSource({ kind: "youtube", url: sampleUrl });

    expect(pipeline.provider.name).toBe("Mock YouTube Transcript");
    expect(pipeline.selection.providerId).toBe("mock-youtube-transcript");
    expect(result.sourceMetadata).toMatchObject({
      providerId: "mock-youtube-transcript",
      providerName: "Mock YouTube Transcript",
      providerReliability: "demo",
    });
  });
});

describe("parseManualTranscriptText", () => {
  const baseInput: ManualTranscriptInput = {
    sourceUrl: sampleUrl,
    title: "Manual paste",
    language: "ko",
    transcriptText: "",
  };

  it("parses plain paragraphs as ordered untimestamped segments", () => {
    expect(
      parseManualTranscriptText({
        ...baseInput,
        transcriptText: "First paragraph.\n\nSecond paragraph.",
      }),
    ).toEqual([
      { index: 0, text: "First paragraph.", language: "ko" },
      { index: 1, text: "Second paragraph.", language: "ko" },
    ]);
  });

  it("parses bracketed timestamp prefixes", () => {
    expect(
      parseManualTranscriptText({
        ...baseInput,
        transcriptText: "[00:12] This is the first line\n[01:04] This is the second line",
      }),
    ).toEqual([
      { index: 0, startSeconds: 12, text: "This is the first line", language: "ko" },
      { index: 1, startSeconds: 64, text: "This is the second line", language: "ko" },
    ]);
  });

  it("parses timestamp ranges with optional spacing", () => {
    expect(
      parseManualTranscriptText({
        ...baseInput,
        transcriptText: "00:12 - 00:24 This is a ranged line\n01:00-01:30 Another ranged line",
      }),
    ).toEqual([
      { index: 0, startSeconds: 12, endSeconds: 24, text: "This is a ranged line", language: "ko" },
      { index: 1, startSeconds: 60, endSeconds: 90, text: "Another ranged line", language: "ko" },
    ]);
  });

  it("supports HH:MM:SS timestamps and keeps Korean text intact", () => {
    expect(
      parseManualTranscriptText({
        ...baseInput,
        transcriptText: "01:02:03 긴 한국어 문장을 그대로 둡니다.\n\n[00:00]   \n  English line  ",
      }),
    ).toEqual([
      { index: 0, startSeconds: 3723, text: "긴 한국어 문장을 그대로 둡니다.", language: "ko" },
      { index: 1, text: "English line", language: "ko" },
    ]);
  });
});

describe("manual transcript ingestion", () => {
  const baseInput: ManualTranscriptInput = {
    sourceUrl: sampleUrl,
    title: "Manual fallback source",
    language: "ko",
    transcriptText: "[00:12] First manual line\n00:24 - 00:30 Second manual line",
  };

  it("builds Manual Transcript source metadata without provider calls", () => {
    expect(buildManualTranscriptSourceMetadata(baseInput)).toMatchObject({
      sourceId: "src-manual-511ctokiROU",
      kind: "youtube",
      title: "Manual fallback source",
      language: "ko",
      canonicalUrl: sampleUrl,
      providerId: "manual-transcript",
      providerName: "Manual Transcript",
      providerReliability: "experimental",
    });
  });

  it("converts parsed manual transcript segments to raw transcript segments without inventing translations", () => {
    const parsed = parseManualTranscriptText(baseInput);

    expect(buildRawSegmentsFromManualTranscript(parsed)).toEqual([
      {
        index: 0,
        startSeconds: 12,
        text: "First manual line",
        language: "ko",
      },
      {
        index: 1,
        startSeconds: 24,
        endSeconds: 30,
        text: "Second manual line",
        language: "ko",
      },
    ]);
  });

  it("ingests timestamped manual transcript text with timestamped YouTube citation URLs", () => {
    const result = ingestManualTranscriptSource(baseInput);

    expect(result.sourceMetadata).toMatchObject({
      title: "Manual fallback source",
      providerName: "Manual Transcript",
      providerReliability: "experimental",
    });
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]).toMatchObject({
      id: "seg-src-manual-511ctokiROU-000",
      startSeconds: 12,
      displayTime: "00:12",
      translationText: undefined,
      sourceUrl: "https://www.youtube.com/watch?v=511ctokiROU&t=12s",
    });
    expect(result.citations[1]).toMatchObject({
      id: "cite-src-manual-511ctokiROU-002",
      displayTime: "00:24",
      url: "https://www.youtube.com/watch?v=511ctokiROU&t=24s",
    });
    expect(result.warnings).toContainEqual({
      code: "TRANSLATION_UNAVAILABLE",
      message: "Translation is not available for manual transcript segments yet.",
      severity: "info",
    });
  });

  it("keeps stable citations and warns when manual transcript text has no timestamps", () => {
    const result = ingestManualTranscriptSource({
      ...baseInput,
      title: undefined,
      transcriptText: "First paragraph.\n\nSecond paragraph.",
    });

    expect(result.sourceMetadata.title).toBe("Manual transcript");
    expect(result.segments.map((segment) => segment.sourceUrl)).toEqual([sampleUrl, sampleUrl]);
    expect(result.segments.map((segment) => segment.displayTime)).toEqual(["00:00", "00:00"]);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        {
          code: "MANUAL_TRANSCRIPT_UNTIMESTAMPED",
          message: "Manual transcript has no timestamps, so citations link to the source URL only.",
          severity: "info",
        },
        {
          code: "TRANSLATION_UNAVAILABLE",
          message: "Translation is not available for manual transcript segments yet.",
          severity: "info",
        },
      ]),
    );
  });

  it("returns an empty transcript warning for empty manual transcript input", () => {
    const result = ingestManualTranscriptSource({
      ...baseInput,
      transcriptText: " \n\n ",
    });

    expect(result.segments).toEqual([]);
    expect(result.citations).toEqual([]);
    expect(result.warnings).toContainEqual({
      code: "EMPTY_TRANSCRIPT",
      message: "Manual transcript did not contain any usable segments.",
      severity: "warning",
    });
  });
});
