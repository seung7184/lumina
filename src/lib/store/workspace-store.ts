import type { LanguageCode } from "@/lib/types/workspace";

export type TemplateId = "executive-brief" | "study-notes" | "decision-memo" | "action-checklist" | "email-draft" | "source-faq";

export interface SourceSegment {
  index: number;
  startSeconds: number;
  endSeconds?: number;
  text: string;
  language: string;
  speaker?: string;
}

export interface IngestedSource {
  sourceId: string;
  kind: "youtube" | "webpage" | "text";
  title: string;
  url?: string;
  creator?: string;
  language: string;
  segments: SourceSegment[];
  totalDurationSeconds?: number;
  ingestedAt: string;
}

export interface GeneratedBrief {
  id: string;
  sourceId: string;
  content: string;
  template: TemplateId;
  language: LanguageCode | "both";
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  sourceIds: string[];
  createdAt: string;
}

export interface WorkspaceState {
  sources: IngestedSource[];
  briefs: GeneratedBrief[];
  chatMessages: ChatMessage[];
  projects: Project[];
  activeSourceId: string | null;
  activeBriefId: string | null;
  activeTemplate: TemplateId;
  language: LanguageCode;
}

const STORAGE_KEY = "lumina-workspace";

export function loadWorkspaceState(): WorkspaceState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...getDefaultState(), ...JSON.parse(stored) };
    }
  } catch {
    // corrupted data
  }
  return getDefaultState();
}

export function saveWorkspaceState(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded
  }
}

function getDefaultState(): WorkspaceState {
  return {
    sources: [],
    briefs: [],
    chatMessages: [],
    projects: [],
    activeSourceId: null,
    activeBriefId: null,
    activeTemplate: "executive-brief",
    language: "en",
  };
}

export const templateLabels: Record<TemplateId, { en: string; ko: string }> = {
  "executive-brief": { en: "Executive Brief", ko: "핵심 브리프" },
  "study-notes": { en: "Study Notes", ko: "학습 노트" },
  "decision-memo": { en: "Decision Memo", ko: "의사결정 메모" },
  "action-checklist": { en: "Action Checklist", ko: "실행 체크리스트" },
  "email-draft": { en: "Email/LinkedIn Draft", ko: "이메일/LinkedIn 초안" },
  "source-faq": { en: "Source FAQ", ko: "출처 기반 FAQ" },
};

export const decisionLensOptions: { id: string; label: { en: string; ko: string }; template: TemplateId }[] = [
  { id: "study", label: { en: "Study / Learn", ko: "공부/학습" }, template: "study-notes" },
  { id: "work", label: { en: "Use at Work", ko: "업무 활용" }, template: "executive-brief" },
  { id: "decide", label: { en: "Make a Decision", ko: "의사결정" }, template: "decision-memo" },
  { id: "act", label: { en: "Take Action", ko: "실행 계획" }, template: "action-checklist" },
  { id: "write", label: { en: "Write / Share", ko: "작성/공유" }, template: "email-draft" },
  { id: "understand", label: { en: "Deep Understanding", ko: "깊은 이해" }, template: "source-faq" },
];
