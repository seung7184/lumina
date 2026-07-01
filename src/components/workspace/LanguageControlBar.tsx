import { Languages } from "lucide-react";
import type { LanguageCode } from "@/lib/types/workspace";
import { labels } from "@/lib/i18n/labels";

interface LanguageControlBarProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

export function LanguageControlBar({ language, onLanguageChange }: LanguageControlBarProps) {
  const copy = labels[language];

  return (
    <div className="language-card" aria-label="Document language controls">
      <div className="language-card__group">
        <span className="eyebrow">{copy.output}</span>
        <div className="segmented segmented--small" role="group" aria-label="Output language">
          <button
            className={language === "en" ? "is-active" : ""}
            type="button"
            onClick={() => onLanguageChange("en")}
          >
            English
          </button>
          <button
            className={language === "ko" ? "is-active" : ""}
            type="button"
            onClick={() => onLanguageChange("ko")}
          >
            한국어
          </button>
        </div>
      </div>
      <span className="language-divider" />
      <span className="source-language">
        <Languages size={15} aria-hidden="true" />
        <span className="eyebrow">{copy.source}</span>
        <strong>한국어</strong>
      </span>
      <button className="ghost-action" type="button">
        <Languages size={15} aria-hidden="true" />
        {copy.generateBilingual}
      </button>
    </div>
  );
}
