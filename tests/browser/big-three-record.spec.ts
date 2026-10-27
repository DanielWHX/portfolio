import { expect, test, type Locator } from "@playwright/test";

const lifts = [
  { id: "squat", label: "Squat", kg: 200 },
  { id: "bench", label: "Bench press", kg: 160 },
  { id: "deadlift", label: "Deadlift", kg: 200 },
];

test("Big Three Record directly shows three video tabs and no game", async ({ page }) => {
  const apiRequests: string[] = [];
  const spriteRequests: string[] = [];
  const videoRequests: string[] = [];
  page.on("request", request => {
    const url = request.url();
    if (url.includes("/api/")) apiRequests.push(url);
    if (/\/gym\/kirby-/.test(url)) spriteRequests.push(url);
    if (/\/gym\/videos\/.*\.mp4/.test(url)) videoRequests.push(url);
  });
  await page.goto("/gym");
  const record = page.getByRole("article", { name: "Big Three Record", exact: true });
  await expect(record.getByRole("tab")).toHaveCount(3);
  await expect(record.getByRole("heading", { name: "Big Three Record", exact: true })).toBeVisible();
  await expect(record.getByLabel("Combined lifts")).toContainText("560");
  for (const lift of lifts) {
    await expect(record.getByRole("tab", { name: `${lift.label} ${lift.kg} kg`, exact: true })).toBeVisible();
  }
  await expect(record.getByRole("tab").first()).toHaveAttribute("aria-selected", "true");
  const video = record.getByLabel("Squat training video");
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute("src", "/gym/videos/squat.mp4");
  await expect(video).toHaveAttribute("poster", "/gym/videos/squat-poster.jpg");
  await expect(video).toHaveAttribute("preload", "none");
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused && !element.autoplay && element.muted && element.controls && element.playsInline)).toBe(true);
  await expect(record.getByRole("button", { name: /Hold to lift|Take a breather/ })).toHaveCount(0);
  await expect(record.getByRole("progressbar")).toHaveCount(0);
  await expect(record.getByRole("checkbox", { name: "Screen impact" })).toHaveCount(0);
  expect(apiRequests).toEqual([]);
  expect(spriteRequests).toEqual([]);
  expect(videoRequests).toEqual([]);
});

test("each clip decodes and switching tabs stops and replaces the previous player", async ({ page }) => {
  await page.goto("/gym");
  let previous: Awaited<ReturnType<Locator["elementHandle"]>> | null = null;
  for (const lift of lifts) {
    await page.getByRole("tab", { name: `${lift.label} ${lift.kg} kg`, exact: true }).click();
    if (previous) {
      expect(await previous.evaluate((element: HTMLVideoElement) => element.paused && !element.isConnected)).toBe(true);
      await previous.dispose();
    }
    await expect(page.locator("video")).toHaveCount(1);
    const video = page.getByLabel(`${lift.label} training video`);
    await expect(video).toHaveAttribute("src", `/gym/videos/${lift.id}.mp4`);
    await expect(video).toHaveAttribute("poster", `/gym/videos/${lift.id}-poster.jpg`);
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused && !element.autoplay)).toBe(true);
    await video.evaluate((element: HTMLVideoElement) => element.play());
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.videoWidth)).toBe(720);
    expect(await video.evaluate((element: HTMLVideoElement) => element.duration)).toBeGreaterThan(10);
    previous = await video.elementHandle();
  }
  await page.getByRole("tab", { name: "Squat 200 kg", exact: true }).click();
  expect(await previous!.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await previous!.dispose();
  const first = page.getByLabel("Squat training video");
  expect(await first.evaluate((element: HTMLVideoElement) => element.paused && element.currentTime === 0)).toBe(true);
});

test("video tabs support arrow keys, Home and End with one keyboard tab stop", async ({ page }) => {
  await page.goto("/gym");
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  for (const [key, index] of [["ArrowRight", 1], ["End", 2], ["ArrowRight", 0], ["ArrowLeft", 2], ["Home", 0]] as const) {
    await page.keyboard.press(key);
    await expect(tabs.nth(index)).toBeFocused();
    await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(index)).toHaveAttribute("tabindex", "0");
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", await tabs.nth(index).getAttribute("id") as string);
    await expect(page.getByRole("tablist").locator('[tabindex="0"]')).toHaveCount(1);
  }
});

test("an unavailable clip has a direct link and does not break the other tabs", async ({ page }) => {
  await page.route("**/gym/videos/squat.mp4", route => route.abort());
  await page.goto("/gym");
  await page.getByLabel("Squat training video").evaluate((element: HTMLVideoElement) => element.play().catch(() => {}));
  await expect(page.getByRole("status")).toContainText("This video could not be played");
  await expect(page.getByRole("link", { name: "Open the video", exact: true })).toHaveAttribute("href", "/gym/videos/squat.mp4");
  await page.getByRole("tab", { name: "Bench press 160 kg", exact: true }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  const video = page.getByLabel("Bench press training video");
  await video.evaluate((element: HTMLVideoElement) => element.play());
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.videoWidth)).toBe(720);
});

for (const viewport of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 720 }]) {
  test(`video dialog fits ${viewport.width}px, hides suggestions and restores the conversation`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    let answers = 0;
    await page.route("**/api/chat", route => { answers++; return route.fulfill({ json: { message: "I enjoy lifting, travel and solving problems.", module: { type: "fun_facts" } } }); });
    await page.route("**/api/followups", route => route.fulfill({ json: { questions: ["What do you enjoy about lifting?", "What did you learn from Whatnot?"] } }));
    await page.goto("/chat?query=Fun%20Facts");
    await expect(page.getByRole("heading", { name: "You could ask" })).toBeVisible();
    const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
    await input.fill("Keep this draft");
    const opener = page.getByRole("button", { name: "Big Three Record", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Big Three Record", exact: true });
    await expect(dialog.getByRole("tablist")).toBeInViewport({ ratio: 1 });
    await expect(dialog.getByLabel("Squat training video")).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole("heading", { name: "You could ask" })).toBeHidden();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const video = await dialog.locator("video").elementHandle();
    if (viewport.width === 1280) await video!.evaluate((element: HTMLVideoElement) => element.play());
    await page.screenshot({ path: test.info().outputPath(`big-three-${viewport.width}.png`), animations: "disabled" });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await video!.evaluate((element: HTMLVideoElement) => element.paused && !element.isConnected)).toBe(true);
    await video!.dispose();
    await expect(opener).toBeFocused();
    await expect(input).toHaveValue("Keep this draft");
    await expect(page.getByRole("heading", { name: "You could ask" })).toBeVisible();
    await opener.click();
    await expect(page.getByRole("tab", { name: "Squat 200 kg", exact: true })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("button", { name: "Close Big Three Record", exact: true }).click();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    expect(answers).toBe(1);
  });
}

test("old theme links show the same video record without a game preview", async ({ page }) => {
  for (const theme of ["iron", "arcade"]) {
    await page.goto(`/gym?theme=${theme}`);
    await expect(page.getByRole("tab")).toHaveCount(3);
    await expect(page.getByLabel("Squat training video")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Compare design previews" })).toHaveCount(0);
  }
});
