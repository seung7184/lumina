import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResearchDocument } from "./ResearchDocument";
import { WorkspaceShell } from "./WorkspaceShell";
import { generateDeterministicBrief } from "@/lib/future/brief-generator";
import { luminaDemo } from "@/lib/mock/lumina-demo";
import type { DeterministicBrief } from "@/lib/types/workspace";

describe("WorkspaceShell", () => {
  it("renders the canonical Lumina workspace and updates local UI state", () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    expect(
      screen.getByRole("heading", {
        name: /People Losing Everything to AI vs People Whose Time Becomes Infinite/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /workspace navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("main", { name: /workspace document/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /research document/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /context panel/i })).toBeInTheDocument();
    expect(screen.getByText("AI literacy creates widening outcomes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "KR" }));
    expect(
      screen.getByRole("heading", {
        name: /AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Assistant" }));
    expect(screen.getByText("Validate this idea")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Explain more simply/i }));
    expect(screen.getByLabelText(/Ask anything about this source/i)).toHaveValue(
      "Turn the idea into one plain-language explanation.",
    );
    fireEvent.click(screen.getByRole("button", { name: /Send assistant question/i }));
    expect(screen.getByText(/Mock response queued from this source/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Highlight" }));
    expect(screen.getByText("Needs validation")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Source" }));
    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });
    expect(within(sourcePanel).getByText(/7 segments/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: /Translate transcript/i }));
    expect(screen.queryByText(/AI knowledge is severely lacking right now/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    const exportDialog = screen.getByRole("dialog", { name: /Export options/i });
    expect(within(exportDialog).getByText("Markdown")).toBeInTheDocument();
    fireEvent.click(within(exportDialog).getByRole("radio", { name: /Slides/i }));
    expect(within(exportDialog).getByRole("radio", { name: /Slides/i })).toBeChecked();
    fireEvent.click(within(exportDialog).getByRole("button", { name: /링크 복사|Copy link/i }));
    expect(screen.getAllByText(/목업 공유 링크를 복사했습니다|Mock share link copied/i).length).toBeGreaterThan(0);
  });

  it("loads the deterministic mock YouTube ingestion result from the Source tab", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });
    const sourceInput = within(sourcePanel).getByLabelText("Try source URL");

    fireEvent.change(sourceInput, { target: { value: "https://youtu.be/511ctokiROU?t=123s" } });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Ingest source URL" }));

    expect(
      await within(sourcePanel).findByText("Ready. Mock YouTube Transcript loaded 7 segments with 7 citations."),
    ).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Provider: Mock YouTube Transcript · demo reliability")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Segments: 7")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Citations: 7")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Translation is not available for every segment yet.")).toBeInTheDocument();
  });

  it("renders a read-only provider catalog in the Source tab", () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });
    const catalogToggle = within(sourcePanel).getByRole("button", { name: "View provider catalog" });

    expect(catalogToggle).toHaveAttribute("aria-expanded", "false");
    expect(within(sourcePanel).queryByText("Future placeholders")).not.toBeInTheDocument();

    fireEvent.click(catalogToggle);

    expect(catalogToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(sourcePanel).getByRole("region", { name: "Source provider catalog" })).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Active providers")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("YouTube mock")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Manual")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Web mock")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("PDF mock")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Future placeholders")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("YouTube captions")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Web extraction")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("PDF extraction")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("PDF OCR")).toBeInTheDocument();
    expect(within(sourcePanel).getAllByText("Placeholder").length).toBeGreaterThanOrEqual(4);
    expect(within(sourcePanel).queryByRole("button", { name: "PDF OCR" })).not.toBeInTheDocument();
  });

  it("shows calm Source-tab feedback for unsupported ingestion URLs", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });

    fireEvent.change(within(sourcePanel).getByLabelText("Try source URL"), {
      target: { value: "https://example.com/watch?v=511ctokiROU" },
    });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Ingest source URL" }));

    expect(await within(sourcePanel).findByText("Only YouTube URLs are supported in this ingestion slice.")).toBeInTheDocument();
  });

  it("shows calm Source-tab feedback for invalid and unavailable transcripts", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });
    const sourceInput = within(sourcePanel).getByLabelText("Try source URL");
    const submit = within(sourcePanel).getByRole("button", { name: "Ingest source URL" });

    fireEvent.change(sourceInput, { target: { value: "not a url" } });
    fireEvent.click(submit);
    expect(await within(sourcePanel).findByText("Enter a valid YouTube URL.")).toBeInTheDocument();

    fireEvent.change(sourceInput, { target: { value: "https://www.youtube.com/watch?v=notTheSample" } });
    fireEvent.click(submit);
    expect(
      await within(sourcePanel).findByText(
        "This source was recognized, but no transcript is available yet. You can paste a manual transcript below.",
      ),
    ).toBeInTheDocument();
  });

  it("loads a pasted manual transcript from the Source tab without regenerating the summary", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });

    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Paste manual transcript" }));
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use manual transcript" }));
    expect(await within(sourcePanel).findByText("Paste transcript text first.")).toBeInTheDocument();

    fireEvent.change(within(sourcePanel).getByLabelText("Manual title"), {
      target: { value: "Manual fallback source" },
    });
    fireEvent.change(within(sourcePanel).getByLabelText("Manual language"), {
      target: { value: "ko" },
    });
    fireEvent.change(within(sourcePanel).getByLabelText("Manual transcript text"), {
      target: {
        value: "[00:12] First pasted line\n00:24 - 00:30 Second pasted line",
      },
    });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use manual transcript" }));

    expect(
      await within(sourcePanel).findByText("Ready. Manual Transcript loaded 2 segments with 2 citations."),
    ).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Provider: Manual Transcript · experimental reliability")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Segments: 2")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Citations: 2")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Translation is not available for manual transcript segments yet.")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("First pasted line")).toBeInTheDocument();
    expect(screen.getByText("AI literacy creates widening outcomes")).toBeInTheDocument();
  });

  it("loads a deterministic mock webpage boundary from the Source tab", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });

    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use mock webpage" }));
    expect(await within(sourcePanel).findByText("Enter a webpage URL first.")).toBeInTheDocument();

    fireEvent.change(within(sourcePanel).getByLabelText("Mock webpage URL"), {
      target: { value: "https://example.com/articles/lumina-boundary" },
    });
    fireEvent.change(within(sourcePanel).getByLabelText("Mock webpage title"), {
      target: { value: "Lumina Boundary Notes" },
    });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use mock webpage" }));

    expect(await within(sourcePanel).findByText("Ready. Mock Webpage loaded 3 segments with 3 citations.")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Provider: Mock Webpage · demo reliability")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Segments: 3")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Citations: 3")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("This mock webpage boundary represents a future article source without fetching the live page.")).toBeInTheDocument();
    expect(screen.getByText("AI literacy creates widening outcomes")).toBeInTheDocument();
  });

  it("loads a deterministic mock PDF boundary from the Source tab with warnings", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });

    fireEvent.change(within(sourcePanel).getByLabelText("Mock PDF filename"), {
      target: { value: "lumina-boundary.pdf" },
    });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use mock PDF" }));

    expect(await within(sourcePanel).findByText("Ready. Mock PDF loaded 3 segments with 3 citations.")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Provider: Mock PDF · demo reliability")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Segments: 3")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Citations: 3")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Mock PDF boundary only; no PDF bytes were parsed.")).toBeInTheDocument();
    expect(within(sourcePanel).getByText("This mock PDF boundary represents a future uploaded or linked document source.")).toBeInTheDocument();
  });

  it("generates a local deterministic brief with evidence, brief blocks, and citations", () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    expect(screen.getByRole("button", { name: "Generate local brief" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate local brief" }));

    const brief = screen.getByRole("region", { name: "Local source-grounded brief" });
    expect(within(brief).getByRole("heading", { name: "Local source-grounded brief" })).toBeInTheDocument();
    expect(within(brief).getByText("Generated from current source segments · no AI model used")).toBeInTheDocument();
    expect(within(brief).getByText("Provider: Local Deterministic Brief · demo · No AI model used")).toBeInTheDocument();
    expect(within(brief).getByText("Citation audit: passed · 0 errors · 0 warnings")).toBeInTheDocument();
    expect(within(brief).getByText("Generation policy: allowed · source-grounded display enabled")).toBeInTheDocument();
    expect(within(brief).getByText("Evidence cards")).toBeInTheDocument();
    expect(within(brief).getByText("Brief blocks")).toBeInTheDocument();
    expect(within(brief).getAllByText(/AI knowledge is severely lacking right now/i).length).toBeGreaterThan(0);
    expect(within(brief).getAllByText(/Source-backed point:/i).length).toBeGreaterThan(0);
    expect(within(brief).getAllByRole("link", { name: "Citation 1" }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/AI confidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI analyzed/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /OpenAI brief|Anthropic brief|Gemini brief/i })).not.toBeInTheDocument();
  });

  it("clears the local brief when a mock webpage or PDF source replaces the active source", async () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    fireEvent.click(screen.getByRole("button", { name: "Generate local brief" }));
    expect(screen.getByRole("region", { name: "Local source-grounded brief" })).toBeInTheDocument();

    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });
    fireEvent.change(within(sourcePanel).getByLabelText("Mock webpage URL"), {
      target: { value: "https://example.com/articles/lumina-boundary" },
    });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use mock webpage" }));

    expect(await within(sourcePanel).findByText("Ready. Mock Webpage loaded 3 segments with 3 citations.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Local source-grounded brief" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Generate local brief" }));
    let brief = screen.getByRole("region", { name: "Local source-grounded brief" });
    expect(brief).toBeInTheDocument();
    expect(within(brief).getByText("Citation audit: passed · 0 errors · 0 warnings")).toBeInTheDocument();
    expect(within(brief).getByText("Generation policy: allowed · source-grounded display enabled")).toBeInTheDocument();
    expect(
      within(brief).getAllByText("This mock webpage boundary represents a future article source without fetching the live page.").length,
    ).toBeGreaterThan(0);

    fireEvent.change(within(sourcePanel).getByLabelText("Mock PDF filename"), {
      target: { value: "lumina-boundary.pdf" },
    });
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "Use mock PDF" }));

    expect(await within(sourcePanel).findByText("Ready. Mock PDF loaded 3 segments with 3 citations.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Local source-grounded brief" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Generate local brief" }));
    brief = screen.getByRole("region", { name: "Local source-grounded brief" });
    expect(brief).toBeInTheDocument();
    expect(within(brief).getByText("Citation audit: passed · 0 errors · 0 warnings")).toBeInTheDocument();
    expect(within(brief).getByText("Generation policy: allowed · source-grounded display enabled")).toBeInTheDocument();
    expect(
      within(brief).getAllByText("This mock PDF boundary represents a future uploaded or linked document source.").length,
    ).toBeGreaterThan(0);
  });

  it("blocks normal local brief rendering when generation policy has errors", () => {
    const generatedBrief = generateDeterministicBrief({
      source: luminaDemo.source,
      segments: luminaDemo.segments,
      citations: luminaDemo.summaries.en.citations,
    });
    const blockedBrief: DeterministicBrief = {
      ...generatedBrief,
      generationPolicy: {
        id: "policy-blocked-test",
        briefId: generatedBrief.id,
        providerId: generatedBrief.providerId,
        allowedToDisplay: false,
        allowedToUseAsSourceGrounded: false,
        issueCount: 1,
        errorCount: 1,
        warningCount: 0,
        issues: [
          {
            id: "policy-blocked-test-issue-1",
            code: "PROVIDER_USES_AI",
            severity: "error",
            message: "Generation provider uses AI and cannot be treated as local deterministic output.",
            targetType: "provider",
            targetId: generatedBrief.providerId,
          },
        ],
      },
    };

    render(
      <ResearchDocument
        activeModeId="summary"
        language="en"
        reportModes={luminaDemo.reportModes}
        source={luminaDemo.source}
        summary={luminaDemo.summaries.en}
        localBrief={blockedBrief}
        visualsEnabled
        onGenerateLocalBrief={() => undefined}
        onLanguageChange={() => undefined}
        onMockAction={() => undefined}
        onReportModeChange={() => undefined}
      />,
    );

    const brief = screen.getByRole("region", { name: "Local source-grounded brief" });
    expect(within(brief).getByText("Generation policy: blocked · source-grounded display disabled")).toBeInTheDocument();
    expect(
      within(brief).getByText("Generated output is blocked by policy until citation/provider issues are resolved."),
    ).toBeInTheDocument();
    expect(within(brief).getByText("Generation provider uses AI and cannot be treated as local deterministic output.")).toBeInTheDocument();
    expect(within(brief).queryByText("Evidence cards")).not.toBeInTheDocument();
    expect(within(brief).queryByText("Brief blocks")).not.toBeInTheDocument();
  });
});
