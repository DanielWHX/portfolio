"use client";

import { useEffect, useRef } from "react";

type ImpactOptions = {
  enabled: boolean;
  charging: boolean;
  /** Non-null only for a successful rep, e.g. `${liftId}:${count}`. */
  successToken: string | number | null;
  theme: "arcade" | "iron";
  suspended?: boolean;
};

// Two previews may be mounted together. Only the active panel owns screen motion.
let activeImpactOwner: symbol | null = null;
const globalClasses = ["gym-impact-charge", "gym-impact-hit"];

/** Presentation only: never reads keys, captures pointers, or changes game state. */
export default function useGymImpact({ enabled, charging, successToken, theme, suspended = false }: ImpactOptions) {
  const panelRef = useRef<HTMLElement>(null);
  const ownerRef = useRef(Symbol("gym-impact"));
  const lastSuccess = useRef(successToken);
  const previousTheme = useRef(theme);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const html = document.documentElement;
    const root = panel.closest<HTMLElement>("[data-gym-impact-root]")
      ?? document.querySelector<HTMLElement>("[data-gym-impact-root]");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const owner = ownerRef.current;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const sameTheme = previousTheme.current === theme;
    const newSuccess = sameTheme && successToken !== null && successToken !== lastSuccess.current;
    previousTheme.current = theme;
    if (successToken !== null) lastSuccess.current = successToken;

    function later(callback: () => void, milliseconds: number) {
      const timer = setTimeout(() => { timers.delete(timer); callback(); }, milliseconds);
      timers.add(timer);
    }

    function releaseScreen() {
      if (activeImpactOwner !== owner) return;
      html.classList.remove(...globalClasses);
      root?.removeAttribute("data-gym-impact-active");
      activeImpactOwner = null;
    }

    function clear() {
      timers.forEach(clearTimeout);
      timers.clear();
      panel?.classList.remove("gym-impact-crack");
      releaseScreen();
    }

    function canAnimate() {
      return theme === "iron" && enabled && !suspended && !media.matches && document.visibilityState !== "hidden" && document.hasFocus();
    }

    function pulse(kind: "charge" | "hit") {
      if (!root || !canAnimate() || (activeImpactOwner !== null && activeImpactOwner !== owner)) return;
      activeImpactOwner = owner;
      html.classList.remove(...globalClasses);
      root.setAttribute("data-gym-impact-active", "");
      // Restart an isolated, finite pulse; do not put transforms on body or html.
      void root.offsetWidth;
      html.classList.add(`gym-impact-${kind}`);
      later(releaseScreen, kind === "hit" ? 240 : 210);
    }

    const stop = () => clear();
    const onVisibility = () => { if (document.visibilityState === "hidden") clear(); };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", stop);

    if (sameTheme && canAnimate()) {
      if (newSuccess) {
        pulse("hit");
        panel.classList.remove("gym-impact-crack");
        void panel.offsetWidth;
        panel.classList.add("gym-impact-crack");
        later(() => panel.classList.remove("gym-impact-crack"), 760);
      } else if (charging) {
        // One small onset pulse. A held button never creates continuous shaking.
        pulse("charge");
      }
    }

    return () => {
      clear();
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", stop);
    };
  }, [enabled, charging, successToken, theme, suspended]);

  return panelRef;
}
