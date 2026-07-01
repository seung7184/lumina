export type LanguageCode = "en" | "ko";

export type SourceType = "youtube" | "pdf" | "webpage" | "audio" | "video" | "text";

export type GroundingStatus = "from_source" | "ai_inferred" | "needs_verification";

export type ReportModeId =
  | "summary"
  | "critical-analysis"
  | "claim-validation"
  | "action-items"
  | "study-notes"
  | "founder"
  | "developer"
  | "investor";

export interface ReportMode {
  id: ReportModeId;
  label: Record<LanguageCode, string>;
  status: "ready" | "preview" | "generate" | "pro" | "soon";
  tone: "teal" | "sage" | "amber" | "coral" | "forest";
}

export interface SourceDocument {
  id: string;
  type: SourceType;
  title: Record<LanguageCode, string>;
  url?: string;
  creator?: string;
  publishedAt?: string;
  durationSeconds?: number;
  sourceLanguage: LanguageCode;
  thumbnailLabel: string;
  segmentIds: string[];
}

export interface SourceSegment {
  id: string;
  sourceId: string;
  index: number;
  startTime: string;
  endTime: string;
  speaker?: string;
  language: LanguageCode;
  text: string;
  translation?: Partial<Record<LanguageCode, string>>;
  citationLabel: string;
  linkedBlockIds: string[];
}

export interface CitationRef {
  id: string;
  sourceId: string;
  segmentIds: string[];
  label: string;
  status: GroundingStatus;
}

export interface BaseBlock {
  id: string;
  citationIds: string[];
  status: GroundingStatus;
}

export interface HeadingBlock extends BaseBlock {
  kind: "heading";
  level: 2 | 3;
  text: string;
}

export interface ParagraphBlock extends BaseBlock {
  kind: "paragraph";
  text: string;
}

export interface TableOfContentsBlock extends BaseBlock {
  kind: "table_of_contents";
  items: Array<{
    id: string;
    label: string;
    citationCount: number;
  }>;
}

export interface VisualBlock extends BaseBlock {
  kind: "visual";
  title: string;
  subtitle?: string;
  generatedFrom: string;
  sourceSegmentCount: number;
}

export interface ConceptDiagramNode {
  id: string;
  label: string;
  tone: "neutral" | "positive" | "negative";
}

export interface ConceptDiagramPath {
  id: string;
  label: string;
  tone: "positive" | "negative";
  nodeIds: string[];
}

export interface ConceptDiagramBlock extends VisualBlock {
  visualType: "concept_diagram";
  mainConcept: string;
  paths: ConceptDiagramPath[];
  nodes: ConceptDiagramNode[];
}

export interface KeyTakeaway {
  id: string;
  title: string;
  body: string;
  citationIds: string[];
  status: GroundingStatus;
}

export interface KeyTakeawaysBlock extends BaseBlock {
  kind: "key_takeaways";
  title: string;
  items: KeyTakeaway[];
}

export interface ClaimValidation {
  id: string;
  claim: string;
  sourceEvidence: string;
  counterEvidence: string;
  coverageLabel: string;
  statusLabel: string;
  suggestedFollowUp: string;
  citationIds: string[];
  status: GroundingStatus;
}

export interface ClaimValidationBlock extends BaseBlock {
  kind: "claim_validation";
  title: string;
  validation: ClaimValidation;
}

export interface ActionItem {
  id: string;
  title: string;
  detail: string;
  citationIds: string[];
}

export interface ActionItemsBlock extends BaseBlock {
  kind: "action_items";
  title: string;
  items: ActionItem[];
}

export interface StudyNote {
  id: string;
  prompt: string;
  answer: string;
  citationIds: string[];
}

export interface StudyNotesBlock extends BaseBlock {
  kind: "study_notes";
  title: string;
  notes: StudyNote[];
}

export type DocumentBlock =
  | HeadingBlock
  | ParagraphBlock
  | TableOfContentsBlock
  | ConceptDiagramBlock
  | KeyTakeawaysBlock
  | ClaimValidationBlock
  | ActionItemsBlock
  | StudyNotesBlock;

export interface SummaryDocument {
  id: string;
  sourceId: string;
  language: LanguageCode;
  title: string;
  abstract: string;
  breadcrumbs: string[];
  statusLabel: string;
  sourceCoverage: number;
  blocks: DocumentBlock[];
  citations: CitationRef[];
}

export interface HighlightItem {
  id: string;
  category: "key_claim" | "important_quote" | "needs_validation" | "user_note";
  text: string;
  provenance: string;
  citationIds: string[];
  status: GroundingStatus;
}

export interface AssistantPrompt {
  id: string;
  label: string;
  description: string;
  mode: "standard" | "critical" | "action" | "study" | "founder" | "developer" | "investor";
}

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  body: string;
  bodyKo?: string;
  citationIds: string[];
  scope: "source" | "collection" | "web_source";
}

export interface ExportOptions {
  language: LanguageCode | "both";
  format: "markdown" | "pdf" | "slides" | "notion";
  scope: "summary" | "full";
  includeTranscript: boolean;
  includeCitations: boolean;
  includeDiagrams: boolean;
  includeHighlights: boolean;
  includeClaimValidation: boolean;
}

export interface LuminaDemoWorkspace {
  source: SourceDocument;
  segments: SourceSegment[];
  summaries: Record<LanguageCode, SummaryDocument>;
  reportModes: ReportMode[];
  highlights: HighlightItem[];
  assistantPrompts: AssistantPrompt[];
  assistantMessages: AssistantMessage[];
}
