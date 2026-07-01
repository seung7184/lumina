import { getActiveSourceProviderForKind, type SourceProviderKind } from "@/lib/future/ingestion-provider-registry";
import type { DeterministicBrief, SourceDocument, SourceType } from "@/lib/types/workspace";

export type PipelineStageId = "source" | "generation" | "citation-audit" | "policy-gate";

export type PipelineStageTone = "ready" | "pending" | "passed" | "allowed" | "warning" | "blocked";

export interface PipelineStageStatus {
  id: PipelineStageId;
  label: string;
  value: string;
  tone: PipelineStageTone;
}

export interface SourceGroundedPipelineStatus {
  chainLabel: "Source provider → Generation provider → Citation audit → Policy gate";
  source: PipelineStageStatus;
  generation: PipelineStageStatus;
  citationAudit: PipelineStageStatus;
  policyGate: PipelineStageStatus;
  stages: PipelineStageStatus[];
}

export interface BuildSourceGroundedPipelineStatusInput {
  source: SourceDocument;
  localBrief: DeterministicBrief | null;
}

export function buildSourceGroundedPipelineStatus(
  input: BuildSourceGroundedPipelineStatusInput,
): SourceGroundedPipelineStatus {
  const source = buildSourceStage(input.source);
  const generation = buildGenerationStage(input.localBrief);
  const citationAudit = buildCitationAuditStage(input.localBrief);
  const policyGate = buildPolicyGateStage(input.localBrief);

  return {
    chainLabel: "Source provider → Generation provider → Citation audit → Policy gate",
    source,
    generation,
    citationAudit,
    policyGate,
    stages: [source, generation, citationAudit, policyGate],
  };
}

function buildSourceStage(source: SourceDocument): PipelineStageStatus {
  const fallbackProvider = getFallbackSourceProvider(source);
  const providerName = source.providerName ?? fallbackProvider?.name ?? "Unknown source provider";
  const providerReliability = source.providerReliability ?? fallbackProvider?.reliability ?? "demo";

  return {
    id: "source",
    label: "Source",
    value: `${providerName} · ${providerReliability}`,
    tone: "ready",
  };
}

function buildGenerationStage(localBrief: DeterministicBrief | null): PipelineStageStatus {
  if (!localBrief) {
    return {
      id: "generation",
      label: "Generation",
      value: "not generated yet",
      tone: "pending",
    };
  }

  return {
    id: "generation",
    label: "Generation",
    value: `${localBrief.providerName ?? "Local Deterministic Brief"} · ${localBrief.providerReliability ?? "demo"}`,
    tone: "ready",
  };
}

function buildCitationAuditStage(localBrief: DeterministicBrief | null): PipelineStageStatus {
  if (!localBrief?.citationAudit) {
    return {
      id: "citation-audit",
      label: "Citation audit",
      value: "pending",
      tone: "pending",
    };
  }

  if (!localBrief.citationAudit.passed || localBrief.citationAudit.errorCount > 0) {
    return {
      id: "citation-audit",
      label: "Citation audit",
      value: "failed",
      tone: "blocked",
    };
  }

  if (localBrief.citationAudit.warningCount > 0) {
    return {
      id: "citation-audit",
      label: "Citation audit",
      value: "passed with warnings",
      tone: "warning",
    };
  }

  return {
    id: "citation-audit",
    label: "Citation audit",
    value: "passed",
    tone: "passed",
  };
}

function buildPolicyGateStage(localBrief: DeterministicBrief | null): PipelineStageStatus {
  if (!localBrief?.generationPolicy) {
    return {
      id: "policy-gate",
      label: "Policy gate",
      value: "pending",
      tone: "pending",
    };
  }

  if (!localBrief.generationPolicy.allowedToDisplay) {
    return {
      id: "policy-gate",
      label: "Policy gate",
      value: "blocked",
      tone: "blocked",
    };
  }

  if (localBrief.generationPolicy.warningCount > 0) {
    return {
      id: "policy-gate",
      label: "Policy gate",
      value: "allowed with warnings",
      tone: "warning",
    };
  }

  return {
    id: "policy-gate",
    label: "Policy gate",
    value: "allowed",
    tone: "allowed",
  };
}

function getFallbackSourceProvider(source: SourceDocument) {
  const sourceKind = getSourceProviderKind(source.type, source.providerName);
  return sourceKind ? getActiveSourceProviderForKind(sourceKind) : undefined;
}

function getSourceProviderKind(sourceType: SourceType, providerName?: string): SourceProviderKind | undefined {
  if (providerName === "Manual Transcript") {
    return "manual-transcript";
  }

  if (sourceType === "youtube" || sourceType === "webpage" || sourceType === "pdf") {
    return sourceType;
  }

  if (sourceType === "text") {
    return "manual-transcript";
  }

  return undefined;
}
