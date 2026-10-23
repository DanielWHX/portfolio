import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const snapshot = JSON.parse(await readFile(new URL("../lib/agent/interview-bank.snapshot.json", import.meta.url), "utf8"));
const entry = id => snapshot.entries.find(row => row.id === id);
const messages = content => [{ role: "user", content }];
const request = (worker, path, payload) => worker.fetch(new Request(`http://localhost/api/${path}`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
}), { ASSETS: { fetch: async () => new Response("Missing", { status: 404 }) } }, { waitUntil() {} });
const output = value => Response.json({ output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(value) }] }] });
const toolCall = () => Response.json({ output: [{ type: "function_call", name: "get_resume_profile", call_id: "resume-evidence", arguments: "{}" }] });

test("Question Bank integration through public API boundaries", { concurrency: false }, async t => {
  const worker = (await import(`../dist/server/index.js?interview=${Date.now()}`)).default;
  const original = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "mock-interview-key";
  t.after(() => { if (original === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = original; });
  const followups = { context: "Projects", messages: messages("Show me your projects."), exclude: [], projectId: "jchatmind" };

  await t.test("rejects unknown or conflicting references without a model request", async t => {
    let calls = 0;
    t.mock.method(globalThis, "fetch", async () => { calls++; return toolCall(); });
    for (const reference of [{ projectId: "other" }, { questionId: "qb-41" }, { questionId: 25 }, { questionId: "qb-25", projectId: "lyntra" }]) {
      const response = await request(worker, "chat", { messages: messages("How does this work?"), ...reference });
      assert.equal(response.status, 400);
      assert.equal(response.headers.get("cache-control"), "no-store");
      await response.text();
    }
    const conflict = await request(worker, "chat", { messages: messages("How does Lyntra check conflicts?"), questionId: "qb-25" });
    assert.equal(conflict.status, 400); await conflict.text();
    for (const extra of [{ projectId: "other" }, { excludeQuestionIds: ["qb-41"] }, { excludeQuestionIds: Array(41).fill("qb-25") }]) {
      const response = await request(worker, "followups", { ...followups, ...extra });
      assert.equal(response.status, 400); await response.text();
    }
    assert.equal(calls, 0);
  });

  await t.test("settled project filters candidates and generates two different sources in one call", async t => {
    const inputs = [];
    t.mock.method(globalThis, "fetch", async (_url, init) => {
      const body = JSON.parse(init.body), input = JSON.parse(body.input[0].content);
      inputs.push(input);
      assert.equal(body.tools, undefined);
      assert.match(body.instructions, /questions\[1\].*DIFFERENT/);
      const candidate = input.interviewBank.candidates.find(row => row.projectId === input.currentProject);
      return output({ questions: [`What design decision shaped ${input.currentProject}'s request flow?`, `What would you investigate next in ${input.currentProject}?`], questionIds: [candidate.id, null] });
    });
    for (const projectId of ["jchatmind", "lyntra"]) {
      const response = await request(worker, "followups", { ...followups, projectId });
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.questions.length, 2);
      assert.equal(entry(result.questionIds[0]).projectId, projectId);
      assert.equal(result.questionIds[1], null);
      const input = inputs.at(-1);
      assert.ok(input.interviewBank.candidates.every(row => row.projectId === null || row.projectId === projectId));
      assert.ok(input.approvedProfile.projects.every(row => row.id === projectId));
      assert.equal(input.approvedProfile[projectId === "lyntra" ? "jchatmindCaseStudy" : "lyntraCaseStudy"], undefined);
    }
    assert.equal(inputs.length, 2);
  });

  await t.test("excludes past IDs and angles, preserves explicit user project, and falls back without unrelated trivia", async t => {
    const inputs = [];
    t.mock.method(globalThis, "fetch", async (_url, init) => {
      const input = JSON.parse(JSON.parse(init.body).input[0].content); inputs.push(input);
      return output({ questions: input.outputLanguage === "zh" ? ["日程验证要考虑什么取舍？", "你会如何验证这一设计？"] : ["What implementation tradeoff mattered most?", "How would you explore the next step?"], ...(input.interviewBank ? { questionIds: [input.interviewBank.candidates[0].id, null] } : {}) });
    });
    const response = await request(worker, "followups", { ...followups, projectId: "lyntra", excludeQuestionIds: ["qb-01"], messages: messages("Tell me about JChatMind SSE.") });
    assert.equal(response.status, 200); await response.json();
    // Here projectId is a newer settled UI selection, so stale text does not override it.
    assert.equal(inputs.at(-1).currentProject, "lyntra");
    assert.ok(inputs.at(-1).interviewBank.candidates.every(row => row.projectId !== "lyntra" || row.topic !== "contribution"));
    assert.ok(inputs.at(-1).interviewBank.excludedAngles.some(row => row.projectId === "lyntra" && row.topic === "contribution"));
    const typed = await request(worker, "followups", { ...followups, projectId: "lyntra", messages: [
      ...messages("Lyntra 如何处理日程冲突？"), { role: "assistant", content: "The backend checks occupied slots and preserves duration." },
    ] });
    assert.equal(typed.status, 200); await typed.json();
    assert.ok(inputs.at(-1).interviewBank.candidates.every(row => row.topic !== "rescheduling"));
    assert.ok(inputs.at(-1).interviewBank.excludedAngles.some(row => row.topic === "rescheduling"));
    const recovery = await request(worker, "followups", { ...followups, messages: messages("What would happen if the SSE connection dropped or the server restarted?") });
    assert.equal(recovery.status, 200); await recovery.json();
    assert.ok(inputs.at(-1).interviewBank.candidates.every(row => row.topic !== "recovery"));
    for (const [context, projectId, content] of [["Fun Facts", undefined, "Tell me about fitness"], ["Projects", "brainstem", "Show me Brainstem"], ["Me", undefined, "Tell me about yourself"]]) {
      const result = await request(worker, "followups", { ...followups, context, projectId, messages: messages(content) });
      assert.equal(result.status, 200); await result.json();
      if (context === "Me") assert.ok(inputs.at(-1).interviewBank.candidates.every(row => !["sse", "rag", "sql"].includes(row.topic)));
      else assert.equal(inputs.at(-1).interviewBank, undefined);
    }
  });

  await t.test("invalid generated IDs and near-duplicate angles fail without retries", async t => {
    let mode = 0, calls = 0;
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async (_url, init) => {
      calls++;
      const candidate = JSON.parse(JSON.parse(init.body).input[0].content).interviewBank.candidates[0];
      if (mode === 2) return output({ questions: ["What would you improve next?", "How would you validate that change?"], questionIds: [candidate.id, null] });
      return output(mode++ === 0
        ? { questions: ["How does SSE deliver completed messages?", "What happens after reconnecting?"], questionIds: ["qb-01", null] }
        : { questions: ["How does JChatMind retrieve relevant knowledge?", "Why does JChatMind retrieve relevant knowledge?"], questionIds: [candidate.id, null] });
    });
    for (let i = 0; i < 3; i++) {
      const response = await request(worker, "followups", { ...followups, ...(i === 2 ? { messages: messages("JChatMind 用了什么技术？") } : {}) });
      assert.equal(response.status, 502); await response.text();
    }
    assert.equal(calls, 3);
  });

  await t.test("clicked question and manual Chinese cross-project question select the right bounded evidence", async t => {
    const finalRequests = [];
    t.mock.method(globalThis, "fetch", async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.tool_choice !== "none") return toolCall();
      finalRequests.push(body);
      return output({ message: "A short grounded answer.", presentation: "text" });
    });
    const cases = [
      { messages: messages("Why use that communication channel?"), projectId: "jchatmind", questionId: "qb-25", id: "qb-25", pattern: /message-level streaming, not token-by-token/ },
      { messages: messages("JChatMind 的 bge-m3 和 Ollama 各自是什么作用？"), projectId: "lyntra", id: "qb-31", pattern: /embedding model/ },
      { messages: messages("What was the documented JChatMind history bug?"), questionId: "qb-37", id: "qb-37", pattern: /oldest messages instead of the newest/ },
      { messages: messages("连接中断后如何恢复？"), projectId: "jchatmind", id: "qb-38", pattern: /I would/ },
      { messages: messages("What would you improve after an SSE disconnect?"), projectId: "jchatmind", questionId: "qb-38", id: "qb-38", pattern: /I would.*persisted job state/ },
    ];
    for (const { id, pattern, ...payload } of cases) {
      const response = await request(worker, "chat", payload);
      assert.equal(response.status, 200); assert.equal((await response.json()).message, "A short grounded answer.");
      const final = finalRequests.at(-1);
      const evidence = JSON.parse(final.input.find(item => item.type === "function_call_output").output).interview;
      assert.equal(evidence.projectId, "jchatmind");
      assert.ok(evidence.answers.length <= 4);
      assert.ok(evidence.answers.every(row => row.projectId === null || row.projectId === "jchatmind"));
      assert.match(evidence.answers.find(row => row.id === id)?.answer ?? "", pattern);
      assert.match(final.instructions, /two to four short sentences/);
      assert.match(final.instructions, /not automatically Hongxiang's own fix/);
      if (id === "qb-37") assert.match(evidence.answers[0].boundary, /not proof.*personally/);
    }
    for (const question of ["How old is Luca?", "What is your fitness assessment?"]) {
      const response = await request(worker, "chat", { messages: messages(question) });
      assert.equal(response.status, 200); await response.json();
      assert.equal(JSON.parse(finalRequests.at(-1).input.find(item => item.type === "function_call_output").output).interview, undefined);
    }
  });
});

