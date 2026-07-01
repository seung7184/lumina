export type SourceProviderKind = "youtube" | "manual-transcript" | "webpage" | "pdf";

export type SourceProviderCapability =
  | "mock"
  | "manual-input"
  | "official-captions"
  | "third-party-captions"
  | "webpage-extraction"
  | "pdf-text-extraction"
  | "pdf-table-extraction"
  | "ocr"
  | "audio-transcription"
  | "translation";

export type SourceProviderAvailability = "active" | "placeholder" | "disabled";

export type SourceProviderReliability = "demo" | "experimental" | "production";

export interface SourceProviderDescriptor {
  id: string;
  sourceKind: SourceProviderKind;
  name: string;
  shortLabel: string;
  description: string;
  availability: SourceProviderAvailability;
  reliability: SourceProviderReliability;
  capabilities: SourceProviderCapability[];
  requiresNetwork: boolean;
  requiresApiKey: boolean;
  requiresUpload: boolean;
  requiresFileParsing: boolean;
  requiresOcr: boolean;
  usesAi: boolean;
  isDeterministic: boolean;
  isUserProvided: boolean;
}

export interface SourceProviderSelection {
  sourceKind: SourceProviderKind;
  providerId: string;
  reason: string;
  fallbackProviderIds: string[];
}

