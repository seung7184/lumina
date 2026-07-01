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

test("desktop workspace loads and core interactions work", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /People Losing Everything/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "KR" }).click();
  await expect(page.getByRole("heading", { name: /AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들/ })).toBeVisible();

  await page.getByRole("button", { name: "Assistant" }).click();
  await page.getByLabel("Ask anything about this source").fill("What claim needs validation first?");
  await page.getByRole("button", { name: "Send assistant question" }).click();
  await expect(page.getByText(/Mock response queued from this source/)).toBeVisible();

  await page.getByRole("button", { name: "Highlight" }).click();
  await expect(page.getByText("Key claims")).toBeVisible();

  await page.getByRole("button", { name: "Export", exact: true }).click();
  await expect(page.getByRole("menu", { name: "Export options" })).toBeVisible();
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
  await expect(drawer.getByRole("tabpanel", { name: "Source" })).toBeVisible();

  await drawer.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(drawer.getByLabel("Ask anything about this source")).toBeVisible();

  await drawer.getByRole("button", { name: "Highlight", exact: true }).click();
  await expect(drawer.getByText("Key claims")).toBeVisible();

  await page.getByRole("button", { name: "Close context drawer" }).click();
  await expect(page.getByRole("dialog", { name: "Context drawer" })).toBeHidden();
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
