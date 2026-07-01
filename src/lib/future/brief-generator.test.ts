import { describe, expect, it } from "vitest";
import { generateDeterministicBrief } from "@/lib/future/brief-generator";
import type { CitationRef, SourceDocument, SourceSegment } from "@/lib/types/workspace";

const source: SourceDocument = {
  id: "src-test",
  type: "youtube",
  title: { en: "Test source", ko: "Test source" },
  url: "https://example.com/source",
  sourceLanguage: "en",
  thumbnailLabel: "Test",
  segmentIds: ["seg-1", "seg-2", "seg-3", "seg-4", "seg-blank"],
};

function segment(overrides: Partial<SourceSegment>): SourceSegment {
  return {
    id: "seg-1",
    sourceId: source.id,
    index: 0,
    startTime: "00:12",
    endTime: "00:18",
    language: "en",
    text: "First segment text from the source.",
    citationLabel: "1",
    linkedBlockIds: [],
    ...overrides,
  };
}

function citation(overrides: Partial<CitationRef>): CitationRef {
  return {
    id: "cite-1",
    sourceId: source.id,
    segmentIds: ["seg-1"],
    label: "1",
    status: "from_source",
    ...overrides,
  };
}

describe("generateDeterministicBrief", () => {
  it("creates deterministic evidence cards and brief blocks from source segments", () => {
    const segments = [
      segment({ id: "seg-1", index: 0, startTime: "00:12", text: "The first cited source point is preserved." }),
      segment({ id: "seg-2", index: 1, startTime: "00:24", text: "The second cited source point is preserved." }),
    ];
    const citations = [
      citation({ id: "cite-1", segmentIds: ["seg-1"], label: "1" }),
      citation({ id: "cite-2", segmentIds: ["seg-2"], label: "2" }),
    ];

    const first = generateDeterministicBrief({ source, segments, citations });
    const second = generateDeterministicBrief({ source, segments, citations });

    expect(second).toEqual(first);
    expect(first.generatedBy).toBe("local-deterministic");
    expect(first.providerId).toBe("local-deterministic-brief");
    expect(first.providerName).toBe("Local Deterministic Brief");
    expect(first.providerReliability).toBe("demo");
    expect(first.citationAudit).toMatchObject({
      id: "audit-brief-src-test-local-deterministic",
      briefId: "brief-src-test-local-deterministic",
      passed: true,
      errorCount: 0,
      warningCount: 0,
      checkedCitationIds: ["cite-1", "cite-2"],
      checkedSegmentIds: ["seg-1", "seg-2"],
    });
    expect(first.evidenceCards).toHaveLength(2);
    expect(first.evidenceCards[0]).toMatchObject({
      id: "evidence-src-test-seg-1",
      sourceId: "src-test",
      segmentIds: ["seg-1"],
      citationIds: ["cite-1"],
      title: "Evidence 1 · 00:12",
      body: "The first cited source point is preserved.",
      sourceTime: "00:12",
      sourceUrl: "https://example.com/source",
      kind: "claim",
    });
    expect(first.blocks[0]).toMatchObject({
      id: "brief-src-test-overview",
      kind: "overview",
      citationIds: ["cite-1", "cite-2"],
      evidenceCardIds: ["evidence-src-test-seg-1", "evidence-src-test-seg-2"],
    });
    expect(first.blocks.some((block) => block.kind === "limitation")).toBe(true);
    expect(first.citationIds).toEqual(["cite-1", "cite-2"]);
    expect(first.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "LOCAL_BRIEF_ONLY",
          message: "Generated locally from existing source segments; no AI model was used.",
        }),
      ]),
    );
  });

  it("limits evidence cards, ignores blank segments, and never invents citation IDs", () => {
    const segments = [
      segment({ id: "seg-1", index: 0, startTime: "00:12", text: "First segment." }),
      segment({ id: "seg-blank", index: 1, startTime: "00:18", text: "   " }),
      segment({ id: "seg-2", index: 2, startTime: "00:24", text: "Second segment." }),
      segment({ id: "seg-3", index: 3, startTime: "00:36", text: "Third segment." }),
    ];
    const citations = [citation({ id: "cite-1", segmentIds: ["seg-1"], label: "1" })];

    const brief = generateDeterministicBrief({ source, segments, citations, maxEvidenceCards: 2 });

    expect(brief.evidenceCards.map((card) => card.segmentIds[0])).toEqual(["seg-1", "seg-2"]);
    expect(brief.evidenceCards.flatMap((card) => card.citationIds)).toEqual(["cite-1"]);
    expect(brief.citationIds).toEqual(["cite-1"]);
    expect(brief.citationAudit).toMatchObject({
      passed: true,
      errorCount: 0,
      checkedCitationIds: ["cite-1"],
      checkedSegmentIds: ["seg-1", "seg-2"],
    });
    expect(brief.citationAudit?.warningCount).toBeGreaterThan(0);
    expect(brief.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "MISSING_SEGMENT_CITATION",
          severity: "warning",
        }),
      ]),
    );
  });

  it("returns an empty brief with a warning when no meaningful segments exist", () => {
    const brief = generateDeterministicBrief({
      source,
      segments: [segment({ id: "seg-empty", text: "" })],
      citations: [],
    });

    expect(brief.evidenceCards).toEqual([]);
    expect(brief.blocks).toEqual([]);
    expect(brief.citationAudit).toMatchObject({
      passed: true,
      errorCount: 0,
      warningCount: 1,
    });
    expect(brief.citationAudit?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "EMPTY_GENERATED_BRIEF",
          severity: "warning",
        }),
      ]),
    );
    expect(brief.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "NO_SOURCE_SEGMENTS",
          severity: "warning",
        }),
      ]),
    );
  });

  it("works with YouTube, PDF, and webpage source labels", () => {
    const segments = [
      segment({ id: "seg-youtube", index: 0, startTime: "00:12", text: "YouTube timed segment." }),
      segment({ id: "seg-pdf", index: 1, startTime: "Page 1", text: "PDF page segment." }),
      segment({ id: "seg-web", index: 2, startTime: "Section 2", text: "Webpage section segment." }),
    ];
    const citations = [
      citation({ id: "cite-youtube", segmentIds: ["seg-youtube"], label: "1" }),
      citation({ id: "cite-pdf", segmentIds: ["seg-pdf"], label: "2" }),
      citation({ id: "cite-web", segmentIds: ["seg-web"], label: "3" }),
    ];

    const brief = generateDeterministicBrief({ source, segments, citations });

    expect(brief.evidenceCards.map((card) => card.title)).toEqual([
      "Evidence 1 · 00:12",
      "Evidence 2 · Page 1",
      "Evidence 3 · Section 2",
    ]);
  });
});
