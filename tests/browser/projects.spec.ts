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
