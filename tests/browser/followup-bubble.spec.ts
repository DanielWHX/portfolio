import { expect, test, type Page } from "@playwright/test";

async function openSuggestions(page: Page) {
  const calls = { answers: 0, followups: 0 };
  await page.route("**/api/chat", route => {
    calls.answers++;
    return route.fulfill({ json: { message: "My skills focus on Python and Java backend development.", module: { type: "skills" } } });
  });
  await page.route("**/api/followups", route => {
    calls.followups++;
    return route.fulfill({ json: { questions: ["How did you use Java in JChatMind?", "What did you build in Lyntra?"] } });
  });
  await page.goto("/chat?query=Skills");
  await expect(page.getByRole("button", { name: "Collapse suggested questions", exact: true })).toBeVisible();
  return calls;
}

async function collapseSphere(page: Page) {
  await page.getByRole("button", { name: "Collapse suggested questions", exact: true }).click();
  const bubble = page.getByRole("button", { name: "Expand suggested questions", exact: true });
  await expect(bubble).toBeVisible();
  await expect.poll(() => page.locator(".chat-dock-orb-slot").evaluate(element => element.getAnimations().some(animation => animation.playState === "running"))).toBe(false);
  return bubble;
}

async function liquidFrame(page: Page) {
  return page.locator(".chat-dock-orb-liquid").evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (let index = 0; index < pixels.length; index += 8) hash = Math.imul(hash ^ pixels[index], 16777619);
    return hash >>> 0;
  });
}

test("the bubble and four-point star stay completely static without hover", async ({ page }) => {
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  expect(await bubble.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  const first = await liquidFrame(page);
  await page.waitForTimeout(180);
  expect(await liquidFrame(page)).toBe(first);
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
});

test("hover blends the star into a living liquid sphere and leaves the hit target fixed", async ({ page }) => {
  const calls = await openSuggestions(page);
  await page.getByRole("textbox", { name: "Ask about Hongxiang" }).fill("Keep this draft");
  const bubble = await collapseSphere(page);
  const star = bubble.locator(".chat-dock-orb-star");
  const liquid = bubble.locator(".chat-dock-orb-liquid");
  const box = await bubble.boundingBox();
  const me = page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Me", exact: true });
  const meBefore = await me.boundingBox();
  const counts = { ...calls };
  await bubble.hover();
  await expect(star).toHaveCSS("opacity", "0");
  await expect(liquid).toHaveCSS("opacity", "1");
  const first = await liquidFrame(page);
  await expect.poll(() => liquidFrame(page)).not.toBe(first);
  expect(Math.abs((await bubble.boundingBox())!.x - box!.x)).toBeLessThan(.5);
  expect(Math.abs((await me.boundingBox())!.x - meBefore!.x)).toBeLessThan(.5);
  await page.screenshot({ path: test.info().outputPath("thinking-sphere-hover.png") });
  await page.mouse.move(box!.x + box!.width + 30, box!.y - 40);
  await expect(star).toHaveCSS("opacity", "1");
  await expect(liquid).toHaveCSS("opacity", "0");
  const resting = await liquidFrame(page);
  await page.waitForTimeout(180);
  expect(await liquidFrame(page)).toBe(resting);
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toHaveValue("Keep this draft");
  expect(calls).toEqual(counts);
  await bubble.press("Enter");
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
});

test("a partial hover reverses smoothly instead of restarting or snapping", async ({ page }) => {
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  const liquid = bubble.locator(".chat-dock-orb-liquid");
  const box = await bubble.boundingBox();
  await page.clock.install();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.clock.runFor(100);
  const entering = await liquid.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(entering).toBeGreaterThan(.05);
  expect(entering).toBeLessThan(.95);
  await page.mouse.move(box!.x + box!.width + 30, box!.y - 30);
  await page.clock.runFor(40);
  const reversing = await liquid.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(reversing).toBeGreaterThan(0);
  expect(Math.abs(reversing - entering)).toBeLessThan(.35);
  await bubble.hover();
  await page.clock.runFor(40);
  const resuming = await liquid.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(resuming).toBeGreaterThan(0);
  expect(Math.abs(resuming - reversing)).toBeLessThan(.35);
  await page.clock.runFor(1000);
  await expect(liquid).toHaveCSS("opacity", "1");
});

test("a stationary hover cycles between a broad fold and a filled sphere without shrinking into a bead", async ({ page }) => {
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await page.clock.install();
  await bubble.hover();
  await page.clock.runFor(1000);
  const coverage: number[] = [];
  for (let sample = 0; sample < 9; sample++) {
    coverage.push(await bubble.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const { data } = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
      let coloured = 0;
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const [r, g, b, a] = data.slice(i, i + 4);
        // Track the coloured liquid, excluding the fixed pale glass shell.
        if (a > 100 && Math.max(r, g, b) - Math.min(r, g, b) > 60) coloured++;
      }
      return coloured / (canvas.width * canvas.height);
    }));
    await page.clock.runFor(400);
  }
  expect(Math.max(...coverage), "the reference fills the glass sphere during its round phase").toBeGreaterThan(.43);
  expect(Math.min(...coverage), "the folded phase opens clear space above and below the wave").toBeLessThan(Math.max(...coverage) * .8);
});

