import type {
  AssistantMessage,
  AssistantPrompt,
  HighlightItem,
  ManualTranscriptInput,
  SourceDocument,
  SourceSegment,
} from "@/lib/types/workspace";
import type { KeyboardEvent } from "react";
import { AssistantTab } from "@/components/context-panel/AssistantTab";
import { HighlightTab } from "@/components/context-panel/HighlightTab";
import { SourceTab } from "@/components/context-panel/SourceTab";
import type { SourceIngestionStatus } from "@/components/context-panel/source-ingestion-status";

const contextTabs = ["source", "assistant", "highlight"] as const;
type ContextTabId = (typeof contextTabs)[number];

interface ContextPanelProps {
  activeTab: ContextTabId;
  idBase?: string;
  source: SourceDocument;
  segments: SourceSegment[];
  activeSegmentId: string;
  showTranslation: boolean;
  assistantMessages: AssistantMessage[];
  assistantPrompts: AssistantPrompt[];
  assistantDraft: string;
  assistantComposerId?: string;
  highlights: HighlightItem[];
  assistantScope: "source" | "collection" | "web_source";
  responseMode: string;
  onTabChange: (tab: ContextTabId) => void;
  onActiveSegmentChange: (id: string) => void;
  onIngestSourceUrl?: (url: string) => Promise<SourceIngestionStatus>;
  onUseManualTranscript?: (input: ManualTranscriptInput) => Promise<SourceIngestionStatus>;
  onTranslationToggle: () => void;
  onAssistantScopeChange: (scope: "source" | "collection" | "web_source") => void;
  onAssistantDraftChange: (draft: string) => void;
  onAssistantSend: () => void;
  onMockAction: (message: string) => void;
  onPromptSelect: (promptId: string) => void;
  onResponseModeChange: (mode: string) => void;
}

export function ContextPanel({
  activeTab,
  idBase = "context-panel",
  source,
  segments,
  activeSegmentId,
  showTranslation,
  assistantMessages,
  assistantPrompts,
  assistantDraft,
  assistantComposerId = "assistant-draft",
  highlights,
  assistantScope,
  responseMode,
  onTabChange,
  onActiveSegmentChange,
  onIngestSourceUrl,
  onUseManualTranscript,
  onTranslationToggle,
  onAssistantScopeChange,
  onAssistantDraftChange,
  onAssistantSend,
  onMockAction,
  onPromptSelect,
  onResponseModeChange,
}: ContextPanelProps) {
  function selectTab(tab: ContextTabId) {
    onTabChange(tab);
    window.requestAnimationFrame(() => document.getElementById(`${idBase}-${tab}-tab`)?.focus());
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: ContextTabId) {
    const currentIndex = contextTabs.indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % contextTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + contextTabs.length) % contextTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = contextTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectTab(contextTabs[nextIndex]);
  }

  return (
    <aside className="context-panel" aria-label="Context panel">
      <div className="context-tabs" role="tablist" aria-label="Context panel tabs">
        {contextTabs.map((tab) => (
          <button
            aria-controls={`${idBase}-${tab}-panel`}
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "is-active" : ""}
            id={`${idBase}-${tab}-tab`}
            key={tab}
            role="tab"
            type="button"
            onClick={() => onTabChange(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === "source" ? (
        <SourceTab
          activeSegmentId={activeSegmentId}
          labelledBy={`${idBase}-source-tab`}
          panelId={`${idBase}-source-panel`}
          segments={segments}
          showTranslation={showTranslation}
          source={source}
          onActiveSegmentChange={onActiveSegmentChange}
          onIngestSourceUrl={onIngestSourceUrl}
          onUseManualTranscript={onUseManualTranscript}
          onMockAction={onMockAction}
          onTranslationToggle={onTranslationToggle}
        />
      ) : null}
      {activeTab === "assistant" ? (
        <AssistantTab
          messages={assistantMessages}
          draft={assistantDraft}
          composerId={assistantComposerId}
          labelledBy={`${idBase}-assistant-tab`}
          panelId={`${idBase}-assistant-panel`}
          prompts={assistantPrompts}
          responseMode={responseMode}
          scope={assistantScope}
          onDraftChange={onAssistantDraftChange}
          onMockAction={onMockAction}
          onPromptSelect={onPromptSelect}
          onResponseModeChange={onResponseModeChange}
          onSend={onAssistantSend}
          onScopeChange={onAssistantScopeChange}
        />
      ) : null}
      {activeTab === "highlight" ? (
        <HighlightTab
          highlights={highlights}
          labelledBy={`${idBase}-highlight-tab`}
          panelId={`${idBase}-highlight-panel`}
          onMockAction={onMockAction}
        />
      ) : null}
    </aside>
  );
}
