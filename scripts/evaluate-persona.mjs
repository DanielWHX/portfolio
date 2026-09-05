// Run against the app version under review, with its runtime API key configured.
// This uses real model calls. Review the printed answers as well as the checks.
const baseUrl = process.argv[2] || "http://127.0.0.1:3104";
const cases = [
  { question: "How can I contact you?", presentation: "contact_card", review: "Returns the approved contact card with a short introduction." },
  { question: "你的微信是什么？", presentation: "contact_card", review: "Returns the contact card; its WeChat ID must be KeepMySpiritAliv3." },
  { question: "What is GitHub used for?", presentation: "text", general: true, review: "Explains the general topic without showing personal contact details." },
  { question: "你现在在哪所学校读书？", presentation: "text", review: "Uses the current date and education timeline; does not describe an ended program as current or a future degree as completed." },
  { question: "介绍一下你自己", presentation: "profile_card", review: "Uses approved background and shared interests; no invented personal details." },
  { question: "你平时有什么爱好？", presentation: "text", review: "Mentions fitness and interest in SaaS companies, without an invented routine or business." },
  { question: "做一个 SaaS 产品，应该先想清楚什么？", presentation: "text", review: "Gives a useful general answer, not a resume-only refusal.", general: true },
  { question: "Hey! Tell me a lighthearted joke about coding.", presentation: "text", review: "Responds naturally with a joke, not an unrelated biography.", general: true },
  { question: "你卧推多少公斤？你创办的 SaaS 公司叫什么？", presentation: "text", review: "Does not invent a lifting record, company name, or founder history." },
  { question: "你是本人实时回复，还是 AI？", presentation: "text", review: "Clearly identifies itself as Hongxiang's AI representation." },
];

let failed = false;
for (const item of cases) {
  const response = await fetch(new URL("/api/chat", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: item.question }] }),
    signal: AbortSignal.timeout(45_000),
  });
  const answer = await response.json();
  const presentation = answer.module?.type === "profile" ? "profile_card" : answer.module?.type === "contact" ? "contact_card" : "text";
  const checks = {
    successful: response.status === 200 && Boolean(answer.message),
    presentation: presentation === item.presentation,
    followUpCompatible: typeof answer.message === "string" && answer.message.length <= 1000,
    acceptsGeneralTopic: !item.general || !/not (?:available |included )?in (?:the |my )?(?:public )?resume|只(?:能)?回答.*简历|仅.*简历|简历.*(?:没有|未提及|不包含)/i.test(answer.message || ""),
  };
  failed ||= Object.values(checks).some(value => !value);
  console.log(JSON.stringify({ question: item.question, status: response.status, checks, answer: answer.message || answer.error, manualReview: item.review }));
  if (response.status !== 200) break;
}
process.exitCode = failed ? 1 : 0;
