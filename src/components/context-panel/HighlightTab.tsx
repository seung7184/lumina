import type { HighlightItem as HighlightItemType } from "@/lib/types/workspace";
import { HighlightItem } from "@/components/context-panel/HighlightItem";

interface HighlightTabProps {
  highlights: HighlightItemType[];
  onMockAction: (message: string) => void;
}

const sections = [
  ["key_claim", "Key claims"],
  ["important_quote", "Important quotes"],
  ["needs_validation", "Needs validation"],
  ["user_note", "Your notes"],
] as const;

export function HighlightTab({ highlights, onMockAction }: HighlightTabProps) {
  return (
    <div className="context-tab-body" role="tabpanel" aria-label="Highlight">
      {sections.map(([category, label]) => {
        const items = highlights.filter((item) => item.category === category);
        return (
          <section className="highlight-section" key={category}>
            <span className="eyebrow">
              <span>{label}</span>
              <small> · {items.length}</small>
            </span>
            {items.map((item) => (
              <HighlightItem item={item} key={item.id} />
            ))}
          </section>
        );
      })}
      <button className="export-selected" type="button" onClick={() => onMockAction("Selected highlights added to mock export.")}>
        Export selected · 3
      </button>
    </div>
  );
}
