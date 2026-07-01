import type {
  CitationAuditIssue,
  CitationAuditIssueCode,
  CitationAuditResult,
  CitationAuditSeverity,
  CitationRef,
  DeterministicBrief,
  SourceSegment,
} from "@/lib/types/workspace";

export interface AuditGeneratedBriefInput {
  brief: DeterministicBrief;
  segments: SourceSegment[];
  citations: CitationRef[];
}

interface IssueInput {
  code: CitationAuditIssueCode;
  severity: CitationAuditSeverity;
  message: string;
  targetType: CitationAuditIssue["targetType"];
  targetId?: string;
}

export function auditGeneratedBriefCitationContract(input: AuditGeneratedBriefInput): CitationAuditResult {
  const auditId = `audit-${input.brief.id}`;
  const citationIds = new Set(input.citations.map((citation) => citation.id));
  const segmentIds = new Set(input.segments.map((segment) => segment.id));
  const evidenceCardIds = new Set(input.brief.evidenceCards.map((card) => card.id));
  const checkedCitationIds: string[] = [];
  const checkedSegmentIds: string[] = [];
  const issues: CitationAuditIssue[] = [];

  function addCheckedCitationId(citationId: string) {
    if (!checkedCitationIds.includes(citationId)) {
      checkedCitationIds.push(citationId);
    }
  }

  function addCheckedSegmentId(segmentId: string) {
    if (!checkedSegmentIds.includes(segmentId)) {
      checkedSegmentIds.push(segmentId);
    }
  }

  function addIssue(issue: IssueInput) {
    issues.push({
      id: `${auditId}-issue-${issues.length + 1}`,
      ...issue,
    });
  }

  function verifyCitationIds(referencedCitationIds: string[]) {
    referencedCitationIds.forEach((citationId) => {
      addCheckedCitationId(citationId);

      if (!citationIds.has(citationId)) {
        addIssue({
          code: "UNKNOWN_CITATION_ID",
          severity: "error",
          message: "Generated brief references a citation ID that does not exist.",
          targetType: "citation",
          targetId: citationId,
        });
      }
    });
  }

  verifyCitationIds(input.brief.citationIds);

  if (input.brief.citationIds.length === 0 && (input.brief.evidenceCards.length > 0 || input.brief.blocks.length > 0)) {
    addIssue({
      code: "MISSING_BRIEF_CITATION",
      severity: "warning",
      message: "Generated brief has content but no brief-level citation IDs.",
      targetType: "brief",
      targetId: input.brief.id,
    });
  }

  input.brief.evidenceCards.forEach((card) => {
    if (card.citationIds.length === 0) {
      addIssue({
        code: "UNCITED_EVIDENCE_CARD",
        severity: "warning",
        message: "Generated evidence card has no citation IDs.",
        targetType: "evidence-card",
        targetId: card.id,
      });
    }

    verifyCitationIds(card.citationIds);

    card.segmentIds.forEach((segmentId) => {
      addCheckedSegmentId(segmentId);

      if (!segmentIds.has(segmentId)) {
        addIssue({
          code: "UNKNOWN_SEGMENT_ID",
          severity: "error",
          message: "Generated evidence card references a source segment ID that does not exist.",
          targetType: "segment",
          targetId: segmentId,
        });
      }
    });
  });

  const referencedEvidenceCardIds = new Set<string>();

  input.brief.blocks.forEach((block) => {
    if (block.citationIds.length === 0) {
      addIssue({
        code: "UNCITED_BRIEF_BLOCK",
        severity: "warning",
        message: "Generated brief block has no citation IDs.",
        targetType: "brief-block",
        targetId: block.id,
      });
    }

    verifyCitationIds(block.citationIds);

    block.evidenceCardIds.forEach((evidenceCardId) => {
      referencedEvidenceCardIds.add(evidenceCardId);

      if (!evidenceCardIds.has(evidenceCardId)) {
        addIssue({
          code: "UNKNOWN_EVIDENCE_CARD_ID",
          severity: "error",
          message: "Generated brief block references an evidence card ID that does not exist.",
          targetType: "evidence-card",
          targetId: evidenceCardId,
        });
      }
    });
  });

  input.brief.evidenceCards.forEach((card) => {
    if (!referencedEvidenceCardIds.has(card.id)) {
      addIssue({
        code: "ORPHANED_EVIDENCE_CARD",
        severity: "warning",
        message: "Generated evidence card is not referenced by any brief block.",
        targetType: "evidence-card",
        targetId: card.id,
      });
    }
  });

  if (input.brief.evidenceCards.length === 0 && input.brief.blocks.length === 0) {
    addIssue({
      code: "EMPTY_GENERATED_BRIEF",
      severity: "warning",
      message: "Generated brief has no evidence cards or brief blocks.",
      targetType: "brief",
      targetId: input.brief.id,
    });
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  if (errorCount === 0 && warningCount === 0) {
    addIssue({
      code: "AUDIT_PASSED",
      severity: "info",
      message: "Citation audit passed.",
      targetType: "brief",
      targetId: input.brief.id,
    });
  }

  return {
    id: auditId,
    briefId: input.brief.id,
    passed: errorCount === 0,
    issueCount: issues.length,
    errorCount,
    warningCount,
    checkedCitationIds: [...checkedCitationIds],
    checkedSegmentIds: [...checkedSegmentIds],
    issues,
  };
}
