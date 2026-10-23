import type { QuickQuestionLabel } from "./quick-questions";
import { isProjectId, isQuestionId, nearDuplicateQuestion, type ProjectId } from "./interview-context";

export type FollowupContext = Exclude<QuickQuestionLabel, "Contact">;

export type FollowupRequest = {
  context: FollowupContext;
  messages: { role: "user" | "assistant"; content: string }[];
  exclude: string[];
  projectId?: ProjectId;
  excludeQuestionIds?: string[];
};

export type FollowupResponse = { questions: string[]; questionIds?: (string | null)[] };

export const MAX_FOLLOWUP_CHARS = 160;
export const MAX_FOLLOWUP_MESSAGES = 6;
export const MAX_FOLLOWUP_EXCLUSIONS = 12;

export class FollowupValidationError extends Error {}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFollowupContext(value: unknown): value is FollowupContext {
  return value === "Me" || value === "Projects" || value === "Skills" || value === "Fun Facts";
}

export function normalizeFollowupQuestion(question: string): string {
  return question.normalize("NFKC").toLocaleLowerCase().replace(/[\p{P}\p{S}\s]/gu, "");
}

export function parseFollowupRequest(payload: unknown): FollowupRequest {
  if (!isObject(payload) || !isFollowupContext(payload.context)) {
    throw new FollowupValidationError("A supported follow-up context is required.");
  }
  if (Object.keys(payload).some((key) => !["context", "messages", "exclude", "projectId", "excludeQuestionIds"].includes(key))) {
    throw new FollowupValidationError("The follow-up request contains unsupported fields.");
  }
  if (!Array.isArray(payload.messages) || payload.messages.length > MAX_FOLLOWUP_MESSAGES) {
    throw new FollowupValidationError("Include at most 6 recent messages.");
  }
  const messages = payload.messages.map<FollowupRequest["messages"][number]>((item, index) => {
    if (
      !isObject(item) ||
      item.role !== (index % 2 === 0 ? "user" : "assistant") ||
      typeof item.content !== "string" ||
      Object.keys(item).some((key) => !["role", "content"].includes(key))
    ) {
      throw new FollowupValidationError("Recent messages must alternate from user to assistant.");
    }
    const content = item.content.trim();
    if (!content || content.length > 1_000) {
      throw new FollowupValidationError("Each recent message must contain 1-1000 characters.");
    }
    return { role: item.role as "user" | "assistant", content };
  });
  if (!Array.isArray(payload.exclude) || payload.exclude.length > MAX_FOLLOWUP_EXCLUSIONS) {
    throw new FollowupValidationError("Include at most 12 previous follow-up questions.");
  }
  const exclude = payload.exclude.map((question) => {
    if (typeof question !== "string" || !question.trim() || question.trim().length > MAX_FOLLOWUP_CHARS) {
      throw new FollowupValidationError("Each previous follow-up must contain 1-160 characters.");
    }
    return question.trim();
  });
  if (payload.projectId !== undefined && !isProjectId(payload.projectId)) throw new FollowupValidationError("Unknown project.");
  if (payload.excludeQuestionIds !== undefined && (!Array.isArray(payload.excludeQuestionIds) || payload.excludeQuestionIds.length > 40 || payload.excludeQuestionIds.some(id => !isQuestionId(id)))) {
    throw new FollowupValidationError("Include at most 40 valid previous question IDs.");
  }
  return { context: payload.context, messages, exclude,
    ...(isProjectId(payload.projectId) ? { projectId: payload.projectId } : {}),
    ...(payload.excludeQuestionIds !== undefined ? { excludeQuestionIds: payload.excludeQuestionIds as string[] } : {}),
  };
}

export function parseFollowupResponse(
  payload: unknown,
  request?: Pick<FollowupRequest, "messages" | "exclude">,
): FollowupResponse {
  if (
    !isObject(payload) ||
    Object.keys(payload).some((key) => !["questions", "questionIds"].includes(key)) ||
    !Array.isArray(payload.questions) ||
    payload.questions.length !== 2
  ) {
    throw new FollowupValidationError("Exactly two follow-up questions are required.");
  }
  const questions = payload.questions.map((question) => {
    if (typeof question !== "string" || !question.trim() || question.trim().length > MAX_FOLLOWUP_CHARS || /[\r\n]/.test(question)) {
      throw new FollowupValidationError("Each follow-up must contain 1-160 characters.");
    }
    return question.trim();
  });
  const disallowed = new Set(
    [
      ...(request?.exclude ?? []),
      ...(request?.messages.filter((message) => message.role === "user").map((message) => message.content) ?? []),
    ].map(normalizeFollowupQuestion),
  );
  for (const question of questions) {
    if (!/[?？]$/.test(question)) throw new FollowupValidationError("Each suggestion must end as a question.");
    const normalized = normalizeFollowupQuestion(question);
    if (!normalized || disallowed.has(normalized)) {
      throw new FollowupValidationError("Follow-up questions must be distinct and not recently asked.");
    }
    disallowed.add(normalized);
  }
  const previous = [...(request?.exclude ?? []), ...(request?.messages.filter(message => message.role === "user").map(message => message.content) ?? [])];
  if (nearDuplicateQuestion(questions[0], questions[1]) || questions.some(question => previous.some(old => nearDuplicateQuestion(question, old)))) {
    throw new FollowupValidationError("Follow-up angles must not repeat recent questions.");
  }
  if (payload.questionIds !== undefined && (!Array.isArray(payload.questionIds) || payload.questionIds.length !== 2 || payload.questionIds.some(id => id !== null && !isQuestionId(id)))) {
    throw new FollowupValidationError("Question references must match the two suggestions.");
  }
  return { questions, ...(payload.questionIds !== undefined ? { questionIds: payload.questionIds as (string | null)[] } : {}) };
}
