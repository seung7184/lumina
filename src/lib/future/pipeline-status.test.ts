import { describe, expect, it } from "vitest";
import { generateDeterministicBrief } from "@/lib/future/brief-generator";
import { buildSourceGroundedPipelineStatus } from "@/lib/future/pipeline-status";
import { luminaDemo } from "@/lib/mock/lumina-demo";
import type { SourceDocument } from "@/lib/types/workspace";

describe("buildSourceGroundedPipelineStatus", () => {
  it("marks generation, citation audit, and policy gate as pending before a local brief exists", () => {
    const status = buildSourceGroundedPipelineStatus({
      source: luminaDemo.source,
      localBrief: null,
    });

    expect(status.chainLabel).toBe("Source provider → Generation provider → Citation audit → Policy gate");
    expect(status.source).toMatchObject({
      label: "Source",
      value: "Mock YouTube Transcript · demo",
      tone: "ready",
    });
    expect(status.generation).toMatchObject({
      label: "Generation",
      value: "not generated yet",
      tone: "pending",
    });
    expect(status.citationAudit).toMatchObject({
      label: "Citation audit",
      value: "pending",
      tone: "pending",
    });
    expect(status.policyGate).toMatchObject({
      label: "Policy gate",
      value: "pending",
      tone: "pending",
    });
  });

  it("reports generation, citation audit, and policy gate status after local brief generation", () => {
    const localBrief = generateDeterministicBrief({
      source: luminaDemo.source,
      segments: luminaDemo.segments,
      citations: luminaDemo.summaries.en.citations,
    });

    const status = buildSourceGroundedPipelineStatus({
      source: luminaDemo.source,
      localBrief,
    });

    expect(status.source.value).toBe("Mock YouTube Transcript · demo");
    expect(status.generation).toMatchObject({
      label: "Generation",
      value: "Local Deterministic Brief · demo",
      tone: "ready",
    });
    expect(status.citationAudit).toMatchObject({
      value: "passed",
      tone: "passed",
    });
    expect(status.policyGate).toMatchObject({
      value: "allowed",
      tone: "allowed",
    });
    expect(status.stages.map((stage) => `${stage.label}: ${stage.value}`)).toEqual([
      "Source: Mock YouTube Transcript · demo",
      "Generation: Local Deterministic Brief · demo",
      "Citation audit: passed",
      "Policy gate: allowed",
    ]);
  });

  it("returns local brief status to not generated after a source replacement clears the brief", () => {
    const webpageSource: SourceDocument = {
      ...luminaDemo.source,
      id: "src-webpage-boundary",
      type: "webpage",
      providerName: "Mock Webpage",
      providerReliability: "demo",
    };

    const status = buildSourceGroundedPipelineStatus({
      source: webpageSource,
      localBrief: null,
    });

    expect(status.source.value).toBe("Mock Webpage · demo");
    expect(status.generation.value).toBe("not generated yet");
    expect(status.citationAudit.value).toBe("pending");
    expect(status.policyGate.value).toBe("pending");
  });
});
