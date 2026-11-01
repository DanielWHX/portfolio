import { expect, test, type Page } from "@playwright/test";
import { FUN_FACTS_REVISION } from "../../lib/portfolio/fun-facts";

const summary = "Outside code, I enjoy strength training, Apex Legends and exploring new perspectives.";
const photoPath = "/life/skydiving.jpg";

async function mockFacts(page: Page) {
  const requests = { answers: 0, followups: 0 };
  await page.route("**/api/chat", route => {
    requests.answers++;
    return route.fulfill({ json: { message: summary, module: { type: "fun_facts" } } });
  });
  await page.route("**/api/followups", route => {
    requests.followups++;
    return route.fulfill({ json: { questions: ["What do you enjoy about Apex Legends?", "What did you learn from Whatnot?"] } });
  });
  return requests;
}

for (const width of [390, 1280]) {
  test(`Fun Facts leads with a loaded skydiving photo and keeps its destinations below at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockFacts(page);
    await page.goto("/chat?query=Fun%20Facts");
    const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
    const photo = hub.locator(`img[src="${photoPath}"]`);
    const opener = hub.getByRole("button", { name: "Open photo collection", exact: true });
    const destinations = hub.getByRole("group", { name: "Explore my interests" });
    await expect(opener).toBeVisible();
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    const photoBox = await photo.boundingBox();
    const summaryBox = await hub.getByText(summary, { exact: true }).boundingBox();
    const linksBox = await destinations.boundingBox();
    expect(photoBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(linksBox).not.toBeNull();
    expect(photoBox!.y).toBeLessThan(summaryBox!.y);
    expect(photoBox!.y + photoBox!.height).toBeLessThanOrEqual(linksBox!.y);
    await expect(destinations.getByRole("button", { name: "Big Three Record", exact: true })).toBeVisible();
    await expect(destinations.getByRole("link", { name: "LeetCode notes", exact: true })).toBeVisible();
    await expect(destinations.getByRole("link", { name: "Whatnot", exact: true })).toHaveAttribute("href", "https://www.whatnot.com/s/uwPr4llY");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("skydiving photo opens and closes without changing the conversation, draft or scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
  const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
  const opener = hub.getByRole("button", { name: "Open photo collection", exact: true });
  const draft = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await draft.fill("Keep this draft while I explore the photo");
  const requestsBefore = { ...requests };
  const userTextCount = await page.getByText("Fun Facts", { exact: true }).count();
  const conversation = page.locator('.chat-messages');

  for (const closeWith of ["Escape", "button"]) {
    await opener.scrollIntoViewIfNeeded();
    await opener.focus();
    const scrollBefore = await conversation.evaluate(element => element.scrollTop);
    await opener.click();
    const lightbox = page.getByRole("dialog", { name: "Photo collection", exact: true });
    await expect(lightbox).toBeVisible();
    await expect(lightbox).toHaveJSProperty("open", true);
    expect(await lightbox.evaluate(element => element.tagName)).toBe("DIALOG");
    const enlargedPhoto = lightbox.locator(`img[src$="${photoPath}"]`);
    await expect(enlargedPhoto).toBeVisible();
    await expect.poll(() => enlargedPhoto.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeHidden();
    if (closeWith === "Escape") await page.keyboard.press("Escape");
    else await lightbox.getByRole("button", { name: "Close photo collection", exact: true }).click();
    await expect(lightbox).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(Math.abs(await conversation.evaluate(element => element.scrollTop) - scrollBefore)).toBeLessThanOrEqual(1);
    await expect(draft).toHaveValue("Keep this draft while I explore the photo");
    await expect(hub.getByText(summary, { exact: true })).toBeVisible();
    expect(await page.getByText("Fun Facts", { exact: true }).count()).toBe(userTextCount);
    expect(requests).toEqual(requestsBefore);
  }

  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
  await hub.getByRole("button", { name: "Big Three Record", exact: true }).click();
  const gym = page.getByRole("dialog", { name: "Big Three Record", exact: true });
  await expect(gym).toBeVisible();
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(gym).toHaveCount(0);
  await expect(draft).toHaveValue("Keep this draft while I explore the photo");
  expect(requests).toEqual(requestsBefore);
});

for (const restored of [false, true]) {
  test(`${restored ? "restored cache" : "reduced motion"} shows the complete Fun Facts photo and summary without entrance animations`, async ({ page }) => {
    if (!restored) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const events: string[] = [];
      (window as unknown as { funFactsAnimationStarts: string[] }).funFactsAnimationStarts = events;
      document.addEventListener("animationstart", event => {
        if (event.target instanceof Element && event.target.closest('article[aria-label="Fun Facts"]')) events.push(event.animationName);
      }, true);
    });
    if (restored) {
      await page.addInitScript(({ summary: savedSummary, revision }) => sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({
        version: 1,
        draft: "Saved draft",
        messages: [
          { role: "user", content: "Fun Facts" },
          { role: "assistant", content: savedSummary, preset: "Fun Facts", card: "fun_facts", factsRevision: revision },
        ],
      })), { summary, revision: FUN_FACTS_REVISION });
    }
    const requests = await mockFacts(page);
    await page.goto(restored ? "/chat" : "/chat?query=Fun%20Facts");
    const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
    const photo = hub.locator(`img[src="${photoPath}"]`);
    await expect(photo).toBeVisible();
    await expect(hub.getByText(summary, { exact: true })).toBeVisible();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    expect(await hub.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
    expect(await page.evaluate(() => (window as unknown as { funFactsAnimationStarts: string[] }).funFactsAnimationStarts)).toEqual([]);
    expect(requests.answers).toBe(restored ? 0 : 1);
    if (restored) await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toHaveValue("Saved draft");
  });
}

test("the animated photo viewer can close during entry and by clicking the backdrop", async ({ page }) => {
  await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  const opener = page.getByRole("button", { name: "Open photo collection", exact: true });
  const viewer = page.getByRole("dialog", { name: "Photo collection", exact: true });
  await opener.click();
  await expect(viewer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(viewer).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(viewer).toHaveCount(0);
  await expect(opener).toBeFocused();
});

for (const width of [320, 390, 1280]) {
  test(`photo collection fans out and browses all supplied photos at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requests = await mockFacts(page);
    await page.goto("/chat?query=Fun%20Facts");
    await page.getByRole("button", { name: "Open photo collection", exact: true }).click();
    const gallery = page.getByRole("dialog");
    await expect(gallery.getByRole("status")).toHaveText("1 / 29");
    await expect(gallery.getByRole("button", { name: /^Enlarge photo/ })).toHaveCount(5);
    for (const card of await gallery.getByRole("button", { name: /^Enlarge photo/ }).all()) {
      const cardBox = await card.boundingBox();
      expect(cardBox!.x).toBeGreaterThanOrEqual(0);
      expect(cardBox!.x + cardBox!.width).toBeLessThanOrEqual(width);
    }
    await page.screenshot({ path: `/private/tmp/portfolio-photo-fan-${width}.png` });
    await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect(gallery.getByRole("status")).toHaveText("2 / 29");
    await gallery.getByRole("button", { name: "Enlarge photo 2", exact: true }).click();
    await expect(gallery.getByRole("button", { name: "Back to photo fan" })).toBeVisible();
    const full = gallery.locator('.fun-photo-focus img');
    await expect.poll(() => full.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(gallery.getByRole("button", { name: "Back to photo fan" })).toHaveCount(0);
    await expect(gallery.getByRole("button", { name: "Enlarge photo 2", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(gallery.getByRole("status")).toHaveText("29 / 29");
    await gallery.getByRole("button", { name: "Enlarge photo 29", exact: true }).click();
    await expect.poll(() => full.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const box = await full.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(850);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(gallery).toHaveCount(0);
    expect(requests.answers).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}


test("a failed photo does not block browsing or closing the collection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockFacts(page);
  await page.route("**/life/collection/01.jpg", route => route.abort());
  await page.goto("/chat?query=Fun%20Facts");
  await page.getByRole("button", { name: "Open photo collection", exact: true }).click();
  const gallery = page.getByRole("dialog", { name: "Photo collection", exact: true });
  await gallery.getByRole("button", { name: "Enlarge photo 2", exact: true }).click();
  await expect(gallery.getByText("Photo unavailable")).toBeVisible();
  await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect.poll(() => gallery.locator('.fun-photo-focus img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await gallery.getByRole("button", { name: "Close photo collection", exact: true }).click();
  await expect(gallery).toHaveCount(0);
});

test("arrow keys move the focused card before Enter enlarges it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  await page.getByRole("button", { name: "Open photo collection", exact: true }).click();
  const gallery = page.getByRole("dialog");
  await gallery.getByRole("button", { name: "Enlarge photo 1", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(gallery.getByRole("button", { name: "Enlarge photo 2", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(gallery.getByRole("status")).toHaveText("2 / 29");
  await expect(gallery.locator('.fun-photo-focus img')).toHaveAttribute("src", /\/life\/collection\/01.jpg$/);
});

test("photo fan remains usable on a small landscape phone", async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  await page.getByRole("button", { name: "Open photo collection", exact: true }).click();
  const gallery = page.getByRole("dialog");
  const card = gallery.getByRole("button", { name: "Enlarge photo 1", exact: true });
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box!.width).toBeGreaterThan(48);
  expect(box!.height).toBeGreaterThan(60);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(320);
  await card.click();
  await expect(gallery.getByRole("button", { name: "Back to photo fan" })).toBeVisible();
  await gallery.getByRole("button", { name: "Close photo collection", exact: true }).click();
  await expect(gallery).toHaveCount(0);
});


test("opening spreads the photo deck and reduced motion settles it immediately", async ({ page }) => {
  await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  const opener = page.getByRole("button", { name: "Open photo collection", exact: true });
  await opener.click();
  const gallery = page.getByRole("dialog");
  const card = gallery.getByRole("button", { name: "Enlarge photo 1", exact: true });
  await expect.poll(() => card.evaluate(element => element.getAnimations().some(animation => animation.playState === "running"))).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => gallery.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  await page.keyboard.press("Escape");
  await expect(gallery).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("the cover stays a single photo until the collection is opened", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  const hub = page.getByRole("article", { name: "Fun Facts", exact: true });
  // Includes decorative/aria-hidden images: the collapsed card has exactly one.
  await expect(hub.locator('figure img')).toHaveCount(1);
  await expect(hub.locator('figure img')).toHaveAttribute("src", photoPath);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await hub.getByRole("button", { name: "Open photo collection", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: /^Enlarge photo/ })).toHaveCount(5);
});

for (const width of [390, 1280]) {
  test(`photo cards remain in reading order while paging forwards and backwards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockFacts(page);
    await page.goto("/chat?query=Fun%20Facts");
    await page.getByRole("button", { name: "Open photo collection", exact: true }).click();
    const gallery = page.getByRole("dialog");
    const visualOrder = () => gallery.getByRole("button", { name: /^Enlarge photo/ }).evaluateAll(cards => cards
      .map(card => ({ label: card.getAttribute("aria-label"), x: card.getBoundingClientRect().x + card.getBoundingClientRect().width / 2 }))
      .sort((a, b) => a.x - b.x).map(card => card.label));
    for (let next = 1; next <= 14; next++) await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect(gallery.getByRole("status")).toHaveText("15 / 29");
    await expect.poll(visualOrder).toEqual([13, 14, 15, 16, 17].map(n => `Enlarge photo ${n}`));
    await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect.poll(visualOrder).toEqual([14, 15, 16, 17, 18].map(n => `Enlarge photo ${n}`));
    await gallery.getByRole("button", { name: "Previous photo", exact: true }).click();
    await expect.poll(visualOrder).toEqual([13, 14, 15, 16, 17].map(n => `Enlarge photo ${n}`));
    await page.screenshot({ path: `/private/tmp/portfolio-photo-ordered-${width}.png` });
  });
}

test("paging moves the outgoing photo off the same edge instead of through the centre", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockFacts(page);
  await page.goto("/chat?query=Fun%20Facts");
  await page.getByRole("button", { name: "Open photo collection", exact: true }).click();
  const gallery = page.getByRole("dialog");
  for (let next = 1; next <= 14; next++) await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
  const outgoing = gallery.getByRole("button", { name: "Enlarge photo 13", exact: true, includeHidden: true });
  const incoming = gallery.getByRole("button", { name: "Enlarge photo 18", exact: true, includeHidden: true });
  const leftBefore = (await outgoing.boundingBox())!.x;
  const rightBefore = (await incoming.boundingBox())!.x;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect.poll(async () => (await outgoing.boundingBox())!.x).toBeLessThan(leftBefore - 5);
  await expect.poll(async () => (await incoming.boundingBox())!.x).toBeLessThan(rightBefore - 5);
  await expect(gallery.getByRole("status")).toHaveText("16 / 29");
  await gallery.getByRole("button", { name: "Previous photo", exact: true }).click();
  await expect.poll(async () => (await outgoing.boundingBox())!.x).toBeGreaterThan(leftBefore - 5);
  await expect(gallery.getByRole("status")).toHaveText("15 / 29");
});
