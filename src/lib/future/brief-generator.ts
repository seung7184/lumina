import type {
  BriefBlock,
  CitationRef,
  DeterministicBrief,
  EvidenceCard,
  IngestionWarning,
  SourceDocument,
  SourceSegment,
} from "@/lib/types/workspace";
import { auditGeneratedBriefCitationContract } from "@/lib/future/citation-audit";
import { evaluateGenerationPolicy } from "@/lib/future/generation-policy-gate";
import { getActiveGenerationProvider } from "@/lib/future/generation-provider-registry";
import { createInitialGenerationReview } from "@/lib/future/generation-review";

export interface GenerateDeterministicBriefInput {
  source: SourceDocument;
  segments: SourceSegment[];
  citations: CitationRef[];
  maxEvidenceCards?: number;
  maxBriefBlocks?: number;
}

const defaultMaxEvidenceCards = 4;
const defaultMaxBriefBlocks = 4;
const maxBodyLength = 220;

export function generateDeterministicBrief(input: GenerateDeterministicBriefInput): DeterministicBrief {
  const provider = getActiveGenerationProvider();
  const maxEvidenceCards = Math.max(0, input.maxEvidenceCards ?? defaultMaxEvidenceCards);
  const maxBriefBlocks = Math.max(0, input.maxBriefBlocks ?? defaultMaxBriefBlocks);
  const meaningfulSegments = input.segments
    .filter((segment) => getSegmentText(segment).length > 0)
    .sort((left, right) => left.index - right.index);
  const selectedSegments = meaningfulSegments.slice(0, maxEvidenceCards);
  const warnings: IngestionWarning[] = [
    {
      code: "LOCAL_BRIEF_ONLY",
      message: "Generated locally from existing source segments; no AI model was used.",
      severity: "info",
    },
  ];

  if (!meaningfulSegments.length) {
    warnings.push({
      code: "NO_SOURCE_SEGMENTS",
      message: "No non-empty source segments are available for a local brief.",
      severity: "warning",
    });
  }

  const evidenceCards = selectedSegments.map((segment, index) => {
    const citationIds = getCitationIdsForSegment(segment.id, input.citations);

    if (!citationIds.length) {
      warnings.push({
        code: "MISSING_SEGMENT_CITATION",
        message: `No existing citation was found for source segment ${segment.id}.`,
        severity: "warning",
      });
    }

    return buildEvidenceCard(input.source, segment, citationIds, index);
  });
  const citationIds = collectCitationIds(evidenceCards);
  const brief: DeterministicBrief = {
    id: `brief-${input.source.id}-local-deterministic`,
    sourceId: input.source.id,
    title: "Local source-grounded brief",
    subtitle: "Generated from current source segments · no AI model used",
    generatedBy: "local-deterministic",
    providerId: provider.id,
    providerName: provider.name,
    providerReliability: provider.reliability,
    evidenceCards,
    blocks: buildBriefBlocks(input.source, evidenceCards, citationIds, maxBriefBlocks),
    citationIds,
    warnings: dedupeWarnings(warnings),
  };
  const citationAudit = auditGeneratedBriefCitationContract({
    brief,
    segments: input.segments,
    citations: input.citations,
  });
  const auditedBrief = { ...brief, citationAudit };
  const generationPolicy = evaluateGenerationPolicy({
    brief: auditedBrief,
    provider,
  });

  const policyCheckedBrief = {
    ...auditedBrief,
    generationPolicy,
  };

  return {
    ...policyCheckedBrief,
    review: createInitialGenerationReview(policyCheckedBrief),
  };
}

function buildEvidenceCard(
  source: SourceDocument,
  segment: SourceSegment,
  citationIds: string[],
  selectedIndex: number,
): EvidenceCard {
  const sourceTime = segment.startTime.trim() || undefined;
  const titleSuffix = sourceTime ? ` · ${sourceTime}` : "";

  return {
    id: `evidence-${source.id}-${segment.id}`,
    sourceId: source.id,
    segmentIds: [segment.id],
    citationIds,
    label: citationIds.length ? segment.citationLabel : "Uncited segment",
    title: `Evidence ${selectedIndex + 1}${titleSuffix}`,
    body: shortenText(getSegmentText(segment)),
    sourceTime,
    sourceUrl: source.url,
    kind: selectedIndex === 0 ? "claim" : "context",
  };
}

function buildBriefBlocks(
  source: SourceDocument,
  evidenceCards: EvidenceCard[],
  citationIds: string[],
  maxBriefBlocks: number,
): BriefBlock[] {
  if (!evidenceCards.length || maxBriefBlocks === 0) {
    return [];
  }

  const blocks: BriefBlock[] = [
    {
      id: `brief-${source.id}-overview`,
      title: "Overview",
      body: "This local brief is assembled from the current source segments and citations. It is not AI-generated.",
      citationIds,
      evidenceCardIds: evidenceCards.map((card) => card.id),
      kind: "overview",
    },
  ];
  const shouldReserveLimitation = maxBriefBlocks > 1;
  const keyPointLimit = Math.max(0, maxBriefBlocks - blocks.length - (shouldReserveLimitation ? 1 : 0));

  evidenceCards.slice(0, keyPointLimit).forEach((card, index) => {
    blocks.push({
      id: `brief-${source.id}-key-point-${index + 1}`,
      title: `Source-backed point ${index + 1}`,
      body: `Source-backed point: ${card.body}`,
      citationIds: card.citationIds,
      evidenceCardIds: [card.id],
      kind: "key-point",
    });
  });

  if (blocks.length < maxBriefBlocks) {
    blocks.push({
      id: `brief-${source.id}-limitation`,
      title: "Limitation",
      body: "This pass does not validate claims beyond the cited source segment, and it does not use external extraction or AI generation.",
      citationIds,
      evidenceCardIds: evidenceCards.map((card) => card.id),
      kind: "limitation",
    });
  }

  if (blocks.length < maxBriefBlocks) {
    blocks.push({
      id: `brief-${source.id}-next-step`,
      title: "Next step",
      body: "Review the cited segments before using this local deterministic draft.",
      citationIds,
      evidenceCardIds: evidenceCards.map((card) => card.id),
      kind: "next-step",
    });
  }

  return blocks;
}

function getCitationIdsForSegment(segmentId: string, citations: CitationRef[]) {
  return citations.filter((citation) => citation.segmentIds.includes(segmentId)).map((citation) => citation.id);
}

function collectCitationIds(evidenceCards: EvidenceCard[]) {
  const seen = new Set<string>();
  const citationIds: string[] = [];

  evidenceCards.forEach((card) => {
    card.citationIds.forEach((citationId) => {
      if (!seen.has(citationId)) {
        seen.add(citationId);
        citationIds.push(citationId);
      }
    });
  });

  return citationIds;
}

function getSegmentText(segment: SourceSegment) {
  return (segment.translation?.en ?? segment.text).replace(/\s+/g, " ").trim();
}

function shortenText(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxBodyLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxBodyLength - 1).trimEnd()}…`;
}

function dedupeWarnings(warnings: IngestionWarning[]) {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    const key = `${warning.code}:${warning.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
