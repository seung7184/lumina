import { expect, type Page, test } from "@playwright/test";

function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
}

async function tabUntilFocused(page: Page, accessibleName: string | RegExp, maxTabs = 60) {
  const target = page.getByRole("button", { name: accessibleName });
  for (let index = 0; index < maxTabs; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement).catch(() => false)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

test("desktop workspace loads and core interactions work", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /People Losing Everything/i })).toBeVisible();
  await expect(page.getByText("AI literacy creates widening outcomes")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await tabUntilFocused(page, "KR");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들/ })).toBeVisible();
  await expect(page.getByText("AI 문해력이 만드는 결과의 격차")).toBeVisible();

  await page.getByRole("tab", { name: "Assistant" }).click();
  await page.getByLabel("Ask anything about this source").fill("What claim needs validation first?");
  await page.getByRole("button", { name: "Send assistant question" }).click();
  await expect(page.getByText(/Mock response queued from this source/)).toBeVisible();

  await page.getByRole("tab", { name: "Highlight" }).click();
  await expect(page.getByText("Key claims")).toBeVisible();

  await page.getByRole("tab", { name: "Source" }).click();
  const sourcePanel = page.getByRole("tabpanel", { name: "Source" });
  await sourcePanel.getByRole("button", { name: "View provider catalog" }).click();
  const providerCatalog = sourcePanel.getByRole("region", { name: "Source provider catalog" });
  await expect(providerCatalog).toBeVisible();
  await expect(providerCatalog.getByText("YouTube mock", { exact: true })).toBeVisible();
  await expect(providerCatalog.getByText("PDF OCR", { exact: true })).toBeVisible();
  await expect(providerCatalog.getByText("Placeholder").first()).toBeVisible();
  await expect(sourcePanel.getByRole("button", { name: "PDF OCR" })).toHaveCount(0);

  const exportButton = page.getByRole("button", { name: "Export", exact: true });
  await expect(exportButton).toHaveAttribute("aria-haspopup", "dialog");
  await exportButton.click();
  await expect(page.getByRole("dialog", { name: "Export options" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close export menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Export options" })).toBeHidden();
  await expect(exportButton).toBeFocused();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("desktop Source tab accepts a local manual transcript paste", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const sourcePanel = page.getByRole("tabpanel", { name: "Source" });
  await sourcePanel.getByRole("button", { name: "Paste manual transcript" }).click();
  await sourcePanel.getByRole("button", { name: "Use manual transcript" }).click();
  await expect(sourcePanel.getByText("Paste transcript text first.")).toBeVisible();

  await sourcePanel.getByLabel("Manual title").fill("Manual fallback source");
  await sourcePanel.getByLabel("Manual language").fill("ko");
  await sourcePanel.getByLabel("Manual transcript text").fill("[00:12] First pasted line\n00:24 - 00:30 Second pasted line");
  await sourcePanel.getByRole("button", { name: "Use manual transcript" }).click();

  await expect(sourcePanel.getByText("Ready. Manual Transcript loaded 2 segments with 2 citations.")).toBeVisible();
  await expect(sourcePanel.getByText("Provider: Manual Transcript · experimental reliability")).toBeVisible();
  await expect(sourcePanel.getByText("First pasted line")).toBeVisible();
  await expect(page.getByText("AI literacy creates widening outcomes")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("desktop Source tab loads mock webpage and PDF boundaries", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const sourcePanel = page.getByRole("tabpanel", { name: "Source" });

  await sourcePanel.getByRole("button", { name: "Use mock webpage" }).click();
  await expect(sourcePanel.getByText("Enter a webpage URL first.")).toBeVisible();

  await sourcePanel.getByLabel("Mock webpage URL").fill("https://example.com/articles/lumina-boundary");
  await sourcePanel.getByLabel("Mock webpage title").fill("Lumina Boundary Notes");
  await sourcePanel.getByRole("button", { name: "Use mock webpage" }).click();
  await expect(sourcePanel.getByText("Ready. Mock Webpage loaded 3 segments with 3 citations.")).toBeVisible();
  await expect(sourcePanel.getByText("Segments: 3")).toBeVisible();
  await expect(sourcePanel.getByText("Citations: 3")).toBeVisible();
  await expect(sourcePanel.getByText("This mock webpage boundary represents a future article source without fetching the live page.")).toBeVisible();

  await sourcePanel.getByLabel("Mock PDF filename").fill("lumina-boundary.pdf");
  await sourcePanel.getByRole("button", { name: "Use mock PDF" }).click();
  await expect(sourcePanel.getByText("Ready. Mock PDF loaded 3 segments with 3 citations.")).toBeVisible();
  await expect(sourcePanel.getByText("Mock PDF boundary only; no PDF bytes were parsed.")).toBeVisible();
  await expect(sourcePanel.getByText("This mock PDF boundary represents a future uploaded or linked document source.")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("desktop workspace generates and resets a local deterministic brief", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await page.getByRole("button", { name: "Generate local brief" }).click();
  const brief = page.getByRole("region", { name: "Local source-grounded brief" });
  await expect(brief).toBeVisible();
  await expect(brief.getByRole("heading", { name: "Local source-grounded brief" })).toBeVisible();
  await expect(brief.getByText("Provider: Local Deterministic Brief · demo · No AI model used")).toBeVisible();
  await expect(brief.getByText("Citation audit: passed · 0 errors · 0 warnings")).toBeVisible();
  await expect(brief.getByText("Generation policy: allowed · source-grounded display enabled")).toBeVisible();
  await expect(brief.getByText("Evidence cards")).toBeVisible();
  await expect(brief.getByText("Brief blocks")).toBeVisible();
  await expect(brief.getByRole("link", { name: "Citation 1" }).first()).toBeVisible();
  await expect(page.getByText(/AI confidence/i)).toHaveCount(0);

  const sourcePanel = page.getByRole("tabpanel", { name: "Source" });
  await sourcePanel.getByLabel("Mock webpage URL").fill("https://example.com/articles/local-brief-reset");
  await sourcePanel.getByLabel("Mock webpage title").fill("Local Brief Reset");
  await sourcePanel.getByRole("button", { name: "Use mock webpage" }).click();
  await expect(sourcePanel.getByText("Ready. Mock Webpage loaded 3 segments with 3 citations.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Local source-grounded brief" })).toHaveCount(0);

  await page.getByRole("button", { name: "Generate local brief" }).click();
  const regeneratedBrief = page.getByRole("region", { name: "Local source-grounded brief" });
  await expect(regeneratedBrief).toBeVisible();
  await expect(
    regeneratedBrief.getByText("This mock webpage boundary represents a future article source without fetching the live page.").first(),
  ).toBeVisible();
  await expect(regeneratedBrief.getByText("Citation audit: passed · 0 errors · 0 warnings")).toBeVisible();
  await expect(regeneratedBrief.getByText("Generation policy: allowed · source-grounded display enabled")).toBeVisible();
  await expect(regeneratedBrief.getByRole("link", { name: "Citation 1" }).first()).toBeVisible();

  await sourcePanel.getByLabel("Mock PDF filename").fill("lumina-boundary.pdf");
  await sourcePanel.getByRole("button", { name: "Use mock PDF" }).click();
  await expect(sourcePanel.getByText("Ready. Mock PDF loaded 3 segments with 3 citations.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Local source-grounded brief" })).toHaveCount(0);

  await page.getByRole("button", { name: "Generate local brief" }).click();
  const pdfBrief = page.getByRole("region", { name: "Local source-grounded brief" });
  await expect(pdfBrief).toBeVisible();
  await expect(pdfBrief.getByText("Citation audit: passed · 0 errors · 0 warnings")).toBeVisible();
  await expect(pdfBrief.getByText("Generation policy: allowed · source-grounded display enabled")).toBeVisible();
  await expect(pdfBrief.getByText("This mock PDF boundary represents a future uploaded or linked document source.").first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("tablet context drawer opens Source, Assistant, and Highlight without scrolling to document bottom", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Open Source context" }).click();
  const drawer = page.getByRole("dialog", { name: "Context drawer" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Close context drawer" })).toBeFocused();
  await expect(drawer.getByRole("tabpanel", { name: "Source" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("tab", { name: "Source" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(drawer.getByRole("tab", { name: "Assistant" })).toBeFocused();
  await expect(drawer.getByRole("tabpanel", { name: "Assistant" })).toBeVisible();

  await drawer.getByRole("tab", { name: "Assistant" }).click();
  await expect(drawer.getByLabel("Ask anything about this source")).toBeVisible();

  await drawer.getByRole("tab", { name: "Highlight" }).click();
  await expect(drawer.getByText("Key claims")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Context drawer" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open Source context" })).toBeFocused();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("mobile context sheet opens and closes from the sticky context bar", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Open Assistant context" }).click();
  const sheet = page.getByRole("dialog", { name: "Context drawer" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Close context drawer" })).toBeFocused();
  await sheet.getByLabel("Ask anything about this source").fill("Summarize the first claim.");
  await sheet.getByRole("button", { name: "Send assistant question" }).click();
  await expect(sheet.getByText(/Mock response queued from this source/)).toBeVisible();

  await page.getByRole("button", { name: "Close context drawer" }).click();
  await expect(page.getByRole("dialog", { name: "Context drawer" })).toBeHidden();

  await page.getByRole("button", { name: "Open Highlight context" }).click();
  await expect(page.getByRole("dialog", { name: "Context drawer" }).getByText("Key claims")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Context drawer" })).toBeHidden();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("major breakpoints do not introduce horizontal overflow", async ({ page }) => {
  for (const width of [1280, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/");
    await expectNoHorizontalOverflow(page);
  }
});
