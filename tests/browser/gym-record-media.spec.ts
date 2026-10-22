import { expect, test } from "@playwright/test";

test("the three real lift clips open on demand and decode without autoplay", async ({ page }) => {
  const fetchedVideos: string[] = [];
  page.on("request", request => { if (/\/gym\/videos\/.*\.mp4/.test(request.url())) fetchedVideos.push(request.url()); });
  await page.goto("/gym");
  await expect(page.getByRole("article", { name: "Big Three Record" })).toHaveAttribute("data-theme", "iron");
  await expect(page.locator("video")).toHaveCount(0);
  expect(fetchedVideos).toEqual([]);
  for (const lift of [{ id: "squat", label: "Squat", kg: 200 }, { id: "bench", label: "Bench press", kg: 160 }, { id: "deadlift", label: "Deadlift", kg: 200 }]) {
    await page.getByRole("button", { name: new RegExp(`${lift.label}.*${lift.kg}`) }).click();
    const opener = page.getByRole("button", { name: `Watch ${lift.label} video` });
    await opener.click();
    const video = page.getByLabel(`${lift.label} training video`);
    await expect(video).toHaveAttribute("src", `/gym/videos/${lift.id}.mp4`);
    await expect(video).toHaveAttribute("preload", "none");
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused && !element.autoplay && element.muted)).toBe(true);
    await video.evaluate(async (element: HTMLVideoElement) => { await element.play(); });
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.videoWidth)).toBe(720);
    expect(await video.evaluate((element: HTMLVideoElement) => element.duration)).toBeGreaterThan(10);
    await page.keyboard.press("Escape");
    await expect(page.locator("video")).toHaveCount(0);
    await expect(opener).toBeFocused();
  }
});

test("closing a nested video returns to the game before returning to the conversation", async ({ page }) => {
  await page.route("**/api/chat", route => route.fulfill({ json: { message: "I enjoy lifting and solving LeetCode problems.", module: { type: "fun_facts" } } }));
  await page.route("**/api/followups", route => route.fulfill({ json: { questions: ["What do you enjoy about lifting?", "What are your other interests?"] } }));
  await page.goto("/chat?query=Fun%20Facts");
  const opener = page.getByRole("button", { name: "Big Three Record", exact: true });
  await opener.click();
  const game = page.getByRole("dialog", { name: "Big Three Record", exact: true });
  await game.getByRole("button", { name: "Watch Squat video" }).click();
  await page.keyboard.press("Escape");
  await expect(game).toBeVisible();
  await expect(game.getByRole("button", { name: "Watch Squat video" })).toBeFocused();
  await game.getByRole("button", { name: "Close Big Three Record" }).click();
  await expect(game).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("iron impact is finite and can be disabled without changing rep scoring", async ({ page }) => {
  await page.clock.install();
  await page.goto("/gym?theme=iron");
  const game = page.getByRole("article", { name: "Big Three Record" });
  await expect(game).toHaveAttribute("data-theme", "iron");
  const hold = page.getByRole("button", { name: "Hold to lift" });
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(page.locator("html")).toHaveClass(/gym-impact-charge/);
  await page.clock.runFor(1400);
  await page.keyboard.up("Space");
  await page.clock.runFor(700);
  await expect(page.getByLabel("1 of 3 reps completed")).toBeVisible();
  await expect(game).toHaveClass(/gym-impact-crack/);
  await page.clock.runFor(900);
  await expect(game).not.toHaveClass(/gym-impact-crack/);
  await expect(page.locator("html")).not.toHaveClass(/gym-impact-/);
  await page.getByRole("checkbox", { name: "Screen impact" }).uncheck();
  await page.getByRole("button", { name: "Hold to lift" }).focus();
  await page.keyboard.down("Space");
  await page.clock.runFor(1400);
  await page.keyboard.up("Space");
  await page.clock.runFor(700);
  await expect(page.getByLabel("2 of 3 reps completed")).toBeVisible();
  await expect(game).not.toHaveClass(/gym-impact-crack/);
  await expect(page.locator("html")).not.toHaveClass(/gym-impact-/);
});

for (const theme of ["arcade", "iron"]) {
  for (const width of [390, 1280]) {
    test(`${theme} preview fits ${width}px and reduced motion disables impact`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.clock.install();
      await page.goto(`/gym?theme=${theme}`);
      const game = page.getByRole("article", { name: "Big Three Record" });
      await expect(game).toHaveAttribute("data-theme", theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole("button", { name: "Hold to lift" }).focus();
      await page.keyboard.down("Space");
      await page.clock.runFor(1400);
      await page.keyboard.up("Space");
      await page.clock.runFor(700);
      await expect(page.getByLabel("1 of 3 reps completed")).toBeVisible();
      await expect(page.locator("html")).not.toHaveClass(/gym-impact-/);
      await expect(game).not.toHaveClass(/gym-impact-crack/);
      await page.screenshot({ path: test.info().outputPath(`${theme}-${width}.png`), fullPage: true, animations: "disabled" });
    });
  }
}
