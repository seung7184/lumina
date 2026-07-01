"use client";

import { ChevronsLeft, Folder, Plus, Search } from "lucide-react";
import { useState } from "react";
import type { LanguageCode, ReportMode } from "@/lib/types/workspace";

interface WorkspaceSidebarProps {
  language: LanguageCode;
  reportModes: ReportMode[];
  activeModeId: string;
  collapsed: boolean;
  onModeChange: (modeId: ReportMode["id"]) => void;
  onMockAction: (message: string) => void;
  onToggleCollapse: () => void;
}

const outlineItems = [
  ["section-1", "Two lenses on the divide", "격차를 만드는 두 시선"],
  ["section-1-1", "Losing everything to AI", "전 재산을 잃는 사람들"],
  ["section-1-2", "Expanding time infinitely", "시간을 확장하는 사람들"],
  ["section-1-3", "The right approach", "올바른 접근"],
] as const;

export function WorkspaceSidebar({
  language,
  reportModes,
  activeModeId,
  collapsed,
  onModeChange,
  onMockAction,
  onToggleCollapse,
}: WorkspaceSidebarProps) {
  const [activeOutlineId, setActiveOutlineId] = useState("section-1");
  const [collectionActive, setCollectionActive] = useState(true);

  return (
    <aside className={`workspace-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <header className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true">
          L
        </div>
        <strong>Lumina</strong>
        <button type="button" aria-label="Search workspace" onClick={() => onMockAction("Search is mocked for this slice.")}>
          <Search size={16} aria-hidden="true" />
        </button>
        <button type="button" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={onToggleCollapse}>
          <ChevronsLeft size={16} aria-hidden="true" />
        </button>
      </header>
      <nav className="sidebar-scroll" aria-label="Workspace navigation">
        <span className="eyebrow">Collection</span>
        <button
          aria-pressed={collectionActive}
          className={`collection-card ${collectionActive ? "is-active" : ""}`}
          type="button"
          onClick={() => {
            setCollectionActive(true);
            onMockAction("AI & Productivity collection selected.");
          }}
        >
          <Folder size={16} aria-hidden="true" />
          <span>AI & Productivity</span>
          <small>12</small>
        </button>
        <section className="sidebar-section" aria-label="Document outline">
          <div className="sidebar-section__head">
            <span className="eyebrow">Outline</span>
            <small>§1.1</small>
          </div>
          {outlineItems.map(([id, en, ko], index) => (
            <a
              className={`outline-link ${activeOutlineId === id ? "is-active" : ""}`}
              href={`#${id}`}
              key={id}
              onClick={() => {
                setActiveOutlineId(id);
                onMockAction(`${index === 0 ? "1" : `1.${index}`} outline section selected.`);
              }}
            >
              {index === 0 ? "1." : `1.${index}`} {language === "en" ? en : ko}
            </a>
          ))}
        </section>
        <section className="sidebar-section" aria-label="Reports">
          <div className="sidebar-section__head">
            <span className="eyebrow">Reports</span>
            <button type="button" aria-label="Add report" onClick={() => onMockAction("Report creation is mocked for this slice.")}>
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
          {reportModes.map((mode) => (
            <button
              className={`report-row report-row--${mode.tone} ${activeModeId === mode.id ? "is-active" : ""}`}
              key={mode.id}
              type="button"
              onClick={() => {
                onModeChange(mode.id);
                if (mode.status !== "ready") {
                  onMockAction(`${mode.label[language]} is marked ${mode.status} in this mock workspace.`);
                }
              }}
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
