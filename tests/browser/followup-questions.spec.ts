import { expect, test, type Page, type Route } from "@playwright/test";
import { getQuickQuestion, quickQuestions } from "../../lib/portfolio/quick-questions";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";
import { contactProfile } from "../../lib/portfolio/contact-profile";

type ChatMessage = { role: "user" | "assistant"; content: string };
type FollowupRequest = { context: "Me" | "Projects" | "Skills" | "Fun Facts"; messages: ChatMessage[]; exclude: string[] };

const firstQuestions = ["How does JChatMind retrieve evidence?", "What did you build in Lyntra?"];
const nextQuestions = ["Why did you choose Spring Boot?", "How does Lyntra handle calendar conflicts?"];

async function stubChat(page: Page) {
  const requests: ChatMessage[][] = [];
  await page.route("**/api/chat", route => {
    const messages = route.request().postDataJSON().messages as ChatMessage[];
    requests.push(messages);
    const label = getQuickQuestion(messages.at(-1)!.content)?.label;
    const message = label ? `${label} overview.` : "JChatMind uses PostgreSQL and pgvector for retrieval.";
    const cardModule = label === "Me" ? { type: "profile", profile: getResumeOverviewCard(message) }
      : label === "Projects" ? { type: "projects" }
      : label === "Skills" ? { type: "skills" }
      : label === "Contact" ? { type: "contact", contact: contactProfile } : undefined;
    return route.fulfill({ json: { message, module: cardModule } });
  });
  return requests;
}

async function deferFollowups(page: Page) {
  const pending: { route: Route; payload: FollowupRequest }[] = [];
  await page.route("**/api/followups", route => {
    pending.push({ route, payload: route.request().postDataJSON() as FollowupRequest });
  });
  return pending;
}

async function release(route: Route, questions: string[]) {
  // Cancellation is an equally valid way to prevent an obsolete response from rendering.
  await route.fulfill({ json: { questions } }).catch(() => {});
}

