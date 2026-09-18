import { contactProfile, type ContactCardData } from "./contact-profile";
import { getResumeOverviewCard, type ResumeOverviewCard } from "./resume-profile";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  module?: { type: "profile"; profile: ResumeOverviewCard } | { type: "contact"; contact: ContactCardData } | { type: "projects" };
  restored?: boolean;
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
        (item.card !== undefined && (item.role !== "assistant" || !["profile", "contact", "projects"].includes(item.card)))) return empty;
      messages.push({
        role: item.role,
        content: item.content,
        restored: true,
        // Rebuild cards from current approved data rather than stored copies.
        ...(item.card === "profile" ? { module: { type: "profile", profile: getResumeOverviewCard(item.content) } } :
          item.card === "projects" ? { module: { type: "projects" } } :
          item.card === "contact" ? { module: { type: "contact", contact: contactProfile } } : {}),
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
      messages: messages.map(({ role, content, module }) => ({ role, content, card: module?.type })),
      draft,
    }));
  } catch {
    // Storage restrictions should never prevent a conversation.
  }
}

export function clearChatSession() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be blocked. */ }
}
