import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`JChatMind evidence walkthrough and return navigation at ${viewport.width}px`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    let chatRequests = 0;
    page.on("request", request => { if (request.url().endsWith("/api/chat")) chatRequests++; });
    await page.goto("/chat?query=projects");
    const card = page.getByRole("article", { name: "Hongxiang's projects" });
    await expect(card).toBeVisible();
    await card.getByRole("link", { name: "Explore JChatMind case study" }).click();
    await expect(page).toHaveURL(/\/projects\/jchatmind$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("JChatMind");
    expect((await page.locator(".jcm-hero").boundingBox())!.height).toBeLessThan(300);
    await expect(page.getByRole("button", { name: "Previous screenshot in this stage" })).toBeDisabled();
    const stages = page.getByRole("navigation", { name: "OrbitDesk demonstration stages" });
    for (const [name, source] of [["Recommend", "01-pricing"], ["Follow up", "01-pricing"], ["Use a tool", "02-trial"], ["Check limits", "03-boundaries"], ["Draft a reply", "03-boundaries"]]) {
      const stage = stages.getByRole("button", { name: new RegExp(name) });
      await stage.click();
      await expect(stage).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("button", { name: "Previous screenshot in this stage" })).toBeDisabled();
      const screenshot = page.locator(".jcm-capture img");
      await expect.poll(() => screenshot.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      const firstSource = await screenshot.getAttribute("src");
      await page.getByRole("button", { name: "Next screenshot in this stage" }).click();
      await expect(screenshot).not.toHaveAttribute("src", firstSource!);
      await expect(page.locator(".jcm-source-link")).toHaveAttribute("href", `/projects/jchatmind/references/${source}.html`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    // Sources must be readable, highlighted, and delivered by this deployment—not localhost.
    const popupEvent = context.waitForEvent("page");
    await page.locator(".jcm-source-link").click();
    const sourcePage = await popupEvent;
    await expect(sourcePage.locator("mark").filter({ hasText: "does not specify SAML SSO support" })).toBeVisible();
    await sourcePage.close();
    await page.getByText("Explore the complete conversation", { exact: false }).first().click();
    await expect(page.locator(".jcm-complete-gallery img")).toHaveCount(8);
    const requestsBeforeReturn = chatRequests;
    await page.getByRole("link", { name: "← Back to projects", exact: true }).first().click();
    await expect(card).toHaveCount(1);
    expect(chatRequests).toBe(requestsBeforeReturn);
    await expect(card.getByRole("link", { name: "Explore JChatMind case study" })).toBeVisible();
  });
}
