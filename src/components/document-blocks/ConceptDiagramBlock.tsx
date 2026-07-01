import { Copy, Expand, ImageDown, RefreshCcw } from "lucide-react";
import type { ConceptDiagramBlock as ConceptDiagramBlockType } from "@/lib/types/workspace";
import { CitationMarker } from "@/components/workspace/CitationMarker";

interface ConceptDiagramBlockProps {
  block: ConceptDiagramBlockType;
  onMockAction: (message: string) => void;
}

export function ConceptDiagramBlock({ block, onMockAction }: ConceptDiagramBlockProps) {
  const upper = block.paths.find((path) => path.tone === "positive");
  const lower = block.paths.find((path) => path.tone === "negative");

  return (
    <section className="visual-block" aria-label={block.title}>
      <div className="visual-block__header">
        <div>
          <span className="eyebrow accent">Concept diagram</span>
          <h3>{block.title}</h3>
          {block.subtitle ? <p>{block.subtitle}</p> : null}
        </div>
        <span className="grounded-pill">Grounded</span>
      </div>
      <div className="diagram-canvas" aria-label={block.mainConcept}>
        <div className="diagram-root">AI era</div>
        <div className="diagram-path diagram-path--upper">
          <span className="diagram-path__label">{upper?.label}</span>
          <div className="diagram-node diagram-node--outline">AI literacy</div>
          <div className="diagram-node diagram-node--positive">Productive leverage</div>
          <div className="diagram-node diagram-node--forest">Time freedom</div>
        </div>
        <div className="diagram-path diagram-path--lower">
          <span className="diagram-path__label">{lower?.label}</span>
          <div className="diagram-node diagram-node--outline-negative">AI illiteracy</div>
          <div className="diagram-node diagram-node--negative">False confidence</div>
          <div className="diagram-node diagram-node--danger">Financial loss / Time poverty</div>
        </div>
      </div>
      <div className="visual-block__meta">
        <span>Generated from transcript {block.generatedFrom}</span>
        <span>{block.sourceSegmentCount} source segments</span>
        <span className="citation-cluster">
          {block.citationIds.map((id) => (
            <CitationMarker
              citation={{
                id,
                label: id.replace("c", ""),
                segmentIds: [],
                sourceId: "",
                status: block.status,
              }}
              key={id}
            />
          ))}
        </span>
      </div>
      <div className="visual-block__actions">
        <button type="button" onClick={() => onMockAction("Diagram opened in mock expanded state.")}>
          <Expand size={14} aria-hidden="true" />
          Expand
        </button>
        <button type="button" onClick={() => onMockAction("Diagram regeneration is mocked for this slice.")}>
          <RefreshCcw size={14} aria-hidden="true" />
          Regenerate
        </button>
        <button type="button" onClick={() => onMockAction("Diagram summary copied as mock text.")}>
          <Copy size={14} aria-hidden="true" />
          Copy
        </button>
        <button type="button" onClick={() => onMockAction("Mock diagram image saved.")}>
          <ImageDown size={14} aria-hidden="true" />
          Save image
        </button>
      </div>
    </section>
  );
}
