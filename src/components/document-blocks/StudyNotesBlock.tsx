import { BookOpen } from "lucide-react";
import type { StudyNotesBlock as StudyNotesBlockType } from "@/lib/types/workspace";

interface StudyNotesBlockProps {
  block: StudyNotesBlockType;
}

export function StudyNotesBlock({ block }: StudyNotesBlockProps) {
  return (
    <section className="compact-block" aria-label={block.title}>
      <span className="eyebrow accent">{block.title}</span>
      {block.notes.map((note) => (
        <article className="compact-row" key={note.id}>
          <BookOpen size={16} aria-hidden="true" />
          <div>
            <h3>{note.prompt}</h3>
            <p>{note.answer}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
