import type { SourceSegment } from "@/lib/types/workspace";
import { TranscriptRow } from "@/components/context-panel/TranscriptRow";

interface TranscriptListProps {
  segments: SourceSegment[];
  activeSegmentId: string;
  showTranslation: boolean;
  onActiveSegmentChange: (id: string) => void;
}

export function TranscriptList({
  segments,
  activeSegmentId,
  showTranslation,
  onActiveSegmentChange,
}: TranscriptListProps) {
  return (
    <div className="transcript-list">
      {segments.map((segment) => (
        <TranscriptRow
          active={segment.id === activeSegmentId}
          key={segment.id}
          segment={segment}
          showTranslation={showTranslation}
          onSelect={() => onActiveSegmentChange(segment.id)}
        />
      ))}
    </div>
  );
}
