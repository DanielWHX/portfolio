import snapshot from "./interview-bank.snapshot.json";
import { explicitProject, nearDuplicateQuestion, resolveProject, type InterviewReference, type ProjectId } from "@/lib/portfolio/interview-context";

export const INTERVIEW_REVISION = snapshot.revision;
export type InterviewEntry = Omit<(typeof snapshot.entries)[number], "projectId"> & { projectId: ProjectId | null };
export const interviewEntries = snapshot.entries as InterviewEntry[];
export function interviewEntry(id: string) { return interviewEntries.find(entry => entry.id === id); }

function score(entry: InterviewEntry, text: string) {
  const input = text.normalize("NFKC").toLowerCase();
  const words = new Set(input.match(/[a-z0-9]+/g) ?? []);
  return entry.keywords.reduce((total, keyword) => {
    const term = keyword.toLowerCase();
    const matches = /^[a-z0-9 -]+$/.test(term)
      ? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "u").test(input)
      : input.includes(term);
    if (matches) return total + (term.includes(" ") || /[^a-z0-9-]/.test(term) ? 4 : 3);
    const fragments = term.match(/[a-z0-9]+/g) ?? [];
    return total + (fragments.length > 1 && fragments.every(word => words.has(word)) ? 2 : 0);
  }, 0);
}

function scoped(projectId?: ProjectId) {
  return interviewEntries.filter(entry => entry.projectId === null || !projectId || entry.projectId === projectId);
}

export function selectInterviewAnswers(messages: { role: string; content: string }[], reference: InterviewReference = {}) {
  const question = messages.at(-1)?.content ?? "";
  const exact = reference.questionId ? interviewEntry(reference.questionId) : undefined;
  const projectId = resolveProject(messages, reference.projectId ?? exact?.projectId ?? undefined);
  const ranked = scoped(projectId).map(entry => ({ entry, score: score(entry, question) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  return { projectId, answers: [
    ...(exact && (!exact.projectId || !projectId || exact.projectId === projectId) ? [exact] : []),
    ...ranked.map(item => item.entry).filter(entry => entry.id !== exact?.id),
  ].slice(0, 4) };
}

export function selectInterviewCandidates({ context, messages, projectId: hint, exclude, excludeQuestionIds = [] }: {
  context: string; messages: { role: string; content: string }[]; projectId?: ProjectId; exclude: string[]; excludeQuestionIds?: string[];
}) {
  // The browser sends the latest settled selection or explicit question's project.
  const projectId = hint ?? resolveProject(messages);
  if (context === "Fun Facts") return { projectId: undefined, candidates: [] as InterviewEntry[], excludedAngles: [] };
  const text = messages.filter(message => message.role === "user").slice(-2).map(message => message.content).join(" ");
  const blockedIds = new Set(excludeQuestionIds);
  // Typed questions have no click ID. Infer their strongest lexical match too,
  // so asking about conflicts manually does not immediately suggest the same topic.
  const askedEntries = messages.flatMap((message, index) => {
    if (message.role !== "user") return [];
    const matches = selectInterviewAnswers(messages.slice(0, index + 1), { projectId: index >= messages.length - 2 ? hint : undefined }).answers;
    return matches.filter(entry => score(entry, message.content) === score(matches[0], message.content));
  });
  const blockedEntries = [...excludeQuestionIds.flatMap(id => interviewEntry(id) ?? []), ...askedEntries];
  const angles = new Map(blockedEntries.map(entry => [`${entry.projectId}:${entry.topic}`, { projectId: entry.projectId, topic: entry.topic }]));
  const blockedAngles = new Set(angles.keys());
  const previous = [...exclude, ...messages.filter(message => message.role === "user").map(message => message.content)];
  const behavior = new Set(["contribution", "initiative", "goal", "requirements", "ai-collaboration", "ai-verification", "ai-responsibility", "debugging"]);
  const candidates = scoped(projectId)
    .filter(entry => context !== "Me" || behavior.has(entry.topic))
    .filter(entry => !blockedIds.has(entry.id) && !blockedAngles.has(`${entry.projectId}:${entry.topic}`))
    .filter(entry => !previous.some(question => nearDuplicateQuestion(question, entry.question)))
    .map(entry => ({ entry, score: score(entry, text) + (projectId && entry.projectId === projectId ? 10 : 0) }))
    .filter(item => context === "Me" || item.score > 0 || (!projectId && item.entry.projectId !== null))
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, 6).map(item => item.entry);
  return { projectId, candidates, excludedAngles: [...angles.values()] };
}

export function referenceConflict(messages: { role: string; content: string }[], reference: InterviewReference) {
  const entry = reference.questionId ? interviewEntry(reference.questionId) : undefined;
  const project = explicitProject(messages.at(-1)?.content ?? "") ?? reference.projectId;
  return !!(entry?.projectId && project && entry.projectId !== project);
}
