import { ChevronsLeft, Folder, Plus, Search } from "lucide-react";
import type { LanguageCode, ReportMode } from "@/lib/types/workspace";

interface WorkspaceSidebarProps {
  language: LanguageCode;
  reportModes: ReportMode[];
  activeModeId: string;
  onModeChange: (modeId: ReportMode["id"]) => void;
}

export function WorkspaceSidebar({ language, reportModes, activeModeId, onModeChange }: WorkspaceSidebarProps) {
  return (
    <aside className="workspace-sidebar">
      <header className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true">
          L
        </div>
        <strong>Lumina</strong>
        <button type="button" aria-label="Search workspace">
          <Search size={16} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Collapse navigation">
          <ChevronsLeft size={16} aria-hidden="true" />
        </button>
      </header>
      <nav className="sidebar-scroll" aria-label="Workspace navigation">
        <span className="eyebrow">Collection</span>
        <div className="collection-card">
          <Folder size={16} aria-hidden="true" />
          <span>AI & Productivity</span>
          <small>12</small>
        </div>
        <section className="sidebar-section" aria-label="Document outline">
          <div className="sidebar-section__head">
            <span className="eyebrow">Outline</span>
            <small>§1.1</small>
          </div>
          <a className="outline-link is-active" href="#section-1">
            1. {language === "en" ? "Two lenses on the divide" : "격차를 만드는 두 시선"}
          </a>
          <a className="outline-link" href="#section-1">
            1.1 {language === "en" ? "Losing everything to AI" : "전 재산을 잃는 사람들"}
          </a>
          <a className="outline-link" href="#section-1">
            1.2 {language === "en" ? "Expanding time infinitely" : "시간을 확장하는 사람들"}
          </a>
          <a className="outline-link" href="#section-1">
            1.3 {language === "en" ? "The right approach" : "올바른 접근"}
          </a>
        </section>
        <section className="sidebar-section" aria-label="Reports">
          <div className="sidebar-section__head">
            <span className="eyebrow">Reports</span>
            <button type="button" aria-label="Add report">
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
          {reportModes.map((mode) => (
            <button
              className={`report-row report-row--${mode.tone} ${activeModeId === mode.id ? "is-active" : ""}`}
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
            >
              <span />
              <strong>{mode.label[language]}</strong>
              {mode.status !== "ready" ? <small>{mode.status}</small> : null}
            </button>
          ))}
        </section>
      </nav>
      <footer className="sidebar-footer">
        <div className="avatar">SK</div>
        <div>
          <strong>Free plan</strong>
          <small>3 of 5 sources used</small>
        </div>
      </footer>
    </aside>
  );
}
