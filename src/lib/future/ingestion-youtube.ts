import type {
  CitationRef,
  IngestionError,
  IngestionResult,
  IngestionWarning,
  LanguageCode,
  ManualTranscriptInput,
  NormalizedSourceSegment,
  ParsedManualTranscriptSegment,
  ParsedYouTubeUrl,
  RawTranscriptSegment,
  SegmentCitationRef,
  SourceDocument,
  SourceMetadata,
  SourceSegment,
  TranscriptFetchResult,
  YouTubeSourceInput,
} from "@/lib/types/workspace";

const sampleVideoId = "511ctokiROU";
const sampleCanonicalUrl = `https://www.youtube.com/watch?v=${sampleVideoId}`;
const deterministicFetchedAt = "2026-07-01T00:00:00.000Z";
const supportedVideoIdPattern = /^[A-Za-z0-9_-]+$/;

export interface YouTubeTranscriptProvider {
  id?: string;
  name: string;
  fetchTranscript(input: YouTubeSourceInput): Promise<TranscriptFetchResult>;
}

export interface YouTubeIngestionOptions {
  provider?: YouTubeTranscriptProvider;
}

export type TranscriptProviderCapability =
  | "mock"
  | "official-captions"
  | "third-party"
  | "manual-transcript"
  | "audio-transcription-fallback";

export interface TranscriptProviderDescriptor {
  id: string;
  name: string;
  capabilities: TranscriptProviderCapability[];
  requiresNetwork: boolean;
  requiresApiKey: boolean;
  supportsLanguageDetection: boolean;
  supportsTranslation: boolean;
  reliability: "demo" | "experimental" | "production";
}

export interface TranscriptProviderSelection {
  providerId: string;
  reason: string;
  fallbackProviderIds: string[];
}

const mockProviderDescriptor: TranscriptProviderDescriptor = {
  id: "mock-youtube-transcript",
  name: "Mock YouTube Transcript",
  capabilities: ["mock"],
  requiresNetwork: false,
  requiresApiKey: false,
  supportsLanguageDetection: false,
  supportsTranslation: true,
  reliability: "demo",
};

const providerDescriptors: TranscriptProviderDescriptor[] = [
  mockProviderDescriptor,
  {
    id: "future-youtube-captions",
    name: "Future YouTube Captions",
    capabilities: ["official-captions"],
    requiresNetwork: true,
    requiresApiKey: true,
    supportsLanguageDetection: true,
    supportsTranslation: false,
    reliability: "experimental",
  },
  {
    id: "manual-transcript",
    name: "Manual Transcript",
    capabilities: ["manual-transcript"],
    requiresNetwork: false,
    requiresApiKey: false,
    supportsLanguageDetection: false,
    supportsTranslation: false,
    reliability: "experimental",
  },
  {
    id: "audio-transcription-fallback",
    name: "Audio Transcription Fallback",
    capabilities: ["audio-transcription-fallback"],
    requiresNetwork: true,
    requiresApiKey: true,
    supportsLanguageDetection: true,
    supportsTranslation: false,
    reliability: "experimental",
  },
];

export class YouTubeIngestionException extends Error implements IngestionError {
  code: IngestionError["code"];
  recoverable: boolean;

  constructor(code: IngestionError["code"], message: string, recoverable = true) {
    super(message);
    this.name = "YouTubeIngestionException";
    this.code = code;
    this.recoverable = recoverable;
  }
}

export function isIngestionError(error: unknown): error is IngestionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "recoverable" in error
  );
}

export function listYouTubeTranscriptProviders(): TranscriptProviderDescriptor[] {
  return providerDescriptors.map((provider) => ({
    ...provider,
    capabilities: [...provider.capabilities],
  }));
}

export function getYouTubeTranscriptProviderById(providerId: string): YouTubeTranscriptProvider | undefined {
  if (providerId === mockProviderDescriptor.id) {
    return new MockYouTubeTranscriptProvider();
  }

  if (providerId === "future-youtube-captions") {
    return new FutureYouTubeCaptionProvider();
  }

  return undefined;
}

