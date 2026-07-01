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

async function openWorkspace(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /People Losing Everything/i })).toBeVisible();
}

test.describe("automated accessibility audit", () => {
  test("desktop workspace has no axe violations", async ({ page }) => {
    await openWorkspace(page, 1440, 900);

    await expectAxeClean(page);
  });

  test("tablet context drawer has no axe violations", async ({ page }) => {
    await openWorkspace(page, 1024, 900);

    await page.getByRole("button", { name: "Open Source context" }).click();
    await expect(page.getByRole("dialog", { name: "Context drawer" })).toBeVisible();

    await expectAxeClean(page);
  });

  test("mobile context sheet has no axe violations", async ({ page }) => {
    await openWorkspace(page, 390, 844);

    await page.getByRole("button", { name: "Open Assistant context" }).click();
    await expect(page.getByRole("dialog", { name: "Context drawer" })).toBeVisible();

    await expectAxeClean(page);
  });

  test("export menu open state has no axe violations", async ({ page }) => {
    await openWorkspace(page, 1280, 900);

    await page.getByRole("button", { name: "Export", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Export options" })).toBeVisible();

    await expectAxeClean(page);
  });

  test("assistant tab and composer state has no axe violations", async ({ page }) => {
    await openWorkspace(page, 1280, 900);

    await page.getByRole("tab", { name: "Assistant" }).click();
    await page.getByLabel("Ask anything about this source").fill("What claim needs validation first?");

    await expectAxeClean(page);
  });

  test("Korean language state has no axe violations", async ({ page }) => {
    await openWorkspace(page, 1280, 900);

    await page.getByRole("button", { name: "KR" }).click();
    await expect(page.getByRole("heading", { name: /AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들/ })).toBeVisible();

    await expectAxeClean(page);
  });
});
