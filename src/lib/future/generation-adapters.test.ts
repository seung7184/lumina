import { describe, expect, it } from "vitest";
import { executeGenerationAdapter, resolveGenerationAdapter } from "@/lib/future/generation-adapters";
import { evaluateGenerationPolicy } from "@/lib/future/generation-policy-gate";
import { getGenerationProviderById } from "@/lib/future/generation-provider-registry";
import { luminaDemo } from "@/lib/mock/lumina-demo";
import type { GenerationPolicyIssueCode } from "@/lib/types/workspace";

const generationInput = {
  source: luminaDemo.source,
  segments: luminaDemo.segments,
  citations: luminaDemo.summaries.en.citations,
};

describe("generation adapters", () => {
  it("resolves only the active local deterministic adapter as executable", () => {
    const adapter = resolveGenerationAdapter("local-deterministic-brief");

    expect(adapter).toMatchObject({
      providerId: "local-deterministic-brief",
      kind: "local-deterministic",
      canExecute: true,
    });

    const result = adapter.execute(generationInput);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(result.brief.generatedBy).toBe("local-deterministic");
    expect(result.brief.providerId).toBe("local-deterministic-brief");
    expect(result.brief.generationPolicy).toMatchObject({
      allowedToDisplay: true,
      allowedToUseAsSourceGrounded: true,
    });
  });

  it("returns disabled adapter results for future AI provider placeholders", () => {
    const adapter = resolveGenerationAdapter("future-openai-structured-brief");
    const result = adapter.execute(generationInput);

    expect(adapter).toMatchObject({
      providerId: "future-openai-structured-brief",
      kind: "disabled-placeholder",
      canExecute: false,
    });
    expect(result).toEqual({
      ok: false,
      providerId: "future-openai-structured-brief",
      code: "GENERATION_PROVIDER_DISABLED",
      message: "Future OpenAI Structured Brief is a disabled placeholder and cannot execute generation.",
    });
  });

  it("returns a safe disabled result for missing providers", () => {
    expect(executeGenerationAdapter("missing-provider", generationInput)).toEqual({
      ok: false,
      providerId: "missing-provider",
      code: "GENERATION_PROVIDER_NOT_FOUND",
      message: "Generation provider was not found.",
    });
  });

  it("keeps future AI providers blocked by the generation policy gate", () => {
    const localResult = executeGenerationAdapter("local-deterministic-brief", generationInput);

    expect(localResult.ok).toBe(true);
    if (!localResult.ok) {
      throw new Error(localResult.message);
    }

    const futureProvider = getGenerationProviderById("future-openai-structured-brief");
    const policy = evaluateGenerationPolicy({
      brief: {
        ...localResult.brief,
        providerId: "future-openai-structured-brief",
        providerName: "Future OpenAI Structured Brief",
      },
      provider: futureProvider,
    });

    expect(policy.allowedToDisplay).toBe(false);
    expect(policy.allowedToUseAsSourceGrounded).toBe(false);
    expect(policy.issues.map((issue) => issue.code as GenerationPolicyIssueCode)).toEqual([
      "PROVIDER_NOT_ACTIVE",
      "PROVIDER_USES_AI",
      "PROVIDER_NOT_LOCAL_ONLY",
      "PROVIDER_NOT_DETERMINISTIC",
    ]);
  });
});
