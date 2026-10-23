import { expect, test, type Page, type Route } from "@playwright/test";
import { getQuickQuestion } from "../../lib/portfolio/quick-questions";

type RequestData = { messages: { role: string; content: string }[]; projectId?: string; questionId?: string; excludeQuestionIds?: string[] };

async function mockChat(page: Page) {
  const calls: RequestData[] = [];
  await page.route("**/api/chat", route => {
    const body = route.request().postDataJSON(); calls.push(body);
    const label = getQuickQuestion(body.messages.at(-1).content)?.label;
    return route.fulfill({ json: { message: label ? `${label} overview.` : "A grounded project answer.", ...(label === "Projects" ? { module: { type: "projects" } } : {}) } });
  });
  return calls;
}
async function openProjects(page: Page) {
  await page.goto("/chat");
  await page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.getByRole("article", { name: "Hongxiang's projects" })).toBeVisible();
}
const questions = (project: string) => [`How does ${project} handle its core workflow?`, `What would you improve in ${project} next?`];
const suggestion = (page: Page, text: string) => page.getByRole("region", { name: "Suggested questions" }).getByRole("button", { name: text, exact: true });

for (const width of [1280, 390]) {
  test(`settled carousel changes only suggestions, preserving answer cache, draft and mobile layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const chats = await mockChat(page);
    const followups: RequestData[] = [];
    await page.route("**/api/followups", route => {
      const body = route.request().postDataJSON(); followups.push(body);
      return route.fulfill({ json: { questions: questions(body.projectId) } });
    });
    await openProjects(page);
    await expect(suggestion(page, questions("portfolio")[0])).toBeVisible();
    const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
    await input.fill("Keep my unfinished question");
    for (const project of ["jchatmind", "lyntra"]) {
      await page.getByRole("button", { name: "Next projects" }).click();
      await expect(suggestion(page, questions(project)[0])).toBeVisible();
      expect(followups.at(-1)?.projectId).toBe(project);
      await expect(input).toHaveValue("Keep my unfinished question");
    }
    expect(chats).toHaveLength(1);
    await expect(page.locator(".chat-turn-user")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath("project-followups.png"), animations: "disabled" });
  });
}

test("clicked IDs reach chat, survive reload, and are excluded from future suggestions", async ({ page }) => {
  const chats = await mockChat(page);
  const followups: RequestData[] = [];
  await page.route("**/api/followups", route => {
    const body = route.request().postDataJSON(); followups.push(body);
    const questionIds = body.projectId === "jchatmind" && !body.excludeQuestionIds?.includes("qb-25") ? ["qb-25", null] : [null, null];
    const text = questionIds[0] ? ["Why is SSE appropriate here?", "What happens if the connection is lost?"] : questions(`${body.projectId}-${followups.length}`);
    return route.fulfill({ json: { questions: text, questionIds } });
  });
  await openProjects(page);
  await expect(suggestion(page, questions("portfolio-1")[0])).toBeVisible();
  await page.getByRole("button", { name: "Next projects" }).click();
  await expect(suggestion(page, "Why is SSE appropriate here?")).toBeVisible();
  await suggestion(page, "Why is SSE appropriate here?").click();
  await expect.poll(() => chats.length).toBe(2);
  expect(chats[1]).toMatchObject({ projectId: "jchatmind", questionId: "qb-25" });
  await expect.poll(() => followups.length).toBe(3);
  expect(followups.at(-1)?.excludeQuestionIds).toContain("qb-25");
  await page.reload();
  await expect(page.getByText("A grounded project answer.", { exact: true })).toBeVisible();
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await input.fill("JChatMind 的 RAG 怎么工作？");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect.poll(() => chats.length).toBe(3);
  expect(chats[2].projectId).toBe("jchatmind");
  expect(chats[2].questionId).toBeUndefined();
  // A restored preset reuses its main answer and carries all asked IDs forward.
  await page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Projects", exact: true }).click();
  await expect.poll(() => followups.length).toBeGreaterThan(3);
  expect(followups.at(-1)?.excludeQuestionIds).toContain("qb-25");
  expect(chats).toHaveLength(3);
});

test("explicit cross-project questions override the card; inactive history cannot drive followups", async ({ page }) => {
  const chats = await mockChat(page);
  const followups: RequestData[] = [];
  await page.route("**/api/followups", route => {
    const body = route.request().postDataJSON(); followups.push(body);
    return route.fulfill({ json: { questions: questions(`${body.projectId}-${followups.length}`) } });
  });
  await openProjects(page);
  await expect(suggestion(page, questions("portfolio-1")[0])).toBeVisible();
  await page.getByRole("button", { name: "Next projects" }).click();
  await expect(suggestion(page, questions("jchatmind-2")[0])).toBeVisible();
  await page.getByRole("textbox", { name: "Ask about Hongxiang" }).fill("How does Lyntra check schedule conflicts?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(suggestion(page, questions("lyntra-3")[0])).toBeVisible();
  expect(chats.at(-1)?.projectId).toBe("lyntra");
  await page.getByRole("button", { name: "Previous projects" }).click();
  await page.waitForTimeout(700); // Scroll settling plus generation debounce; no request should occur.
  expect(followups).toHaveLength(3);
});

test("rapid project switches cancel stale suggestions and a failed refresh leaves chat usable", async ({ page }) => {
  const chats = await mockChat(page);
  const pending: { route: Route; body: RequestData }[] = [];
  await page.route("**/api/followups", route => { pending.push({ route, body: route.request().postDataJSON() }); });
  await openProjects(page);
  await expect.poll(() => pending.length).toBe(1);
  await page.getByRole("button", { name: "Next projects" }).click();
  await expect.poll(() => pending.length).toBe(2);
  await page.getByRole("button", { name: "Next projects" }).click();
  await expect.poll(() => pending.length).toBe(3);
  expect(pending[2].body.projectId).toBe("lyntra");
  await pending[2].route.fulfill({ json: { questions: questions("Lyntra") } });
  await expect(suggestion(page, questions("Lyntra")[0])).toBeVisible();
  await pending[1].route.fulfill({ json: { questions: questions("JChatMind") } }).catch(() => {});
  await pending[0].route.fulfill({ json: { questions: questions("Portfolio") } }).catch(() => {});
  await expect(suggestion(page, questions("Lyntra")[0])).toBeVisible();
  await expect(page.getByRole("button", { name: questions("JChatMind")[0], exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Generate new questions" }).click();
  await expect.poll(() => pending.length).toBe(4);
  await pending[3].route.fulfill({ status: 502, json: { error: "Unavailable" } });
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toBeEnabled();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(chats).toHaveLength(1);
});
