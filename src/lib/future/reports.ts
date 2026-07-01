import type { LanguageCode, SourceDocument, SourceSegment, SummaryDocument } from "@/lib/types/workspace";

export interface ReportGenerationInput {
  source: SourceDocument;
  segments: SourceSegment[];
  language: LanguageCode;
  mode: string;
  length: "short" | "base" | "long";
  difficulty: "easy" | "standard" | "expert";
}

export async function generateSourceGroundedReport(_input: ReportGenerationInput): Promise<SummaryDocument> {
  void _input;
  // TODO: Normalize segments, group topics, generate block-level output, attach
  // source segment IDs, run validation, then produce EN/KR document copy.
  throw new Error("Report generation is not implemented in this front-end slice.");
}
