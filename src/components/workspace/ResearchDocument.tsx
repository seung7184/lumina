import { Copy, Files } from "lucide-react";
import type {
  BriefBlock,
  CitationAuditResult,
  DeterministicBrief,
  DocumentBlock,
  EvidenceCard,
  GenerationPolicyResult,
  LanguageCode,
  ReportMode,
  SourceDocument,
  SummaryDocument,
} from "@/lib/types/workspace";
import { ActionItemsBlock } from "@/components/document-blocks/ActionItemsBlock";
import { ClaimValidationBlock } from "@/components/document-blocks/ClaimValidationBlock";
import { ConceptDiagramBlock } from "@/components/document-blocks/ConceptDiagramBlock";
import { KeyTakeawaysBlock } from "@/components/document-blocks/KeyTakeawaysBlock";
import { StudyNotesBlock } from "@/components/document-blocks/StudyNotesBlock";
import { CitationMarker } from "@/components/workspace/CitationMarker";
import { DocumentHeader } from "@/components/workspace/DocumentHeader";
import { GroundingLegend } from "@/components/workspace/GroundingLegend";
import { ReportModeChips } from "@/components/workspace/ReportModeChips";
import { TableOfContents } from "@/components/workspace/TableOfContents";

interface ResearchDocumentProps {
  source: SourceDocument;
  summary: SummaryDocument;
  localBrief: DeterministicBrief | null;
  language: LanguageCode;
  reportModes: ReportMode[];
  activeModeId: string;
  visualsEnabled: boolean;
  onGenerateLocalBrief: () => void;
  onApproveLocalBrief: () => void;
  onCopyEvidenceCardsMarkdown: () => void;
  onCopyLocalBriefMarkdown: () => void;
  onLanguageChange: (language: LanguageCode) => void;
  onReportModeChange: (modeId: ReportMode["id"]) => void;
  onRejectLocalBrief: () => void;
  onMockAction: (message: string) => void;
}

export function ResearchDocument({
  source,
  summary,
  localBrief,
  language,
  reportModes,
  activeModeId,
  visualsEnabled,
  onGenerateLocalBrief,
  onApproveLocalBrief,
  onCopyEvidenceCardsMarkdown,
  onCopyLocalBriefMarkdown,
  onLanguageChange,
  onReportModeChange,
  onRejectLocalBrief,
  onMockAction,
}: ResearchDocumentProps) {
  const citationMap = new Map(summary.citations.map((citation) => [citation.id, citation]));

  return (
    <section className="document-pane" aria-label="Research document">
      <article className="research-document">
        <DocumentHeader
          source={source}
          summary={summary}
          language={language}
          onLanguageChange={onLanguageChange}
          onMockAction={onMockAction}
        />
        <GroundingLegend language={language} sourceCoverage={summary.sourceCoverage} />
        <div className="local-brief-action">
          <div>
            <strong>Local deterministic draft</strong>
            <p>Uses current source segments only. No AI model is called.</p>
          </div>
          <button type="button" onClick={onGenerateLocalBrief}>
            Generate local brief
          </button>
        </div>
        {summary.blocks.map((block) =>
          renderBlock(block, citationMap, visualsEnabled, reportModes, activeModeId, language, onReportModeChange, onMockAction),
        )}
        {localBrief ? (
          <LocalBriefSection
            brief={localBrief}
            citationMap={citationMap}
            onApproveLocalBrief={onApproveLocalBrief}
            onCopyEvidenceCardsMarkdown={onCopyEvidenceCardsMarkdown}
            onCopyLocalBriefMarkdown={onCopyLocalBriefMarkdown}
            onRejectLocalBrief={onRejectLocalBrief}
          />
        ) : null}
      </article>
    </section>
  );
}

