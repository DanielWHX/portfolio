import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`JChatMind interactive recorded replay at ${viewport.width}px`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    const requests: string[] = [];
    page.on("request", request => { if (/\/api\//.test(request.url())) requests.push(request.url()); });
    await page.goto("/chat?query=projects");
    const card = page.getByRole("article", { name: "Hongxiang's projects" });
    await card.getByRole("link", { name: "Explore JChatMind case study" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("JChatMind");
    const demo = page.locator(".jcm-demo");
    const app = demo.locator(".chat-replay > .replay-app");
    const conversation = app.getByRole("region", { name: "Recorded conversation", exact: true });
    const stages = page.getByRole("navigation", { name: "OrbitDesk demonstration stages" });
    const cases = [
      ["Recommend", "01-pricing", "We are an 8-person team"],
      ["Follow up", "01-pricing", "The same team grows to 12"],
      ["Use a tool", "02-trial", "If we start a free trial today"],
      ["Check limits", "03-boundaries", "Does OrbitDesk support SAML SSO"],
      ["Draft a reply", "03-boundaries", "Draft a short customer reply"],
    ];
    for (const [name, source, question] of cases) {
      const button = stages.getByRole("button", { name: new RegExp(name) });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(conversation.locator(":scope > .replay-user")).toHaveCount(1);
      await expect(conversation.locator(":scope > .replay-user")).toContainText(question);
      expect(await conversation.evaluate(el => el.scrollTop)).toBe(0);
      const tool = conversation.locator(":scope > .replay-tool-result").first();
      await tool.locator("summary").click();
      await expect(tool.locator("pre")).toBeVisible();
      await tool.locator("summary").click();
      await expect(tool.locator("pre")).not.toBeVisible();
      await expect(demo.locator(".jcm-source-link")).toHaveAttribute("href", `/projects/jchatmind/references/${source}.html`);
      if (name === "Use a tool") await expect(conversation).toContainText("2026-10-11");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    // Long messages scroll inside the replica; no future turn leaks into this stage.
    expect(await conversation.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await conversation.hover();
    await page.mouse.wheel(0, 400);
    await expect.poll(() => conversation.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await stages.getByRole("button", { name: /Recommend/ }).click();
    expect(await conversation.evaluate(el => el.scrollTop)).toBe(0);
    if (viewport.width < 600) await app.getByRole("button", { name: "☰ JChatMind" }).click();
    await app.getByRole("button", { name: "知识库", exact: true }).click();
    await expect(app.getByRole("region", { name: "OrbitDesk knowledge base" })).toContainText("The Team plan costs USD 18");
    if (viewport.width < 600) await app.getByRole("button", { name: "☰ JChatMind" }).click();
    await app.getByRole("button", { name: "智能体助手", exact: true }).click();
    await expect(app.getByRole("region", { name: "Recorded agent configuration" })).toContainText("deepseek-chat");
    if (viewport.width < 600) await app.getByRole("button", { name: "☰ JChatMind" }).click();
    await app.getByRole("button", { name: "＋ 新聊天", exact: true }).click();
    await expect(app.getByLabel("Recorded question")).toHaveValue(/We are an 8-person/);
    const beforeReplay = requests.length;
    await app.getByRole("button", { name: "Replay recorded response" }).click();
    await expect(conversation).toContainText("USD 144 per month");
    expect(requests.length).toBe(beforeReplay);
    await demo.getByRole("button", { name: "Expand ↗", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Expanded JChatMind replay" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await stages.getByRole("button", { name: /Check limits/ }).click();
    const popupEvent = context.waitForEvent("page");
    await demo.locator(".jcm-source-link").click();
    const sourcePage = await popupEvent;
    await expect(sourcePage.locator("mark").filter({ hasText: "does not specify SAML SSO support" })).toBeVisible();
    await sourcePage.close();
    await page.getByText("Explore the complete conversation", { exact: false }).first().click();
    const complete = page.locator(".jcm-details > .chat-replay > .replay-app");
    await expect(complete.locator(".replay-scroll > .replay-user")).toHaveCount(6);
    const beforeReturn = requests.length;
    await page.getByRole("link", { name: "← Back to projects", exact: true }).first().click();
    await expect(card).toHaveCount(1);
    expect(requests.length).toBe(beforeReturn);
  });
}

test("guided entry expands in place and keeps replay available when live service is not configured", async ({ page }) => {
  await page.goto("/projects/jchatmind");
  const entry = page.getByRole("button", { name: /Explore the demo/ });
  await expect(entry).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("iframe")).toHaveCount(0);
  await entry.click();
  await expect(entry).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("The live experience is being prepared.")).toBeVisible();
  await page.getByRole("link", { name: "View the interactive replay" }).click();
  await expect(page.getByRole("navigation", { name: "OrbitDesk demonstration stages" })).toBeVisible();
  await entry.click();
  await expect(page.getByRole("region", { name: "Try JChatMind live" })).toHaveCount(0);
});
