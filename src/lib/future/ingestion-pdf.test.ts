import { describe, expect, it } from "vitest";
import { ingestMockPdfSource } from "@/lib/future/ingestion-pdf";

describe("mock PDF ingestion", () => {
  it("builds deterministic PDF source data from a filename-only input", () => {
    const result = ingestMockPdfSource({
      kind: "pdf",
      filename: "lumina-boundary.pdf",
      language: "en",
    });

    expect(result.sourceMetadata).toMatchObject({
      sourceId: "src-pdf-lumina-boundary-pdf",
      kind: "pdf",
      title: "lumina-boundary.pdf",
      canonicalUrl: "lumina-boundary.pdf",
      providerId: "mock-pdf",
      providerName: "Mock PDF",
      providerReliability: "demo",
    });
    expect(result.segments).toHaveLength(3);
    expect(result.citations).toHaveLength(3);
    expect(result.citations[0]).toMatchObject({
      label: "[1]",
      displayTime: "Page 1",
      url: "lumina-boundary.pdf#page=1",
    });
    expect(result.warnings).toContainEqual({
      code: "MOCK_PDF_BOUNDARY",
      message: "Mock PDF boundary only; no PDF bytes were parsed.",
      severity: "info",
    });
  });

  it("uses URL-backed PDF anchors when a URL is provided", () => {
    const result = ingestMockPdfSource({
      kind: "pdf",
      url: "https://example.com/reports/lumina.pdf",
      title: "Lumina PDF Report",
      language: "ko",
    });

    expect(result.sourceMetadata).toMatchObject({
      sourceId: "src-pdf-example-com-reports-lumina-pdf",
      title: "Lumina PDF Report",
      canonicalUrl: "https://example.com/reports/lumina.pdf",
      language: "ko",
    });
    expect(result.segments[0]).toMatchObject({
      displayTime: "Page 1",
      sourceUrl: "https://example.com/reports/lumina.pdf#page=1",
      text: "This mock PDF boundary represents a future uploaded or linked document source.",
    });
    expect(result.segments[2].text).toBe("Future PDF extraction should preserve page numbers and citation anchors.");
  });
});
