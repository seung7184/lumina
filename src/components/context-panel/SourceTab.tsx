import { Copy, Globe2, Play } from "lucide-react";
import type { SourceDocument, SourceSegment } from "@/lib/types/workspace";
import { TranscriptList } from "@/components/context-panel/TranscriptList";

interface SourceTabProps {
  source: SourceDocument;
  segments: SourceSegment[];
  activeSegmentId: string;
  labelledBy: string;
  panelId: string;
  showTranslation: boolean;
  onActiveSegmentChange: (id: string) => void;
  onMockAction: (message: string) => void;
  onTranslationToggle: () => void;
}

export function SourceTab({
  source,
  segments,
  activeSegmentId,
  labelledBy,
  panelId,
  showTranslation,
  onActiveSegmentChange,
  onMockAction,
  onTranslationToggle,
}: SourceTabProps) {
  return (
    <div className="context-tab-body" role="tabpanel" id={panelId} aria-labelledby={labelledBy}>
      <div className="source-preview">
        <span className="source-preview__title ko-copy">{source.thumbnailLabel}</span>
        <span className="source-preview__play">
          <Play size={18} fill="currentColor" aria-hidden="true" />
        </span>
        <span className="source-preview__duration">14:32</span>
      </div>
      <dl className="source-meta-list">
        <div>
          <dt>Creator</dt>
          <dd className="ko-copy">{source.creator}</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{source.publishedAt}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>
            <Globe2 size={13} aria-hidden="true" />
            한국어 · Korean
          </dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>14:32</dd>
        </div>
      </dl>
      <div className="transcript-head">
        <strong>Transcript</strong>
        <span>{segments.length} segments</span>
        <button type="button" aria-label="Copy transcript" onClick={() => onMockAction("Transcript copied as mock text.")}>
          <Copy size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="toggle-row">
        <button
          aria-checked={showTranslation}
          aria-label="Translate transcript"
          className={`switch ${showTranslation ? "is-on" : ""}`}
          role="switch"
          type="button"
          onClick={onTranslationToggle}
        >
          <span />
        </button>
        <span>Translate</span>
      </div>
      <TranscriptList
        activeSegmentId={activeSegmentId}
        segments={segments}
        showTranslation={showTranslation}
        onActiveSegmentChange={onActiveSegmentChange}
      />
    </div>
  );
}
