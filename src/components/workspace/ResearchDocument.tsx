import type {
  BriefBlock,
  DeterministicBrief,
  DocumentBlock,
  EvidenceCard,
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
  onLanguageChange: (language: LanguageCode) => void;
  onReportModeChange: (modeId: ReportMode["id"]) => void;
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
  onLanguageChange,
  onReportModeChange,
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
        {localBrief ? <LocalBriefSection brief={localBrief} citationMap={citationMap} /> : null}
      </article>
    </section>
  );
}

function LocalBriefSection({
  brief,
  citationMap,
}: {
  brief: DeterministicBrief;
  citationMap: Map<string, SummaryDocument["citations"][number]>;
}) {
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
      </header>
      {brief.warnings.length ? (
        <ul className="local-brief__warnings" aria-label="Local brief warnings">
          {brief.warnings.map((warning) => (
            <li key={`${warning.code}-${warning.message}`}>{warning.message}</li>
          ))}
        </ul>
      ) : null}
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
    </section>
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
