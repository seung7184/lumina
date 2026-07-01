import { Copy, Globe2, Play } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { ManualTranscriptInput, SourceDocument, SourceSegment } from "@/lib/types/workspace";
import { TranscriptList } from "@/components/context-panel/TranscriptList";
import { idleSourceIngestionStatus, type SourceIngestionStatus } from "@/components/context-panel/source-ingestion-status";

interface SourceTabProps {
  source: SourceDocument;
  segments: SourceSegment[];
  activeSegmentId: string;
  labelledBy: string;
  panelId: string;
  showTranslation: boolean;
  onActiveSegmentChange: (id: string) => void;
  onIngestSourceUrl?: (url: string) => Promise<SourceIngestionStatus>;
  onUseManualTranscript?: (input: ManualTranscriptInput) => Promise<SourceIngestionStatus>;
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
  onUseManualTranscript,
  onMockAction,
  onTranslationToggle,
}: SourceTabProps) {
  const [manualTranscriptOpen, setManualTranscriptOpen] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<SourceIngestionStatus>({
    ...idleSourceIngestionStatus,
    providerName: source.providerName ?? "Mock YouTube Transcript",
    providerReliability: source.providerReliability ?? "demo",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const sourceUrl = String(formData.get("source-url") ?? "").trim();

    if (!sourceUrl) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Enter a YouTube source URL first.",
        providerName: ingestStatus.providerName,
        providerReliability: ingestStatus.providerReliability,
      };
      setIngestStatus(nextStatus);
      onMockAction("Enter a YouTube source URL first.");
      return;
    }

    if (!onIngestSourceUrl) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Mock ingestion is not connected in this view.",
        providerName: ingestStatus.providerName,
        providerReliability: ingestStatus.providerReliability,
      };
      setIngestStatus(nextStatus);
      onMockAction("Mock ingestion is not connected in this view.");
      return;
    }

    setIngestStatus({
      phase: "validating-url",
      label: "Validating URL",
      message: "Checking the source URL locally.",
      providerName: ingestStatus.providerName,
      providerReliability: ingestStatus.providerReliability,
    });
    setIngestStatus({
      phase: "selecting-provider",
      label: "Selecting provider",
      message: "Choosing the local mock transcript provider.",
      providerName: ingestStatus.providerName,
      providerReliability: ingestStatus.providerReliability,
    });
    setIngestStatus({
      phase: "fetching-transcript",
      label: "Fetching transcript",
      message: "Loading deterministic mock transcript data.",
      providerName: ingestStatus.providerName,
      providerReliability: ingestStatus.providerReliability,
    });
    setIngestStatus({
      phase: "normalizing-segments",
      label: "Normalizing segments",
      message: "Preparing local segments and citations.",
      providerName: ingestStatus.providerName,
      providerReliability: ingestStatus.providerReliability,
    });

    const nextStatus = await onIngestSourceUrl(sourceUrl);
    setIngestStatus(nextStatus);
    onMockAction(nextStatus.message ?? nextStatus.label);
  }

  async function handleManualTranscriptSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const transcriptText = String(formData.get("manual-transcript-text") ?? "").trim();

    if (!transcriptText) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Paste transcript text first.",
        providerName: "Manual Transcript",
        providerReliability: "experimental",
      };
      setIngestStatus(nextStatus);
      onMockAction("Paste transcript text first.");
      return;
    }

    if (!onUseManualTranscript) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Manual transcript ingestion is not connected in this view.",
        providerName: "Manual Transcript",
        providerReliability: "experimental",
      };
      setIngestStatus(nextStatus);
      onMockAction("Manual transcript ingestion is not connected in this view.");
      return;
    }

    const input: ManualTranscriptInput = {
      sourceUrl: source.url ?? "",
      title: String(formData.get("manual-title") ?? "").trim(),
      language: String(formData.get("manual-language") ?? source.sourceLanguage).trim() || source.sourceLanguage,
      transcriptText,
    };

    setIngestStatus({
      phase: "parsing-manual-transcript",
      label: "Parsing transcript",
      message: "Parsing pasted transcript text locally.",
      providerName: "Manual Transcript",
      providerReliability: "experimental",
    });
    setIngestStatus({
      phase: "normalizing-segments",
      label: "Normalizing segments",
      message: "Preparing local manual transcript segments and citations.",
      providerName: "Manual Transcript",
      providerReliability: "experimental",
    });

    const nextStatus = await onUseManualTranscript(input);
    setIngestStatus(nextStatus);
    onMockAction(nextStatus.message ?? nextStatus.label);
  }

  const providerLine = ingestStatus.providerName
    ? `Provider: ${ingestStatus.providerName} · ${ingestStatus.providerReliability ?? "demo"} reliability`
    : undefined;

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
      <form className="source-ingest-form" noValidate onSubmit={handleSubmit}>
        <label htmlFor={`${panelId}-source-url`}>Try source URL</label>
        <div className="source-ingest-row">
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
        {providerLine ? <span>{providerLine}</span> : null}
        <span className="source-ingest-phase">{ingestStatus.label}</span>
        <p role="status" aria-live="polite">
          {ingestStatus.message ?? ingestStatus.label}
        </p>
        {ingestStatus.phase === "ready" ? (
          <div className="source-ingest-metrics" aria-label="Ingestion result counts">
            <span>Segments: {ingestStatus.segmentCount ?? 0}</span>
            <span>Citations: {ingestStatus.citationCount ?? 0}</span>
          </div>
        ) : null}
        {ingestStatus.warnings?.length ? (
          <ul className="source-ingest-warnings" aria-label="Ingestion warnings">
            {ingestStatus.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </form>
      <section className="manual-transcript-panel" aria-label="Manual transcript fallback">
        <button
          type="button"
          className="manual-transcript-toggle"
          aria-expanded={manualTranscriptOpen}
          aria-controls={`${panelId}-manual-transcript-form`}
          onClick={() => {
            setManualTranscriptOpen((open) => !open);
            onMockAction(manualTranscriptOpen ? "Manual transcript paste closed." : "Manual transcript paste opened.");
          }}
        >
          Paste manual transcript
        </button>
        {manualTranscriptOpen ? (
          <form
            className="manual-transcript-form"
            id={`${panelId}-manual-transcript-form`}
            noValidate
            onSubmit={handleManualTranscriptSubmit}
          >
            <label htmlFor={`${panelId}-manual-title`}>Manual title</label>
            <input
              id={`${panelId}-manual-title`}
              name="manual-title"
              type="text"
              defaultValue={source.title.en}
              placeholder="Manual transcript"
            />
            <label htmlFor={`${panelId}-manual-language`}>Manual language</label>
            <input
              id={`${panelId}-manual-language`}
              name="manual-language"
              type="text"
              defaultValue={source.sourceLanguage}
              inputMode="text"
            />
            <label htmlFor={`${panelId}-manual-transcript-text`}>Manual transcript text</label>
            <textarea
              id={`${panelId}-manual-transcript-text`}
              name="manual-transcript-text"
              rows={5}
              placeholder="[00:12] Text from the source"
            />
            <p>Paste paragraphs or timestamped lines like [00:12] text.</p>
            <button type="submit">Use manual transcript</button>
          </form>
        ) : null}
      </section>
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
