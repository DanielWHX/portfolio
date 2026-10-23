// Client-safe identifiers only. Answers and the draft snapshot stay server-side.
export const PROJECT_IDS = ["portfolio", "jchatmind", "lyntra", "brainstem", "pcitc", "edge"] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];
export type InterviewReference = { projectId?: ProjectId; questionId?: string };

export function isProjectId(value: unknown): value is ProjectId {
  return typeof value === "string" && PROJECT_IDS.some(id => id === value);
}

export function isQuestionId(value: unknown): value is string {
  return typeof value === "string" && /^qb-(?:0[1-9]|[12]\d|3\d|40)$/.test(value);
}

export function explicitProject(text: string): ProjectId | undefined {
  const matches: ProjectId[] = [];
  if (/j\s*chat\s*mind/iu.test(text)) matches.push("jchatmind");
  if (/\blyntra\b/iu.test(text)) matches.push("lyntra");
  if (/\bportfolio\b|个人作品集|你的作品集/iu.test(text)) matches.push("portfolio");
  if (/\bbrainstem\b|脑干/iu.test(text)) matches.push("brainstem");
  if (/\bpcitc\b|石化盈科/iu.test(text)) matches.push("pcitc");
  if (/o-ran|edge.computing|边缘计算/iu.test(text)) matches.push("edge");
  return matches.length === 1 ? matches[0] : undefined;
}

export function resolveProject(messages: { role: string; content: string }[], hint?: ProjectId): ProjectId | undefined {
  const users = messages.filter(message => message.role === "user");
  return explicitProject(users.at(-1)?.content ?? "") ?? hint
    ?? users.slice(0, -1).reverse().map(message => explicitProject(message.content)).find(Boolean);
}

export function nearDuplicateQuestion(a: string, b: string): boolean {
  const normalize = (text: string) => text.normalize("NFKC").toLowerCase().replace(/[\p{P}\p{S}\s]/gu, "");
  if (normalize(a) === normalize(b)) return true;
  const tokens = (text: string) => new Set(text.toLowerCase().match(/[a-z0-9]+|[\u3400-\u9fff]{2}/gu)?.filter(word => !/^(how|what|why|can|you|your|the|a|an|is|in|to|of|and|do|does|did|would|could|it|for|with|that|this)$/.test(word)) ?? []);
  const left = tokens(a), right = tokens(b);
  if (left.size < 3 || right.size < 3) return false;
  const overlap = [...left].filter(word => right.has(word)).length;
  return overlap / new Set([...left, ...right]).size >= .75;
}
