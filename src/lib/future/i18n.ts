import type { LanguageCode, SummaryDocument } from "@/lib/types/workspace";

export interface LocalizedReportInput {
  document: SummaryDocument;
  targetLanguage: LanguageCode;
  preserveCitations: boolean;
}

export async function localizeResearchDocument(_input: LocalizedReportInput): Promise<SummaryDocument> {
  void _input;
  // TODO: Generate language-native document copy. This should not be a naive
  // string translation pass; block structure and citations must be preserved.
  throw new Error("i18n generation is not implemented in this front-end slice.");
}
