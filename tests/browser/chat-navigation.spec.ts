import { expect, test } from "@playwright/test";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`returns to the homepage after a conversation at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route("**/api/chat", route => route.fulfill({
      json: { message: "Hi, I'm Hongxiang.", module: { type: "profile", profile: getResumeOverviewCard("Hi, I'm Hongxiang.") } },
    }));
    await page.goto("/");
    await page.getByRole("link", { name: /Me/ }).click();
    await expect(page.getByRole("article", { name: "Hongxiang Wang profile" })).toBeVisible();
    await page.getByRole("link", { name: "Back to portfolio" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Full-Stack Engineer", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ask about me", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Me/ })).toBeVisible();
  });
}
