import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const details = results.violations
    .map(
      (violation) =>
        `${violation.id}: ${violation.help}\n${violation.nodes
          .map((node) => `  - ${node.target.join(", ")}: ${node.failureSummary ?? "No failure summary"}`)
          .join("\n")}`,
    )
    .join("\n\n");

  expect(results.violations.length, details).toBe(0);
}

async function mockAI(page: Page) {
  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        content: "Lumina converts raw meeting notes into cited decision briefs [0].",
        template: "executive-brief",
        language: "en",
        segmentCount: 1,
        sourceTitle: "Nova Source",
      }),
    });
  });
}

async function openCleanWorkspace(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await mockAI(page);
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/workspace");
  await expect(page.getByRole("heading", { name: "Welcome to Lumina" })).toBeVisible();
}

async function addTextSource(page: Page) {
  await page.getByRole("button", { name: "Text" }).click();
  await page.getByPlaceholder("Paste text content...").fill("Nova source says Lumina converts raw meeting notes into cited decision briefs.");
  await page.getByRole("button", { name: "Add source" }).click();
  await expect(page.getByText(/Source loaded: 1 segments extracted/)).toBeVisible();
}

test.describe("automated accessibility audit", () => {
  test("empty desktop workspace has no axe violations", async ({ page }) => {
    await openCleanWorkspace(page, 1440, 900);

    await expectAxeClean(page);
  });

  test("desktop workspace with source has no axe violations", async ({ page }) => {
    await openCleanWorkspace(page, 1280, 900);
    await addTextSource(page);

    await expectAxeClean(page);
  });

  test("desktop generated brief has no axe violations", async ({ page }) => {
    await openCleanWorkspace(page, 1280, 900);
    await addTextSource(page);
    await page.getByRole("button", { name: "Use at Work" }).click();
    await expect(page.getByRole("heading", { name: "Executive Brief" })).toBeVisible();

    await expectAxeClean(page);
  });

  test("mobile stacked workspace has no axe violations", async ({ page }) => {
    await openCleanWorkspace(page, 390, 844);
    await addTextSource(page);

    await expectAxeClean(page);
  });
});
