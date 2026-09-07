import { expect, test } from "@playwright/test";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";
import { contactProfile } from "../../lib/portfolio/contact-profile";

const introduction = "I'm Hongxiang. I enjoy fitness and SaaS companies.";
const skills = "My skills include TypeScript, Java, React, and Spring Boot.";

test("retains cards, drafts and follow-up context through home navigation and reload, then starts fresh", async ({ page, context }) => {
  const requests: { role: string; content: string }[][] = [];
  await page.route("**/api/chat", route => {
    const messages = route.request().postDataJSON().messages;
    requests.push(messages);
    return route.fulfill({ json: requests.length === 1
      ? { message: introduction, module: { type: "profile", profile: getResumeOverviewCard(introduction) } }
      : { message: skills } });
  });
  await page.goto("/chat?query=Who%20are%20you%3F");
  await expect(page.getByRole("article", { name: "Hongxiang Wang profile" })).toBeVisible();
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await input.fill("What are your skills?");
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await page.getByRole("link", { name: "Me", exact: true }).click();
  await expect(input).toHaveValue("What are your skills?");
  await expect(page.getByRole("article", { name: "Hongxiang Wang profile" })).toHaveCount(1);
  await expect(page.locator(".answer-reveal > span").last()).toHaveCSS("animation-name", "none");
  expect(requests).toHaveLength(1);
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByText(skills, { exact: true })).toBeVisible();
  expect(requests[1]).toEqual([
    { role: "user", content: "Who are you?" },
    { role: "assistant", content: introduction },
    { role: "user", content: "What are your skills?" },
  ]);
  await page.reload();
  await expect(page.getByText(skills, { exact: true })).toBeVisible();
  expect(requests).toHaveLength(2);
  const freshTab = await context.newPage();
  await freshTab.goto("/chat");
  await expect(freshTab.getByRole("article")).toHaveCount(0);
  await expect(freshTab.getByText(skills, { exact: true })).toHaveCount(0);
  await freshTab.close();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(skills, { exact: true })).toHaveCount(0);
  await expect(input).toHaveValue("");
  await input.fill("Hello again");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByText(skills, { exact: true })).toBeVisible();
  expect(requests[2]).toEqual([{ role: "user", content: "Hello again" }]);
});

test("an interrupted request restores the question as a draft instead of replaying or duplicating it", async ({ page }) => {
  const requests: { role: string; content: string }[][] = [];
  await page.route("**/api/chat", route => {
    requests.push(route.request().postDataJSON().messages);
    if (requests.length === 2) return;
    return route.fulfill({ json: { message: requests.length === 1 ? introduction : skills } });
  });
  await page.goto("/chat?query=Who%20are%20you%3F");
  await expect(page.getByText(introduction, { exact: true })).toBeVisible();
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await input.fill("What are your skills?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect.poll(() => requests.length).toBe(2);
  await page.reload();
  await expect(input).toHaveValue("What are your skills?");
  await expect(page.getByText("Thinking…", { exact: true })).toHaveCount(0);
  await expect(page.getByText(introduction, { exact: true })).toBeVisible();
  expect(requests).toHaveLength(2);
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByText(skills, { exact: true })).toBeVisible();
  expect(requests[2]).toEqual(requests[1]);
});

for (const unavailable of [false, true]) {
  test(`chat still works with ${unavailable ? "blocked" : "corrupt"} session storage`, async ({ page }) => {
    await page.addInitScript(unavailable => {
      if (unavailable) {
        Object.defineProperty(Storage.prototype, "getItem", { value: () => { throw new Error("Storage blocked"); } });
        Object.defineProperty(Storage.prototype, "setItem", { value: () => { throw new Error("Storage blocked"); } });
      } else sessionStorage.setItem("portfolio.chat.v1", '{"messages":[{"role":"assistant","content":"invalid"}]}');
    }, unavailable);
    await page.route("**/api/chat", route => route.fulfill({ json: { message: skills } }));
    await page.goto("/chat?query=Skills");
    await expect(page.getByText(skills, { exact: true })).toBeVisible();
    await expect(page.getByText("invalid", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
}

test("restores a Contact card with working copy actions", async ({ page }) => {
  let copied = "";
  await page.exposeFunction("captureCopy", (value: string) => { copied = value; });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: {
      writeText: (value: string) => (window as unknown as { captureCopy: (value: string) => Promise<void> }).captureCopy(value),
    } });
  });
  await page.route("**/api/chat", route => route.fulfill({ json: {
    message: "Let's connect!", module: { type: "contact", contact: contactProfile },
  } }));
  await page.goto("/chat?query=How%20can%20I%20contact%20you%3F");
  await expect(page.getByRole("article", { name: "Contact Hongxiang" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Copy Email", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Email copied.");
  expect(copied).toBe("hxjob1017@gmail.com");
});

test("New chat resets a restored conversation at the question limit", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    sessionStorage.setItem("portfolio.chat.v1", JSON.stringify({ version: 1, draft: "", messages:
      Array.from({ length: 15 }, (_, index) => [
        { role: "user", content: `Question ${index}` }, { role: "assistant", content: `Answer ${index}` },
      ]).flat(),
    }));
  });
  await page.goto("/chat");
  const input = page.getByRole("textbox", { name: "Ask about Hongxiang" });
  await expect(input).toHaveAttribute("placeholder", "Question limit reached");
  await expect(input).toBeDisabled();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await expect(input).toBeEnabled();
  await expect(input).toHaveAttribute("placeholder", "Ask about me...");
  await expect(page.getByText("Answer 14", { exact: true })).toHaveCount(0);
});
