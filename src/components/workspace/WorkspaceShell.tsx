"use client";

import { useEffect, useState } from "react";
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

  const summary = demo.summaries[language];
  const assistantMessages = [...demo.assistantMessages, ...localAssistantMessages];

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeout = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

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
      <section className="workspace-main">
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
      </section>
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
      <div className="mock-feedback" role="status" aria-live="polite">
        {feedback}
      </div>
    </div>
  );
}
