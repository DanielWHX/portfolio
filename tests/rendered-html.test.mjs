import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

function dispatch(worker, path = "/", init = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("accept")) headers.set("accept", "text/html");

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), { ...init, headers }),
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

async function request(path = "/", init = {}) {
  return dispatch(await loadWorker(), path, init);
}

function visibleMarkup(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function restoreApiKey(value) {
  if (value === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = value;
}

test("renders the Hongxiang Wang landing page with only Me enabled", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  const html = visibleMarkup(await response.text());

  assert.match(html, /<title>Hongxiang Wang \| Full-Stack Engineer<\/title>/i);
  assert.match(html, /<main class="single-page">/i);
  assert.match(html, /<canvas[^>]*id="fluid"/i);
  assert.match(html, />HXW</);
  assert.match(html, /Hey, I(?:&#x27;|')m Hongxiang/);
  assert.match(html, /<h1[^>]*>Full-Stack Engineer<\/h1>/i);
  assert.match(
    html,
    /<img\b(?=[^>]*class="portrait")(?=[^>]*src="\/hongxiang-avatar\.png")(?=[^>]*alt="Muscular pink character representing Hongxiang Wang")[^>]*>/i,
  );

  assert.match(
    html,
    /<form\b(?=[^>]*class="query-box")(?=[^>]*action="\/chat")(?=[^>]*method="get")[^>]*>/i,
  );
  assert.match(
    html,
    /<input\b(?=[^>]*name="query")(?=[^>]*placeholder="Ask about me\.\.\.")(?=[^>]*maxlength="1000")[^>]*>/i,
  );

  const options = html.match(
    /<nav\b[^>]*aria-label="Quick questions"[^>]*>([\s\S]*?)<\/nav>/i,
  )?.[1];
  assert.ok(options, "expected quick-question options");
  assert.equal(options.match(/<a\b/g)?.length, 1);
  assert.match(options, /<a\b[^>]*href="\/chat\?query=Who%20are%20you%3F"[^>]*>/i);
  assert.equal(options.match(/aria-disabled="true"/g)?.length, 4);
  for (const label of ["Me", "Projects", "Skills", "Fun Facts", "Contact"]) {
    assert.match(options, new RegExp(`<strong>${label}</strong>`));
  }

  assert.doesNotMatch(html, /JChatMind|Brainstem Learning|PCITC|Lyntra/i);
});

test("keeps the WebGL fluid canvas behind the interactive UI", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.fluid-cursor-layer\s*{[^}]*position:\s*fixed/i);
  assert.match(css, /\.fluid-cursor-layer\s*{[^}]*z-index:\s*0/i);
  assert.match(css, /\.fluid-cursor-layer\s*{[^}]*pointer-events:\s*none/i);
  assert.match(css, /\.hero\s*{[^}]*z-index:\s*2/i);
});

test("renders the minimal resume chat page", async () => {
  const response = await request("/chat?query=Who%20are%20you%3F");
  assert.equal(response.status, 200);
  const html = visibleMarkup(await response.text());

  assert.match(html, /<main class="chat-page">/i);
  assert.match(html, /<h1[^>]*>Ask about me<\/h1>/i);
  assert.match(html, /class="chat-form"/i);
  assert.match(html, /AI-assisted answers based on Hongxiang(?:&#x27;|')s approved resume\./i);
});

test("ships the complete glass chat layout and current main-page styles", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.chat-page\s*{[^}]*display:\s*grid/i);
  assert.match(css, /\.chat-shell\s*{[^}]*backdrop-filter:\s*blur\(20px\)/i);
  assert.match(css, /\.chat-messages\s*{[^}]*overflow-y:\s*auto/i);
  assert.match(css, /\.chat-form\s*{[^}]*border-radius:\s*999px/i);
  assert.match(css, /\.chat-message-user\s*{[^}]*align-self:\s*flex-end/i);
  assert.match(css, /\.profile-card\s*{[^}]*backdrop-filter:\s*blur\(20px\)/i);
  assert.match(css, /\.quick-option\s*{[^}]*display:\s*flex/i);
  assert.match(css, /\.portrait\s*{[^}]*object-fit:\s*contain/i);
  assert.doesNotMatch(css, /\.brand-mark\b/i);
});

test("rejects an invalid chat request", async () => {
  const response = await request("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: [] }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /conversation/i);
});

test("explains when the portfolio agent secret is missing", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const response = await request("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Who are you?" }],
      }),
    });

    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /not configured/i);
  } finally {
    restoreApiKey(previousKey);
  }
});

