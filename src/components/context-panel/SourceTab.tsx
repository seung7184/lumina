import { Copy, Globe2, Play } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
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
  onIngestSourceUrl?: (url: string) => Promise<string>;
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
  onIngestSourceUrl,
  onMockAction,
  onTranslationToggle,
}: SourceTabProps) {
  const [ingestStatus, setIngestStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const sourceUrl = String(formData.get("source-url") ?? "").trim();

    if (!sourceUrl) {
      setIngestStatus("Enter a YouTube source URL first.");
      onMockAction("Enter a YouTube source URL first.");
      return;
    }

    if (!onIngestSourceUrl) {
      setIngestStatus("Mock ingestion is not connected in this view.");
      onMockAction("Mock ingestion is not connected in this view.");
      return;
    }

    const message = await onIngestSourceUrl(sourceUrl);
    setIngestStatus(message);
    onMockAction(message);
  }

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
      <form className="source-ingest-form" onSubmit={handleSubmit}>
        <label htmlFor={`${panelId}-source-url`}>Try source URL</label>
        <div>
          <input
            id={`${panelId}-source-url`}
            name="source-url"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=511ctokiROU"
            defaultValue={source.url}
          />
          <button type="submit">Ingest source URL</button>
        </div>
        <span>{source.providerName ?? "mock-youtube-transcript"}</span>
        <p role="status" aria-live="polite">
          {ingestStatus}
        </p>
      </form>
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
