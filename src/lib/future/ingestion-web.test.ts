import { describe, expect, it } from "vitest";
import { ingestMockWebpageSource, isWebpageIngestionError, parseWebpageSourceUrl } from "@/lib/future/ingestion-web";

describe("mock webpage ingestion", () => {
  it("accepts http and https webpage URLs without fetching them", () => {
    expect(parseWebpageSourceUrl("https://example.com/articles/lumina")).toBeInstanceOf(URL);
    expect(parseWebpageSourceUrl("http://example.com/articles/lumina").toString()).toBe("http://example.com/articles/lumina");
  });

  it("rejects invalid and unsupported webpage URLs with recoverable ingestion errors", () => {
    for (const url of ["not a url", "ftp://example.com/article"]) {
      try {
        parseWebpageSourceUrl(url);
        throw new Error("Expected parser to reject URL");
      } catch (error) {
        expect(isWebpageIngestionError(error)).toBe(true);
        if (isWebpageIngestionError(error)) {
          expect(error.code).toBe("INVALID_URL");
          expect(error.recoverable).toBe(true);
        }
      }
    }
  });

  it("builds deterministic webpage source metadata, segments, and citations", () => {
    const result = ingestMockWebpageSource({
      kind: "webpage",
      url: "https://example.com/articles/lumina-boundary",
      title: "Lumina Boundary Notes",
      language: "ko",
    });

    expect(result.sourceMetadata).toMatchObject({
      sourceId: "src-webpage-example-com-articles-lumina-boundary",
      kind: "webpage",
      title: "Lumina Boundary Notes",
      language: "ko",
      canonicalUrl: "https://example.com/articles/lumina-boundary",
      providerId: "mock-webpage",
      providerName: "Mock Webpage",
      providerReliability: "demo",
    });
    expect(result.segments).toHaveLength(3);
    expect(result.citations).toHaveLength(3);
    expect(result.segments[0]).toMatchObject({
      id: "seg-src-webpage-example-com-articles-lumina-boundary-000",
      displayTime: "Section 1",
      sourceUrl: "https://example.com/articles/lumina-boundary#section-1",
      text: "This mock webpage boundary represents a future article source without fetching the live page.",
      language: "ko",
    });
    expect(result.segments[1].text).toContain("source attribution");
    expect(result.citations[2]).toMatchObject({
      id: "cite-src-webpage-example-com-articles-lumina-boundary-003",
      label: "[3]",
      displayTime: "Section 3",
      url: "https://example.com/articles/lumina-boundary#section-3",
    });
    expect(result.warnings).toEqual([]);
  });

  it("preserves Korean and English fixture text when provided", () => {
    const result = ingestMockWebpageSource({
      kind: "webpage",
      url: "https://example.com/ko/lumina",
      title: "한국어 Boundary",
      language: "ko",
    });

    expect(result.sourceMetadata.title).toBe("한국어 Boundary");
    expect(result.segments.map((segment) => segment.text).join(" ")).toContain("Lumina keeps source attribution");
  });
});
