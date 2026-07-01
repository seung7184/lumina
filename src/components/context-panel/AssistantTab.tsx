import { Bot } from "lucide-react";
import type { AssistantMessage, AssistantPrompt } from "@/lib/types/workspace";
import { AssistantComposer } from "@/components/context-panel/AssistantComposer";
import { SuggestedPromptCard } from "@/components/context-panel/SuggestedPromptCard";

interface AssistantTabProps {
  messages: AssistantMessage[];
  prompts: AssistantPrompt[];
  draft: string;
  composerId: string;
  scope: "source" | "collection" | "web_source";
  responseMode: string;
  onDraftChange: (draft: string) => void;
  onMockAction: (message: string) => void;
  onPromptSelect: (promptId: string) => void;
  onScopeChange: (scope: "source" | "collection" | "web_source") => void;
  onResponseModeChange: (mode: string) => void;
  onSend: () => void;
}

export function AssistantTab({
  messages,
  prompts,
  draft,
  composerId,
  scope,
  responseMode,
  onDraftChange,
  onMockAction,
  onPromptSelect,
  onScopeChange,
  onResponseModeChange,
  onSend,
}: AssistantTabProps) {
  return (
    <div className="assistant-tab" role="tabpanel" aria-label="Assistant">
      <div className="context-tab-body">
        <span className="eyebrow">Scope</span>
        <div className="segmented segmented--wide" role="group" aria-label="Assistant scope">
          {(["source", "collection", "web_source"] as const).map((item) => (
            <button className={scope === item ? "is-active" : ""} key={item} type="button" onClick={() => onScopeChange(item)}>
              {item === "source" ? "This source" : item === "collection" ? "Collection" : "Web + source"}
            </button>
          ))}
        </div>
        {messages.map((message) => (
          <article className={`assistant-message assistant-message--${message.role}`} key={message.id}>
            <div className="assistant-avatar">
              <Bot size={17} aria-hidden="true" />
            </div>
            <div>
              <p>{message.body}</p>
              {message.bodyKo ? <p className="ko-copy">{message.bodyKo}</p> : null}
              <small>grounded in §1.1 · cites [26]</small>
            </div>
          </article>
        ))}
        <span className="eyebrow">Suggested actions</span>
        <div className="prompt-list">
          {prompts.map((prompt) => (
            <SuggestedPromptCard key={prompt.id} prompt={prompt} onSelect={() => onPromptSelect(prompt.id)} />
          ))}
        </div>
      </div>
      <AssistantComposer
        draft={draft}
        id={composerId}
        responseMode={responseMode}
        onDraftChange={onDraftChange}
        onMockAction={onMockAction}
        onResponseModeChange={onResponseModeChange}
        onSend={onSend}
      />
    </div>
  );
}