test(
  "keeps Agent-selected presentation and code-owned profile facts at the public API",
  { concurrency: false },
  async (t) => {
    const worker = await loadWorker();
    const warmup = await dispatch(worker, "/");
    assert.equal(warmup.status, 200);
    await warmup.text();

    const previousKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "test-key";
    t.after(() => restoreApiKey(previousKey));

    const cases = [
      {
        question: "Who are you?",
        message: "I'm Hongxiang Wang, a full-stack engineer.",
        presentation: "profile_card",
      },
      {
        question: "Tell me about yourself.",
        message: "I build reliable backend systems and AI-assisted products.",
        presentation: "profile_card",
      },
      {
        question: "介绍一下你自己",
        message: "我是 Hongxiang Wang，一名全栈工程师。",
        presentation: "profile_card",
      },
      {
        question: "What are your skills?",
        message: "My skills include TypeScript, Java, Python, React, Spring Boot, and Docker.",
        presentation: "text",
      },
    ];
    const requests = [];
    let toolCallCount = 0;
    let answerCount = 0;

    t.mock.method(globalThis, "fetch", async (_input, init) => {
      const request = JSON.parse(init.body);
      requests.push(request);

      if (request.tool_choice?.type === "function") {
        toolCallCount += 1;
        return Response.json({
          output: [
            {
              type: "function_call",
              call_id: `call_profile_${toolCallCount}`,
              name: "get_resume_profile",
              arguments: "{}",
            },
          ],
        });
      }

      const answer = cases[answerCount];
      answerCount += 1;
      return Response.json({
        output: [
          {
            type: "message",
            role: "assistant",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  message: answer.message,
                  presentation: answer.presentation,
                }),
              },
            ],
          },
        ],
      });
    });

    for (const testCase of cases) {
      const response = await dispatch(worker, "/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: testCase.question }],
        }),
      });

      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(payload.message, testCase.message);

      if (testCase.presentation === "profile_card") {
        assert.deepEqual(payload.module, {
          type: "profile",
          profile: {
            name: "Hongxiang Wang",
            headline: "Full-Stack Engineer",
            summary: testCase.message,
            education: [
              "UIUC - Master of Computer Science, 2026-2028",
              "The Ohio State University - Computer Science, 2021-2026",
            ],
            experience: [
              "PCITC - Back-end Engineering Intern",
              "Lyntra - Full-stack Developer Intern",
              "Ohio State - Back-end Developer / Researcher",
            ],
            skills: ["TypeScript", "Java", "Python", "React", "Spring Boot", "Docker"],
          },
        });
      } else {
        assert.deepEqual(payload, { message: testCase.message });
      }
    }

    assert.equal(requests.length, cases.length * 2);
    assert.equal(answerCount, cases.length);
    assert.match(requests[0].instructions, /介绍一下你自己/);
    assert.equal(requests[1].text.format.type, "json_schema");
    assert.equal(requests[1].text.format.strict, true);
    assert.deepEqual(requests[1].text.format.schema.properties.presentation.enum, [
      "text",
      "profile_card",
    ]);
  },
);

