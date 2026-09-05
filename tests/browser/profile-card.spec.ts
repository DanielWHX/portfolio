import { expect, test } from "@playwright/test";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";

const introduction = "Hey, I'm Hongxiang 👋 I build software, enjoy fitness, and love talking about SaaS companies.";

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`the profile presents a portrait, school details and interests at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route("**/api/chat", route => route.fulfill({
      json: { message: introduction, module: { type: "profile", profile: getResumeOverviewCard(introduction) } },
    }));
    await page.goto("/chat?query=Who%20are%20you%3F");
    const card = page.getByRole("article", { name: "Hongxiang Wang profile" });
    await expect(card).toBeVisible();
    await expect(card.getByText(introduction, { exact: true })).toBeVisible();
    await expect(card.getByRole("list", { name: "Interests" })).toContainText("Fitness");
    await expect(card.getByRole("list", { name: "Interests" })).toContainText("SaaS companies");
    await expect(card.getByText("Master of Computer Science (MCS)", { exact: true })).toBeVisible();
    await expect(card.getByRole("link", { name: /CS #5, Graduate Computer Science, U.S. News 2026/ })).toHaveAttribute("href", "https://siebelschool.illinois.edu/about/facts-and-rankings");
    await expect(card.getByRole("link", { name: /#36 National Universities/ })).toBeVisible();
    await expect(card.getByRole("link", { name: /#41 National Universities/ })).toBeVisible();
    const images = card.getByRole("img");
    await expect(images).toHaveCount(3);
    for (const img of await images.all()) {
      await expect(img).toBeVisible();
      await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
}
