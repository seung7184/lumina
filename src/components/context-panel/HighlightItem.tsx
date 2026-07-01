import type { HighlightItem as HighlightItemType } from "@/lib/types/workspace";

interface HighlightItemProps {
  item: HighlightItemType;
}

export function HighlightItem({ item }: HighlightItemProps) {
  return (
    <article className={`highlight-card highlight-card--${item.status}`}>
      <p className={/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(item.text) ? "ko-copy" : ""}>{item.text}</p>
      <small>{item.provenance}</small>
    </article>
  );
}
