"use client";

import { useState } from "react";
import type { ExportOptions, LanguageCode, LuminaDemoWorkspace, ReportMode } from "@/lib/types/workspace";
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

  const summary = demo.summaries[language];

  return (
    <div className="workspace-shell" data-theme="dart">
      <WorkspaceSidebar
        activeModeId={activeModeId}
        language={language}
        reportModes={demo.reportModes}
        onModeChange={setActiveModeId}
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
          onReportModeChange={setActiveModeId}
        />
      </section>
      <ContextPanel
        activeSegmentId={activeSegmentId}
        activeTab={contextTab}
        assistantMessages={demo.assistantMessages}
        assistantPrompts={demo.assistantPrompts}
        assistantScope={assistantScope}
        highlights={demo.highlights}
        responseMode={responseMode}
        segments={demo.segments}
        showTranslation={showTranslation}
        source={demo.source}
        onActiveSegmentChange={setActiveSegmentId}
        onAssistantScopeChange={setAssistantScope}
        onResponseModeChange={setResponseMode}
        onTabChange={setContextTab}
        onTranslationToggle={() => setShowTranslation((show) => !show)}
      />
    </div>
  );
}