test(
  "aborts a stalled OpenAI request instead of hanging forever",
  { concurrency: false },
  async (t) => {
    const worker = await loadWorker();
    const warmup = await dispatch(worker, "/");
    assert.equal(warmup.status, 200);
    await warmup.text();

    const previousKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "test-key";
    t.after(() => restoreApiKey(previousKey));

    t.mock.method(globalThis, "setTimeout", (callback) => {
      queueMicrotask(callback);
      return 0;
    });
    t.mock.method(globalThis, "fetch", async (_input, init) => {
      const signal = init?.signal;
      assert.ok(signal instanceof AbortSignal);

      return new Promise((_resolve, reject) => {
        const rejectAsAborted = () =>
          reject(new DOMException("The operation was aborted", "AbortError"));

        if (signal.aborted) rejectAsAborted();
        else signal.addEventListener("abort", rejectAsAborted, { once: true });
      });
    });

    const response = await dispatch(worker, "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "What did you build at PCITC?" }],
      }),
    });

    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /cannot reach OpenAI/i);
  },
);

test(
  "distinguishes an API-key rejection from a network failure",
  { concurrency: false },
  async (t) => {
    const worker = await loadWorker();
    const warmup = await dispatch(worker, "/");
    assert.equal(warmup.status, 200);
    await warmup.text();

    const previousKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "rejected-key";
    t.after(() => restoreApiKey(previousKey));
    let loggedError;
    t.mock.method(console, "error", (_message, details) => {
      loggedError = details;
    });
    t.mock.method(globalThis, "fetch", async () =>
      Response.json(
        {
          error: {
            message: "Incorrect API key provided.",
            type: "invalid_request_error",
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: { "x-request-id": "req_test" } },
      ),
    );

    const response = await dispatch(worker, "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "What are your skills?" }],
      }),
    });

    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /not configured correctly/i);
    assert.equal(loggedError.status, 401);
    assert.equal(loggedError.requestId, "req_test");
    assert.equal(loggedError.apiCode, "invalid_api_key");
  },
);

test(
  "calls Luna, executes the resume tool, and returns the final answer",
  { concurrency: false },
  async (t) => {
    const worker = await loadWorker();
    const warmup = await dispatch(worker, "/");
    assert.equal(warmup.status, 200);
    await warmup.text();

    const previousKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "test-key";
    t.after(() => restoreApiKey(previousKey));

    const requests = [];
    const responses = [
      {
        output: [
          {
            type: "function_call",
            call_id: "call_resume",
            name: "get_resume_profile",
            arguments: "{}",
          },
        ],
      },
      {
        output: [
          {
            type: "message",
            role: "assistant",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  message: "I built adaptive scheduling services at Lyntra.",
                  presentation: "text",
                }),
              },
            ],
          },
        ],
      },
    ];

    t.mock.method(globalThis, "fetch", async (input, init) => {
      const url = typeof input === "string" ? input : input.url;
      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-key");
      requests.push(JSON.parse(init.body));
      return Response.json(responses.shift());
    });

    const response = await dispatch(worker, "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "What did you build at Lyntra?" }],
      }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      message: "I built adaptive scheduling services at Lyntra.",
    });
    assert.equal(requests.length, 2);

    assert.equal(requests[0].model, "gpt-5.6-luna");
    assert.equal(requests[0].store, false);
    assert.deepEqual(requests[0].reasoning, { effort: "none" });
    assert.deepEqual(requests[0].tool_choice, {
      type: "function",
      name: "get_resume_profile",
    });
    assert.equal(requests[0].tools[0].name, "get_resume_profile");
    assert.equal(requests[0].tools[0].strict, true);
    assert.equal(requests[1].text.format.type, "json_schema");

    const toolResult = requests[1].input.find(
      (item) => item.type === "function_call_output",
    );
    assert.ok(toolResult, "expected the resume tool result in the second request");
    assert.equal(toolResult.call_id, "call_resume");
    assert.equal(JSON.parse(toolResult.output).name, "Hongxiang Wang");
  },
);
