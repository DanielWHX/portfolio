import { expect, test } from "@playwright/test";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";

const introduction = "I build practical software with Python, Java and AI. Outside engineering, I enjoy lifting, travelling and learning from people with different perspectives.";

for (const width of [320, 1280]) {
  test(`chat design stays isolated from the homepage and fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/chat", route => route.fulfill({ json: { message: introduction, module: { type: "profile", profile: getResumeOverviewCard(introduction) } } }));
    await page.route("**/api/followups", route => route.fulfill({ json: { questions: ["What do you enjoy building?", "What did you learn from your projects?"] } }));
    await page.goto("/");
    const homeAppearance = () => page.locator(".hero").evaluate(element => {
      const title = getComputedStyle(element.querySelector("h1")!);
      const input = getComputedStyle(element.querySelector(".query-box")!);
      return { font: title.fontFamily, size: title.fontSize, weight: title.fontWeight, color: title.color, inputBackground: input.backgroundColor, inputBorder: input.border, inputRadius: input.borderRadius };
    });
    const before = await homeAppearance();
    await page.getByRole("link", { name: "Me", exact: true }).click();
    const profile = page.getByRole("article", { name: "Hongxiang Wang profile" });
    await expect(profile).toHaveCSS("border-top-width", "0px");
    await expect(profile.getByText(introduction, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send question" })).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole("navigation", { name: "Quick questions" })).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("link", { name: "Back to portfolio" }).click();
    await expect(page.locator(".hero")).toBeVisible();
    expect(await homeAppearance()).toEqual(before);
  });
}

test("new answers reveal as a whole and restored answers remain still", async ({ page }) => {
  await page.route("**/api/chat", route => route.fulfill({ json: { message: introduction } }));
  await page.goto("/chat?query=Hello");
  const answer = page.locator(".answer-reveal");
  await expect(answer).toHaveText(introduction);
  await expect(answer).toHaveCSS("animation-name", "chat-text-arrive");
  await expect(answer).toHaveCSS("opacity", "1");
  await page.reload();
  await expect(answer).toHaveText(introduction);
  await expect(answer).toHaveCSS("animation-name", "none");
  await expect(answer).toHaveCSS("opacity", "1");
});
