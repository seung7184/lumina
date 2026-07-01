import type { KeyTakeawaysBlock as KeyTakeawaysBlockType } from "@/lib/types/workspace";

interface KeyTakeawaysBlockProps {
  block: KeyTakeawaysBlockType;
}

export function KeyTakeawaysBlock({ block }: KeyTakeawaysBlockProps) {
  return (
    <section className="note-block" aria-label={block.title}>
      <span className="eyebrow accent">{block.title}</span>
      <div className="takeaway-list">
        {block.items.map((item, index) => (
          <article className={`takeaway takeaway--${item.status}`} key={item.id}>
            <span className="takeaway__number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
