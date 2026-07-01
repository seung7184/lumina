export type LanguageCode = "en" | "ko";

export type SourceType = "youtube" | "pdf" | "webpage" | "audio" | "video" | "text";

export type SourceKind = "youtube" | "pdf" | "webpage" | "text";

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
  providerName?: string;
  providerReliability?: "demo" | "experimental" | "production";
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

export interface IngestionSourceInput {
  kind: SourceKind;
  url?: string;
  text?: string;
  fileName?: string;
  languageHint?: string;
}

export interface YouTubeSourceInput extends IngestionSourceInput {
  kind: "youtube";
  url: string;
}

export interface WebpageSourceInput {
  kind: "webpage";
  url: string;
  title?: string;
  language?: LanguageCode;
}

export interface PdfSourceInput {
  kind: "pdf";
  url?: string;
  filename?: string;
  title?: string;
  language?: LanguageCode;
}

export type IngestibleSourceInput = YouTubeSourceInput | WebpageSourceInput | PdfSourceInput | ManualTranscriptInput;

export interface ParsedYouTubeUrl {
  videoId: string;
  canonicalUrl: string;
  originalUrl: string;
}

export interface SourceMetadata {
  sourceId: string;
  kind: SourceKind;
  title: string;
  creator?: string;
  publishedAt?: string;
  durationSeconds?: number;
  language?: string;
  canonicalUrl?: string;
  thumbnailUrl?: string;
  providerId?: string;
  providerName?: string;
  providerReliability?: "demo" | "experimental" | "production";
}

export interface RawTranscriptSegment {
  index: number;
  startSeconds: number;
  endSeconds?: number;
  text: string;
  language: string;
  translationText?: string;
  speaker?: string;
  confidence?: number;
}

export interface NormalizedSourceSegment {
  id: string;
  sourceId: string;
  index: number;
  startSeconds: number;
  endSeconds?: number;
  displayTime: string;
  text: string;
  language: string;
  translationText?: string;
  speaker?: string;
  confidence?: number;
  citationId: string;
  sourceUrl?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface SegmentCitationRef {
  id: string;
  sourceId: string;
  segmentId: string;
  label: string;
  displayTime: string;
  url?: string;
}

export interface TranscriptFetchResult {
  sourceMetadata: SourceMetadata;
  rawSegments: RawTranscriptSegment[];
  provider: string;
  fetchedAt: string;
}

export interface IngestionWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface EvidenceCard {
  id: string;
  sourceId: string;
  segmentIds: string[];
  citationIds: string[];
  label: string;
  title: string;
  body: string;
  sourceTime?: string;
  sourceUrl?: string;
  kind: "claim" | "context" | "limitation" | "next-step";
}

export interface BriefBlock {
  id: string;
  title: string;
  body: string;
  citationIds: string[];
  evidenceCardIds: string[];
  kind: "overview" | "key-point" | "limitation" | "next-step";
}

export type CitationAuditSeverity = "info" | "warning" | "error";

export type CitationAuditIssueCode =
  | "MISSING_BRIEF_CITATION"
  | "UNKNOWN_CITATION_ID"
  | "UNKNOWN_SEGMENT_ID"
  | "UNKNOWN_EVIDENCE_CARD_ID"
  | "UNCITED_EVIDENCE_CARD"
  | "UNCITED_BRIEF_BLOCK"
  | "ORPHANED_EVIDENCE_CARD"
  | "EMPTY_GENERATED_BRIEF"
  | "AUDIT_PASSED";

export interface CitationAuditIssue {
  id: string;
  code: CitationAuditIssueCode;
  severity: CitationAuditSeverity;
  message: string;
  targetType: "brief" | "evidence-card" | "brief-block" | "citation" | "segment";
  targetId?: string;
}

export interface CitationAuditResult {
  id: string;
  briefId: string;
  passed: boolean;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  checkedCitationIds: string[];
  checkedSegmentIds: string[];
  issues: CitationAuditIssue[];
}

export type GenerationPolicySeverity = "info" | "warning" | "error";

export type GenerationPolicyIssueCode =
  | "POLICY_PASSED"
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_NOT_ACTIVE"
  | "PROVIDER_USES_AI"
  | "PROVIDER_NOT_LOCAL_ONLY"
  | "PROVIDER_NOT_DETERMINISTIC"
  | "PROVIDER_ALLOWS_UNCITED_CLAIMS"
  | "PROVIDER_DOES_NOT_REQUIRE_CITATIONS"
  | "PROVIDER_DOES_NOT_PRESERVE_CITATIONS"
  | "MISSING_CITATION_AUDIT"
  | "CITATION_AUDIT_FAILED"
  | "CITATION_AUDIT_ERRORS"
  | "CITATION_AUDIT_UNCITED_OUTPUT"
  | "EMPTY_GENERATED_OUTPUT";

export interface GenerationPolicyIssue {
  id: string;
  code: GenerationPolicyIssueCode;
  severity: GenerationPolicySeverity;
  message: string;
  targetType: "brief" | "provider" | "citation-audit";
  targetId?: string;
}

export interface GenerationPolicyResult {
  id: string;
  briefId: string;
  providerId?: string;
  allowedToDisplay: boolean;
  allowedToUseAsSourceGrounded: boolean;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: GenerationPolicyIssue[];
}

export interface DeterministicBrief {
  id: string;
  sourceId: string;
  title: string;
  subtitle: string;
  generatedBy: "local-deterministic";
  providerId?: string;
  providerName?: string;
  providerReliability?: "demo" | "experimental" | "production";
  evidenceCards: EvidenceCard[];
  blocks: BriefBlock[];
  citationIds: string[];
  warnings: IngestionWarning[];
  citationAudit?: CitationAuditResult;
  generationPolicy?: GenerationPolicyResult;
}

export interface IngestionResult {
  sourceMetadata: SourceMetadata;
  segments: NormalizedSourceSegment[];
  citations: SegmentCitationRef[];
  warnings: IngestionWarning[];
}

export interface ManualTranscriptInput {
  sourceUrl: string;
  title?: string;
  language: string;
  transcriptText: string;
}

export interface ParsedManualTranscriptSegment {
  index: number;
  startSeconds?: number;
  endSeconds?: number;
  text: string;
  language: string;
}

export interface IngestionError {
  code:
    | "INVALID_URL"
    | "UNSUPPORTED_SOURCE"
    | "TRANSCRIPT_UNAVAILABLE"
    | "PROVIDER_UNAVAILABLE"
    | "EMPTY_TRANSCRIPT"
    | "UNKNOWN_ERROR";
  message: string;
  recoverable: boolean;
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