test("a failed animation asset leaves the static star and its expand action usable", async ({ page }) => {
  await page.route("**/ai/thinking-cycle.webp", route => route.abort());
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await bubble.hover();
  await page.waitForTimeout(700);
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
  await bubble.click();
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
});

test("the supplied cycle returns to the same pose after several uninterrupted loops", async ({ page }) => {
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await page.clock.install();
  // Pixel readback must not advance real time between the two samples.
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await bubble.hover();
  await page.clock.runFor(1000);
  const pixels = () => bubble.locator("canvas").evaluate((canvas: HTMLCanvasElement) =>
    Array.from(canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data));
  const before = await pixels();
  await page.clock.runFor(7500);
  const after = await pixels();
  const error = after.reduce((sum, value, index) => sum + Math.abs(value - before[index]), 0) / after.length;
  expect(error, "five 1.5s cycles must return to the same visual pose").toBeLessThan(3);
});

test("finishing a delayed asset load after blur does not restart the animation", async ({ page }) => {
  let release!: () => void;
  let waiting = false;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/ai/thinking-cycle.webp", async route => {
    waiting = true;
    await pending;
    await route.continue();
  });
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await expect.poll(() => waiting).toBe(true);
  await bubble.hover();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const loaded = page.waitForResponse("**/ai/thinking-cycle.webp");
  release();
  await loaded;
  await page.waitForTimeout(800);
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
});

test("a pending animation keeps the star visible and starts only when the hovered asset is ready", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/ai/thinking-cycle.webp", async route => {
    await pending;
    await route.continue();
  });
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await bubble.hover();
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
  release();
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "1");
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "0");
});

test("reduced motion and blur restore the still star without breaking expansion", async ({ page }) => {
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await bubble.hover();
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "1");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
  await page.mouse.move(0, 0);
  await bubble.hover();
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
  expect(await bubble.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  await bubble.press("Enter");
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
});

test("touch keeps the static icon and tap still expands suggestions", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3103", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await openSuggestions(page);
    const bubble = await collapseSphere(page);
    await bubble.dispatchEvent("pointerenter", { pointerType: "touch", isPrimary: true });
    await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
    await expect(bubble.locator(".chat-dock-orb-liquid")).toHaveCSS("opacity", "0");
    await bubble.tap();
    await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test("an unavailable Canvas leaves a usable glass-star fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (this.classList.contains("chat-dock-orb-liquid")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await openSuggestions(page);
  const bubble = await collapseSphere(page);
  await bubble.hover();
  await expect(bubble.locator(".chat-dock-orb-star")).toHaveCSS("opacity", "1");
  await bubble.click();
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
});

for (const width of [390, 1280]) {
  test(`both thought-bubble tail dots remain painted below the question at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openSuggestions(page);
    const tail = page.locator(".chat-followups-tail");
    const painted = await tail.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const before = getComputedStyle(element, "::before");
      const after = getComputedStyle(element, "::after");
      const gap = parseFloat(getComputedStyle(element).columnGap);
      const centres = [
        [rect.left + parseFloat(before.width) / 2, rect.top + rect.height / 2],
        [rect.left + parseFloat(before.width) + gap + parseFloat(after.width) / 2, rect.top + rect.height / 2 + new DOMMatrix(after.transform).m42],
      ];
      return centres.map(([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        return hit === element || Boolean(hit && element.contains(hit));
      });
    });
    expect(painted, "both decorative circles must survive the dock's paint clipping").toEqual([true, true]);
    await page.getByRole("region", { name: "Suggested questions", exact: true }).screenshot({ path: test.info().outputPath(`thought-tail-${width}.png`) });
  });
}
