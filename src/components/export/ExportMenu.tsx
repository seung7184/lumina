import { Check, Link2 } from "lucide-react";
import type { ExportOptions } from "@/lib/types/workspace";

interface ExportMenuProps {
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
  onClose: () => void;
}

const formats = [
  { id: "markdown", label: "Markdown", badge: "MD" },
  { id: "pdf", label: "PDF", badge: "PDF" },
  { id: "slides", label: "Slides", badge: "PPT" },
  { id: "notion", label: "Notion", badge: "N" },
] as const;

const contentOptions = [
  ["includeTranscript", "Include transcript"],
  ["includeCitations", "Include citations"],
  ["includeDiagrams", "Include diagrams"],
  ["includeHighlights", "Include highlights"],
  ["includeClaimValidation", "Include claim validation"],
] as const;

export function ExportMenu({ options, onChange, onClose }: ExportMenuProps) {
  return (
    <div className="export-menu" role="menu" aria-label="Export options">
      <div className="export-menu__head">
        <strong>Export</strong>
        <button type="button" onClick={onClose} aria-label="Close export menu">
          Close
        </button>
      </div>
      <span className="eyebrow">Export language</span>
      <div className="segmented segmented--wide" role="radiogroup" aria-label="Export language">
        {(["en", "ko", "both"] as const).map((language) => (
          <button
            aria-checked={options.language === language}
            className={options.language === language ? "is-active" : ""}
            key={language}
            role="radio"
            type="button"
            onClick={() => onChange({ ...options, language })}
          >
            {language === "en" ? "English" : language === "ko" ? "Korean" : "Both"}
          </button>
        ))}
      </div>
      <span className="eyebrow">Format</span>
      <div className="export-menu__formats">
        {formats.map((format) => (
          <button
            aria-checked={options.format === format.id}
            className={options.format === format.id ? "is-active" : ""}
            key={format.id}
            role="radio"
            type="button"
            onClick={() => onChange({ ...options, format: format.id })}
          >
            <span className="format-badge">{format.badge}</span>
            {format.label}
          </button>
        ))}
      </div>
      <span className="eyebrow">Content</span>
      <div className="segmented segmented--wide" role="radiogroup" aria-label="Export scope">
        {(["summary", "full"] as const).map((scope) => (
          <button
            aria-checked={options.scope === scope}
            className={options.scope === scope ? "is-active" : ""}
            key={scope}
            role="radio"
            type="button"
            onClick={() => onChange({ ...options, scope })}
          >
            {scope === "summary" ? "Summary only" : "Full research note"}
          </button>
        ))}
      </div>
      <div className="export-checks">
        {contentOptions.map(([key, label]) => (
          <button
            aria-checked={options[key]}
            key={key}
            role="checkbox"
            type="button"
            onClick={() => onChange({ ...options, [key]: !options[key] })}
          >
            <span className="check-box">{options[key] ? <Check size={12} aria-hidden="true" /> : null}</span>
            {label}
          </button>
        ))}
      </div>
      <div className="export-menu__actions">
        <button className="secondary-action" type="button">
          <Link2 size={14} aria-hidden="true" />
          Copy link
        </button>
        <button className="primary-action" type="button">
          Export
        </button>
      </div>
    </div>
  );
}
