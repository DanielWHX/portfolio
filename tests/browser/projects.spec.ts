import { expect, test } from "@playwright/test";

test("Projects opens a real case study and returns without losing or duplicating the card", async ({ page }) => {
  let requests = 0;
  page.on("request", request => { if (request.url().endsWith("/api/chat")) requests++; });
  await page.goto("/");
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  const card = page.getByRole("article", { name: "Hongxiang's projects" });
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", { level: 3 }).first()).toContainText("Lyntra");
  await expect(card.getByRole("link", { name: "Explore JChatMind case study" })).toHaveAttribute("href", "/projects/jchatmind");
  await expect(card.getByText("Case study coming soon", { exact: true })).toHaveCount(3);
  await page.getByRole("link", { name: "Explore Lyntra case study" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A calendar that adapts.");
  const video = page.locator("video");
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState)).toBeGreaterThan(0);
  await page.getByRole("button", { name: /Resolve a conflict/ }).click();
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThanOrEqual(24.9);
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  await video.evaluate((el: HTMLVideoElement) => el.pause());
  for (const src of ["workflow.svg", "architecture.svg"]) {
    const img = page.locator(`img[src$="${src}"]`);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
  await page.getByRole("link", { name: "← Back to projects", exact: true }).first().click();
  await expect(card).toHaveCount(1);
  expect(requests).toBe(1);
  await page.reload();
  await expect(card).toHaveCount(1);
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Full-Stack Engineer" })).toBeVisible();
});

test("a direct case-study visitor can find Projects, with a readable mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/lyntra");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "← Back to projects", exact: true }).first().click();
  await expect(page.getByRole("article", { name: "Hongxiang's projects" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const width of [1440, 390, 320]) {
  test(`open chat keeps controls visible and browses portrait projects at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/chat?query=Projects");
    const card = page.getByRole("article", { name: "Hongxiang's projects" });
    await expect(card.getByRole("heading", { level: 2 })).toHaveText("Project");
    await expect(card.getByRole("listitem")).toHaveCount(5);
    await expect(card.getByRole("link")).toHaveCount(2);
    const first = card.getByRole("listitem").first();
    const box = await first.boundingBox();
    expect(box!.height).toBeGreaterThan(box!.width);
    const previous = page.getByRole("button", { name: "Previous projects" });
    const next = page.getByRole("button", { name: "Next projects" });
    await expect(previous).toBeDisabled();
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(previous).toBeEnabled();
    const track = card.getByRole("list", { name: "Projects", exact: true });
    for (let i = 0; i < (width > 600 ? 1 : 3); i++) {
      const target = await track.evaluate(el => Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + el.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap)));
      await next.click();
      await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThanOrEqual(target - 2);
    }
    await expect(next).toBeDisabled();
    await expect(card.getByRole("heading", { name: "O-RAN Research Environment" })).toBeInViewport();
    const shortcuts = page.getByRole("navigation", { name: "Quick questions" });
    for (const button of await shortcuts.getByRole("button").all()) await expect(button).toBeInViewport();
    await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const nav = await shortcuts.boundingBox();
    expect(Math.abs(nav!.x + nav!.width / 2 - width / 2)).toBeLessThan(2);
    await expect(page.locator(".chat-shell")).toHaveCSS("box-shadow", "none");
  });
}
