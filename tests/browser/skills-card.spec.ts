import { expect, test } from "@playwright/test";

for (const width of [1280, 390, 320]) {
  test(`Skills presents compact capability groups at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("link", { name: "Skills", exact: true }).click();
    const card = page.getByRole("article", { name: "Hongxiang's skills" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("heading", { level: 2 })).toHaveText("Skills & Expertise.");
    await expect(card.getByText("Python & Java backend.", { exact: true })).toBeVisible();
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(["Backend & Systems", "AI & Agent Workflows", "Frontend Development", "Data & Storage", "Tools & Cloud", "Soft Skills"]);
    const backend = card.getByRole("list", { name: "Backend & Systems" });
    await expect(backend.getByRole("listitem").nth(0)).toHaveText("Python");
    await expect(backend.getByRole("listitem").nth(1)).toHaveText("Java");
    await expect(card.getByRole("list", { name: "AI & Agent Workflows" }).getByRole("listitem")).toHaveText(["Spring AI", "RAG", "LLM Integration", "Tool Calling", "Ollama"]);
    await expect(card.getByText("Applied in real work")).toHaveCount(0);
    await expect(card.getByRole("link")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.getByRole("heading", { name: "Soft Skills", exact: true }).scrollIntoViewIfNeeded();
    expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    for (const tag of await card.getByRole("listitem").all()) {
      expect(await tag.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
  });
}

test("Skills survives a home round trip and reload, preserving follow-up context", async ({ page }) => {
  await page.goto("/chat");
  await page.getByRole("button", { name: "Skills", exact: true }).click();
  const card = page.getByRole("article", { name: "Hongxiang's skills" });
  await expect(card).toBeVisible();
  await page.getByRole("textbox", { name: "Ask about Hongxiang" }).fill("Where have you used Java?");
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await page.getByRole("link", { name: "Me", exact: true }).click();
  await expect(card).toHaveCount(1);
  await page.reload();
  await expect(card).toHaveCount(1);
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toHaveValue("Where have you used Java?");
  let history: {role: string; content: string}[] = [];
  await page.route("**/api/chat", route => {
    history = route.request().postDataJSON().messages;
    return route.fulfill({ json: { message: "At PCITC, I contributed to Spring Boot inventory workflows using MyBatis and MySQL." } });
  });
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByText("At PCITC, I contributed to Spring Boot inventory workflows using MyBatis and MySQL.", { exact: true })).toBeVisible();
  expect(history).toHaveLength(3);
  expect(history[1].content).toContain("Python and Java");
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await expect(card).toHaveCount(0);
});
