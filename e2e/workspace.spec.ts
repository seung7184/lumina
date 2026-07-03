import { expect, type Page, test } from "@playwright/test";

function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Download the React DevTools")) {
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

async function mockAI(page: Page) {
  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        content: [
          "**Executive Brief**",
          "",
          "Lumina converts raw meeting notes into cited decision briefs [0].",
          "",
          "- Product teams compare evidence before writing launch notes [1].",
        ].join("\n"),
        template: "executive-brief",
        language: "en",
        segmentCount: 2,
        sourceTitle: "Nova Source",
      }),
    });
  });

  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        response: "The source says Lumina converts raw meeting notes into cited decision briefs [0].",
        language: "en",
      }),
    });
  });
}

async function openCleanWorkspace(page: Page, width = 1280, height = 900) {
  await page.setViewportSize({ width, height });
  await mockAI(page);
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/workspace");
  await expect(page.getByRole("heading", { name: "Welcome to Lumina" })).toBeVisible();
}

async function addTextSource(page: Page) {
  await page.getByRole("button", { name: "Text" }).click();
  await page.getByPlaceholder("Paste text content...").fill(
    "Nova source says Lumina converts raw meeting notes into cited decision briefs.\n\nNova source says product teams compare evidence before writing launch notes.",
  );
  await page.getByRole("button", { name: "Add source" }).click();
  await expect(page.getByText(/Source loaded: 2 segments extracted/)).toBeVisible();
  await expect(page.getByText("2 segments ready for analysis")).toBeVisible();
}

test("landing page opens the functional workspace", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Lumina" })).toBeVisible();
  await page.getByRole("link", { name: "Start for free" }).click();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole("heading", { name: "Welcome to Lumina" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("desktop workspace ingests text, generates a brief, and chats from the source", async ({ page }) => {
  const errors = collectPageErrors(page);
  await openCleanWorkspace(page);

  await addTextSource(page);
  await expect(page.getByText("Sources (1)")).toBeVisible();
  await expect(page.getByRole("button", { name: /Nova source says Lumina converts raw meeting notes/ })).toBeVisible();
  await expect(page.getByText("[0]")).toBeVisible();
  await expect(page.getByText("[1]")).toBeVisible();

  await page.getByRole("button", { name: "Use at Work" }).click();
  await expect(page.getByRole("heading", { name: "Executive Brief" })).toBeVisible();
  await expect(page.locator(".fw-brief-content").getByText("cited decision briefs")).toBeVisible();
  await expect(page.locator(".fw-brief-content").getByText("[0]")).toBeVisible();

  await page.getByRole("button", { name: "Ask" }).click();
  await page.getByPlaceholder("Ask about this source...").fill("What does the source say?");
  await page.locator(".fw-chat-composer button").click();
  await expect(page.getByText("The source says Lumina converts raw meeting notes")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("mobile workspace keeps source input and chat reachable", async ({ page }) => {
  const errors = collectPageErrors(page);
  await openCleanWorkspace(page, 390, 844);

  await expect(page.getByRole("button", { name: "Text" })).toBeVisible();
  await addTextSource(page);
  await expect(page.getByRole("button", { name: "Ask" })).toBeVisible();
  await page.getByRole("button", { name: "Ask" }).click();
  await expect(page.getByPlaceholder("Ask about this source...")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("major workspace breakpoints do not introduce horizontal overflow", async ({ page }) => {
  for (const width of [1280, 1024, 390]) {
    await openCleanWorkspace(page, width, width === 390 ? 844 : 900);
    await addTextSource(page);
    await expectNoHorizontalOverflow(page);
  }
});