test("release snapshot has stable curated entries and answer text is absent from browser assets", async () => {
  assert.equal(snapshot.reviewStatus, "release-authorized");
  assert.equal(snapshot.entries.length, 40);
  assert.equal(new Set(snapshot.entries.map(row => row.id)).size, 40);
  for (const row of snapshot.entries) {
    assert.ok(row.question && row.answer && row.boundary && row.keywords.some(word => /[\u3400-\u9fff]/u.test(word)));
    assert.doesNotMatch(row.answer, /[\u3400-\u9fff]/u);
  }
  async function files(url) {
    const children = await readdir(url, { withFileTypes: true });
    return (await Promise.all(children.map(child => child.isDirectory() ? files(new URL(`${child.name}/`, url)) : [new URL(child.name, url)]))).flat();
  }
  const client = await files(new URL("../dist/client/", import.meta.url));
  const bundles = await Promise.all(client.filter(url => /\.js$/.test(url.pathname)).map(url => readFile(url, "utf8")));
  assert.ok(bundles.length > 0);
  for (const code of bundles) {
    assert.ok(!code.includes(snapshot.revision));
    assert.doesNotMatch(code, /sourceLastEditedAt/);
    for (const row of snapshot.entries) assert.ok(!code.includes(row.answer.slice(0, 75)), `${row.id} leaked to a browser bundle`);
  }
});