export function selectYouTubeTranscriptProvider(_input: YouTubeSourceInput): TranscriptProviderSelection {
  void _input;
  return {
    providerId: mockProviderDescriptor.id,
    reason: "Defaulting to the local deterministic mock provider until approved caption providers are configured.",
    fallbackProviderIds: ["manual-transcript", "audio-transcription-fallback"],
  };
}

export function createDefaultYouTubeIngestionPipeline(): {
  provider: YouTubeTranscriptProvider;
  selection: TranscriptProviderSelection;
} {
  const selection = selectYouTubeTranscriptProvider({ kind: "youtube", url: sampleCanonicalUrl });
  const provider = getYouTubeTranscriptProviderById(selection.providerId);

  if (!provider) {
    throw new YouTubeIngestionException("PROVIDER_UNAVAILABLE", "No YouTube transcript provider is configured.");
  }

  return {
    provider,
    selection,
  };
}

function getProviderDescriptor(provider: YouTubeTranscriptProvider): TranscriptProviderDescriptor {
  const providerId = provider.id ?? (provider.name === mockProviderDescriptor.name ? mockProviderDescriptor.id : provider.name);
  return (
    providerDescriptors.find((descriptor) => descriptor.id === providerId || descriptor.name === provider.name) ?? {
      id: providerId,
      name: provider.name,
      capabilities: [],
      requiresNetwork: false,
      requiresApiKey: false,
      supportsLanguageDetection: false,
      supportsTranslation: false,
      reliability: "experimental",
    }
  );
}

export function parseYouTubeUrl(url: string): ParsedYouTubeUrl {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new YouTubeIngestionException("INVALID_URL", "Enter a valid YouTube URL.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  let videoId: string | null = null;

  if (hostname === "youtu.be") {
    videoId = firstPathPart(parsedUrl.pathname);
  } else if (hostname === "youtube.com" || hostname === "www.youtube.com") {
    if (parsedUrl.pathname === "/watch") {
      videoId = parsedUrl.searchParams.get("v");
    } else if (parsedUrl.pathname.startsWith("/shorts/") || parsedUrl.pathname.startsWith("/embed/")) {
      videoId = firstPathPart(parsedUrl.pathname.replace(/^\/(shorts|embed)\//, "/"));
    } else {
      throw new YouTubeIngestionException("UNSUPPORTED_SOURCE", "Only YouTube watch, short, and embed URLs are supported.");
    }
  } else {
    throw new YouTubeIngestionException("UNSUPPORTED_SOURCE", "Only YouTube URLs are supported.");
  }

  if (!videoId || !supportedVideoIdPattern.test(videoId)) {
    throw new YouTubeIngestionException("INVALID_URL", "The YouTube URL is missing a valid video ID.");
  }

  return {
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    originalUrl: url,
  };
}

export function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds].map((part) => part.toString().padStart(2, "0")).join(":");
  }

  return [minutes, remainingSeconds].map((part) => part.toString().padStart(2, "0")).join(":");
}

export function secondsToDisplayTime(seconds: number): string {
  return formatTimestamp(seconds);
}

export function normalizeTranscriptSegments(
  sourceMetadata: SourceMetadata,
  rawSegments: RawTranscriptSegment[],
): NormalizedSourceSegment[] {
  return rawSegments.map((segment, position) => {
    const citationIndex = position + 1;
    const startSeconds = Math.max(0, Math.floor(segment.startSeconds));

    return {
      id: `seg-${sourceMetadata.sourceId}-${String(position).padStart(3, "0")}`,
      sourceId: sourceMetadata.sourceId,
      index: segment.index,
      startSeconds,
      endSeconds: segment.endSeconds,
      displayTime: secondsToDisplayTime(startSeconds),
      text: segment.text,
      language: segment.language,
      translationText: segment.translationText,
      speaker: segment.speaker,
      confidence: segment.confidence,
      citationId: `cite-${sourceMetadata.sourceId}-${String(citationIndex).padStart(3, "0")}`,
      sourceUrl: buildTimestampUrl(sourceMetadata.canonicalUrl, startSeconds),
      metadata: {
        providerSegmentIndex: segment.index,
      },
    };
  });
}

