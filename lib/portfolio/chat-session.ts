import { contactProfile, type ContactCardData } from "./contact-profile";
import { getResumeOverviewCard, type ResumeOverviewCard } from "./resume-profile";
import { getQuickQuestion, type QuickQuestionLabel } from "./quick-questions";
import { FUN_FACTS_REVISION } from "./fun-facts";
import { isProjectId, isQuestionId, type ProjectId } from "./interview-context";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  module?: { type: "profile"; profile: ResumeOverviewCard } | { type: "contact"; contact: ContactCardData } | { type: "projects" } | { type: "skills" } | { type: "fun_facts" };
  restored?: boolean;
  preset?: QuickQuestionLabel;
  factsRevision?: string;
  projectId?: ProjectId;
  questionId?: string;
};

const STORAGE_KEY = "portfolio.chat.v1";

export function readChatSession(): { messages: ConversationMessage[]; draft: string } {
  const empty = { messages: [], draft: "" };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 80_000) return empty;
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !Array.isArray(saved.messages) || saved.messages.length > 30 || saved.messages.length % 2 ||
      typeof saved.draft !== "string" || saved.draft.length > 1000) return empty;

    const messages: ConversationMessage[] = [];
    for (const [index, item] of saved.messages.entries()) {
      if (!item || item.role !== (index % 2 ? "assistant" : "user") ||
        typeof item.content !== "string" || !item.content.trim() || item.content.length > 1000 ||
        (item.card !== undefined && (item.role !== "assistant" || !["profile", "contact", "projects", "skills", "fun_facts"].includes(item.card))) ||
        (item.preset !== undefined && (item.role !== "assistant" || getQuickQuestion(messages[index - 1]?.content ?? "")?.label !== item.preset)) ||
        (item.factsRevision !== undefined && (item.role !== "assistant" || typeof item.factsRevision !== "string" || item.factsRevision.length > 80)) ||
        (item.projectId !== undefined && !isProjectId(item.projectId)) ||
        (item.questionId !== undefined && (item.role !== "user" || !isQuestionId(item.questionId)))) return empty;
      // Older gym-only answers remain readable, but must not hide the expanded
      // personal profile behind an outdated successful preset cache entry.
      const staleFacts = (item.card === "fun_facts" || item.preset === "Fun Facts") && item.factsRevision !== FUN_FACTS_REVISION;
      const card = staleFacts ? undefined : item.card;
      messages.push({
        role: item.role,
        content: item.content,
        restored: true,
        ...(item.projectId ? { projectId: item.projectId } : {}),
        ...(item.questionId ? { questionId: item.questionId } : {}),
        ...(item.preset && !staleFacts ? { preset: item.preset } : {}),
        ...(item.factsRevision && !staleFacts ? { factsRevision: item.factsRevision } : {}),
        // Rebuild cards from current approved data rather than stored copies.
        ...(card === "fun_facts" || (!staleFacts && card === undefined && item.preset === "Fun Facts") ? { module: { type: "fun_facts" } } :
          card === "profile" ? { module: { type: "profile", profile: getResumeOverviewCard(item.content) } } :
          card === "skills" ? { module: { type: "skills" } } :
          card === "projects" ? { module: { type: "projects" } } :
          card === "contact" ? { module: { type: "contact", contact: contactProfile } } : {}),
      });
    }
    return { messages, draft: saved.draft };
  } catch {
    return empty;
  }
}

export function saveChatSession(messages: ConversationMessage[], draft: string) {
  // Only completed user/assistant pairs are history. Pending questions are drafts.
  if (messages.length % 2) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      messages: messages.map(({ role, content, module, preset, factsRevision, projectId, questionId }) => ({ role, content, card: module?.type, preset, factsRevision, projectId, questionId })),
      draft,
    }));
  } catch {
    // Storage restrictions should never prevent a conversation.
  }
}

export function clearChatSession() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be blocked. */ }
}
