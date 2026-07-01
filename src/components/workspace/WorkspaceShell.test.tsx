import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceShell } from "./WorkspaceShell";
import { luminaDemo } from "@/lib/mock/lumina-demo";

describe("WorkspaceShell", () => {
  it("renders the canonical Lumina workspace and updates local UI state", () => {
    render(<WorkspaceShell demo={luminaDemo} />);

    expect(
      screen.getByRole("heading", {
        name: /People Losing Everything to AI vs People Whose Time Becomes Infinite/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /workspace navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("main", { name: /research document/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /context panel/i })).toBeInTheDocument();
    expect(screen.getByText("AI literacy creates widening outcomes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "KR" }));
    expect(
      screen.getByRole("heading", {
        name: /AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Assistant" }));
    expect(screen.getByText("Validate this idea")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Explain more simply/i }));
    expect(screen.getByLabelText(/Ask anything about this source/i)).toHaveValue(
      "Turn the idea into one plain-language explanation.",
    );
    fireEvent.click(screen.getByRole("button", { name: /Send assistant question/i }));
    expect(screen.getByText(/Mock response queued from this source/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Highlight" }));
    expect(screen.getByText("Needs validation")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    const sourcePanel = screen.getByRole("tabpanel", { name: /Source/i });
    expect(within(sourcePanel).getByText(/7 segments/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: /Translate transcript/i }));
    expect(screen.queryByText(/AI knowledge is severely lacking right now/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    const menu = screen.getByRole("menu", { name: /Export options/i });
    expect(within(menu).getByText("Markdown")).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("radio", { name: /Slides/i }));
    expect(within(menu).getByRole("radio", { name: /Slides/i })).toBeChecked();
    fireEvent.click(within(menu).getByRole("button", { name: /링크 복사|Copy link/i }));
    expect(screen.getAllByText(/목업 공유 링크를 복사했습니다|Mock share link copied/i).length).toBeGreaterThan(0);
  });
});