export function createCitationRefsFromSegments(segments: NormalizedSourceSegment[]): SegmentCitationRef[] {
  return segments.map((segment, index) => ({
    id: segment.citationId,
    sourceId: segment.sourceId,
    segmentId: segment.id,
    label: `[${index + 1}]`,
    displayTime: segment.displayTime,
    url: segment.sourceUrl,
  }));
}

export function buildSourceDocumentFromYouTube(
  sourceMetadata: SourceMetadata,
  segments: NormalizedSourceSegment[],
): SourceDocument {
  const language = toWorkspaceLanguage(sourceMetadata.language);

  return {
    id: sourceMetadata.sourceId,
    type: "youtube",
    title: {
      en: sourceMetadata.title,
      ko: sourceMetadata.title,
    },
    url: sourceMetadata.canonicalUrl,
    creator: sourceMetadata.creator,
    publishedAt: sourceMetadata.publishedAt,
    durationSeconds: sourceMetadata.durationSeconds,
    sourceLanguage: language,
    thumbnailLabel: sourceMetadata.title,
    providerName: sourceMetadata.providerName,
    providerReliability: sourceMetadata.providerReliability,
    segmentIds: segments.map((segment) => segment.id),
  };
}

export function buildWorkspaceSegmentsFromNormalized(segments: NormalizedSourceSegment[]): SourceSegment[] {
  return segments.map((segment, index) => ({
    id: segment.id,
    sourceId: segment.sourceId,
    index: segment.index,
    startTime: segment.displayTime,
    endTime: segment.endSeconds === undefined ? segment.displayTime : secondsToDisplayTime(segment.endSeconds),
    speaker: segment.speaker,
    language: toWorkspaceLanguage(segment.language),
    text: segment.text,
    translation: segment.translationText ? { en: segment.translationText } : undefined,
    citationLabel: String(index + 1),
    linkedBlockIds: [],
  }));
}

export function buildWorkspaceCitationRefsFromSegments(segments: NormalizedSourceSegment[]): CitationRef[] {
  return createCitationRefsFromSegments(segments).map((citation) => ({
    id: citation.id,
    sourceId: citation.sourceId,
    segmentIds: [citation.segmentId],
    label: citation.label.replace(/^\[|\]$/g, ""),
    status: "from_source",
  }));
}

export function parseManualTranscriptText(input: ManualTranscriptInput): ParsedManualTranscriptSegment[] {
  const lines = input.transcriptText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const containsTimestamp = lines.some((line) => parseTimestampedLine(line).hasTimestamp);
  const chunks = containsTimestamp
    ? lines
    : input.transcriptText
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim().replace(/\s*\r?\n\s*/g, " "))
        .filter(Boolean);

  return chunks.reduce<ParsedManualTranscriptSegment[]>((segments, chunk) => {
    const parsed = parseTimestampedLine(chunk);
    const text = parsed.text.trim();

    if (!text) {
      return segments;
    }

    segments.push({
      index: segments.length,
      startSeconds: parsed.startSeconds,
      endSeconds: parsed.endSeconds,
      text,
      language: input.language,
    });
    return segments;
  }, []);
}

