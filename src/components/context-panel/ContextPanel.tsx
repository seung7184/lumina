import type {
  AssistantMessage,
  AssistantPrompt,
  HighlightItem,
  SourceDocument,
  SourceSegment,
} from "@/lib/types/workspace";
import { AssistantTab } from "@/components/context-panel/AssistantTab";
import { HighlightTab } from "@/components/context-panel/HighlightTab";
import { SourceTab } from "@/components/context-panel/SourceTab";

interface ContextPanelProps {
  activeTab: "source" | "assistant" | "highlight";
  source: SourceDocument;
  segments: SourceSegment[];
  activeSegmentId: string;
  showTranslation: boolean;
  assistantMessages: AssistantMessage[];
  assistantPrompts: AssistantPrompt[];
  assistantDraft: string;
  highlights: HighlightItem[];
  assistantScope: "source" | "collection" | "web_source";
  responseMode: string;
  onTabChange: (tab: "source" | "assistant" | "highlight") => void;
  onActiveSegmentChange: (id: string) => void;
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
  source,
  segments,
  activeSegmentId,
  showTranslation,
  assistantMessages,
  assistantPrompts,
  assistantDraft,
  highlights,
  assistantScope,
  responseMode,
  onTabChange,
  onActiveSegmentChange,
  onTranslationToggle,
  onAssistantScopeChange,
  onAssistantDraftChange,
  onAssistantSend,
  onMockAction,
  onPromptSelect,
  onResponseModeChange,
}: ContextPanelProps) {
  return (
    <aside className="context-panel" aria-label="Context panel">
      <div className="context-tabs" aria-label="Context panel tabs">
        {(["source", "assistant", "highlight"] as const).map((tab) => (
          <button
            aria-pressed={activeTab === tab}
            className={activeTab === tab ? "is-active" : ""}
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === "source" ? (
        <SourceTab
          activeSegmentId={activeSegmentId}
          segments={segments}
          showTranslation={showTranslation}
          source={source}
          onActiveSegmentChange={onActiveSegmentChange}
          onMockAction={onMockAction}
          onTranslationToggle={onTranslationToggle}
        />
      ) : null}
      {activeTab === "assistant" ? (
        <AssistantTab
          messages={assistantMessages}
          draft={assistantDraft}
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
      {activeTab === "highlight" ? <HighlightTab highlights={highlights} onMockAction={onMockAction} /> : null}
    </aside>
  );
}
