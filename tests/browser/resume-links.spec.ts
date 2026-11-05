import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { getResumeOverviewCard } from "../../lib/portfolio/resume-profile";

const pdfPath = "/resume/Hongxiang_Wang_Resume.pdf";

for (const width of [320, 1280]) {
  test(`Me offers a working resume preview and download at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let requests = 0;
    await page.route("**/api/chat", route => {
      requests++;
      return route.fulfill({ json: { message: "I'm Hongxiang.", module: { type: "profile", profile: getResumeOverviewCard("I'm Hongxiang.") } } });
    });
    await page.goto("/chat?query=Me");
    const card = page.getByRole("article", { name: "Hongxiang Wang profile" });
    const resume = card.getByRole("region", { name: "Resume", exact: true });
    await expect(resume).toBeVisible();
    await resume.scrollIntoViewIfNeeded();
    const preview = resume.getByRole("link", { name: "Preview PDF", exact: true });
    const download = resume.getByRole("link", { name: "Download PDF", exact: true });
    await expect(preview).toHaveAttribute("href", pdfPath);
    await expect(preview).toHaveAttribute("target", "_blank");
    await expect(download).toHaveAttribute("download", "Hongxiang_Wang_Resume.pdf");
    expect(await resume.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    if (width === 1280) {
      const opened = page.waitForEvent("popup");
      await preview.click();
      const tab = await opened;
      await expect(tab).toHaveURL(/\/resume\/Hongxiang_Wang_Resume\.pdf$/);
      await tab.close();
      const response = await page.request.get(pdfPath);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/pdf");
      const expected = await readFile("app/resume/Hongxiang_Wang_Resume.pdf/document.pdf");
      expect(await response.body()).toEqual(expected);
      const completed = page.waitForEvent("download");
      await download.click();
      const file = await completed;
      expect(file.suggestedFilename()).toBe("Hongxiang_Wang_Resume.pdf");
      expect(await readFile((await file.path())!)).toEqual(expected);
    }
    await page.getByRole("textbox", { name: "Ask about Hongxiang" }).fill("Keep my draft");
    await page.reload();
    await expect(resume).toBeVisible();
    await resume.scrollIntoViewIfNeeded();
    await expect(preview).toHaveAttribute("href", pdfPath);
    expect(requests).toBe(1);
    await expect(page.getByRole("textbox", { name: "Ask about Hongxiang" })).toHaveValue("Keep my draft");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/private/tmp/portfolio-resume-${width}.png` });
  });
}

for (const question of ["Can I download your resume?", "我想看看你的简历"]) {
  test(`a direct resume request has usable links and survives reload: ${question}`, async ({ page }) => {
    let requests = 0;
    await page.route("**/api/chat", route => {
      requests++;
      return route.fulfill({ json: { message: "You can preview or download my resume here.", module: { type: "resume" } } });
    });
    await page.goto(`/chat?query=${encodeURIComponent(question)}`);
    const resume = page.getByRole("region", { name: "Resume", exact: true });
    await expect(resume.getByRole("link", { name: "Preview PDF" })).toHaveAttribute("href", pdfPath);
    await expect(resume.getByRole("link", { name: "Download PDF" })).toHaveAttribute("download", "Hongxiang_Wang_Resume.pdf");
    await expect(page.getByRole("navigation", { name: "Quick questions" }).getByRole("button")).toHaveCount(5);
    await page.reload();
    await expect(resume).toBeVisible();
    expect(requests).toBe(1);
  });
}
