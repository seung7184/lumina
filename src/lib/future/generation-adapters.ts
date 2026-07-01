import { generateDeterministicBrief, type GenerateDeterministicBriefInput } from "@/lib/future/brief-generator";
import {
  getGenerationProviderById,
  type GenerationProviderDescriptor,
} from "@/lib/future/generation-provider-registry";
import type { DeterministicBrief } from "@/lib/types/workspace";

export type GenerationAdapterKind = "local-deterministic" | "disabled-placeholder";

export type GenerationAdapterResult =
  | {
      ok: true;
      providerId: string;
      brief: DeterministicBrief;
    }
  | {
      ok: false;
      providerId: string;
      code: "GENERATION_PROVIDER_NOT_FOUND" | "GENERATION_PROVIDER_DISABLED";
      message: string;
    };

export interface GenerationAdapter {
  providerId: string;
  kind: GenerationAdapterKind;
  canExecute: boolean;
  execute(input: GenerateDeterministicBriefInput): GenerationAdapterResult;
}

export function resolveGenerationAdapter(providerId: string): GenerationAdapter {
  const provider = getGenerationProviderById(providerId);

  if (!provider) {
    return createMissingProviderAdapter(providerId);
  }

  if (isExecutableLocalProvider(provider)) {
    return createLocalDeterministicAdapter(provider);
  }

  return createDisabledProviderAdapter(provider);
}

export function executeGenerationAdapter(
  providerId: string,
  input: GenerateDeterministicBriefInput,
): GenerationAdapterResult {
  return resolveGenerationAdapter(providerId).execute(input);
}

function createLocalDeterministicAdapter(provider: GenerationProviderDescriptor): GenerationAdapter {
  return {
    providerId: provider.id,
    kind: "local-deterministic",
    canExecute: true,
    execute(input) {
      return {
        ok: true,
        providerId: provider.id,
        brief: generateDeterministicBrief(input),
      };
    },
  };
}

function createDisabledProviderAdapter(provider: GenerationProviderDescriptor): GenerationAdapter {
  return {
    providerId: provider.id,
    kind: "disabled-placeholder",
    canExecute: false,
    execute() {
      return {
        ok: false,
        providerId: provider.id,
        code: "GENERATION_PROVIDER_DISABLED",
        message: `${provider.name} is a disabled placeholder and cannot execute generation.`,
      };
    },
  };
}

function createMissingProviderAdapter(providerId: string): GenerationAdapter {
  return {
    providerId,
    kind: "disabled-placeholder",
    canExecute: false,
    execute() {
      return {
        ok: false,
        providerId,
        code: "GENERATION_PROVIDER_NOT_FOUND",
        message: "Generation provider was not found.",
      };
    },
  };
}

function isExecutableLocalProvider(provider: GenerationProviderDescriptor) {
  return (
    provider.id === "local-deterministic-brief" &&
    provider.kind === "local-deterministic" &&
    provider.availability === "active" &&
    !provider.usesAi &&
    !provider.requiresNetwork &&
    !provider.requiresApiKey &&
    !provider.requiresModel &&
    !provider.usesEmbeddings &&
    !provider.usesVectorSearch &&
    !provider.storesUserData &&
    provider.isDeterministic
  );
}
