import { Download, Eye, Grid2X2, Link2, Share2 } from "lucide-react";
import { useRef } from "react";
import type { ExportOptions, LanguageCode } from "@/lib/types/workspace";
import { labels } from "@/lib/i18n/labels";
import { ExportMenu } from "@/components/export/ExportMenu";

interface DocumentToolbarProps {
  language: LanguageCode;
  mode: "summary" | "expand";
  length: "short" | "base" | "long";
  difficulty: "easy" | "standard" | "expert";
  visualsEnabled: boolean;
  exportOpen: boolean;
  exportOptions: ExportOptions;
  onLanguageChange: (language: LanguageCode) => void;
  onModeChange: (mode: "summary" | "expand") => void;
  onLengthChange: (length: "short" | "base" | "long") => void;
  onDifficultyChange: (difficulty: "easy" | "standard" | "expert") => void;
  onVisualsToggle: () => void;
  onExportToggle: () => void;
  onExportOptionsChange: (options: ExportOptions) => void;
  onMockAction: (message: string) => void;
}

export function DocumentToolbar({
  language,
  mode,
  length,
  difficulty,
  visualsEnabled,
  exportOpen,
  exportOptions,
  onLanguageChange,
  onModeChange,
  onLengthChange,
  onDifficultyChange,
  onVisualsToggle,
  onExportToggle,
  onExportOptionsChange,
  onMockAction,
}: DocumentToolbarProps) {
  const copy = labels[language];
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="document-toolbar" role="toolbar" aria-label="Document controls">
      <div className="segmented" role="group" aria-label="View mode">
        <button
          aria-pressed={mode === "summary"}
          className={mode === "summary" ? "is-active" : ""}
          type="button"
          onClick={() => onModeChange("summary")}
        >
          {copy.summary}
        </button>
        <button
          aria-pressed={mode === "expand"}
          className={mode === "expand" ? "is-active" : ""}
          type="button"
          onClick={() => onModeChange("expand")}
        >
          {copy.expand}
        </button>
      </div>
      <div className="segmented" role="group" aria-label="Length">
        {(["short", "base", "long"] as const).map((item) => (
          <button
            aria-pressed={length === item}
            className={length === item ? "is-active" : ""}
            key={item}
            type="button"
            onClick={() => onLengthChange(item)}
          >
            {copy[item]}
          </button>
        ))}
      </div>
      <div className="segmented" role="group" aria-label="Reading level">
        {(["easy", "standard", "expert"] as const).map((item) => (
          <button
            aria-pressed={difficulty === item}
            className={difficulty === item ? "is-active" : ""}
            key={item}
            type="button"
            onClick={() => onDifficultyChange(item)}
          >
            {copy[item]}
          </button>
        ))}
      </div>
      <span className="toolbar-spacer" />
      <div className="segmented segmented--language" role="group" aria-label="Toolbar language">
        <button
          aria-pressed={language === "en"}
          className={language === "en" ? "is-active" : ""}
          type="button"
          onClick={() => onLanguageChange("en")}
        >
          EN
        </button>
        <button
          aria-pressed={language === "ko"}
          className={language === "ko" ? "is-active" : ""}
          type="button"
          onClick={() => onLanguageChange("ko")}
        >
          KR
        </button>
      </div>
      <button
        className={`icon-button ${visualsEnabled ? "is-active" : ""}`}
        type="button"
        aria-pressed={visualsEnabled}
        aria-label="Toggle visual blocks"
        onClick={() => {
          onVisualsToggle();
          onMockAction(visualsEnabled ? "Visual blocks hidden." : "Visual blocks shown.");
        }}
        title="Visual blocks"
      >
        <Grid2X2 size={16} aria-hidden="true" />
      </button>
      <button
        className="icon-button is-active"
        type="button"
        aria-label="Citation links"
        title="Citation links"
        onClick={() => onMockAction("Citation links are visible in the document.")}
      >
        <Link2 size={16} aria-hidden="true" />
      </button>
      <div className="export-anchor">
        <button
          className="toolbar-export"
          type="button"
          ref={exportButtonRef}
          onClick={onExportToggle}
          aria-expanded={exportOpen}
          aria-haspopup="dialog"
        >
          <Download size={15} aria-hidden="true" />
          Export
        </button>
        {exportOpen ? (
          <ExportMenu
            language={language}
            options={exportOptions}
            onChange={onExportOptionsChange}
            onClose={onExportToggle}
            onMockAction={onMockAction}
            returnFocusRef={exportButtonRef}
          />
        ) : null}
      </div>
      <button
        className="icon-button"
        type="button"
        aria-label="Preview reading view"
        title="Preview reading view"
        onClick={() => onMockAction("Reading preview is mocked in this slice.")}
      >
        <Eye size={16} aria-hidden="true" />
      </button>
      <button
        className="icon-button"
        type="button"
        aria-label="Share"
        title="Share"
        onClick={() => onMockAction("Mock share link copied.")}
      >
        <Share2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
