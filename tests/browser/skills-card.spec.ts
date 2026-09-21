import { expect, test } from "@playwright/test";

for (const width of [1280, 390, 320]) {
  test(`Skills presents the backend focus and resume categories at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("link", { name: "Skills", exact: true }).click();
    const card = page.getByRole("article", { name: "Hongxiang's skills" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("heading", { level: 2 })).toHaveText("Python & Java.Backend engineering.");
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(["Languages", "Frameworks", "Tools", "Applied in real work"]);
    const languages = card.getByRole("list", { name: "Languages" });
    await expect(languages.getByRole("listitem")).toHaveText(["Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "HTML/CSS"]);
    await expect(card.getByRole("list", { name: "Frameworks" }).getByRole("listitem")).toHaveCount(8);
    await expect(card.getByRole("list", { name: "Tools" }).getByRole("listitem")).toHaveCount(10);
    await expect(card.getByRole("heading", { name: "Lyntra", exact: true })).toBeAttached();
    await expect(card.getByRole("heading", { name: "PCITC", exact: true })).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.getByRole("heading", { name: "Applied in real work" }).scrollIntoViewIfNeeded();
    expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
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
