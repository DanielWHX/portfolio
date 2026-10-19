import { SKILLS_QUERY } from "./skills-profile";

export const quickQuestions = [
  { label: "Me", icon: "☺", tone: "cyan", query: "Who are you?" },
  { label: "Projects", icon: "▣", tone: "green", query: "Tell me about projects from your listed work and research experience." },
  { label: "Skills", icon: "◇", tone: "violet", query: SKILLS_QUERY },
  { label: "Fun Facts", icon: "✦", tone: "pink", query: "What do you enjoy outside of engineering?" },
  { label: "Contact", icon: "☎", tone: "amber", query: "How can I contact you?" },
] as const;

export type QuickQuestionLabel = (typeof quickQuestions)[number]["label"];

export function getQuickQuestion(query: string) {
  const normalized = query.trim().toLowerCase();
  return quickQuestions.find((question) => question.query.toLowerCase() === normalized || question.label.toLowerCase() === normalized);
}
