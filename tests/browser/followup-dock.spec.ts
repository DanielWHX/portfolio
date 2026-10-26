import { expect, test, type Page } from "@playwright/test";
import { getQuickQuestion } from "../../lib/portfolio/quick-questions";
import { contactProfile } from "../../lib/portfolio/contact-profile";

type ChatRequest = { messages: { role: string; content: string }[]; questionId?: string; projectId?: string };
const questions = ["How does JChatMind deliver live responses?", "What did you learn from Lyntra?"];
const overview = "I enjoy exploring different perspectives, strength training and Apex Legends.";

async function mockChat(page: Page) {
  const calls = { chat: [] as ChatRequest[], followups: 0 };
  await page.route("**/api/chat", route => {
    const body = route.request().postDataJSON() as ChatRequest;
    calls.chat.push(body);
    const label = getQuickQuestion(body.messages.at(-1)!.content)?.label;
    const cardModule = label === "Skills" ? { type: "skills" }
      : label === "Fun Facts" ? { type: "fun_facts" }
      : label === "Contact" ? { type: "contact", contact: contactProfile } : undefined;
    return route.fulfill({ json: { message: label ? overview : "JChatMind delivers responses using SSE.", module: cardModule } });
  });
  await page.route("**/api/followups", route => {
    calls.followups++;
    const hobbies = route.request().postDataJSON().context === "Fun Facts";
    return route.fulfill({ json: {
      questions: hobbies ? ["What do you enjoy about skydiving?", "What have you learned from strength training?"] : questions,
      questionIds: hobbies ? [null, null] : ["qb-25", null],
    } });
  });
  return calls;
}

const panel = (page: Page) => page.getByRole("region", { name: "Suggested questions", exact: true });
const collapse = (page: Page) => page.getByRole("button", { name: "Collapse suggested questions", exact: true });
const expand = (page: Page) => page.getByRole("button", { name: "Expand suggested questions", exact: true });
const presets = (page: Page) => page.getByRole("navigation", { name: "Quick questions", exact: true });

async function openSkills(page: Page) {
  await page.goto("/chat");
  await presets(page).getByRole("button", { name: "Skills", exact: true }).click();
  await expect(panel(page).getByRole("button", { name: questions[0], exact: true })).toBeVisible();
}

