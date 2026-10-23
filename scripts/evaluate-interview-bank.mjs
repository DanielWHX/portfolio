// Real-model acceptance: run against the configured local app, never embed a key.
import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3121");
if (!["127.0.0.1", "localhost"].includes(base.hostname)) throw new Error("Use a local review server.");
const history = [];
const excluded = [];
const ids = [];

async function post(path, payload, retry = true) {
  const response = await fetch(new URL(`/api/${path}`, base), {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(40_000),
  });
  const result = await response.json();
  if (retry && response.status === 502 && /cannot reach OpenAI/.test(result.error ?? "")) {
    console.error(`${path}: transient network failure; retrying this read-only acceptance request once.`);
    return post(path, payload, false);
  }
  assert.equal(response.status, 200, `${path}: ${JSON.stringify(result)}`);
  return result;
}
async function suggestions(projectId) {
  const payload = await post("followups", { context: "Projects", projectId, messages: history.slice(-6), exclude: excluded.slice(-12), excludeQuestionIds: ids });
  assert.equal(payload.questions.length, 2);
  assert.match(payload.questionIds?.[0] ?? "", /^qb-/);
  assert.equal(payload.questionIds[1], null);
  assert.ok(!ids.includes(payload.questionIds[0]));
  excluded.push(...payload.questions); ids.push(payload.questionIds[0]);
  console.log(JSON.stringify({ step: "suggestions", projectId, ...payload }));
  return payload;
}
async function answer(question, reference = {}) {
  const result = await post("chat", { messages: [...history, { role: "user", content: question }], ...reference });
  history.push({ role: "user", content: question }, { role: "assistant", content: result.message });
  console.log(JSON.stringify({ step: "answer", question, reference, ...result }));
  return result;
}

const first = await suggestions("jchatmind");
await answer(first.questions[0], { projectId: "jchatmind", questionId: first.questionIds[0] });
await suggestions("jchatmind");
await answer("Why use SSE here? Is JChatMind streaming every token?", { projectId: "jchatmind", questionId: "qb-25" });
await answer("What would happen if the SSE connection dropped or the server restarted?", { projectId: "jchatmind", questionId: "qb-38" });
await suggestions("jchatmind");
await suggestions("lyntra");
await answer("Lyntra 如何处理日程冲突？自动移动任务有什么取舍？", { projectId: "jchatmind" });
await suggestions("lyntra");
await answer("Did you personally discover and fix JChatMind's history query bug?", { projectId: "jchatmind", questionId: "qb-37" });
console.log("Review the printed answers for personal/team ownership, did/would, historical status and unsupported metrics. Shape checks alone do not establish factual accuracy.");
