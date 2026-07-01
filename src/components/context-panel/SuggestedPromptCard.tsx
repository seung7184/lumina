import { BookOpen, Lightbulb, ListChecks, Search, ShieldCheck, TrendingUp } from "lucide-react";
import type { AssistantPrompt } from "@/lib/types/workspace";

interface SuggestedPromptCardProps {
  prompt: AssistantPrompt;
  onSelect: () => void;
}

const iconByPrompt: Record<string, React.ReactNode> = {
  "p-validate": <ShieldCheck size={16} aria-hidden="true" />,
  "p-simple": <Lightbulb size={16} aria-hidden="true" />,
  "p-actions": <ListChecks size={16} aria-hidden="true" />,
  "p-founder": <TrendingUp size={16} aria-hidden="true" />,
  "p-study": <BookOpen size={16} aria-hidden="true" />,
  "p-compare": <Search size={16} aria-hidden="true" />,
};

export function SuggestedPromptCard({ prompt, onSelect }: SuggestedPromptCardProps) {
  return (
    <button className="prompt-card" type="button" onClick={onSelect}>
      {iconByPrompt[prompt.id]}
      <span>
        <strong>{prompt.label}</strong>
        <small>{prompt.description}</small>
      </span>
    </button>
  );
}
