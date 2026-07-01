import type { CitationRef, DeterministicBrief, SourceDocument } from "@/lib/types/workspace";

export type BriefMarkdownExportScope = "brief" | "evidence";

export interface BriefMarkdownExportInput {
  brief: DeterministicBrief | null;
  source: SourceDocument;
  citations: CitationRef[];
}

export type BriefMarkdownExportResult =
  | {
      allowed: true;
      markdown: string;
      scope: BriefMarkdownExportScope;
    }
  | {
      allowed: false;
      reason: string;
      scope: BriefMarkdownExportScope;
    };

export function exportLocalBriefMarkdown(input: BriefMarkdownExportInput): BriefMarkdownExportResult {
  return buildBriefMarkdownExport(input, "brief");
}

export function exportEvidenceCardsMarkdown(input: BriefMarkdownExportInput): BriefMarkdownExportResult {
  return buildBriefMarkdownExport(input, "evidence");
}

function buildBriefMarkdownExport(input: BriefMarkdownExportInput, scope: BriefMarkdownExportScope): BriefMarkdownExportResult {
  if (!input.brief) {
    return {
      allowed: false,
      reason: "Generate a local source-grounded brief before copying Markdown.",
      scope,
    };
  }

  if (input.brief.generationPolicy?.allowedToDisplay === false) {
    return {
      allowed: false,
      reason: "Copy export is unavailable while generation policy blocks display.",
      scope,
    };
  }

  const citationMap = new Map(input.citations.map((citation) => [citation.id, citation]));
  const markdown = scope === "brief" ? buildFullBriefMarkdown(input.brief, input.source, citationMap) : buildEvidenceMarkdown(input.brief, input.source, citationMap);

  return {
    allowed: true,
    markdown,
    scope,
  };
}

function buildFullBriefMarkdown(
  brief: DeterministicBrief,
  source: SourceDocument,
  citationMap: Map<string, CitationRef>,
) {
  return compactMarkdown([
    ...buildMetadataMarkdown(brief, source),
    "",
    "## Evidence cards",
    ...brief.evidenceCards.flatMap((card) => [
      "",
      `### ${card.title} ${formatCitationRun(card.citationIds, citationMap)}`.trim(),
      `Source segments: ${card.segmentIds.join(", ") || "none"}`,
      "",
      card.body,
    ]),
    "",
    "## Brief blocks",
    ...brief.blocks.flatMap((block) => [
      "",
      `### ${block.title} ${formatCitationRun(block.citationIds, citationMap)}`.trim(),
      `Evidence cards: ${block.evidenceCardIds.join(", ") || "none"}`,
      "",
      block.body,
    ]),
    "",
    ...buildCitationAppendix(brief.citationIds, citationMap),
  ]);
}

function buildEvidenceMarkdown(
  brief: DeterministicBrief,
  source: SourceDocument,
  citationMap: Map<string, CitationRef>,
) {
  return compactMarkdown([
    `# Evidence cards for ${brief.title}`,
    "",
    ...buildMetadataMarkdown(brief, source).slice(1),
    "",
    "## Evidence cards",
    ...brief.evidenceCards.flatMap((card) => [
      "",
      `### ${card.title} ${formatCitationRun(card.citationIds, citationMap)}`.trim(),
      `Source segments: ${card.segmentIds.join(", ") || "none"}`,
      "",
      card.body,
    ]),
    "",
    ...buildCitationAppendix(collectEvidenceCitationIds(brief), citationMap),
  ]);
}

function buildMetadataMarkdown(brief: DeterministicBrief, source: SourceDocument) {
  return [
    `# ${brief.title}`,
    "",
    brief.subtitle,
    "",
    `Source: ${source.title.en || source.title.ko}`,
    `Source ID: ${source.id}`,
    `Provider: ${formatProvider(brief)}`,
    `Citation audit: ${formatCitationAudit(brief)}`,
    `Generation policy: ${formatGenerationPolicy(brief)}`,
    "Note: local deterministic draft, no AI model used.",
  ];
}

function buildCitationAppendix(citationIds: string[], citationMap: Map<string, CitationRef>) {
  const uniqueCitationIds = Array.from(new Set(citationIds));

  if (!uniqueCitationIds.length) {
    return ["## Citations", "", "No citations were included."];
  }

  return [
    "## Citations",
    "",
    ...uniqueCitationIds.map((citationId) => {
      const citation = citationMap.get(citationId);

      if (!citation) {
        return `- ${citationId}`;
      }

      return `- Citation ${citation.label} (${citation.id}): source ${citation.sourceId}; segments ${citation.segmentIds.join(", ")}`;
    }),
  ];
}

function collectEvidenceCitationIds(brief: DeterministicBrief) {
  return Array.from(new Set(brief.evidenceCards.flatMap((card) => card.citationIds)));
}

function formatProvider(brief: DeterministicBrief) {
  return [brief.providerName ?? brief.providerId ?? "unknown provider", brief.providerReliability].filter(Boolean).join(" · ");
}

function formatCitationAudit(brief: DeterministicBrief) {
  const audit = brief.citationAudit;

  if (!audit) {
    return "pending";
  }

  const status = !audit.passed ? "needs review" : audit.warningCount > 0 ? "passed with warnings" : "passed";
  return `${status} · ${formatIssueCount(audit.errorCount, "error")} · ${formatIssueCount(audit.warningCount, "warning")}`;
}

function formatGenerationPolicy(brief: DeterministicBrief) {
  const policy = brief.generationPolicy;

  if (!policy) {
    return "pending";
  }

  if (!policy.allowedToDisplay) {
    return "blocked · source-grounded display disabled";
  }

  if (policy.warningCount > 0) {
    return "allowed with warnings · source-grounded display enabled";
  }

  return "allowed · source-grounded display enabled";
}

function formatIssueCount(count: number, label: "error" | "warning") {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function formatCitationRun(citationIds: string[], citationMap: Map<string, CitationRef>) {
  return citationIds
    .map((citationId) => {
      const citation = citationMap.get(citationId);
      return citation ? `[Citation ${citation.label} (${citation.id})]` : `[${citationId}]`;
    })
    .join(" ");
}

function compactMarkdown(lines: string[]) {
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}
