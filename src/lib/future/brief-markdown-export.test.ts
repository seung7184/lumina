import { describe, expect, it } from "vitest";
import { exportEvidenceCardsMarkdown, exportLocalBriefMarkdown } from "@/lib/future/brief-markdown-export";
import { generateDeterministicBrief } from "@/lib/future/brief-generator";
import { luminaDemo } from "@/lib/mock/lumina-demo";
import type { DeterministicBrief } from "@/lib/types/workspace";

function generatedBrief() {
  return generateDeterministicBrief({
    source: luminaDemo.source,
    segments: luminaDemo.segments,
    citations: luminaDemo.summaries.en.citations,
  });
}

describe("brief Markdown export", () => {
  it("exports a source-grounded local brief with provider, audit, policy, evidence, blocks, and citations", () => {
    const result = exportLocalBriefMarkdown({
      brief: generatedBrief(),
      source: luminaDemo.source,
      citations: luminaDemo.summaries.en.citations,
    });

    expect(result.allowed).toBe(true);
    if (!result.allowed) {
      throw new Error(result.reason);
    }

    expect(result.markdown).toContain("# Local source-grounded brief");
    expect(result.markdown).toContain("Provider: Local Deterministic Brief · demo");
    expect(result.markdown).toContain("Citation audit: passed · 0 errors · 0 warnings");
    expect(result.markdown).toContain("Generation policy: allowed · source-grounded display enabled");
    expect(result.markdown).toContain("Note: local deterministic draft, no AI model used.");
    expect(result.markdown).toContain("## Evidence cards");
    expect(result.markdown).toContain("## Brief blocks");
    expect(result.markdown).toContain("[Citation 1 (c1)]");
    expect(result.markdown).toContain(`- Citation 1 (c1): source ${luminaDemo.source.id}; segments seg-00`);
    expect(result.markdown).not.toContain(luminaDemo.source.url);
  });

  it("exports evidence cards as Markdown using existing citation labels and IDs", () => {
    const result = exportEvidenceCardsMarkdown({
      brief: generatedBrief(),
      source: luminaDemo.source,
      citations: luminaDemo.summaries.en.citations,
    });

    expect(result.allowed).toBe(true);
    if (!result.allowed) {
      throw new Error(result.reason);
    }

    expect(result.scope).toBe("evidence");
    expect(result.markdown).toContain("# Evidence cards for Local source-grounded brief");
    expect(result.markdown).toContain("## Evidence cards");
    expect(result.markdown).not.toContain("## Brief blocks");
    expect(result.markdown).toContain("[Citation 1 (c1)]");
    expect(result.markdown).toContain("Source segments: seg-00");
    expect(result.markdown).not.toContain("https://");
  });

  it("blocks Markdown export when generation policy blocks display", () => {
    const brief = generatedBrief();
    const blockedBrief: DeterministicBrief = {
      ...brief,
      generationPolicy: {
        id: "policy-blocked-export",
        briefId: brief.id,
        providerId: brief.providerId,
        allowedToDisplay: false,
        allowedToUseAsSourceGrounded: false,
        issueCount: 1,
        errorCount: 1,
        warningCount: 0,
        issues: [
          {
            id: "policy-blocked-export-issue-1",
            code: "PROVIDER_USES_AI",
            severity: "error",
            message: "Generation provider uses AI and cannot be treated as local deterministic output.",
            targetType: "provider",
            targetId: brief.providerId,
          },
        ],
      },
    };

    expect(
      exportLocalBriefMarkdown({
        brief: blockedBrief,
        source: luminaDemo.source,
        citations: luminaDemo.summaries.en.citations,
      }),
    ).toEqual({
      allowed: false,
      reason: "Copy export is unavailable while generation policy blocks display.",
      scope: "brief",
    });
  });

  it("blocks Markdown export until a local brief exists", () => {
    expect(
      exportLocalBriefMarkdown({
        brief: null,
        source: luminaDemo.source,
        citations: luminaDemo.summaries.en.citations,
      }),
    ).toEqual({
      allowed: false,
      reason: "Generate a local source-grounded brief before copying Markdown.",
      scope: "brief",
    });
  });
});
