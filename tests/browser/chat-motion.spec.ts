import { expect, test } from "@playwright/test";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";
import { contactProfile } from "../../lib/portfolio/contact-profile";

const answer = "我喜欢健身，也对 SaaS 公司感兴趣。👋 Building useful software starts with understanding a real problem. I enjoy discussing practical ideas, engineering tradeoffs, and how to turn a small prototype into something people want to use.";

for (const width of [1280, 390]) {
  test(`quick questions continue the conversation above the composer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const requests: { role: string; content: string }[][] = [];
    await page.route("**/api/chat", route => {
      const messages = route.request().postDataJSON().messages;
      requests.push(messages);
      const question = messages.at(-1).content;
      return route.fulfill({ json: question === "Who are you?"
        ? { message: answer, module: { type: "profile", profile: getResumeOverviewCard(answer) } }
        : question === "How can I contact you?"
          ? { message: "Let's connect!", module: { type: "contact", contact: contactProfile } }
          : { message: answer } });
    });
    await page.goto("/");
    await page.getByRole("link", { name: "Me", exact: true }).click();
    await expect(page.getByRole("article", { name: "Hongxiang Wang profile" })).toBeVisible();
    const shortcuts = page.getByRole("navigation", { name: "Quick questions" });
    await expect(shortcuts.getByRole("button")).toHaveText(["☺Me", "▣Projects", "◇Skills", "✦Fun Facts", "☎Contact"]);
    for (const label of ["Projects", "Skills", "Fun Facts", "Contact", "Me"]) {
      const button = shortcuts.getByRole("button", { name: label, exact: true });
      await expect(button).toBeInViewport();
      await button.click();
      await expect(button).toBeEnabled();
    }
    expect(requests).toHaveLength(6);
    expect(requests[2]).toHaveLength(5);
    expect(requests[2][1]).toEqual({ role: "assistant", content: answer });
    await expect(page.getByRole("article", { name: "Contact Hongxiang" })).toHaveCount(1);
    const navBox = await shortcuts.boundingBox();
    const inputBox = await page.getByRole("textbox", { name: "Ask about Hongxiang" }).boundingBox();
    expect(navBox!.y + navBox!.height).toBeLessThan(inputBox!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("answers reveal progressively and reduced motion shows the complete answer immediately", async ({ page }) => {
  await page.route("**/api/chat", route => route.fulfill({ json: { message: answer } }));
  await page.goto("/chat?query=Hello");
  const letters = page.locator(".answer-reveal > span");
  await expect(letters.first()).toHaveCSS("opacity", "1");
  await expect(letters.last()).toHaveCSS("opacity", "0");
  await expect(letters.last()).toHaveCSS("opacity", "1");
  await expect(page.locator(".answer-reveal")).toHaveText(answer);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/chat?query=Hello");
  await expect(letters.last()).toHaveCSS("animation-name", "none");
  await expect(letters.last()).toHaveCSS("opacity", "1");
  await expect(page.locator(".answer-reveal")).toHaveText(answer);
});

test("waiting disables quick questions and reading earlier messages prevents reply scroll takeover", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let releaseReply: (() => void) | undefined;
  let requests = 0;
  await page.route("**/api/chat", async route => {
    requests++;
    if (requests > 1) await new Promise<void>(resolve => { releaseReply = resolve; });
    await route.fulfill({ json: { message: answer, module: { type: "profile", profile: getResumeOverviewCard(answer) } } });
  });
  await page.goto("/chat?query=Who%20are%20you%3F");
  const cards = page.getByRole("article", { name: "Hongxiang Wang profile" });
  await expect(cards).toHaveCount(1);
  const shortcuts = page.getByRole("navigation", { name: "Quick questions" });
  await shortcuts.getByRole("button", { name: "Skills", exact: true }).click();
  for (const button of await shortcuts.getByRole("button").all()) await expect(button).toBeDisabled();
  await expect.poll(() => Boolean(releaseReply)).toBe(true);
  const conversation = page.locator(".chat-messages");
  await conversation.evaluate(element => { element.scrollTop = 0; element.dispatchEvent(new Event("scroll")); });
  releaseReply!();
  await expect(cards).toHaveCount(2);
  expect(await conversation.evaluate(element => element.scrollTop)).toBe(0);
  expect(requests).toBe(2);
  await expect(shortcuts.getByRole("button", { name: "Skills", exact: true })).toBeEnabled();
});
