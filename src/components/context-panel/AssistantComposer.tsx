import { AtSign, Paperclip, Send } from "lucide-react";

interface AssistantComposerProps {
  id: string;
  draft: string;
  responseMode: string;
  onDraftChange: (draft: string) => void;
  onMockAction: (message: string) => void;
  onResponseModeChange: (mode: string) => void;
  onSend: () => void;
}

const responseModes = ["Standard", "Critical", "Action-oriented", "Study", "Founder", "Developer", "Investor"];

export function AssistantComposer({
  id,
  draft,
  responseMode,
  onDraftChange,
  onMockAction,
  onResponseModeChange,
  onSend,
}: AssistantComposerProps) {
  return (
    <div className="assistant-composer">
      <span className="eyebrow">Response mode</span>
      <div className="mode-pills">
        {responseModes.map((mode) => (
          <button
            className={responseMode === mode ? "is-active" : ""}
            key={mode}
            type="button"
            onClick={() => onResponseModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className="composer-box">
        <label className="sr-only" htmlFor={id}>
          Ask anything about this source
        </label>
        <textarea
          id={id}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Ask anything about this source..."
          rows={3}
        />
        <div>
          <button type="button" aria-label="Attach file" onClick={() => onMockAction("File attachment is mocked in this slice.")}>
            <Paperclip size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Mention source" onClick={() => onDraftChange(`${draft.trim()} @source`.trim())}>
            <AtSign size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Send assistant question" onClick={onSend}>
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <small>Answers are grounded in this source. Citations link to the transcript.</small>
    </div>
  );
}
