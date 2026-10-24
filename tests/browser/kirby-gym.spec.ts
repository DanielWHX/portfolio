import { expect, test, type Page } from "@playwright/test";

async function holdRep(page: Page, duration = 1400) {
  const button = page.getByRole("button", { name: "Hold to lift", exact: false });
  await button.focus();
  await page.keyboard.down("Space");
  await page.clock.runFor(duration);
  await page.keyboard.up("Space");
  await page.clock.runFor(700);
}

test("the public gym shows approved records and plays a three-rep set without API calls", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) apiRequests.push(request.url()); });
  await page.clock.install();
  await page.goto("/gym");
  const gym = page.getByRole("article", { name: "Big Three Record" });
  await expect(gym).toBeVisible();
  await expect(page.getByRole("button", { name: /Squat.*200/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /Bench press.*160/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Deadlift.*200/ })).toBeVisible();
  await expect(gym.getByText("560", { exact: false }).first()).toBeVisible();
  for (const count of [1, 2, 3]) {
    await holdRep(page);
    await expect(page.getByLabel(`${count} of 3 reps completed`)).toBeVisible();
  }
  await expect(page.getByRole("status")).toHaveText("Set complete! Three stars, well earned.");
  await page.getByRole("button", { name: "Start another set", exact: false }).click();
  await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
  expect(apiRequests).toEqual([]);
});

test("early and late release do not award a rep; cancelled and interrupted holds reset", async ({ page }) => {
  await page.clock.install();
  await page.goto("/gym");
  await holdRep(page, 200);
  await expect(page.getByRole("status")).toContainText("A little early");
  await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
  await holdRep(page, 2000);
  await expect(page.getByRole("status")).toContainText("Too much power");
  const button = page.getByRole("button", { name: "Hold to lift", exact: false });
  await button.focus();
  await page.keyboard.down("Space");
  await page.clock.runFor(1400);
  await page.getByRole("button", { name: /Bench press.*160/ }).focus();
  await page.keyboard.up("Space");
  await expect(page.getByRole("progressbar", { name: "Lift power" })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
  const box = await button.boundingBox();
  await page.mouse.move(box!.x + 15, box!.y + 15);
  await page.mouse.down();
  await page.clock.runFor(1400);
  await page.getByRole("button", { name: "Release in the target zone", exact: false }).dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", isPrimary: true });
  await page.mouse.up();
  await expect(page.getByRole("progressbar", { name: "Lift power" })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
});

test("a mouse release cannot complete a keyboard-owned hold", async ({ page }) => {
  await page.clock.install();
  await page.goto("/gym");
  const button = page.getByRole("button", { name: "Hold to lift", exact: false });
  await button.focus();
  const box = await button.boundingBox();
  await page.keyboard.down("Space");
  await page.clock.runFor(1400);
  await page.mouse.click(box!.x + 20, box!.y + 20);
  await expect(page.getByRole("button", { name: "Release in the target zone", exact: false })).toBeVisible();
  await page.keyboard.up("Space");
  await page.clock.runFor(700);
  await expect(page.getByLabel("1 of 3 reps completed")).toBeVisible();
});

test("a mobile touch hold completes a rep", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3103", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.clock.install();
    await page.goto("/gym");
    const button = page.getByRole("button", { name: "Hold to lift", exact: false });
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    const touch = await context.newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box!.x + box!.width / 2, y: box!.y + box!.height / 2, id: 0 }] });
    await page.clock.runFor(1400);
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.clock.runFor(700);
    await expect(page.getByLabel("1 of 3 reps completed")).toBeVisible();
  } finally {
    await context.close();
  }
});

test("changing lifts or resting cancels pending rewards and retains each lift's progress", async ({ page }) => {
  await page.clock.install();
  await page.goto("/gym");
  await holdRep(page);
  await page.getByRole("button", { name: /Deadlift.*200/ }).click();
  await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
  const liftButton = page.getByRole("button", { name: "Hold to lift", exact: false });
  await liftButton.focus();
  await page.keyboard.down("Space");
  await page.clock.runFor(1400);
  await page.keyboard.up("Space");
  await page.getByRole("button", { name: "Take a breather", exact: false }).click();
  await page.clock.runFor(1000);
  await expect(page.getByRole("status")).toContainText("Recovery is part of the game");
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to the bar", exact: false }).click();
  await expect(page.getByRole("button", { name: /Deadlift.*200/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
  await page.getByRole("button", { name: /Squat.*200/ }).click();
  await expect(page.getByLabel("1 of 3 reps completed")).toBeVisible();
});

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
  await gym.getByRole("button", { name: /Bench press.*160/ }).click();
  await expect(gym.getByRole("button", { name: /Bench press.*160/ })).toHaveAttribute("aria-pressed", "true");
  await expect(gym.locator(".gym-sprite-action")).toHaveCSS("animation-name", "gym-breathe");
  await page.keyboard.press("Escape");
  await quickFacts.click();
  await hub.getByRole("button", { name: "Big Three Record", exact: true }).click();
  await expect(gym.getByRole("button", { name: /Squat.*200/ })).toHaveAttribute("aria-pressed", "true");
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
    await expect(gym.getByRole("heading", { name: /THE BIG THREE 560 kg/ })).toBeVisible();
    await expect(gym.getByText("Kirby’s Gym", { exact: false })).toHaveCount(0);
    await expect(gym.getByText("Strong typing. Heavy lifting.")).toHaveCount(0);
    await expect(gym.getByRole("link", { name: /Open the gym/ })).toHaveCount(0);
    await expect(gym.locator(".gym-sr-only")).toHaveCSS("width", "1px");
    await page.getByRole("button", { name: "Close Big Three Record", exact: true }).click();
    await expect(gym).toHaveCount(0);
  });
}

for (const width of [390, 1280]) {
  test(`gym assets, pointer controls and reduced motion work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/gym");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const id of ["idle", "squat", "squat-up", "bench", "bench-down", "deadlift", "deadlift-up"]) {
      const src = `/gym/kirby-${id}.png`;
      const response = await page.request.get(src);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
    }
    await expect(page.locator(".gym-sprite-idle")).toHaveCSS("animation-name", "none");
    const button = page.getByRole("button", { name: "Hold to lift", exact: false });
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await button.click();
    await expect(page.getByRole("status")).toContainText("A little early");
    await expect(page.getByLabel("0 of 3 reps completed")).toBeVisible();
    await page.screenshot({ path: test.info().outputPath(`kirby-gym-${width}.png`), fullPage: true, animations: "disabled" });
  });
}
