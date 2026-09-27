import type { quickQuestions } from "@/lib/portfolio/quick-questions";

type Label = (typeof quickQuestions)[number]["label"];

export default function QuickQuestionIcon({ label }: { label: Label }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {label === "Me" && <><circle cx="12" cy="12" r="8.5"/><path d="M8 14a4.5 4.5 0 0 0 8 0M9 9h.01M15 9h.01"/></>}
      {label === "Projects" && <><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a23 23 0 0 0 18 0M10 12h4v3h-4z"/></>}
      {label === "Skills" && <><path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/></>}
      {label === "Fun Facts" && <><path d="m4 20 4-13 9 9-13 4ZM6 14l4 4M14 3l-1 4M21 10l-4 1M18 3c3 1-2 4 1 5M10 3v.01M21 15v.01"/></>}
      {label === "Contact" && <><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 9-6"/><circle cx="17" cy="16" r="4"/><path d="m20 19 2 3"/></>}
    </svg>
  );
}
