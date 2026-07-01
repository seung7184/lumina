"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssistantMessage,
  ExportOptions,
  LanguageCode,
  LuminaDemoWorkspace,
  ReportMode,
} from "@/lib/types/workspace";
import { ContextPanel } from "@/components/context-panel/ContextPanel";
import { DocumentToolbar } from "@/components/workspace/DocumentToolbar";
import { ResearchDocument } from "@/components/workspace/ResearchDocument";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";

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
  const [feedback, setFeedback] = useState("");
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  const contextDrawerRef = useRef<HTMLElement>(null);
  const contextDrawerCloseRef = useRef<HTMLButtonElement>(null);
  const contextTriggerRef = useRef<HTMLButtonElement | null>(null);

  const summary = demo.summaries[language];
  const assistantMessages = [...demo.assistantMessages, ...localAssistantMessages];

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
    const prompt = demo.assistantPrompts.find((item) => item.id === promptId);
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

  return (
    <div className={`workspace-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`} data-theme="dart">
      <WorkspaceSidebar
        activeModeId={activeModeId}
        collapsed={sidebarCollapsed}
        language={language}
        reportModes={demo.reportModes}
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
          reportModes={demo.reportModes}
          source={demo.source}
          summary={summary}
          visualsEnabled={visualsEnabled}
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
        assistantPrompts={demo.assistantPrompts}
        assistantScope={assistantScope}
        highlights={demo.highlights}
        responseMode={responseMode}
        segments={demo.segments}
        showTranslation={showTranslation}
        source={demo.source}
        onActiveSegmentChange={setActiveSegmentId}
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
              assistantPrompts={demo.assistantPrompts}
              assistantScope={assistantScope}
              highlights={demo.highlights}
              idBase="context-drawer"
              responseMode={responseMode}
              segments={demo.segments}
              showTranslation={showTranslation}
              source={demo.source}
              onActiveSegmentChange={setActiveSegmentId}
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
