"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssistantMessage,
  CitationRef,
  DeterministicBrief,
  ExportOptions,
  IngestionWarning,
  LanguageCode,
  LuminaDemoWorkspace,
  ManualTranscriptInput,
  PdfSourceInput,
  ResearchCollection,
  ReportMode,
  SourceDocument,
  SourceSegment,
  WebpageSourceInput,
} from "@/lib/types/workspace";
import type { SourceIngestionStatus } from "@/components/context-panel/source-ingestion-status";
import { ContextPanel } from "@/components/context-panel/ContextPanel";
import { DocumentToolbar } from "@/components/workspace/DocumentToolbar";
import { ResearchDocument } from "@/components/workspace/ResearchDocument";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import {
  buildSourceDocumentFromYouTube,
  buildSourceDocumentFromMetadata,
  buildWorkspaceCitationRefsFromSegments,
  buildWorkspaceSegmentsFromNormalized,
  ingestManualTranscriptSource,
  ingestYouTubeSource,
  isIngestionError,
} from "@/lib/future/ingestion-youtube";
import { ingestMockPdfSource } from "@/lib/future/ingestion-pdf";
import { ingestMockWebpageSource } from "@/lib/future/ingestion-web";
import { generateDeterministicBrief } from "@/lib/future/brief-generator";
import { exportEvidenceCardsMarkdown, exportLocalBriefMarkdown } from "@/lib/future/brief-markdown-export";
import {
  addSourceReferenceToCollection,
  buildGeneratedBriefSourceBinding,
  createResearchCollectionFromSource,
  setActiveCollectionSource,
} from "@/lib/future/research-collection";

interface WorkspaceShellProps {
  demo: LuminaDemoWorkspace;
}

const initialExportOptions: ExportOptions = {
  language: "en",
  format: "markdown",
  scope: "full",
  includeTranscript: false,
  includeCitations: true,
  includeDiagrams: true,
  includeHighlights: true,
  includeClaimValidation: false,
};

