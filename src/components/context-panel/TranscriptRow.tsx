import { Link2 } from "lucide-react";
import type { SourceSegment } from "@/lib/types/workspace";

interface TranscriptRowProps {
  segment: SourceSegment;
  active: boolean;
  showTranslation: boolean;
  onSelect: () => void;
}

export function TranscriptRow({ segment, active, showTranslation, onSelect }: TranscriptRowProps) {
  return (
    <button
      aria-label={`Transcript segment ${segment.startTime}${active ? ", selected" : ""}`}
      aria-pressed={active}
      className={`transcript-row ${active ? "is-active" : ""}`}
      type="button"
      onClick={onSelect}
    >
      <span className="transcript-time">{segment.startTime}</span>
      <span className="transcript-copy">
        <span className="ko-copy">{segment.text}</span>
        {showTranslation && segment.translation?.en ? <em>{segment.translation.en}</em> : null}
        <small>
          <Link2 size={12} aria-hidden="true" />
          linked to summary · [{segment.citationLabel}]
        </small>
      </span>
    </button>
  );
}