for (const width of [320, 390, 1280]) {
  test(`collapsed suggestions and five presets share one row inside the composer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockChat(page);
    await openSkills(page);
    const firstPreset = presets(page).getByRole("button", { name: "Me", exact: true });
    const expandedPosition = await firstPreset.boundingBox();
    await collapse(page).click();
    await expect(expand(page)).toBeVisible();
    await expect(panel(page)).toBeHidden();
    await expect(presets(page).getByRole("button")).toHaveText(["Me", "Projects", "Skills", "Fun Facts", "Contact"]);
    const visibleLabel = (await expand(page).innerText()).trim();
    expect(visibleLabel).not.toMatch(/You could ask|Expand|suggested questions/i);
    expect(visibleLabel === "✦" || await expand(page).locator("svg").count() > 0).toBe(true);
    const controls = [expand(page), ...await presets(page).getByRole("button").all()];
    const boxes = await Promise.all(controls.map(control => control.boundingBox()));
    const composer = await page.locator(".chat-form").boundingBox();
    expect(boxes.every(box => box !== null)).toBe(true);
    expect(composer).not.toBeNull();
    const rows = boxes.map(box => box!);
    for (const box of rows) {
      expect(Math.abs(box.y + box.height / 2 - rows[0].y - rows[0].height / 2)).toBeLessThanOrEqual(2);
      expect(box.x).toBeGreaterThanOrEqual(composer!.x - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(composer!.x + composer!.width + 1);
    }
    for (let index = 1; index < rows.length; index++) expect(rows[index].x).toBeGreaterThanOrEqual(rows[index - 1].x + rows[index - 1].width);
    expect(rows[1].x).toBeGreaterThan(expandedPosition!.x + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`followup-dock-${width}.png`), animations: "disabled" });
    await expand(page).click();
    await expect(panel(page).getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
    await expect.poll(async () => (await firstPreset.boundingBox())!.x).toBeLessThan(rows[1].x - 1);
  });
}

test("folding preserves the draft and conversation without new requests; suggested question references still reach chat", async ({ page }) => {
  const calls = await mockChat(page);
  await openSkills(page);
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await input.fill("Keep my unfinished question while I fold suggestions");
  const counts = { chat: calls.chat.length, followups: calls.followups };
  for (let index = 0; index < 3; index++) {
    await collapse(page).click();
    await expect(expand(page)).toBeVisible();
    await expect(panel(page)).toBeHidden();
    await expect(input).toHaveValue("Keep my unfinished question while I fold suggestions");
    await expand(page).click();
    await expect(panel(page).getByRole("button", { name: questions[0], exact: true })).toBeVisible();
  }
  expect(calls.chat).toHaveLength(counts.chat);
  expect(calls.followups).toBe(counts.followups);
  await expect(page.locator(".chat-turn-user")).toHaveCount(1);
  await expect(page.locator(".chat-turn-assistant")).toHaveCount(1);
  await expect(input).toHaveValue("Keep my unfinished question while I fold suggestions");
  await panel(page).getByRole("button", { name: questions[0], exact: true }).click();
  await expect.poll(() => calls.chat.length).toBe(counts.chat + 1);
  expect(calls.chat.at(-1)).toMatchObject({ questionId: "qb-25", projectId: "jchatmind" });
  expect(calls.chat.at(-1)!.messages.at(-1)).toEqual({ role: "user", content: questions[0] });
  await expect(page.getByText("JChatMind delivers responses using SSE.", { exact: true })).toBeVisible();
});

test("rapid keyboard toggles settle consistently and reduced motion disables dock movement", async ({ page }) => {
  const calls = await mockChat(page);
  await openSkills(page);
  const followupsBefore = calls.followups;
  await collapse(page).press("Enter");
  await expand(page).press("Enter");
  await collapse(page).press("Enter");
  await expect(expand(page)).toBeVisible();
  await expect(panel(page)).toBeHidden();
  await expand(page).click();
  await expect(panel(page).getByRole("button", { name: questions[0], exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await collapse(page).click();
  await expect(expand(page)).toBeVisible();
  expect(await expand(page).evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  expect(await presets(page).evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  await expand(page).click();
  await expect(panel(page).getByRole("button", { name: questions[0], exact: true })).toBeVisible();
  expect(await panel(page).evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  expect(calls.chat).toHaveLength(1);
  expect(calls.followups).toBe(followupsBefore);
});

test("Contact, New chat and immersive overlays leave no residual collapsed bubble", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockChat(page);
  await openSkills(page);
  await collapse(page).click();
  await expect(expand(page)).toBeVisible();
  await presets(page).getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page.getByRole("article", { name: "Contact Hongxiang" })).toBeVisible();
  await expect(expand(page)).toHaveCount(0);
  await expect(collapse(page)).toHaveCount(0);
  await expect(panel(page)).toHaveCount(0);

  await presets(page).getByRole("button", { name: "Fun Facts", exact: true }).click();
  await expect.poll(async () => await expand(page).isVisible() || await collapse(page).isVisible()).toBe(true);
  if (await collapse(page).isVisible()) await collapse(page).click();
  await expect(expand(page)).toBeVisible();
  await page.getByRole("button", { name: "View skydiving photo", exact: true }).click();
  const photo = page.getByRole("dialog", { name: "Skydiving photo", exact: true });
  await expect(photo).toBeVisible();
  await expect(expand(page)).toHaveCount(0);
  await expect(panel(page)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(photo).toHaveCount(0);
  await expect(expand(page)).toBeVisible();
  await page.getByRole("button", { name: "Big Three Record", exact: true }).click();
  const gym = page.getByRole("dialog", { name: "Big Three Record", exact: true });
  await expect(gym).toBeVisible();
  await expect(expand(page)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(gym).toHaveCount(0);
  await expect(expand(page)).toBeVisible();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await expect(expand(page)).toHaveCount(0);
  await expect(collapse(page)).toHaveCount(0);
  await expect(panel(page)).toHaveCount(0);
  await expect(page.locator(".chat-turn")).toHaveCount(0);
});
