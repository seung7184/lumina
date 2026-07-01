import { Copy, Globe2, Play } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type {
  DeterministicBrief,
  ManualTranscriptInput,
  PdfSourceInput,
  SourceDocument,
  SourceSegment,
  WebpageSourceInput,
} from "@/lib/types/workspace";
import {
  getSourceProviderRequirementsSummary,
  listSourceProviders,
} from "@/lib/future/ingestion-provider-registry";
import type { SourceProviderDescriptor, SourceProviderKind } from "@/lib/future/ingestion-provider-registry";
import { TranscriptList } from "@/components/context-panel/TranscriptList";
import { idleSourceIngestionStatus, type SourceIngestionStatus } from "@/components/context-panel/source-ingestion-status";
import { buildSourceGroundedPipelineStatus, type PipelineStageStatus } from "@/lib/future/pipeline-status";

interface SourceTabProps {
  source: SourceDocument;
  segments: SourceSegment[];
  localBrief: DeterministicBrief | null;
  activeSegmentId: string;
  labelledBy: string;
  panelId: string;
  showTranslation: boolean;
  onActiveSegmentChange: (id: string) => void;
  onIngestSourceUrl?: (url: string) => Promise<SourceIngestionStatus>;
  onUseManualTranscript?: (input: ManualTranscriptInput) => Promise<SourceIngestionStatus>;
  onUseMockWebpage?: (input: WebpageSourceInput) => Promise<SourceIngestionStatus>;
  onUseMockPdf?: (input: PdfSourceInput) => Promise<SourceIngestionStatus>;
  onMockAction: (message: string) => void;
  onTranslationToggle: () => void;
}

