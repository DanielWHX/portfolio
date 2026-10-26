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

test("the magnetic crystal surface moves toward the pointer and returns without moving its hit target", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const calls = await openSuggestions(page);
  await page.getByRole("textbox", { name: "Ask about Hongxiang" }).fill("Keep this draft");
  await page.getByRole("button", { name: "Collapse suggested questions", exact: true }).click();
  const bubble = page.getByRole("button", { name: "Expand suggested questions", exact: true });
  const surface = bubble.locator(".chat-dock-orb-surface");
  await expect(surface).toBeVisible();
  await bubble.hover({ position: { x: 24, y: 24 } });
  const box = await bubble.boundingBox();
  const me = page.getByRole("navigation", { name: "Quick questions" }).getByRole("button", { name: "Me", exact: true });
  const meBefore = await me.boundingBox();
  const counts = { ...calls };
  await page.mouse.move(box!.x + box!.width * .85, box!.y + box!.height / 2);
  await expect.poll(() => surface.evaluate(element => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return matrix.m41 > .3 && Math.abs(matrix.a - matrix.d) > .01;
  })).toBe(true);
  const hitTarget = await bubble.boundingBox();
  expect(Math.abs(hitTarget!.x - box!.x)).toBeLessThan(.5);
  expect(Math.abs((await me.boundingBox())!.x - meBefore!.x)).toBeLessThan(.5);
  const visual = await surface.boundingBox();
  expect(visual!.x).toBeGreaterThanOrEqual(box!.x - .5);
  expect(visual!.x + visual!.width).toBeLessThanOrEqual(box!.x + box!.width + .5);
  await page.screenshot({ path: test.info().outputPath("crystal-bubble-hover.png") });

  await page.mouse.move(box!.x + box!.width + 30, box!.y + box!.height + 45);
  await expect.poll(() => surface.evaluate(element => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return Math.abs(matrix.m41) < .1 && Math.abs(matrix.m42) < .1 && Math.abs(matrix.a - 1) < .002 && Math.abs(matrix.d - 1) < .002;
  })).toBe(true);
  const film = bubble.locator(".chat-dock-orb-film");
  const initialLight = await film.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => film.evaluate(element => getComputedStyle(element).transform)).not.toBe(initialLight);
  await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toHaveValue("Keep this draft");
  expect(calls).toEqual(counts);
  await bubble.press("Enter");
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
});

test("changing to reduced motion stops the glass light and resets a hovered bubble", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openSuggestions(page);
  await page.getByRole("button", { name: "Collapse suggested questions", exact: true }).click();
  const bubble = page.getByRole("button", { name: "Expand suggested questions", exact: true });
  const surface = bubble.locator(".chat-dock-orb-surface");
  await expect(surface).toBeVisible();
  await bubble.hover({ position: { x: 38, y: 22 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => surface.evaluate(element => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return Math.abs(matrix.m41) < .01 && Math.abs(matrix.m42) < .01 && Math.abs(matrix.a - 1) < .001 && Math.abs(matrix.d - 1) < .001;
  })).toBe(true);
  expect(await bubble.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === "running"))).toBe(false);
  await bubble.press("Enter");
  await expect(page.getByRole("heading", { name: "You could ask", exact: true })).toBeVisible();
});