async function flushRendering(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

for (const width of [1280, 390]) {
  test(`suggestions appear above presets without overflow and replay their rise at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await stubChat(page);
    const requests: FollowupRequest[] = [];
    await page.route("**/api/followups", route => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({ json: { questions: requests.length === 1 ? firstQuestions : nextQuestions } });
    });
    await page.goto("/chat");
    const presets = page.getByRole("navigation", { name: "Quick questions" });
    await presets.getByRole("button", { name: "Projects", exact: true }).click();
    const suggestions = page.getByRole("region", { name: "Suggested questions" });
    await expect(suggestions.getByText("You could ask", { exact: true })).toBeVisible();
    for (const question of firstQuestions) await expect(suggestions.getByRole("button", { name: question, exact: true })).toBeInViewport();
    const motionNames = () => suggestions.evaluate(element => [element, ...element.querySelectorAll("*")].map(node => getComputedStyle(node).animationName));
    expect(await motionNames()).toContain("followup-rise");
    await expect(suggestions.getByRole("button", { name: firstQuestions[0], exact: true })).toHaveCSS("animation-duration", "0.4s");
    const suggestionBox = await suggestions.boundingBox();
    const presetBox = await presets.boundingBox();
    const inputBox = await page.getByRole("textbox", { name: "Ask about Hongxiang" }).boundingBox();
    expect(suggestionBox!.y + suggestionBox!.height).toBeLessThanOrEqual(presetBox!.y);
    expect(presetBox!.y + presetBox!.height).toBeLessThan(inputBox!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath("followups.png"), animations: "disabled" });
    await suggestions.getByRole("button", { name: "Generate new questions" }).click();
    await expect(suggestions.getByRole("button", { name: nextQuestions[0], exact: true })).toBeVisible();
    expect(requests).toHaveLength(2);
    expect(requests[1].exclude).toEqual(expect.arrayContaining(firstQuestions));
    expect(await motionNames()).toContain("followup-rise");
    const running = await suggestions.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"));
    expect(running).toBe(true);
  });
}

test("cached answers stay immediate while new suggestions preserve the draft and send normal chat history", async ({ page }) => {
  const chatRequests = await stubChat(page);
  const pending = await deferFollowups(page);
  await page.goto("/chat");
  const me = page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Me", exact: true });
  await me.click();
  await expect.poll(() => pending.length).toBe(1);
  await release(pending[0].route, firstQuestions);
  const suggestions = page.getByRole("region", { name: "Suggested questions" });
  await expect(suggestions.getByRole("button", { name: firstQuestions[0], exact: true })).toBeVisible();
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await input.fill("Keep this unfinished question");
  await me.click();
  await expect.poll(() => pending.length).toBe(2);
  await expect(page.getByRole("article", { name: "Hongxiang Wang profile" })).toBeInViewport({ ratio: 0.1 });
  await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
  await expect(page.locator(".chat-turn-assistant")).toHaveCount(1);
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue("Keep this unfinished question");
  await expect(me).toBeEnabled();
  expect(chatRequests).toHaveLength(1);
  expect(pending[1].payload).toMatchObject({ context: "Me", exclude: expect.arrayContaining(firstQuestions) });
  expect(pending[1].payload.messages).toEqual([
    { role: "user", content: quickQuestions[0].query },
    { role: "assistant", content: "Me overview." },
  ]);
  await release(pending[1].route, nextQuestions);
  await expect(suggestions.getByRole("button", { name: nextQuestions[0], exact: true })).toBeVisible();
  await expect(input).toHaveValue("Keep this unfinished question");
  await suggestions.getByRole("button", { name: nextQuestions[0], exact: true }).click();
  await expect.poll(() => chatRequests.length).toBe(2);
  await expect(page.getByText("JChatMind uses PostgreSQL and pgvector for retrieval.", { exact: true })).toBeVisible();
  expect(chatRequests[1]).toEqual([
    ...chatRequests[0], { role: "assistant", content: "Me overview." }, { role: "user", content: nextQuestions[0] },
  ]);
  await expect(page.locator(".chat-turn-user").filter({ hasText: nextQuestions[0] })).toHaveCount(1);
  await expect(page.getByRole("button", { name: nextQuestions[0], exact: true })).toHaveCount(0);
  await expect(input).toBeFocused();
});

test("rapid context switches keep only the latest suggestions", async ({ page }) => {
  await stubChat(page);
  const pending = await deferFollowups(page);
  await page.goto("/chat");
  const presets = page.getByRole("navigation", { name: "Quick questions" });
  await presets.getByRole("button", { name: "Projects", exact: true }).click();
  await expect.poll(() => pending.length).toBe(1);
  await expect(presets.getByRole("button", { name: "Skills", exact: true })).toBeEnabled();
  await presets.getByRole("button", { name: "Skills", exact: true }).click();
  await expect.poll(() => pending.length).toBe(2);
  expect(pending.map(item => item.payload.context)).toEqual(["Projects", "Skills"]);
  await release(pending[1].route, ["Where have you used Java?", "Which project shows your backend skills?"]);
  const suggestions = page.getByRole("region", { name: "Suggested questions" });
  await expect(suggestions.getByRole("button", { name: "Where have you used Java?", exact: true })).toBeVisible();
  await release(pending[0].route, firstQuestions);
  await flushRendering(page);
  await expect(suggestions.getByRole("button", { name: "Where have you used Java?", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: firstQuestions[0], exact: true })).toHaveCount(0);
});

test("Contact and New chat clear suggestions and ignore outstanding generation", async ({ page }) => {
  await stubChat(page);
  const pending = await deferFollowups(page);
  await page.goto("/chat");
  const presets = page.getByRole("navigation", { name: "Quick questions" });
  await presets.getByRole("button", { name: "Me", exact: true }).click();
  await expect.poll(() => pending.length).toBe(1);
  await presets.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page.getByRole("article", { name: "Contact Hongxiang" })).toBeVisible();
  await release(pending[0].route, firstQuestions);
  await flushRendering(page);
  await expect(page.getByRole("region", { name: "Suggested questions" })).toHaveCount(0);
  expect(pending).toHaveLength(1);
  await presets.getByRole("button", { name: "Projects", exact: true }).click();
  await expect.poll(() => pending.length).toBe(2);
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await release(pending[1].route, nextQuestions);
  await flushRendering(page);
  await expect(page.getByRole("region", { name: "Suggested questions" })).toHaveCount(0);
  await expect(page.locator(".chat-turn")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toHaveValue("");
});

test("generation failure leaves chat usable and reduced motion shows questions without an entrance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const chatRequests = await stubChat(page);
  let attempts = 0;
  await page.route("**/api/followups", route => {
    attempts++;
    return attempts === 1 ? route.fulfill({ status: 502, json: { error: "Suggestion service unavailable." } })
      : route.fulfill({ json: { questions: firstQuestions } });
  });
  await page.goto("/chat");
  const funFacts = page.getByRole("button", { name: "Fun Facts", exact: true });
  await funFacts.click();
  await expect.poll(() => attempts).toBe(1);
  await expect(page.getByRole("article", { name: "Fun Facts", exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await input.fill("My draft survives a suggestion failure");
  await funFacts.click();
  const suggestions = page.getByRole("region", { name: "Suggested questions" });
  await expect(suggestions.getByRole("button", { name: firstQuestions[0], exact: true })).toBeVisible();
  await expect(input).toHaveValue("My draft survives a suggestion failure");
  expect(chatRequests).toHaveLength(1);
  expect(attempts).toBe(2);
  expect(await suggestions.evaluate(element => [element, ...element.querySelectorAll("*")].some(node => getComputedStyle(node).animationName.includes("followup-rise")))).toBe(false);
});

test("the question limit keeps cached answers but stops suggestions from consuming more requests", async ({ page }) => {
  await page.addInitScript(query => {
    const messages = Array.from({ length: 14 }, (_, index) => [
      { role: "user", content: index === 0 ? query : `Question ${index}` },
      { role: "assistant", content: `Answer ${index}`, ...(index === 0 ? { preset: "Me" } : {}) },
    ]).flat();
    sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({ version: 1, messages, draft: "" }));
  }, quickQuestions[0].query);
  const chatRequests = await stubChat(page);
  let generations = 0;
  await page.route("**/api/followups", route => {
    generations++;
    return route.fulfill({ json: { questions: firstQuestions } });
  });
  await page.goto("/chat");
  const me = page.getByRole("button", { name: "Me", exact: true });
  await me.click();
  await page.getByRole("region", { name: "Suggested questions" }).getByRole("button", { name: firstQuestions[0], exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toBeDisabled();
  await expect(page.getByText("JChatMind uses PostgreSQL and pgvector for retrieval.", { exact: true })).toBeVisible();
  await me.click();
  await expect(page.getByText("Answer 0", { exact: true })).toBeInViewport();
  const remaining = page.getByRole("region", { name: "Suggested questions" }).getByRole("button");
  for (const button of await remaining.all()) {
    await expect(button).toBeDisabled();
    await button.evaluate(element => (element as HTMLElement).click());
  }
  await flushRendering(page);
  expect(chatRequests).toHaveLength(1);
  expect(chatRequests[0]).toHaveLength(29);
  expect(generations).toBe(1);
});
