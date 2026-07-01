import { ListChecks } from "lucide-react";
import type { ActionItemsBlock as ActionItemsBlockType } from "@/lib/types/workspace";

interface ActionItemsBlockProps {
  block: ActionItemsBlockType;
}

export function ActionItemsBlock({ block }: ActionItemsBlockProps) {
  return (
    <section className="compact-block" aria-label={block.title}>
      <span className="eyebrow accent">{block.title}</span>
      {block.items.map((item) => (
        <article className="compact-row" key={item.id}>
          <ListChecks size={16} aria-hidden="true" />
          <div>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
