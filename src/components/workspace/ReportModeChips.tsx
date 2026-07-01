import type { LanguageCode, ReportMode } from "@/lib/types/workspace";

interface ReportModeChipsProps {
  language: LanguageCode;
  modes: ReportMode[];
  activeModeId: string;
  onChange: (modeId: ReportMode["id"]) => void;
}

export function ReportModeChips({ language, modes, activeModeId, onChange }: ReportModeChipsProps) {
  return (
    <div className="report-chips" aria-label="Report modes">
      {modes.map((mode) => (
        <button
          className={`report-chip ${activeModeId === mode.id ? "is-active" : ""}`}
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
        >
          {mode.label[language]}
        </button>
      ))}
    </div>
  );
}
