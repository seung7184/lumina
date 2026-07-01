import { BadgeCheck, Globe2, PlayCircle } from "lucide-react";
import type { LanguageCode, SourceDocument, SummaryDocument } from "@/lib/types/workspace";
import { LanguageControlBar } from "@/components/workspace/LanguageControlBar";

interface DocumentHeaderProps {
  source: SourceDocument;
  summary: SummaryDocument;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

export function DocumentHeader({ source, summary, language, onLanguageChange }: DocumentHeaderProps) {
  return (
    <header className="document-header">
      <div className="breadcrumb-row">
        <span>{summary.breadcrumbs.join(" / ")}</span>
        <span className="status-pill status-pill--success">
          <BadgeCheck size={13} aria-hidden="true" />
          {summary.statusLabel}
        </span>
      </div>
      <h1 className={language === "ko" ? "ko-title" : ""}>{summary.title}</h1>
      <div className="source-meta">
        <span>
          <PlayCircle size={15} aria-hidden="true" />
          YouTube
        </span>
        <span>{source.creator}</span>
        <span>{source.publishedAt}</span>
        <span>{formatDuration(source.durationSeconds ?? 0)}</span>
        <span>
          <Globe2 size={14} aria-hidden="true" />
          Source 한국어
        </span>
      </div>
      <LanguageControlBar language={language} onLanguageChange={onLanguageChange} />
      <p className={language === "ko" ? "document-abstract ko-copy" : "document-abstract"}>{summary.abstract}</p>
    </header>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