export async function ingestYouTubeSource(
  input: YouTubeSourceInput,
  options: YouTubeIngestionOptions = {},
): Promise<IngestionResult> {
  if (input.kind !== "youtube") {
    throw new YouTubeIngestionException("UNSUPPORTED_SOURCE", "Only YouTube ingestion is supported by this pipeline.");
  }

  const parsedUrl = parseYouTubeUrl(input.url);
  const pipeline = options.provider
    ? { provider: options.provider, selection: undefined }
    : createDefaultYouTubeIngestionPipeline();
  const provider = pipeline.provider;

  if (!provider) {
    throw new YouTubeIngestionException("PROVIDER_UNAVAILABLE", "No YouTube transcript provider is configured.");
  }

  const providerDescriptor = getProviderDescriptor(provider);
  const fetchResult = await provider.fetchTranscript({
    ...input,
    url: parsedUrl.canonicalUrl,
  });

  const sourceMetadata = {
    ...fetchResult.sourceMetadata,
    sourceId: fetchResult.sourceMetadata.sourceId || `src-youtube-${parsedUrl.videoId}`,
    canonicalUrl: fetchResult.sourceMetadata.canonicalUrl ?? parsedUrl.canonicalUrl,
    providerId: providerDescriptor.id,
    providerName: providerDescriptor.name,
    providerReliability: providerDescriptor.reliability,
  };
  const segments = normalizeTranscriptSegments(sourceMetadata, fetchResult.rawSegments);
  const citations = createCitationRefsFromSegments(segments);

  return {
    sourceMetadata,
    segments,
    citations,
    warnings: buildIngestionWarnings(fetchResult.rawSegments),
  };
}

export class MockYouTubeTranscriptProvider implements YouTubeTranscriptProvider {
  id = mockProviderDescriptor.id;
  name = mockProviderDescriptor.name;

  async fetchTranscript(input: YouTubeSourceInput): Promise<TranscriptFetchResult> {
    const parsedUrl = parseYouTubeUrl(input.url);

    if (parsedUrl.videoId !== sampleVideoId) {
      throw new YouTubeIngestionException(
        "TRANSCRIPT_UNAVAILABLE",
        "The mock YouTube provider only has deterministic transcript data for the sample source.",
      );
    }

    return {
      sourceMetadata: {
        sourceId: `src-youtube-${sampleVideoId}`,
        kind: "youtube",
        title: "AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들",
        creator: "코드팩토리",
        publishedAt: "2026-06-26",
        durationSeconds: 872,
        language: "ko",
        canonicalUrl: sampleCanonicalUrl,
        thumbnailUrl: `https://i.ytimg.com/vi/${sampleVideoId}/hqdefault.jpg`,
      },
      rawSegments: mockRawSegments,
      provider: this.id,
      fetchedAt: deterministicFetchedAt,
    };
  }
}

export class FutureYouTubeCaptionProvider implements YouTubeTranscriptProvider {
  id = "future-youtube-captions";
  name = "Future YouTube Captions";

  async fetchTranscript(_input: YouTubeSourceInput): Promise<TranscriptFetchResult> {
    void _input;
    // Future pass: integrate an official or otherwise approved provider-backed
    // caption source here, preserving timestamps and source attribution.
    // This placeholder intentionally performs no scraping and no network calls.
    throw new YouTubeIngestionException(
      "PROVIDER_UNAVAILABLE",
      "A real YouTube caption provider has not been configured yet.",
    );
  }
}

function firstPathPart(pathname: string) {
  return pathname.split("/").filter(Boolean)[0] ?? null;
}

function parseTimestampedLine(line: string): {
  hasTimestamp: boolean;
  startSeconds?: number;
  endSeconds?: number;
  text: string;
} {
  const timestampPattern = "\\d{1,2}:\\d{2}(?::\\d{2})?";
  const rangeMatch = line.match(new RegExp(`^\\[?(${timestampPattern})\\]?\\s*-\\s*\\[?(${timestampPattern})\\]?\\s+(.+)$`));

  if (rangeMatch) {
    return {
      hasTimestamp: true,
      startSeconds: parseTimestampSeconds(rangeMatch[1]),
      endSeconds: parseTimestampSeconds(rangeMatch[2]),
      text: rangeMatch[3],
    };
  }

  const bracketMatch = line.match(new RegExp(`^\\[(${timestampPattern})\\]\\s*(.*)$`));

  if (bracketMatch) {
    return {
      hasTimestamp: true,
      startSeconds: parseTimestampSeconds(bracketMatch[1]),
      text: bracketMatch[2],
    };
  }

  const prefixMatch = line.match(new RegExp(`^(${timestampPattern})\\s+(.+)$`));

  if (prefixMatch) {
    return {
      hasTimestamp: true,
      startSeconds: parseTimestampSeconds(prefixMatch[1]),
      text: prefixMatch[2],
    };
  }

  return {
    hasTimestamp: false,
    text: line,
  };
}

