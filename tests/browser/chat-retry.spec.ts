import { expect, test } from "@playwright/test";

type ChatPayload = {
  messages: { role: "user" | "assistant"; content: string }[];
};

const skillsQuestion = "What are your skills?";
const skillsAnswer = "My skills include TypeScript, Java, Python, React, Spring Boot, and Docker.";

test("restores a failed initial question and retries it once as a text answer", async ({ page }) => {
  const requests: ChatPayload[] = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) {
      await route.fulfill({ status: 502, json: { error: "Please try again." } });
    } else {
      await route.fulfill({ json: { message: skillsAnswer } });
    }
  });

  await page.goto(`/chat?query=${encodeURIComponent(skillsQuestion)}`);
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  const send = page.getByRole("button", { name: "Send question" });
  await expect(page.getByRole("alert")).toHaveText("Please try again.");
  await expect(input).toHaveValue(skillsQuestion);
  await expect(input).toBeEnabled();
  await expect(send).toBeEnabled();
  await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
  await expect(page.getByText(skillsQuestion, { exact: true })).toHaveCount(0);

  await send.click();
  await expect(page.getByText(skillsAnswer, { exact: true })).toBeVisible();
  expect(requests).toEqual([
    { messages: [{ role: "user", content: skillsQuestion }] },
    { messages: [{ role: "user", content: skillsQuestion }] },
  ]);
  await expect(page.getByText(skillsQuestion, { exact: true })).toHaveCount(1);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(input).toHaveValue("");
});

test("keeps completed turns when a follow-up fails and is resent", async ({ page }) => {
  const requests: ChatPayload[] = [];
  const introduction = "I'm Hongxiang Wang, a full-stack engineer.";
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 2) {
      await route.abort("failed");
    } else {
      await route.fulfill({
        json: { message: requests.length === 1 ? introduction : skillsAnswer },
      });
    }
  });

  await page.goto("/chat");
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  const send = page.getByRole("button", { name: "Send question" });
  await input.fill("Who are you?");
  await send.click();
  await expect(page.getByText(introduction, { exact: true })).toBeVisible();

  await input.fill(skillsQuestion);
  await send.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(input).toHaveValue(skillsQuestion);
  await expect(send).toBeEnabled();
  await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
  await expect(page.getByText(introduction, { exact: true })).toBeVisible();

  await send.click();
  await expect(page.getByText(skillsAnswer, { exact: true })).toBeVisible();
  const followUp = {
    messages: [
      { role: "user", content: "Who are you?" },
      { role: "assistant", content: introduction },
      { role: "user", content: skillsQuestion },
    ],
  };
  expect(requests).toEqual([
    { messages: [{ role: "user", content: "Who are you?" }] },
    followUp,
    followUp,
  ]);
  await expect(page.getByText("Who are you?", { exact: true })).toHaveCount(1);
  await expect(page.getByText(skillsQuestion, { exact: true })).toHaveCount(1);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("a stalled request times out and leaves the question ready to resend", async ({ page }) => {
  await page.clock.install();
  const requests: ChatPayload[] = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    // Leave the first request pending so the real client timeout must abort it.
    if (requests.length > 1) {
      await route.fulfill({ json: { message: skillsAnswer } });
    }
  });

  await page.goto("/chat");
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  const send = page.getByRole("button", { name: "Send question" });
  await input.fill(skillsQuestion);
  await send.click();
  await expect(page.getByText("Thinking…", { exact: true })).toBeVisible();
  await expect.poll(() => requests.length).toBe(1);
  await page.clock.runFor(35_001);

  await expect(page.getByRole("alert")).toHaveText("The response took too long. Please try again.");
  await expect(input).toHaveValue(skillsQuestion);
  await expect(send).toBeEnabled();
  await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
  await send.click();
  await expect(page.getByText(skillsAnswer, { exact: true })).toBeVisible();
  expect(requests).toEqual([
    { messages: [{ role: "user", content: skillsQuestion }] },
    { messages: [{ role: "user", content: skillsQuestion }] },
  ]);
});
