import type { CitationRef } from "@/lib/types/workspace";

interface CitationMarkerProps {
  citation: CitationRef;
}

export function CitationMarker({ citation }: CitationMarkerProps) {
  return (
    <sup className={`citation citation--${citation.status}`}>
      <a href={`#${citation.id}`} aria-label={`Citation ${citation.label}`}>
        {citation.label}
      </a>
    </sup>
  );
}