function parseTimestampSeconds(value: string) {
  const parts = value.split(":").map((part) => Number.parseInt(part, 10));

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return parts[0] * 60 + parts[1];
}

function buildTimestampUrl(canonicalUrl: string | undefined, seconds: number) {
  if (!canonicalUrl) {
    return undefined;
  }

  const url = new URL(canonicalUrl);
  url.searchParams.set("t", `${Math.max(0, Math.floor(seconds))}s`);
  return url.toString();
}

function toWorkspaceLanguage(language: string | undefined): LanguageCode {
  return language === "ko" ? "ko" : "en";
}

function buildIngestionWarnings(rawSegments: RawTranscriptSegment[]): IngestionWarning[] {
  const warnings: IngestionWarning[] = [];

  if (rawSegments.length === 0) {
    warnings.push({
      code: "EMPTY_TRANSCRIPT",
      message: "Transcript provider returned no segments.",
      severity: "warning",
    });
    return warnings;
  }

  if (rawSegments.some((segment) => segment.endSeconds === undefined)) {
    warnings.push({
      code: "PARTIAL_TRANSCRIPT",
      message: "Some transcript segments are missing end timestamps.",
      severity: "warning",
    });
  }

  if (rawSegments.some((segment) => !segment.translationText)) {
    warnings.push({
      code: "TRANSLATION_UNAVAILABLE",
      message: "Some transcript segments do not include translated text.",
      severity: "info",
    });
  }

  return warnings;
}

const mockRawSegments: RawTranscriptSegment[] = [
  {
    index: 0,
    startSeconds: 0,
    endSeconds: 6,
    language: "ko",
    text: "지금 AI에 대한 지식이 굉장히 부족한데 AI가 시키는 대로 창업해 가지고 전 재산 날리는 사례들이 막 나오고 있거든요.",
    translationText:
      "AI knowledge is severely lacking right now, yet people start companies on whatever AI tells them and lose their entire fortune.",
  },
  {
    index: 1,
    startSeconds: 6,
    endSeconds: 14,
    language: "ko",
    text: "사회적 문제가 돼서 PD 수첩에서도 나왔는데 반대로 AI에 대한 이해도가 높은 사람들은 시간을 사실상 무한으로 확장하고 있어요.",
    translationText:
      "It became a social problem, even covered on investigative TV. Conversely, people with high AI fluency expand their time almost infinitely.",
  },
  {
    index: 2,
    startSeconds: 14,
    endSeconds: 16,
    language: "ko",
    text: "그들만의 타임 머신이 있는 거나 마찬가지예요.",
    translationText: "It is as if they have their own time machine.",
  },
  {
    index: 3,
    startSeconds: 16,
    endSeconds: 19,
    language: "ko",
    text: "그냥 평행 우주를 관리하고 있다고 생각하시면 돼요.",
  },
  {
    index: 4,
    startSeconds: 19,
    endSeconds: 23,
    language: "ko",
    text: "특히나 토큰이 무한해 버리면 그냥 일반인이 따라갈 수 없는 생산성을 갖게 될 겁니다.",
    translationText:
      "Especially once your tokens are effectively infinite, you gain productivity ordinary people simply cannot match.",
  },
  {
    index: 5,
    startSeconds: 23,
    endSeconds: 31,
    language: "ko",
    text: "이건 단순히 계정을 여러 개 사서 200달러짜리 토큰 다섯 개를 이번 주에 다 썼다, 이런 정도의 문제가 아니에요.",
  },
  {
    index: 6,
    startSeconds: 31,
    endSeconds: 38,
    language: "ko",
    text: "자, 토큰이 무한하다는 건 사실 우리가 API 자동화 관점으로 봐야 되거든요.",
    translationText: "Infinite tokens really has to be viewed through the lens of API automation.",
  },
];