const sourceProviderCatalog: SourceProviderDescriptor[] = [
  {
    id: "mock-youtube-transcript",
    sourceKind: "youtube",
    name: "Mock YouTube Transcript",
    shortLabel: "YouTube mock",
    description: "Deterministic local transcript fixture for the sample YouTube source.",
    availability: "active",
    reliability: "demo",
    capabilities: ["mock", "translation"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresUpload: false,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: true,
    isUserProvided: false,
  },
  {
    id: "manual-transcript",
    sourceKind: "manual-transcript",
    name: "Manual Transcript",
    shortLabel: "Manual",
    description: "User-provided transcript text parsed locally as a fallback source.",
    availability: "active",
    reliability: "experimental",
    capabilities: ["manual-input"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresUpload: false,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: true,
    isUserProvided: true,
  },
  {
    id: "mock-webpage",
    sourceKind: "webpage",
    name: "Mock Webpage",
    shortLabel: "Web mock",
    description: "Deterministic local webpage boundary; no live webpage is fetched.",
    availability: "active",
    reliability: "demo",
    capabilities: ["mock"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresUpload: false,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: true,
    isUserProvided: false,
  },
  {
    id: "mock-pdf",
    sourceKind: "pdf",
    name: "Mock PDF",
    shortLabel: "PDF mock",
    description: "Deterministic local PDF boundary; no PDF bytes are parsed.",
    availability: "active",
    reliability: "demo",
    capabilities: ["mock"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresUpload: false,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: true,
    isUserProvided: false,
  },
  {
    id: "future-youtube-captions",
    sourceKind: "youtube",
    name: "Future YouTube Captions",
    shortLabel: "YouTube captions",
    description: "Placeholder for future approved YouTube caption extraction. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["official-captions"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresUpload: false,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: false,
    isUserProvided: false,
  },
  {
    id: "future-webpage-extractor",
    sourceKind: "webpage",
    name: "Future Webpage Extractor",
    shortLabel: "Web extraction",
    description: "Placeholder for future approved webpage extraction. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["webpage-extraction"],
    requiresNetwork: true,
    requiresApiKey: false,
    requiresUpload: false,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: false,
    isUserProvided: false,
  },
  {
    id: "future-pdf-text-extractor",
    sourceKind: "pdf",
    name: "Future PDF Text Extractor",
    shortLabel: "PDF extraction",
    description: "Placeholder for future PDF text and table extraction. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["pdf-text-extraction", "pdf-table-extraction"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresUpload: true,
    requiresFileParsing: true,
    requiresOcr: false,
    usesAi: false,
    isDeterministic: true,
    isUserProvided: false,
  },
  {
    id: "future-pdf-ocr",
    sourceKind: "pdf",
    name: "Future PDF OCR",
    shortLabel: "PDF OCR",
    description: "Placeholder for future OCR-backed PDF extraction. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["ocr"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresUpload: true,
    requiresFileParsing: true,
    requiresOcr: true,
    usesAi: false,
    isDeterministic: false,
    isUserProvided: false,
  },
  {
    id: "future-audio-transcription",
    sourceKind: "youtube",
    name: "Future Audio Transcription",
    shortLabel: "Audio transcription",
    description: "Placeholder for future audio transcription fallback. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["audio-transcription"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresUpload: true,
    requiresFileParsing: false,
    requiresOcr: false,
    usesAi: true,
    isDeterministic: false,
    isUserProvided: false,
  },
];

const defaultProviderByKind: Record<SourceProviderKind, string> = {
  youtube: "mock-youtube-transcript",
  "manual-transcript": "manual-transcript",
  webpage: "mock-webpage",
  pdf: "mock-pdf",
};

export function listSourceProviders(): SourceProviderDescriptor[] {
  return sourceProviderCatalog.map(copySourceProviderDescriptor);
}

export function listActiveSourceProviders(): SourceProviderDescriptor[] {
  return sourceProviderCatalog
    .filter((provider) => provider.availability === "active")
    .map(copySourceProviderDescriptor);
}

export function listSourceProvidersByKind(sourceKind: SourceProviderKind): SourceProviderDescriptor[] {
  return sourceProviderCatalog
    .filter((provider) => provider.sourceKind === sourceKind)
    .map(copySourceProviderDescriptor);
}

export function getSourceProviderById(providerId: string): SourceProviderDescriptor | undefined {
  const provider = sourceProviderCatalog.find((descriptor) => descriptor.id === providerId);
  return provider ? copySourceProviderDescriptor(provider) : undefined;
}

export function getActiveSourceProviderForKind(sourceKind: SourceProviderKind): SourceProviderDescriptor | undefined {
  const providerId = defaultProviderByKind[sourceKind];
  const provider = sourceProviderCatalog.find(
    (descriptor) => descriptor.id === providerId && descriptor.availability === "active",
  );
  return provider ? copySourceProviderDescriptor(provider) : undefined;
}

export function getSourceProviderRequirementsSummary(descriptor: SourceProviderDescriptor): string[] {
  const labels = [
    descriptor.requiresNetwork ? "Requires network" : "No network",
    descriptor.requiresApiKey ? "Requires API key" : "No API key",
  ];

  if (descriptor.requiresUpload) {
    labels.push("Requires upload");
  }

  if (descriptor.requiresFileParsing) {
    labels.push("Requires file parsing");
  }

  if (descriptor.requiresOcr) {
    labels.push("Requires OCR");
  }

  if (descriptor.usesAi) {
    labels.push("Uses AI");
  }

  if (descriptor.isDeterministic) {
    labels.push("Deterministic");
  }

  if (descriptor.isUserProvided) {
    labels.push("User-provided");
  }

  if (descriptor.availability === "placeholder") {
    labels.push("Placeholder");
  }

  if (descriptor.availability === "disabled") {
    labels.push("Disabled");
  }

  return labels;
}

export function selectSourceProviderForKind(sourceKind: SourceProviderKind): SourceProviderSelection {
  const provider = getActiveSourceProviderForKind(sourceKind);

  if (!provider) {
    throw new Error(`No active source provider is configured for ${sourceKind}.`);
  }

  return {
    sourceKind,
    providerId: provider.id,
    reason:
      sourceKind === "manual-transcript"
        ? "Using user-provided manual transcript input."
        : "Defaulting to the deterministic local mock provider until approved extraction providers are configured.",
    fallbackProviderIds: sourceKind === "youtube" ? ["manual-transcript", "future-audio-transcription"] : [],
  };
}

function copySourceProviderDescriptor(descriptor: SourceProviderDescriptor): SourceProviderDescriptor {
  return {
    ...descriptor,
    capabilities: [...descriptor.capabilities],
  };
}
