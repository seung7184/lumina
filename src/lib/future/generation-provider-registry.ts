export type GenerationProviderKind = "local-deterministic" | "ai-chat" | "ai-structured" | "ai-evaluator";

export type GenerationProviderAvailability = "active" | "placeholder" | "disabled";

export type GenerationProviderReliability = "demo" | "experimental" | "production";

export type GenerationProviderCapability =
  | "extractive-brief"
  | "evidence-cards"
  | "brief-blocks"
  | "citation-preservation"
  | "citation-required"
  | "structured-output"
  | "multilingual-output"
  | "claim-validation"
  | "style-rewrite"
  | "question-answering";

export interface GenerationProviderDescriptor {
  id: string;
  kind: GenerationProviderKind;
  name: string;
  shortLabel: string;
  description: string;
  availability: GenerationProviderAvailability;
  reliability: GenerationProviderReliability;
  capabilities: GenerationProviderCapability[];
  requiresNetwork: boolean;
  requiresApiKey: boolean;
  requiresModel: boolean;
  usesAi: boolean;
  usesEmbeddings: boolean;
  usesVectorSearch: boolean;
  storesUserData: boolean;
  isDeterministic: boolean;
  requiresCitations: boolean;
  preservesCitationIds: boolean;
  allowsUncitedClaims: boolean;
  outputModes: Array<"brief" | "evidence" | "qa" | "rewrite" | "validation">;
}

export interface GenerationProviderSelection {
  providerId: string;
  reason: string;
  fallbackProviderIds: string[];
}

const activeGenerationProviderId = "local-deterministic-brief";

const generationProviderCatalog: GenerationProviderDescriptor[] = [
  {
    id: activeGenerationProviderId,
    kind: "local-deterministic",
    name: "Local Deterministic Brief",
    shortLabel: "Local brief",
    description: "Assembles evidence cards and brief blocks from existing source segments and citations without calling an AI model.",
    availability: "active",
    reliability: "demo",
    capabilities: ["extractive-brief", "evidence-cards", "brief-blocks", "citation-preservation", "citation-required"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresModel: false,
    usesAi: false,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: true,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["brief", "evidence"],
  },
  {
    id: "future-openai-structured-brief",
    kind: "ai-structured",
    name: "Future OpenAI Structured Brief",
    shortLabel: "OpenAI brief",
    description: "Placeholder for future AI-backed structured brief generation. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["structured-output", "brief-blocks", "citation-preservation", "multilingual-output"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresModel: true,
    usesAi: true,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: false,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["brief"],
  },
  {
    id: "future-anthropic-structured-brief",
    kind: "ai-structured",
    name: "Future Anthropic Structured Brief",
    shortLabel: "Anthropic brief",
    description: "Placeholder for future AI-backed structured brief generation. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["structured-output", "brief-blocks", "citation-preservation", "multilingual-output"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresModel: true,
    usesAi: true,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: false,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["brief"],
  },
  {
    id: "future-gemini-structured-brief",
    kind: "ai-structured",
    name: "Future Gemini Structured Brief",
    shortLabel: "Gemini brief",
    description: "Placeholder for future AI-backed structured brief generation. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["structured-output", "brief-blocks", "citation-preservation", "multilingual-output"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresModel: true,
    usesAi: true,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: false,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["brief"],
  },
  {
    id: "future-local-model-brief",
    kind: "ai-structured",
    name: "Future Local Model Brief",
    shortLabel: "Local model",
    description: "Placeholder for future local model structured brief generation. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["structured-output", "brief-blocks", "citation-preservation"],
    requiresNetwork: false,
    requiresApiKey: false,
    requiresModel: true,
    usesAi: true,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: false,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["brief"],
  },
  {
    id: "future-claim-validation",
    kind: "ai-evaluator",
    name: "Future Claim Validation",
    shortLabel: "Claim validation",
    description: "Placeholder for future AI-backed claim validation against cited evidence. Not active.",
    availability: "placeholder",
    reliability: "experimental",
    capabilities: ["claim-validation", "structured-output", "citation-preservation", "citation-required"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresModel: true,
    usesAi: true,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: false,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["validation"],
  },
  {
    id: "future-citation-auditor",
    kind: "ai-evaluator",
    name: "Future Citation Auditor",
    shortLabel: "Citation auditor",
    description: "Disabled placeholder for future citation safety auditing. Not active.",
    availability: "disabled",
    reliability: "experimental",
    capabilities: ["claim-validation", "citation-preservation", "citation-required", "structured-output"],
    requiresNetwork: true,
    requiresApiKey: true,
    requiresModel: true,
    usesAi: true,
    usesEmbeddings: false,
    usesVectorSearch: false,
    storesUserData: false,
    isDeterministic: false,
    requiresCitations: true,
    preservesCitationIds: true,
    allowsUncitedClaims: false,
    outputModes: ["validation"],
  },
];

export function listGenerationProviders(): GenerationProviderDescriptor[] {
  return generationProviderCatalog.map(copyGenerationProviderDescriptor);
}

export function listActiveGenerationProviders(): GenerationProviderDescriptor[] {
  return generationProviderCatalog
    .filter((provider) => provider.availability === "active")
    .map(copyGenerationProviderDescriptor);
}

export function listGenerationProvidersByKind(kind: GenerationProviderKind): GenerationProviderDescriptor[] {
  return generationProviderCatalog.filter((provider) => provider.kind === kind).map(copyGenerationProviderDescriptor);
}

export function getGenerationProviderById(providerId: string): GenerationProviderDescriptor | undefined {
  const provider = generationProviderCatalog.find((descriptor) => descriptor.id === providerId);
  return provider ? copyGenerationProviderDescriptor(provider) : undefined;
}

export function getActiveGenerationProvider(): GenerationProviderDescriptor {
  const provider = generationProviderCatalog.find(
    (descriptor) => descriptor.id === activeGenerationProviderId && descriptor.availability === "active",
  );

  if (!provider) {
    throw new Error("No active generation provider is configured.");
  }

  return copyGenerationProviderDescriptor(provider);
}

export function getGenerationProviderRequirementsSummary(descriptor: GenerationProviderDescriptor): string[] {
  const labels = [
    descriptor.requiresNetwork ? "Requires network" : "No network",
    descriptor.requiresApiKey ? "Requires API key" : "No API key",
    descriptor.requiresModel ? "Requires model" : "No AI model",
  ];

  if (descriptor.usesAi) {
    labels.push("Uses AI");
  }

  if (descriptor.preservesCitationIds) {
    labels.push("Preserves citations");
  }

  if (descriptor.requiresCitations) {
    labels.push("Citations required");
  }

  if (descriptor.isDeterministic) {
    labels.push("Deterministic");
  }

  labels.push(descriptor.usesVectorSearch ? "Uses vector search" : "No vector search");

  if (descriptor.availability === "placeholder") {
    labels.push("Placeholder");
  }

  if (descriptor.availability === "disabled") {
    labels.push("Disabled");
  }

  return labels;
}

export function selectGenerationProvider(): GenerationProviderSelection {
  return {
    providerId: activeGenerationProviderId,
    reason: "Using the local deterministic provider until AI-backed generation providers are explicitly enabled.",
    fallbackProviderIds: [],
  };
}

function copyGenerationProviderDescriptor(descriptor: GenerationProviderDescriptor): GenerationProviderDescriptor {
  return {
    ...descriptor,
    capabilities: [...descriptor.capabilities],
    outputModes: [...descriptor.outputModes],
  };
}
