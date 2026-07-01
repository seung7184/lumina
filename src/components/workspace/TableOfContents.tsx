import type { TableOfContentsBlock } from "@/lib/types/workspace";

interface TableOfContentsProps {
  block: TableOfContentsBlock;
}

export function TableOfContents({ block }: TableOfContentsProps) {
  return (
    <nav className="toc" aria-label="Table of contents">
      <span className="eyebrow">Table of contents</span>
      <div className="toc__items">
        {block.items.map((item) => (
          <a className="toc__item" href={`#${item.id}`} key={item.id}>
            <span>{item.label}</span>
            <small>{item.citationCount} cites</small>
          </a>
        ))}
      </div>
    </nav>
  );
}
