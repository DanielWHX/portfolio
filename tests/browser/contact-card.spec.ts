import { expect, test } from "@playwright/test";
import { contactProfile } from "../../lib/portfolio/contact-profile";

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`Contact opens a usable card at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    let copied = "";
    await page.exposeFunction("recordContactCopy", (text: string) => { copied = text; });
    await page.addInitScript(({ rejectCopy }) => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
        writeText: async (text: string) => {
          if (rejectCopy) throw new Error("Clipboard unavailable");
          await (window as Window & { recordContactCopy: (text: string) => Promise<void> }).recordContactCopy(text);
        },
      } });
    }, { rejectCopy: viewport.width === 390 });
    const requests: { role: string; content: string }[][] = [];
    await page.route("**/api/chat", route => {
      const { messages } = route.request().postDataJSON();
      requests.push(messages);
      return route.fulfill({ json: messages.length === 1
        ? { message: "Here are my contact details.", module: { type: "contact", contact: contactProfile } }
        : { message: "You're welcome!" } });
    });
    await page.goto("/");
    await page.getByRole("link", { name: "Contact", exact: true }).click();
    const card = page.getByRole("article", { name: "Contact Hongxiang" });
    await expect(card).toBeVisible();
    await expect(page.getByRole("article", { name: "Hongxiang Wang profile" })).toHaveCount(0);
    expect(requests[0]).toEqual([{ role: "user", content: "How can I contact you?" }]);
    for (const [label, href] of [
      ["Email", "mailto:hxjob1017@gmail.com"],
      ["Phone", "tel:3147533414"],
      ["GitHub", "https://github.com/DanielWHX"],
      ["LinkedIn", "https://www.linkedin.com/in/hongxiang-wang-5aa597221"],
    ]) await expect(card.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("href", href);
    for (const label of ["GitHub", "LinkedIn"]) {
      await expect(card.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("target", "_blank");
      await expect(card.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("rel", "noopener noreferrer");
    }
    await expect(card.getByText("KeepMySpiritAliv3", { exact: true })).toBeVisible();
    await card.getByRole("button", { name: "Copy WeChat ID" }).click();
    if (viewport.width === 1280) {
      await expect(card.getByRole("status")).toHaveText("WeChat ID copied.");
      expect(copied).toBe("KeepMySpiritAliv3");
    } else {
      await expect(card.getByRole("status")).toContainText("Select the WeChat ID to copy it.");
      expect(copied).toBe("");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await card.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
    const input = page.getByPlaceholder("Ask about me...");
    await input.fill("Thanks!");
    await page.getByRole("button", { name: "Send question" }).click();
    await expect(page.getByText("You're welcome!", { exact: true })).toBeVisible();
    expect(requests[1]).toEqual([
      { role: "user", content: "How can I contact you?" },
      { role: "assistant", content: "Here are my contact details." },
      { role: "user", content: "Thanks!" },
    ]);
    await page.getByRole("link", { name: "Back to portfolio" }).click();
    await expect(page.getByRole("heading", { name: "Full-Stack Engineer", exact: true })).toBeVisible();
  });
}