export function WorkspaceShell({ demo }: WorkspaceShellProps) {
  const [workspace, setWorkspace] = useState<LuminaDemoWorkspace>(demo);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [contextTab, setContextTab] = useState<"source" | "assistant" | "highlight">("source");
  const [toolbarMode, setToolbarMode] = useState<"summary" | "expand">("summary");
  const [length, setLength] = useState<"short" | "base" | "long">("base");
  const [difficulty, setDifficulty] = useState<"easy" | "standard" | "expert">("standard");
  const [showTranslation, setShowTranslation] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [visualsEnabled, setVisualsEnabled] = useState(true);
  const [activeModeId, setActiveModeId] = useState<ReportMode["id"]>("summary");
  const [activeSegmentId, setActiveSegmentId] = useState(demo.segments[0]?.id ?? "");
  const [assistantScope, setAssistantScope] = useState<"source" | "collection" | "web_source">("source");
  const [responseMode, setResponseMode] = useState("Standard");
  const [exportOptions, setExportOptions] = useState<ExportOptions>(initialExportOptions);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState("");
  const [localAssistantMessages, setLocalAssistantMessages] = useState<AssistantMessage[]>([]);
  const [localBrief, setLocalBrief] = useState<DeterministicBrief | null>(null);
  const [researchCollection, setResearchCollection] = useState<ResearchCollection>(() =>
    createResearchCollectionFromSource({
      source: demo.source,
      segmentCount: demo.segments.length,
      citationCount: demo.summaries.en.citations.length,
    }),
  );
  const [feedback, setFeedback] = useState("");
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  const contextDrawerRef = useRef<HTMLElement>(null);
  const contextDrawerCloseRef = useRef<HTMLButtonElement>(null);
  const contextTriggerRef = useRef<HTMLButtonElement | null>(null);

  const summary = workspace.summaries[language];
  const assistantMessages = [...workspace.assistantMessages, ...localAssistantMessages];

  const closeContextDrawer = useCallback(() => {
    setContextDrawerOpen(false);
    window.requestAnimationFrame(() => contextTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeout = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!contextDrawerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeContextDrawer();
        return;
      }

      if (event.key !== "Tab" || !contextDrawerRef.current) {
        return;
      }

      const focusableElements = Array.from(
        contextDrawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");

      if (!focusableElements.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => contextDrawerCloseRef.current?.focus(), 0);

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeContextDrawer, contextDrawerOpen]);

  function announce(message: string) {
    setFeedback(message);
  }

  function handlePromptSelect(promptId: string) {
    const prompt = workspace.assistantPrompts.find((item) => item.id === promptId);
    if (!prompt) {
      return;
    }
    setAssistantDraft(prompt.description);
    setContextTab("assistant");
    announce(`${prompt.label} added to the assistant composer.`);
  }

  function openContextDrawer(tab: "source" | "assistant" | "highlight", trigger: HTMLButtonElement) {
    contextTriggerRef.current = trigger;
    setContextTab(tab);
    setContextDrawerOpen(true);
  }

  function handleAssistantSend() {
    const body = assistantDraft.trim();
    if (!body) {
      announce("Type a source-grounded question first.");
      return;
    }
    setLocalAssistantMessages((messages) => [
      ...messages,
      {
        id: `local-${Date.now()}`,
        role: "user",
        body,
        citationIds: ["c1", "c2"],
        scope: assistantScope,
      },
      {
        id: `local-response-${Date.now()}`,
        role: "assistant",
        body: "Mock response queued from this source. Real AI generation is intentionally not connected in this slice.",
        bodyKo: "이 답변은 목업입니다. 실제 AI 생성은 아직 연결하지 않았습니다.",
        citationIds: ["c1", "c2"],
        scope: assistantScope,
      },
    ]);
    setAssistantDraft("");
    setContextTab("assistant");
    announce("Mock assistant response added with source citations.");
  }

  function handleGenerateLocalBrief() {
    const brief = generateDeterministicBrief({
      source: workspace.source,
      segments: workspace.segments,
      citations: summary.citations,
    });

    setLocalBrief({
      ...brief,
      sourceBinding: buildGeneratedBriefSourceBinding(researchCollection, workspace.source),
    });
    announce(`Local source-grounded brief generated with ${brief.evidenceCards.length} evidence cards.`);
  }

  async function handleCopyLocalBriefMarkdown() {
    const result = exportLocalBriefMarkdown({
      brief: localBrief,
      source: workspace.source,
      citations: summary.citations,
    });

    if (!result.allowed) {
      announce(result.reason);
      return;
    }

    const copied = await copyTextToClipboard(result.markdown);
    announce(copied ? "Local brief Markdown copied." : "Local brief Markdown prepared, but clipboard was unavailable.");
  }

  async function handleCopyEvidenceCardsMarkdown() {
    const result = exportEvidenceCardsMarkdown({
      brief: localBrief,
      source: workspace.source,
      citations: summary.citations,
    });

    if (!result.allowed) {
      announce(result.reason);
      return;
    }

    const copied = await copyTextToClipboard(result.markdown);
    announce(copied ? "Evidence cards Markdown copied." : "Evidence cards Markdown prepared, but clipboard was unavailable.");
  }

  async function handleIngestSourceUrl(url: string): Promise<SourceIngestionStatus> {
    try {
      const result = await ingestYouTubeSource({ kind: "youtube", url });
      const source = buildSourceDocumentFromYouTube(result.sourceMetadata, result.segments);
      const segments = buildWorkspaceSegmentsFromNormalized(result.segments);
      const citations = buildWorkspaceCitationRefsFromSegments(result.segments);

      applyIngestionResult(source, segments, citations);

      return {
        phase: "ready",
        label: "Ready",
        message: `Ready. ${source.providerName ?? "Mock YouTube Transcript"} loaded ${segments.length} segments with ${
          citations.length
        } citations.`,
        providerName: source.providerName ?? "Mock YouTube Transcript",
        providerReliability: source.providerReliability ?? "demo",
        segmentCount: segments.length,
        citationCount: citations.length,
        warnings: result.warnings.map(formatIngestionWarning),
      };
    } catch (error) {
      return {
        phase: "error",
        label: "Error",
        message: formatIngestionError(error),
        providerName: "Mock YouTube Transcript",
        providerReliability: "demo",
      };
    }
  }

  async function handleUseManualTranscript(input: ManualTranscriptInput): Promise<SourceIngestionStatus> {
    try {
      const result = ingestManualTranscriptSource(input);
      const source = buildSourceDocumentFromMetadata(result.sourceMetadata, result.segments);
      const segments = buildWorkspaceSegmentsFromNormalized(result.segments);
      const citations = buildWorkspaceCitationRefsFromSegments(result.segments);

      applyIngestionResult(source, segments, citations);

      return {
        phase: "ready",
        label: "Ready",
        message: `Ready. ${source.providerName ?? "Manual Transcript"} loaded ${segments.length} segments with ${
          citations.length
        } citations.`,
        providerName: source.providerName ?? "Manual Transcript",
        providerReliability: source.providerReliability ?? "experimental",
        segmentCount: segments.length,
        citationCount: citations.length,
        warnings: result.warnings.map(formatIngestionWarning),
      };
    } catch (error) {
      return {
        phase: "error",
        label: "Error",
        message: formatIngestionError(error),
        providerName: "Manual Transcript",
        providerReliability: "experimental",
      };
    }
  }

  async function handleUseMockWebpage(input: WebpageSourceInput): Promise<SourceIngestionStatus> {
    try {
      const result = ingestMockWebpageSource(input);
      const source = buildSourceDocumentFromMetadata(result.sourceMetadata, result.segments);
      const segments = buildWorkspaceSegmentsFromNormalized(result.segments);
      const citations = buildWorkspaceCitationRefsFromSegments(result.segments);

      applyIngestionResult(source, segments, citations);

      return buildReadyStatus(source, segments.length, citations.length, result.warnings);
    } catch (error) {
      return {
        phase: "error",
        label: "Error",
        message: isIngestionError(error) && error.code === "INVALID_URL" ? "Enter a valid webpage URL." : formatIngestionError(error),
        providerName: "Mock Webpage",
        providerReliability: "demo",
      };
    }
  }

  async function handleUseMockPdf(input: PdfSourceInput): Promise<SourceIngestionStatus> {
    try {
      const result = ingestMockPdfSource(input);
      const source = buildSourceDocumentFromMetadata(result.sourceMetadata, result.segments);
      const segments = buildWorkspaceSegmentsFromNormalized(result.segments);
      const citations = buildWorkspaceCitationRefsFromSegments(result.segments);

      applyIngestionResult(source, segments, citations);

      return buildReadyStatus(source, segments.length, citations.length, result.warnings);
    } catch (error) {
      return {
        phase: "error",
        label: "Error",
        message: formatIngestionError(error),
        providerName: "Mock PDF",
        providerReliability: "demo",
      };
    }
  }

  function applyIngestionResult(source: SourceDocument, segments: SourceSegment[], citations: CitationRef[]) {
    setLocalBrief(null);
    setResearchCollection((current) =>
      setActiveCollectionSource(
        addSourceReferenceToCollection(current, {
          source,
          segmentCount: segments.length,
          citationCount: citations.length,
        }),
        source.id,
      ),
    );
    setWorkspace((current) => ({
      ...current,
      source,
      segments,
      summaries: {
        en: {
          ...current.summaries.en,
          sourceId: source.id,
          citations: mergeCitationRefs(current.summaries.en.citations, citations),
        },
        ko: {
          ...current.summaries.ko,
          sourceId: source.id,
          citations: mergeCitationRefs(current.summaries.ko.citations, citations),
        },
      },
    }));
    setActiveSegmentId(segments[0]?.id ?? "");
    setContextTab("source");
  }

  return (
    <div className={`workspace-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`} data-theme="dart">
      <WorkspaceSidebar
        activeModeId={activeModeId}
        collapsed={sidebarCollapsed}
        language={language}
        reportModes={workspace.reportModes}
        onMockAction={announce}
        onModeChange={setActiveModeId}
        onToggleCollapse={() => {
          setSidebarCollapsed((collapsed) => !collapsed);
          announce(sidebarCollapsed ? "Navigation expanded." : "Navigation collapsed.");
        }}
      />
      <main className="workspace-main" aria-label="Workspace document">
        <DocumentToolbar
          difficulty={difficulty}
          exportOpen={exportOpen}
          exportOptions={exportOptions}
          language={language}
          length={length}
          mode={toolbarMode}
          visualsEnabled={visualsEnabled}
          onDifficultyChange={setDifficulty}
          onExportOptionsChange={setExportOptions}
          onExportToggle={() => setExportOpen((open) => !open)}
          onLanguageChange={setLanguage}
          onLengthChange={setLength}
          onMockAction={announce}
          onModeChange={setToolbarMode}
          onVisualsToggle={() => setVisualsEnabled((enabled) => !enabled)}
        />
        <ResearchDocument
          activeModeId={activeModeId}
          language={language}
          reportModes={workspace.reportModes}
          source={workspace.source}
          summary={summary}
          localBrief={localBrief}
          visualsEnabled={visualsEnabled}
          onCopyEvidenceCardsMarkdown={handleCopyEvidenceCardsMarkdown}
          onCopyLocalBriefMarkdown={handleCopyLocalBriefMarkdown}
          onGenerateLocalBrief={handleGenerateLocalBrief}
          onLanguageChange={setLanguage}
          onMockAction={announce}
          onReportModeChange={setActiveModeId}
        />
      </main>
      <ContextPanel
        activeSegmentId={activeSegmentId}
        activeTab={contextTab}
        assistantDraft={assistantDraft}
        assistantMessages={assistantMessages}
        assistantPrompts={workspace.assistantPrompts}
        assistantScope={assistantScope}
        highlights={workspace.highlights}
        localBrief={localBrief}
        researchCollection={researchCollection}
        responseMode={responseMode}
        segments={workspace.segments}
        showTranslation={showTranslation}
        source={workspace.source}
        onActiveSegmentChange={setActiveSegmentId}
        onIngestSourceUrl={handleIngestSourceUrl}
        onUseManualTranscript={handleUseManualTranscript}
        onUseMockWebpage={handleUseMockWebpage}
        onUseMockPdf={handleUseMockPdf}
        onAssistantScopeChange={setAssistantScope}
        onAssistantDraftChange={setAssistantDraft}
        onAssistantSend={handleAssistantSend}
        onMockAction={announce}
        onPromptSelect={handlePromptSelect}
        onResponseModeChange={setResponseMode}
        onTabChange={setContextTab}
        onTranslationToggle={() => setShowTranslation((show) => !show)}
      />
      <nav className="responsive-context-access" aria-label="Context shortcuts">
        {(["source", "assistant", "highlight"] as const).map((tab) => (
          <button
            aria-label={`Open ${tab[0].toUpperCase() + tab.slice(1)} context`}
            aria-pressed={contextDrawerOpen && contextTab === tab}
            className={contextTab === tab ? "is-active" : ""}
            key={tab}
            type="button"
            onClick={(event) => openContextDrawer(tab, event.currentTarget)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
      {contextDrawerOpen ? (
        <div className="context-drawer-layer">
          <button
            className="context-drawer-backdrop"
            type="button"
            aria-label="Dismiss context overlay"
            tabIndex={-1}
            onClick={closeContextDrawer}
          />
          <section className="context-drawer" role="dialog" aria-modal="true" aria-label="Context drawer" ref={contextDrawerRef}>
            <header className="context-drawer__header">
              <strong>{contextTab[0].toUpperCase() + contextTab.slice(1)}</strong>
              <button type="button" aria-label="Close context drawer" ref={contextDrawerCloseRef} onClick={closeContextDrawer}>
                <X size={16} aria-hidden="true" />
              </button>
            </header>
            <ContextPanel
              activeSegmentId={activeSegmentId}
              activeTab={contextTab}
              assistantComposerId="assistant-draft-drawer"
              assistantDraft={assistantDraft}
              assistantMessages={assistantMessages}
              assistantPrompts={workspace.assistantPrompts}
              assistantScope={assistantScope}
              highlights={workspace.highlights}
              idBase="context-drawer"
              localBrief={localBrief}
              researchCollection={researchCollection}
              responseMode={responseMode}
              segments={workspace.segments}
              showTranslation={showTranslation}
              source={workspace.source}
              onActiveSegmentChange={setActiveSegmentId}
              onIngestSourceUrl={handleIngestSourceUrl}
              onUseManualTranscript={handleUseManualTranscript}
              onUseMockWebpage={handleUseMockWebpage}
              onUseMockPdf={handleUseMockPdf}
              onAssistantScopeChange={setAssistantScope}
              onAssistantDraftChange={setAssistantDraft}
              onAssistantSend={handleAssistantSend}
              onMockAction={announce}
              onPromptSelect={handlePromptSelect}
              onResponseModeChange={setResponseMode}
              onTabChange={setContextTab}
              onTranslationToggle={() => setShowTranslation((show) => !show)}
            />
          </section>
        </div>
      ) : null}
      <div className="mock-feedback" role="status" aria-live="polite">
        {feedback}
      </div>
    </div>
  );
}

function mergeCitationRefs(existing: CitationRef[], incoming: CitationRef[]) {
  const citationMap = new Map(existing.map((citation) => [citation.id, citation]));
  incoming.forEach((citation) => citationMap.set(citation.id, citation));
  return Array.from(citationMap.values());
}

function formatIngestionWarning(warning: IngestionWarning) {
  if (warning.code === "MOCK_PDF_BOUNDARY") {
    return warning.message;
  }

  if (warning.code === "EMPTY_TRANSCRIPT") {
    return warning.message.includes("Manual transcript")
      ? "Manual transcript did not contain any usable segments."
      : "The provider returned no transcript segments.";
  }

  if (warning.code === "TRANSLATION_UNAVAILABLE") {
    return warning.message.includes("manual transcript")
      ? "Translation is not available for manual transcript segments yet."
      : "Translation is not available for every segment yet.";
  }

  if (warning.code === "MANUAL_TRANSCRIPT_UNTIMESTAMPED") {
    return "Manual transcript has no timestamps, so citations link to the source URL only.";
  }

  if (warning.code === "PARTIAL_TRANSCRIPT") {
    return "Some transcript segments are missing end timestamps.";
  }

  return "The local mock ingestion completed with a warning.";
}

function formatIngestionError(error: unknown) {
  if (!isIngestionError(error)) {
    return "Mock YouTube ingestion failed.";
  }

  if (error.code === "INVALID_URL") {
    return "Enter a valid YouTube URL.";
  }

  if (error.code === "UNSUPPORTED_SOURCE") {
    return "Only YouTube URLs are supported in this ingestion slice.";
  }

  if (error.code === "TRANSCRIPT_UNAVAILABLE") {
    return "This source was recognized, but no transcript is available yet. You can paste a manual transcript below.";
  }

  if (error.code === "EMPTY_TRANSCRIPT") {
    return "The provider returned no transcript segments.";
  }

  return error.message;
}

function buildReadyStatus(
  source: SourceDocument,
  segmentCount: number,
  citationCount: number,
  warnings: IngestionWarning[],
): SourceIngestionStatus {
  return {
    phase: "ready",
    label: "Ready",
    message: `Ready. ${source.providerName ?? "Mock source"} loaded ${segmentCount} segments with ${citationCount} citations.`,
    providerName: source.providerName,
    providerReliability: source.providerReliability,
    segmentCount,
    citationCount,
    warnings: warnings.map(formatIngestionWarning),
  };
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return copyTextWithTextarea(text);
    }
  }

  return copyTextWithTextarea(text);
}

function copyTextWithTextarea(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
