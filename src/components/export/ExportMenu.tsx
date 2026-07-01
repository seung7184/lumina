"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import type { ExportOptions, LanguageCode } from "@/lib/types/workspace";

interface ExportMenuProps {
  language: LanguageCode;
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
  onClose: () => void;
  onMockAction: (message: string) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const formats = [
  { id: "markdown", label: "Markdown", badge: "MD" },
  { id: "pdf", label: "PDF", badge: "PDF" },
  { id: "slides", label: "Slides", badge: "PPT" },
  { id: "notion", label: "Notion", badge: "N" },
] as const;

const contentOptions = [
  ["includeTranscript", "Include transcript", "스크립트 포함"],
  ["includeCitations", "Include citations", "인용 포함"],
  ["includeDiagrams", "Include diagrams", "다이어그램 포함"],
  ["includeHighlights", "Include highlights", "하이라이트 포함"],
  ["includeClaimValidation", "Include claim validation", "주장 검증 포함"],
] as const;

const exportCopy = {
  en: {
    title: "Export",
    close: "Close",
    language: "Export language",
    en: "English",
    ko: "Korean",
    both: "Bilingual",
    format: "Format",
    content: "Content",
    summary: "Summary only",
    full: "Full research note",
    copyLink: "Copy link",
    copied: "Mock share link copied.",
    exported: "Mock export queued. Real file generation is not connected yet.",
  },
  ko: {
    title: "내보내기",
    close: "닫기",
    language: "내보내기 언어",
    en: "English",
    ko: "한국어",
    both: "이중 언어",
    format: "형식",
    content: "내용",
    summary: "요약만",
    full: "전체 리서치 노트",
    copyLink: "링크 복사",
    copied: "목업 공유 링크를 복사했습니다.",
    exported: "목업 내보내기를 준비했습니다. 실제 파일 생성은 아직 연결하지 않았습니다.",
  },
} as const;

export function ExportMenu({ language, options, onChange, onClose, onMockAction, returnFocusRef }: ExportMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [localStatus, setLocalStatus] = useState("");
  const copy = exportCopy[language];

  const closeMenu = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => returnFocusRef?.current?.focus());
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || returnFocusRef?.current?.contains(target)) {
        return;
      }
      closeMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, returnFocusRef]);

  function announce(message: string) {
    setLocalStatus(message);
    onMockAction(message);
  }

  return (
    <div className="export-menu" role="dialog" aria-label="Export options" ref={menuRef}>
      <div className="export-menu__head">
        <strong>{copy.title}</strong>
        <button type="button" onClick={closeMenu} aria-label="Close export menu" ref={closeButtonRef}>
          {copy.close}
        </button>
      </div>
      <span className="eyebrow">{copy.language}</span>
      <div className="segmented segmented--wide" role="radiogroup" aria-label="Export language">
        {(["en", "ko", "both"] as const).map((exportLanguage) => (
          <button
            aria-checked={options.language === exportLanguage}
            className={options.language === exportLanguage ? "is-active" : ""}
            key={exportLanguage}
            role="radio"
            type="button"
            onClick={() => onChange({ ...options, language: exportLanguage })}
          >
            {copy[exportLanguage]}
          </button>
        ))}
      </div>
      <span className="eyebrow">{copy.format}</span>
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
      <span className="eyebrow">{copy.content}</span>
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
            {scope === "summary" ? copy.summary : copy.full}
          </button>
        ))}
      </div>
      <div className="export-checks">
        {contentOptions.map(([key, labelEn, labelKo]) => (
          <button
            aria-checked={options[key]}
            key={key}
            role="checkbox"
            type="button"
            onClick={() => onChange({ ...options, [key]: !options[key] })}
          >
            <span className="check-box">{options[key] ? <Check size={12} aria-hidden="true" /> : null}</span>
            {language === "en" ? labelEn : labelKo}
          </button>
        ))}
      </div>
      {localStatus ? (
        <p className="menu-status" role="status">
          {localStatus}
        </p>
      ) : null}
      <div className="export-menu__actions">
        <button className="secondary-action" type="button" onClick={() => announce(copy.copied)}>
          <Link2 size={14} aria-hidden="true" />
          {copy.copyLink}
        </button>
        <button className="primary-action" type="button" onClick={() => announce(copy.exported)}>
          {copy.title}
        </button>
      </div>
    </div>
  );
}
