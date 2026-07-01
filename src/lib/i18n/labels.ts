import type { LanguageCode } from "@/lib/types/workspace";

export const labels: Record<
  LanguageCode,
  {
    summary: string;
    expand: string;
    short: string;
    base: string;
    long: string;
    easy: string;
    standard: string;
    expert: string;
    output: string;
    source: string;
    generateBilingual: string;
    tableOfContents: string;
    grounding: string;
    fromSource: string;
    aiInferred: string;
    needsVerification: string;
  }
> = {
  en: {
    summary: "Summary",
    expand: "Expand",
    short: "Short",
    base: "Base",
    long: "Long",
    easy: "Easy",
    standard: "Standard",
    expert: "Expert",
    output: "Output",
    source: "Source",
    generateBilingual: "Generate bilingual note",
    tableOfContents: "Table of contents",
    grounding: "Grounding",
    fromSource: "From source",
    aiInferred: "AI inferred",
    needsVerification: "Needs verification",
  },
  ko: {
    summary: "요약",
    expand: "확장",
    short: "짧게",
    base: "기본",
    long: "길게",
    easy: "쉬움",
    standard: "표준",
    expert: "전문가",
    output: "출력",
    source: "출처",
    generateBilingual: "이중 언어 노트 생성",
    tableOfContents: "목차",
    grounding: "근거",
    fromSource: "출처 기반",
    aiInferred: "AI 추론",
    needsVerification: "검증 필요",
  },
};
