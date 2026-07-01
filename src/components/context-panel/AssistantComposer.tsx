import { AtSign, Paperclip, Send } from "lucide-react";

interface AssistantComposerProps {
  responseMode: string;
  onResponseModeChange: (mode: string) => void;
}

const responseModes = ["Standard", "Critical", "Action-oriented", "Study", "Founder", "Developer", "Investor"];

export function AssistantComposer({ responseMode, onResponseModeChange }: AssistantComposerProps) {
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
        <span>Ask anything about this source...</span>
        <div>
          <button type="button" aria-label="Attach file">
            <Paperclip size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Mention source">
            <AtSign size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Send assistant question">
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <small>Answers are grounded in this source. Citations link to the transcript.</small>
    </div>
  );
}
