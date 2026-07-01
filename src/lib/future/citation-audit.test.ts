import { describe, expect, it } from "vitest";
import { auditGeneratedBriefCitationContract } from "@/lib/future/citation-audit";
import type { CitationRef, DeterministicBrief, SourceDocument, SourceSegment } from "@/lib/types/workspace";

const source: SourceDocument = {
  id: "src-audit",
  type: "youtube",
  title: { en: "Audit source", ko: "Audit source" },
  url: "https://example.com/audit",
  sourceLanguage: "en",
  thumbnailLabel: "Audit",
  segmentIds: ["seg-1", "seg-2"],
};

function segment(overrides: Partial<SourceSegment>): SourceSegment {
  return {
    id: "seg-1",
    sourceId: source.id,
    index: 0,
    startTime: "00:01",
    endTime: "00:05",
    language: "en",
    text: "Source segment text.",
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

function validBrief(overrides: Partial<DeterministicBrief> = {}): DeterministicBrief {
  return {
    id: "brief-src-audit-local-deterministic",
    sourceId: source.id,
    title: "Local source-grounded brief",
    subtitle: "Generated from current source segments · no AI model used",
    generatedBy: "local-deterministic",
    providerId: "local-deterministic-brief",
    providerName: "Local Deterministic Brief",
    providerReliability: "demo",
    evidenceCards: [
      {
        id: "evidence-src-audit-seg-1",
        sourceId: source.id,
        segmentIds: ["seg-1"],
        citationIds: ["cite-1"],
        label: "1",
        title: "Evidence 1 · 00:01",
        body: "Source segment text.",
        sourceTime: "00:01",
        sourceUrl: source.url,
        kind: "claim",
      },
    ],
    blocks: [
      {
        id: "brief-src-audit-overview",
        title: "Overview",
        body: "This local brief is assembled from current source segments.",
        citationIds: ["cite-1"],
        evidenceCardIds: ["evidence-src-audit-seg-1"],
        kind: "overview",
      },
    ],
    citationIds: ["cite-1"],
    warnings: [],
    ...overrides,
  };
}

const validSegments = [segment({ id: "seg-1" })];
const validCitations = [citation({ id: "cite-1", segmentIds: ["seg-1"] })];

describe("auditGeneratedBriefCitationContract", () => {
  it("passes for a valid deterministic brief", () => {
    const result = auditGeneratedBriefCitationContract({
      brief: validBrief(),
      segments: validSegments,
      citations: validCitations,
    });

    expect(result).toMatchObject({
      id: "audit-brief-src-audit-local-deterministic",
      briefId: "brief-src-audit-local-deterministic",
      passed: true,
      issueCount: 1,
      errorCount: 0,
      warningCount: 0,
      checkedCitationIds: ["cite-1"],
      checkedSegmentIds: ["seg-1"],
    });
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "AUDIT_PASSED",
        severity: "info",
        targetType: "brief",
        targetId: "brief-src-audit-local-deterministic",
      }),
    ]);
  });

  it("returns a deterministic result for the same input", () => {
    const input = {
      brief: validBrief(),
      segments: validSegments,
      citations: validCitations,
    };

    expect(auditGeneratedBriefCitationContract(input)).toEqual(auditGeneratedBriefCitationContract(input));
  });

  it("detects an unknown citation ID at the brief level", () => {
    const result = auditGeneratedBriefCitationContract({
      brief: validBrief({ citationIds: ["cite-missing"] }),
      segments: validSegments,
      citations: validCitations,
    });

    expect(result.passed).toBe(false);
    expect(result.errorCount).toBe(1);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "UNKNOWN_CITATION_ID",
        severity: "error",
        targetType: "citation",
        targetId: "cite-missing",
      }),
    ]);
  });

  it("detects an unknown citation ID in an evidence card", () => {
    const brief = validBrief({
      evidenceCards: [
        {
          ...validBrief().evidenceCards[0],
          citationIds: ["cite-missing"],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "UNKNOWN_CITATION_ID",
        targetId: "cite-missing",
      }),
    ]);
  });

  it("detects an unknown citation ID in a brief block", () => {
    const brief = validBrief({
      blocks: [
        {
          ...validBrief().blocks[0],
          citationIds: ["cite-missing"],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "UNKNOWN_CITATION_ID",
        targetId: "cite-missing",
      }),
    ]);
  });

  it("detects an unknown segment ID in an evidence card", () => {
    const brief = validBrief({
      evidenceCards: [
        {
          ...validBrief().evidenceCards[0],
          segmentIds: ["seg-missing"],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "UNKNOWN_SEGMENT_ID",
        severity: "error",
        targetType: "segment",
        targetId: "seg-missing",
      }),
    ]);
  });

  it("detects an unknown evidence card ID in a brief block", () => {
    const brief = validBrief({
      blocks: [
        {
          ...validBrief().blocks[0],
          evidenceCardIds: ["evidence-missing"],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "UNKNOWN_EVIDENCE_CARD_ID",
          severity: "error",
          targetType: "evidence-card",
          targetId: "evidence-missing",
        }),
      ]),
    );
  });

  it("warns for an uncited evidence card", () => {
    const brief = validBrief({
      evidenceCards: [
        {
          ...validBrief().evidenceCards[0],
          citationIds: [],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(true);
    expect(result.warningCount).toBe(1);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "UNCITED_EVIDENCE_CARD",
        severity: "warning",
        targetType: "evidence-card",
        targetId: "evidence-src-audit-seg-1",
      }),
    ]);
  });

  it("warns for an uncited brief block", () => {
    const brief = validBrief({
      blocks: [
        {
          ...validBrief().blocks[0],
          citationIds: [],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(true);
    expect(result.warningCount).toBe(1);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "UNCITED_BRIEF_BLOCK",
        severity: "warning",
        targetType: "brief-block",
        targetId: "brief-src-audit-overview",
      }),
    ]);
  });

  it("warns for an orphaned evidence card", () => {
    const brief = validBrief({
      blocks: [
        {
          ...validBrief().blocks[0],
          evidenceCardIds: [],
        },
      ],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(true);
    expect(result.warningCount).toBe(1);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "ORPHANED_EVIDENCE_CARD",
        severity: "warning",
        targetType: "evidence-card",
        targetId: "evidence-src-audit-seg-1",
      }),
    ]);
  });

  it("warns for an empty brief", () => {
    const brief = validBrief({
      evidenceCards: [],
      blocks: [],
      citationIds: [],
    });

    const result = auditGeneratedBriefCitationContract({ brief, segments: validSegments, citations: validCitations });

    expect(result.passed).toBe(true);
    expect(result.warningCount).toBe(1);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "EMPTY_GENERATED_BRIEF",
        severity: "warning",
        targetType: "brief",
        targetId: "brief-src-audit-local-deterministic",
      }),
    ]);
  });

  it("returns isolated checked ID arrays", () => {
    const result = auditGeneratedBriefCitationContract({
      brief: validBrief(),
      segments: validSegments,
      citations: validCitations,
    });

    result.checkedCitationIds.push("mutated");
    result.checkedSegmentIds.push("mutated");

    const nextResult = auditGeneratedBriefCitationContract({
      brief: validBrief(),
      segments: validSegments,
      citations: validCitations,
    });

    expect(nextResult.checkedCitationIds).toEqual(["cite-1"]);
    expect(nextResult.checkedSegmentIds).toEqual(["seg-1"]);
  });
});