function LocalBriefSection({
  brief,
  citationMap,
  onApproveLocalBrief,
  onCopyEvidenceCardsMarkdown,
  onCopyLocalBriefMarkdown,
  onRejectLocalBrief,
}: {
  brief: DeterministicBrief;
  citationMap: Map<string, SummaryDocument["citations"][number]>;
  onApproveLocalBrief: () => void;
  onCopyEvidenceCardsMarkdown: () => void;
  onCopyLocalBriefMarkdown: () => void;
  onRejectLocalBrief: () => void;
}) {
  const isPolicyBlocked = brief.generationPolicy?.allowedToDisplay === false;
  const disabledDescriptionId = `${brief.id}-copy-disabled`;
  const reviewDescriptionId = `${brief.id}-review-disabled`;
  const review = brief.review;
  const approvalDisabled = !review?.canApprove || isPolicyBlocked;

  return (
    <section className="local-brief" aria-label="Local source-grounded brief">
      <header className="local-brief__header">
        <span className="status-pill status-pill--success">Local deterministic draft</span>
        <h2>{brief.title}</h2>
        <p>{brief.subtitle}</p>
        {brief.providerName ? (
          <p className="local-brief__provider">
            Provider: {brief.providerName} · {brief.providerReliability ?? "demo"} · No AI model used
          </p>
        ) : null}
        {brief.citationAudit ? <CitationAuditStatus audit={brief.citationAudit} /> : null}
        {brief.generationPolicy ? <GenerationPolicyStatus policy={brief.generationPolicy} /> : null}
        {review ? (
          <section className={`local-brief__review local-brief__review--${review.status}`} aria-label="Manual review status">
            <p>Manual review: {formatReviewStatus(review.status)} · source-grounded: {review.sourceGrounded ? "yes" : "no"}</p>
            {review.reviewerNote ? <span>{review.reviewerNote}</span> : null}
            <div className="local-brief__review-actions">
              <button
                type="button"
                disabled={approvalDisabled}
                aria-describedby={approvalDisabled ? reviewDescriptionId : undefined}
                onClick={onApproveLocalBrief}
              >
                Approve locally
              </button>
              <button type="button" onClick={onRejectLocalBrief}>
                Reject locally
              </button>
            </div>
            {approvalDisabled ? (
              <span className="local-brief__review-note" id={reviewDescriptionId}>
                Approval unavailable until citation audit and generation policy allow display.
              </span>
            ) : null}
          </section>
        ) : null}
        <div className="local-brief__copy-actions" aria-label="Local brief copy actions">
          <button
            type="button"
            disabled={isPolicyBlocked}
            aria-describedby={isPolicyBlocked ? disabledDescriptionId : undefined}
            onClick={onCopyLocalBriefMarkdown}
          >
            <Copy size={14} aria-hidden="true" />
            Copy brief Markdown
          </button>
          <button
            type="button"
            disabled={isPolicyBlocked}
            aria-describedby={isPolicyBlocked ? disabledDescriptionId : undefined}
            onClick={onCopyEvidenceCardsMarkdown}
          >
            <Files size={14} aria-hidden="true" />
            Copy evidence Markdown
          </button>
        </div>
        {isPolicyBlocked ? (
          <p className="local-brief__copy-note" id={disabledDescriptionId}>
            Copy export unavailable while generation policy blocks display.
          </p>
        ) : null}
      </header>
      {brief.warnings.length ? (
        <ul className="local-brief__warnings" aria-label="Local brief warnings">
          {brief.warnings.map((warning) => (
            <li key={`${warning.code}-${warning.message}`}>{warning.message}</li>
          ))}
        </ul>
      ) : null}
      {isPolicyBlocked ? (
        <div className="local-brief__blocked">
          <p>Generated output is blocked by policy until citation/provider issues are resolved.</p>
        </div>
      ) : (
        <div className="local-brief__grid">
          <section className="local-brief__group" aria-label="Evidence cards">
            <h3>Evidence cards</h3>
            {brief.evidenceCards.map((card) => (
              <EvidenceCardView card={card} citationMap={citationMap} key={card.id} />
            ))}
          </section>
          <section className="local-brief__group" aria-label="Brief blocks">
            <h3>Brief blocks</h3>
            {brief.blocks.map((block) => (
              <BriefBlockView block={block} citationMap={citationMap} key={block.id} />
            ))}
          </section>
        </div>
      )}
    </section>
  );
}

function formatReviewStatus(status: NonNullable<DeterministicBrief["review"]>["status"]) {
  if (status === "needs_review") {
    return "needs review";
  }

  return status;
}

