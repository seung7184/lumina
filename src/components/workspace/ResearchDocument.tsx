import type { DocumentBlock, LanguageCode, ReportMode, SourceDocument, SummaryDocument } from "@/lib/types/workspace";
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
  language: LanguageCode;
  reportModes: ReportMode[];
  activeModeId: string;
  visualsEnabled: boolean;
  onLanguageChange: (language: LanguageCode) => void;
  onReportModeChange: (modeId: ReportMode["id"]) => void;
  onMockAction: (message: string) => void;
}

export function ResearchDocument({
  source,
  summary,
  language,
  reportModes,
  activeModeId,
  visualsEnabled,
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
        {summary.blocks.map((block) =>
          renderBlock(block, citationMap, visualsEnabled, reportModes, activeModeId, language, onReportModeChange, onMockAction),
        )}
      </article>
    </section>
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
