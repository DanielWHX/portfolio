import type { ReactNode } from "react";

const paths = {
  "arrow-left": <path d="m12 5-7 7 7 7M5 12h15" />,
  "arrow-right": <path d="m12 5 7 7-7 7M19 12H4" />,
  "arrow-up": <path d="m5 12 7-7 7 7M12 5v15" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4 4 10-10" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  phone: <path d="m7 3 3 5-2 2a14 14 0 0 0 6 6l2-2 5 3c0 3-2 5-5 4C9 19 5 15 3 8 2 5 4 3 7 3Z" />,
  github: <path d="M9 20c-4 1-4-2-6-2m12 4v-4a4 4 0 0 0-1-3c3-.3 6-1.5 6-6a4.7 4.7 0 0 0-1.3-3.3A4.4 4.4 0 0 0 18.5 2S17.3 1.7 15 3a12 12 0 0 0-6 0C6.7 1.7 5.5 2 5.5 2a4.4 4.4 0 0 0-.2 3.7A4.7 4.7 0 0 0 4 9c0 4.5 3 5.7 6 6a4 4 0 0 0-1 3v4" />,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7m0-10h.01M11 17v-7m0 3a3 3 0 0 1 6 0v4" /></>,
  chat: <><path d="M14 16H8l-4 3v-4a7 7 0 1 1 14-6" /><path d="M21 15a5 5 0 0 1-1 3v3l-3-2h-2a5 5 0 1 1 6-4Z" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a22 22 0 0 0 18 0M10 12v3h4v-3" /></>,
  graduation: <><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6M22 9v7" /></>,
  dumbbell: <path d="m6 6 12 12M3 8l5-5M16 21l5-5M2 6l4-4M18 22l4-4M5 10l5-5M14 19l5-5" />,
  rocket: <><path d="M14 5c2-2 6-2 6-2s0 4-2 6l-7 7-5-5 8-6ZM6 11l-3 1 4-7 5-1M11 16l-1 5 7-4 1-5M4 17l-1 4 4-1" /><circle cx="15" cy="8" r="1" /></>,
} satisfies Record<string, ReactNode>;

export type PortfolioIconName = keyof typeof paths;

export default function PortfolioIcon({ name, size = 20 }: { name: PortfolioIconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