function CitationAuditStatus({ audit }: { audit: CitationAuditResult }) {
  const visibleIssues = audit.issues.filter((issue) => issue.severity === "error" || issue.severity === "warning");

  return (
    <div className={`local-brief__audit local-brief__audit--${getAuditTone(audit)}`}>
      <p>{formatAuditStatus(audit)}</p>
      {visibleIssues.length ? (
        <ul aria-label="Citation audit issues">
          {visibleIssues.map((issue) => (
            <li key={issue.id}>{issue.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GenerationPolicyStatus({ policy }: { policy: GenerationPolicyResult }) {
  const visibleIssues = policy.issues.filter((issue) => issue.severity === "error" || issue.severity === "warning");

  return (
    <div className={`local-brief__policy local-brief__policy--${getPolicyTone(policy)}`}>
      <p>{formatPolicyStatus(policy)}</p>
      {visibleIssues.length ? (
        <ul aria-label="Generation policy issues">
          {visibleIssues.map((issue) => (
            <li key={issue.id}>{issue.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function EvidenceCardView({
  card,
  citationMap,
}: {
  card: EvidenceCard;
  citationMap: Map<string, SummaryDocument["citations"][number]>;
}) {
  return (
    <article className="evidence-card">
      <header>
        <span>{card.sourceTime ?? card.label}</span>
        <h4>{card.title}</h4>
      </header>
      <p>{card.body}</p>
      {renderCitations(card.citationIds, citationMap)}
    </article>
  );
}

function BriefBlockView({
  block,
  citationMap,
}: {
  block: BriefBlock;
  citationMap: Map<string, SummaryDocument["citations"][number]>;
}) {
  return (
    <article className="brief-block">
      <h4>{block.title}</h4>
      <p>{block.body}</p>
      {renderCitations(block.citationIds, citationMap)}
    </article>
  );
}

function formatAuditStatus(audit: CitationAuditResult) {
  const status = !audit.passed ? "needs review" : audit.warningCount > 0 ? "passed with warnings" : "passed";
  return `Citation audit: ${status} · ${formatIssueCount(audit.errorCount, "error")} · ${formatIssueCount(
    audit.warningCount,
    "warning",
  )}`;
}

function formatIssueCount(count: number, label: "error" | "warning") {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function formatPolicyStatus(policy: GenerationPolicyResult) {
  if (!policy.allowedToDisplay) {
    return "Generation policy: blocked · source-grounded display disabled";
  }

  if (policy.warningCount > 0) {
    return "Generation policy: allowed with warnings · source-grounded display enabled";
  }

  return "Generation policy: allowed · source-grounded display enabled";
}

function getAuditTone(audit: CitationAuditResult) {
  if (!audit.passed) {
    return "error";
  }

  if (audit.warningCount > 0) {
    return "warning";
  }

  return "success";
}

function getPolicyTone(policy: GenerationPolicyResult) {
  if (!policy.allowedToDisplay) {
    return "error";
  }

  if (policy.warningCount > 0) {
    return "warning";
  }

  return "success";
}

function renderBlock(
  block: DocumentBlock,
  citationMap: Map<string, NonNullable<SummaryDocument["citations"][number]>>,
  visualsEnabled: boolean,
  reportModes: ReportMode[],
  activeModeId: string,
  language: LanguageCode,
  onReportModeChange: (modeId: ReportMode["id"]) => void,
  onMockAction: (message: string) => void,
) {
  if (block.kind === "table_of_contents") {
    return (
      <div key={block.id}>
        <TableOfContents block={block} />
        <ReportModeChips language={language} modes={reportModes} activeModeId={activeModeId} onChange={onReportModeChange} />
      </div>
    );
  }
  if (block.kind === "heading") {
    const Tag = block.level === 2 ? "h2" : "h3";
    return (
      <Tag className="document-heading" id={block.id} key={block.id}>
        {block.text}
        {renderCitations(block.citationIds, citationMap)}
      </Tag>
    );
  }
  if (block.kind === "paragraph") {
    return (
      <p className="document-paragraph" key={block.id}>
        {block.text}
        {renderCitations(block.citationIds, citationMap)}
      </p>
    );
  }
  if (block.kind === "visual") {
    return visualsEnabled ? <ConceptDiagramBlock block={block} key={block.id} onMockAction={onMockAction} /> : null;
  }
  if (block.kind === "key_takeaways") {
    return <KeyTakeawaysBlock block={block} key={block.id} />;
  }
  if (block.kind === "claim_validation") {
    return <ClaimValidationBlock block={block} key={block.id} onMockAction={onMockAction} />;
  }
  if (block.kind === "action_items") {
    return <ActionItemsBlock block={block} key={block.id} />;
  }
  if (block.kind === "study_notes") {
    return <StudyNotesBlock block={block} key={block.id} />;
  }
  return null;
}

function renderCitations(citationIds: string[], citationMap: Map<string, SummaryDocument["citations"][number]>) {
  return (
    <span className="citation-run">
      {citationIds.map((id) => {
        const citation = citationMap.get(id);
        return citation ? <CitationMarker citation={citation} key={id} /> : null;
      })}
    </span>
  );
}
