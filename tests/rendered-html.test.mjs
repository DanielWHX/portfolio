import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function visibleMarkup(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

test("renders only the single-screen Hongxiang Wang landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = visibleMarkup(await response.text());

  assert.match(html, /<title>Hongxiang Wang \| Full-Stack Engineer<\/title>/i);
  assert.match(html, /<main class="single-page">/i);
  assert.match(html, /<canvas[^>]*id="fluid"/i);
  assert.match(html, />HXW</);
  assert.match(html, /Hey, I(?:&#x27;|')m Hongxiang/);
  assert.match(html, /<h1[^>]*>Full-Stack Engineer<\/h1>/i);
  assert.match(html, /aria-label="Stylized avatar representing Hongxiang Wang"/i);

  assert.match(
    html,
    /<form\b(?=[^>]*class="query-box")(?=[^>]*action="\/")(?=[^>]*method="get")[^>]*>/i,
  );
  assert.match(html, /<input\b(?=[^>]*name="query")(?=[^>]*placeholder="Ask me anything\.\.\.")[^>]*>/i);
  assert.match(html, /aria-label="Send question"/i);

  const options = html.match(
    /<nav\b[^>]*aria-label="Quick questions"[^>]*>([\s\S]*?)<\/nav>/i,
  )?.[1];
  assert.ok(options, "expected quick-question options");
  assert.equal(options.match(/<a\b/g)?.length, 5);
  for (const label of ["Me", "Projects", "Skills", "Fun", "Contact"]) {
    assert.match(options, new RegExp(`<strong>${label}</strong>`));
  }

  assert.doesNotMatch(html, /href="\/chat|<video\b|<footer\b/i);
  assert.doesNotMatch(html, /id="(?:about|work|skills|contact)"/i);
  assert.doesNotMatch(html, /JChatMind|Brainstem Learning|PCITC|Lyntra/i);
});

test("keeps the WebGL fluid canvas behind the interactive UI", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.fluid-cursor-layer\s*{[^}]*position:\s*fixed/i);
  assert.match(css, /\.fluid-cursor-layer\s*{[^}]*z-index:\s*0/i);
  assert.match(css, /\.fluid-cursor-layer\s*{[^}]*pointer-events:\s*none/i);
  assert.match(css, /\.hero\s*{[^}]*z-index:\s*2/i);
});

test("keeps quick questions on the same single page", async () => {
  const response = await render("/?query=Show%20me%20your%20projects.");
  assert.equal(response.status, 200);
  const html = visibleMarkup(await response.text());

  assert.match(html, /name="query"[^>]*value="Show me your projects\."/i);
  assert.doesNotMatch(html, /\/chat\?query=/i);
});

test("does not expose the removed chat route", async () => {
  const response = await render("/chat");
  assert.equal(response.status, 404);
});
