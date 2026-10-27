import { expect, test } from "@playwright/test";

const factsSummary = "I’m an ENTP who enjoys exploring different perspectives and meeting people from different places. Away from code, I’m into strength training, travel, skiing and LeetCode, and I co-ran a Whatnot livestream venture at university.";

test("Fun Facts opens an AI summary with compact destinations and restores its successful cache", async ({ page }) => {
  let answers = 0;
  await page.route("**/api/chat", route => { answers += 1; return route.fulfill({ json: { message: factsSummary, module: { type: "fun_facts" } } }); });
  await page.route("**/api/followups", route => route.fulfill({ json: { questions: ["What do you enjoy about LeetCode?", "What did you do on Whatnot?"] } }));
  await page.goto("/chat");
  const quickFacts = page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Fun Facts", exact: true });
  await quickFacts.click();
  const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
  await expect(hub.getByText(factsSummary)).toBeVisible();
  await expect(page.getByRole("article", { name: "Big Three Record" })).toHaveCount(0);
  await expect(hub.getByRole("link", { name: "LeetCode notes" })).toHaveAttribute("href", "https://app.notion.com/p/316ea0b55422803cbd1dd44fe5bfb6ff?source=copy_link");
  const whatnot = hub.getByRole("link", { name: "Whatnot", exact: true });
  await expect(whatnot).toHaveAttribute("href", "https://www.whatnot.com/s/uwPr4llY");
  await expect(whatnot).toHaveAttribute("target", "_blank");
  await expect(whatnot).toHaveAttribute("rel", /\bnoreferrer\b/);
  await expect(hub.getByRole("button", { name: /Footprints/ })).toBeDisabled();
  await hub.getByRole("button", { name: "Big Three Record", exact: true }).click();
  const gym = page.getByRole("article", { name: "Big Three Record" });
  await expect(gym).toBeVisible();
  await gym.getByRole("tab", { name: /Bench press.*160/ }).click();
  await expect(gym.getByRole("tab", { name: /Bench press.*160/ })).toHaveAttribute("aria-selected", "true");
  await expect(gym.getByLabel("Bench press training video")).toBeVisible();
  await page.keyboard.press("Escape");
  await quickFacts.click();
  await hub.getByRole("button", { name: "Big Three Record", exact: true }).click();
  await expect(gym.getByRole("tab", { name: /Squat.*200/ })).toHaveAttribute("aria-selected", "true");
  await page.reload();
  await expect(hub).toBeVisible();
  await expect(gym).toHaveCount(0);
  await quickFacts.click();
  expect(answers).toBe(1);
});

for (const card of [undefined, "fun_facts"]) {
  test(`a legacy ${card ?? "text"} Fun Facts answer refreshes once for the expanded profile`, async ({ page }) => {
    await page.addInitScript(card => sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({ version: 1, draft: "", messages: [
      { role: "user", content: "What do you enjoy outside of engineering?" },
      { role: "assistant", content: "Welcome to my pixel gym!", preset: "Fun Facts", card },
    ] })), card);
    let answers = 0;
    await page.route("**/api/chat", route => { answers++; return route.fulfill({ json: { message: factsSummary, module: { type: "fun_facts" } } }); });
    await page.goto("/chat");
    await expect(page.getByText("Welcome to my pixel gym!")).toBeVisible();
    await expect(page.getByRole("article", { name: "Fun Facts", exact: true })).toHaveCount(0);
    const button = page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Fun Facts", exact: true });
    await button.click();
    await expect(page.getByRole("article", { name: "Fun Facts", exact: true })).toBeVisible();
    await button.click();
    expect(answers).toBe(1);
  });
}

test("a cached Luca-era summary stays readable and refreshes once for Whatnot and Apex", async ({ page }) => {
  const oldSummary = "I enjoy lifting and spending time with my dog Luca.";
  const newSummary = "I enjoy Apex Legends, where my historical peak was Diamond I, and collaborated on Whatnot livestream selling during college.";
  await page.addInitScript(summary => {
    if (!sessionStorage.getItem("portfolio.chat.v1")) sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({ version: 1, draft: "", messages: [
      { role: "user", content: "What do you enjoy outside of engineering?" },
      { role: "assistant", content: summary, preset: "Fun Facts", card: "fun_facts", factsRevision: "2026-10-21-personal-hub-luca" },
    ] }));
  }, oldSummary);
  let answers = 0;
  await page.route("**/api/chat", route => { answers++; return route.fulfill({ json: { message: newSummary, module: { type: "fun_facts" } } }); });
  await page.route("**/api/followups", route => route.fulfill({ json: { questions: ["What do you enjoy about Apex Legends?", "What did you learn through Whatnot?"] } }));
  await page.goto("/chat");
  await expect(page.getByText(oldSummary, { exact: true })).toBeVisible();
  const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
  await expect(hub).toHaveCount(0);
  expect(answers).toBe(0);

  const quickFacts = page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Fun Facts", exact: true });
  await quickFacts.click();
  await expect(hub.getByText(newSummary, { exact: true })).toBeVisible();
  await expect(page.getByText(oldSummary, { exact: true })).toBeVisible();
  await expect(hub.getByRole("link", { name: "Whatnot", exact: true })).toHaveAttribute("href", "https://www.whatnot.com/s/uwPr4llY");
  await expect(hub.getByRole("button", { name: /Footprints/ })).toBeDisabled();
  await quickFacts.click();
  expect(answers).toBe(1);

  await page.reload();
  await expect(hub.getByText(newSummary, { exact: true })).toBeVisible();
  await expect(page.getByText(oldSummary, { exact: true })).toBeVisible();
  await quickFacts.click();
  expect(answers).toBe(1);
});

for (const width of [390, 1280]) {
  test(`Fun Facts destinations fit at ${width}px and Big Three Record opens on demand`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/chat", route => route.fulfill({ json: { message: factsSummary, module: { type: "fun_facts" } } }));
    await page.goto("/chat?query=Fun%20Facts");
    const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
    await expect(hub).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = hub.getByRole("button", { name: "Big Three Record", exact: true });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await page.screenshot({ path: test.info().outputPath(`fun-facts-${width}.png`), fullPage: true, animations: "disabled" });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const gym = page.getByRole("article", { name: "Big Three Record" });
    await expect(gym.getByRole("heading", { name: "Big Three Record", exact: true })).toBeVisible();
    await expect(gym.getByText("Kirby’s Gym", { exact: false })).toHaveCount(0);
    await expect(gym.getByText("Strong typing. Heavy lifting.")).toHaveCount(0);
    await expect(gym.getByRole("link", { name: /Open the gym/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Close Big Three Record", exact: true }).click();
    await expect(gym).toHaveCount(0);
  });
}