export function SourceTab({
  source,
  segments,
  localBrief,
  activeSegmentId,
  labelledBy,
  panelId,
  showTranslation,
  onActiveSegmentChange,
  onIngestSourceUrl,
  onUseManualTranscript,
  onUseMockWebpage,
  onUseMockPdf,
  onMockAction,
  onTranslationToggle,
}: SourceTabProps) {
  const [manualTranscriptOpen, setManualTranscriptOpen] = useState(false);
  const [providerCatalogOpen, setProviderCatalogOpen] = useState(false);
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

  async function handleMockWebpageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = String(formData.get("mock-webpage-url") ?? "").trim();

    if (!url) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Enter a webpage URL first.",
        providerName: "Mock Webpage",
        providerReliability: "demo",
      };
      setIngestStatus(nextStatus);
      onMockAction("Enter a webpage URL first.");
      return;
    }

    if (!onUseMockWebpage) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Mock webpage ingestion is not connected in this view.",
        providerName: "Mock Webpage",
        providerReliability: "demo",
      };
      setIngestStatus(nextStatus);
      onMockAction("Mock webpage ingestion is not connected in this view.");
      return;
    }

    setIngestStatus({
      phase: "normalizing-segments",
      label: "Loading mock webpage",
      message: "Preparing a deterministic webpage boundary locally.",
      providerName: "Mock Webpage",
      providerReliability: "demo",
    });

    const nextStatus = await onUseMockWebpage({
      kind: "webpage",
      url,
      title: String(formData.get("mock-webpage-title") ?? "").trim() || undefined,
      language: source.sourceLanguage,
    });
    setIngestStatus(nextStatus);
    onMockAction(nextStatus.message ?? nextStatus.label);
  }

  async function handleMockPdfSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!onUseMockPdf) {
      const nextStatus: SourceIngestionStatus = {
        phase: "error",
        label: "Error",
        message: "Mock PDF ingestion is not connected in this view.",
        providerName: "Mock PDF",
        providerReliability: "demo",
      };
      setIngestStatus(nextStatus);
      onMockAction("Mock PDF ingestion is not connected in this view.");
      return;
    }

    setIngestStatus({
      phase: "normalizing-segments",
      label: "Loading mock PDF",
      message: "Preparing a deterministic PDF boundary locally.",
      providerName: "Mock PDF",
      providerReliability: "demo",
    });

    const nextStatus = await onUseMockPdf({
      kind: "pdf",
      filename: String(formData.get("mock-pdf-filename") ?? "").trim() || "mock-source.pdf",
      title: String(formData.get("mock-pdf-title") ?? "").trim() || undefined,
      language: source.sourceLanguage,
    });
    setIngestStatus(nextStatus);
    onMockAction(nextStatus.message ?? nextStatus.label);
  }

  const providerLine = ingestStatus.providerName
    ? `Provider: ${ingestStatus.providerName} · ${ingestStatus.providerReliability ?? "demo"} reliability`
    : undefined;
  const sourceProviders = listSourceProviders();
  const activeProviders = sourceProviders.filter((provider) => provider.availability === "active");
  const futureProviders = sourceProviders.filter((provider) => provider.availability === "placeholder");
  const durationLabel = source.durationSeconds ? formatDuration(source.durationSeconds) : source.type.toUpperCase();
  const sourceLanguageLabel = source.sourceLanguage === "ko" ? "한국어 · Korean" : "English";
  const pipelineStatus = buildSourceGroundedPipelineStatus({ source, localBrief });

  return (
    <div className="context-tab-body" role="tabpanel" id={panelId} aria-labelledby={labelledBy}>
      <div className="source-preview">
        <span className="source-preview__title ko-copy">{source.thumbnailLabel}</span>
        <span className="source-preview__play">
          <Play size={18} fill="currentColor" aria-hidden="true" />
        </span>
        <span className="source-preview__duration">{durationLabel}</span>
      </div>
      <dl className="source-meta-list">
        <div>
          <dt>Creator</dt>
          <dd className="ko-copy">{source.creator ?? "Local mock boundary"}</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{source.publishedAt ?? "Not fetched"}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>
            <Globe2 size={13} aria-hidden="true" />
            {sourceLanguageLabel}
          </dd>
        </div>
        <div>
          <dt>{source.durationSeconds ? "Duration" : "Type"}</dt>
          <dd>{durationLabel}</dd>
        </div>
      </dl>
      <section className="pipeline-status-panel" aria-label="Source-grounded pipeline status">
        <strong>{pipelineStatus.chainLabel}</strong>
        <ul>
          {pipelineStatus.stages.map((stage) => (
            <PipelineStatusRow key={stage.id} stage={stage} />
          ))}
        </ul>
      </section>
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
      <section className="source-boundary-panel" aria-label="Other source boundaries">
        <div>
          <strong>Try other source boundary</strong>
          <p>No live webpage fetch or PDF parsing is performed in this pass.</p>
        </div>
        <form className="source-boundary-form" noValidate onSubmit={handleMockWebpageSubmit}>
          <strong>Mock webpage boundary</strong>
          <label htmlFor={`${panelId}-mock-webpage-url`}>Mock webpage URL</label>
          <input
            id={`${panelId}-mock-webpage-url`}
            name="mock-webpage-url"
            type="url"
            inputMode="url"
            placeholder="https://example.com/articles/lumina-boundary"
          />
          <label htmlFor={`${panelId}-mock-webpage-title`}>Mock webpage title</label>
          <input
            id={`${panelId}-mock-webpage-title`}
            name="mock-webpage-title"
            type="text"
            placeholder="Lumina Boundary Notes"
          />
          <button type="submit">Use mock webpage</button>
        </form>
        <form className="source-boundary-form" noValidate onSubmit={handleMockPdfSubmit}>
          <strong>Mock PDF boundary</strong>
          <label htmlFor={`${panelId}-mock-pdf-filename`}>Mock PDF filename</label>
          <input
            id={`${panelId}-mock-pdf-filename`}
            name="mock-pdf-filename"
            type="text"
            placeholder="mock-source.pdf"
          />
          <label htmlFor={`${panelId}-mock-pdf-title`}>Mock PDF title</label>
          <input id={`${panelId}-mock-pdf-title`} name="mock-pdf-title" type="text" placeholder="Mock PDF source" />
          <button type="submit">Use mock PDF</button>
        </form>
      </section>
      <section className="source-provider-panel">
        <div>
          <strong>Source providers</strong>
          <p>Active: {activeProviders.map((provider) => provider.shortLabel).join(", ")}</p>
          <p>Future: {futureProviders.map((provider) => provider.shortLabel).join(", ")}</p>
        </div>
        <button
          type="button"
          className="source-provider-toggle"
          aria-expanded={providerCatalogOpen}
          aria-controls={`${panelId}-provider-catalog`}
          onClick={() => setProviderCatalogOpen((open) => !open)}
        >
          View provider catalog
        </button>
        {providerCatalogOpen ? (
          <section
            className="source-provider-catalog"
            id={`${panelId}-provider-catalog`}
            aria-label="Source provider catalog"
          >
            <ProviderCatalogGroup title="Active providers" providers={activeProviders} />
            <ProviderCatalogGroup title="Future placeholders" providers={futureProviders} />
          </section>
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

function PipelineStatusRow({ stage }: { stage: PipelineStageStatus }) {
  return (
    <li className={`pipeline-status-row pipeline-status-row--${stage.tone}`}>
      <span>
        {stage.label}: {stage.value}
      </span>
    </li>
  );
}

function ProviderCatalogGroup({
  title,
  providers,
}: {
  title: string;
  providers: SourceProviderDescriptor[];
}) {
  return (
    <div className="source-provider-group">
      <strong>{title}</strong>
      <ul>
        {providers.map((provider) => (
          <li key={provider.id}>
            <div className="source-provider-row__head">
              <span>{provider.shortLabel}</span>
              <small>{formatSourceProviderKind(provider.sourceKind)}</small>
              <small>{provider.reliability}</small>
            </div>
            <div className="source-provider-badges" aria-label={`${provider.shortLabel} requirements`}>
              {getSourceProviderRequirementsSummary(provider).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatSourceProviderKind(sourceKind: SourceProviderKind) {
  if (sourceKind === "manual-transcript") {
    return "manual";
  }

  return sourceKind;
}

function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
