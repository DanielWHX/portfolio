import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
  test(`the game keeps its stage and controls visible without suggested questions at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/chat", route => route.fulfill({ json: { message: "Outside code I enjoy lifting, travel, and LeetCode.", module: { type: "fun_facts" } } }));
    await page.route("**/api/followups", route => route.fulfill({ json: { questions: ["What do you enjoy about strength training?", "What did you learn through Whatnot?"] } }));
    await page.goto("/chat?query=Fun%20Facts");
    await expect(page.getByRole("heading", { name: "You could ask" })).toBeVisible();
    const opener = page.getByRole("button", { name: "Big Three Record", exact: true });
    await opener.click();
    await expect(page.getByRole("article", { name: "Big Three Record", exact: true })).toHaveAttribute("data-theme", "iron");
    await expect(page.locator(".gym-room")).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole("button", { name: "Hold to lift", exact: false })).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole("heading", { name: "You could ask" })).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Big Three Record", exact: true })).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.getByRole("heading", { name: "You could ask" })).toBeVisible();
  });
}
