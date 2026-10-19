import { expect, test } from "@playwright/test";
import { quickQuestions, getQuickQuestion } from "../../lib/portfolio/quick-questions";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";
import { contactProfile } from "../../lib/portfolio/contact-profile";

for (const width of [1280, 390]) {
  test(`each preset requests AI once, reuses it instantly and survives reload at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const requests: { role: string; content: string }[][] = [];
    await page.route("**/api/chat", route => {
      const messages = route.request().postDataJSON().messages;
      requests.push(messages);
      const label = getQuickQuestion(messages.at(-1).content)?.label;
      const message = `An AI answer for ${label}.`;
      const cardModule = label === "Me" ? { type: "profile", profile: getResumeOverviewCard(message) }
        : label === "Projects" ? { type: "projects" }
        : label === "Skills" ? { type: "skills" }
        : label === "Contact" ? { type: "contact", contact: contactProfile } : undefined;
      return route.fulfill({ json: { message, module: cardModule } });
    });
    await page.goto("/chat");
    const shortcuts = page.getByRole("navigation", { name: "Quick questions" });
    for (const [index, question] of quickQuestions.entries()) {
      const button = shortcuts.getByRole("button", { name: question.label, exact: true });
      await button.click();
      await expect(button).toBeEnabled();
      expect(requests).toHaveLength(index + 1);
      expect(requests[index].at(-1)).toEqual({ role: "user", content: question.query });
      expect(requests[index]).toHaveLength(index * 2 + 1);
      const answer = page.locator(`[data-message-index="${index * 2 + 1}"]`);
      await expect(answer).toBeVisible();
      for (let repeat = 0; repeat < 2; repeat++) {
        await button.click();
        await expect(answer).toHaveClass(/chat-turn-restored/);
        await expect(answer).toBeInViewport();
        await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
        expect(requests).toHaveLength(index + 1);
        await expect(page.locator(".chat-turn-assistant")).toHaveCount(index + 1);
      }
      const letters = answer.locator(".answer-reveal > span");
      if (await letters.count()) await expect(letters.last()).toHaveCSS("animation-name", "none");
    }
    await page.reload();
    for (const question of quickQuestions) {
      await shortcuts.getByRole("button", { name: question.label, exact: true }).click();
      await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
    }
    expect(requests).toHaveLength(5);
    await expect(page.locator(".chat-turn-assistant")).toHaveCount(5);
    await page.getByRole("textbox", { name: "Ask about Hongxiang" }).fill("A specific follow-up");
    await page.getByRole("button", { name: "Send question" }).click();
    await expect(page.getByRole("button", { name: "Send question" })).toBeDisabled();
    await expect(shortcuts.getByRole("button").first()).toBeEnabled();
    expect(requests).toHaveLength(6);
    expect(requests[5]).toHaveLength(11);
    await page.getByRole("button", { name: "New chat", exact: true }).click();
    await shortcuts.getByRole("button", { name: "Me", exact: true }).click();
    await expect(shortcuts.getByRole("button", { name: "Me", exact: true })).toBeEnabled();
    expect(requests).toHaveLength(7);
    expect(requests[6]).toEqual([{ role: "user", content: quickQuestions[0].query }]);
  });
}

test("an in-flight or failed preset is never cached and can be retried", async ({ page }) => {
  let requests = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/chat", async route => {
    requests++;
    if (requests === 1) {
      await new Promise<void>(resolve => { release = resolve; });
      return route.fulfill({ status: 502, json: { error: "Please retry." } });
    }
    return route.fulfill({ json: { message: "I enjoy fitness and SaaS companies." } });
  });
  await page.goto("/chat");
  const button = page.getByRole("button", { name: "Fun Facts", exact: true });
  await button.click();
  await expect.poll(() => Boolean(release)).toBe(true);
  await expect(button).toBeDisabled();
  await button.evaluate(element => (element as HTMLElement).click());
  expect(requests).toBe(1);
  release!();
  await expect(page.getByRole("alert")).toHaveText("Please retry.");
  await expect(page.locator(".chat-turn-assistant")).toHaveCount(0);
  await button.click();
  await expect(button).toBeEnabled();
  expect(requests).toBe(2);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await button.click();
  await expect(page.locator(".chat-turn-assistant")).toHaveCount(1);
  expect(requests).toBe(2);
});

test("completed preset cache remains usable at the conversation limit", async ({ page }) => {
  await page.addInitScript(query => {
    const messages = Array.from({ length: 15 }, (_, index) => [
      { role: "user", content: index === 0 ? query : `Follow-up ${index}` },
      { role: "assistant", content: `Answer ${index}`, ...(index === 0 ? { preset: "Me" } : {}) },
    ]).flat();
    sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({ version: 1, messages, draft: "" }));
  }, quickQuestions[0].query);
  let requests = 0;
  await page.route("**/api/chat", route => { requests++; return route.fulfill({ json: { message: "Unexpected request" } }); });
  await page.goto("/chat");
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Projects", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Me", exact: true }).click();
  await expect(page.getByText("Answer 0", { exact: true })).toBeInViewport();
  expect(requests).toBe(0);
});

test("legacy static cards do not count as a successful AI preset answer", async ({ page }) => {
  await page.addInitScript(query => {
    sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({ version: 1, draft: "", messages: [
      { role: "user", content: query },
      { role: "assistant", content: "Old static overview", card: "projects" },
    ] }));
  }, quickQuestions[1].query);
  let requests = 0;
  await page.route("**/api/chat", route => {
    requests++;
    return route.fulfill({ json: { message: "Fresh AI answer", module: { type: "projects" } } });
  });
  await page.goto("/chat");
  const button = page.getByRole("button", { name: "Projects", exact: true });
  await button.click();
  await expect(button).toBeEnabled();
  expect(requests).toBe(1);
  await button.click();
  await expect(page.locator(".chat-turn-assistant")).toHaveCount(2);
  expect(requests).toBe(1);
});
