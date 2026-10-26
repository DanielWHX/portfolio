"use client";

import { useEffect, useId, type RefObject } from "react";

export default function FollowupBubble({ buttonRef, expanded, controls, onExpand }: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  expanded: boolean;
  controls: string;
  onExpand: () => void;
}) {
  const starId = `bubble-star-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const neutral = [0, 0, 1, 1, 0];
    let current = [...neutral];
    let target = [...neutral];
    let velocity = [0, 0, 0, 0, 0];
    let frame: number | null = null;
    let previousTime: number | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const allowed = () => !expanded && !reduced.matches && fine.matches && !document.hidden;

    function paint() {
      for (const [index, property] of ["--orb-x", "--orb-y", "--orb-sx", "--orb-sy", "--orb-skew"].entries()) {
        const unit = index < 2 ? "px" : index === 4 ? "deg" : "";
        button!.style.setProperty(property, `${current[index].toFixed(5)}${unit}`);
      }
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
      current = [...neutral];
      target = [...neutral];
      velocity = [0, 0, 0, 0, 0];
      paint();
    }

    function tick(time: number) {
      if (!allowed()) { stop(); return; }
      const dt = Math.min((time - (previousTime ?? time - 16.67)) / 1000, 1 / 30);
      previousTime = time;
      let settled = true;
      for (let index = 0; index < current.length; index++) {
        velocity[index] += ((target[index] - current[index]) * 280 - velocity[index] * 25) * dt;
        current[index] += velocity[index] * dt;
        const precision = index === 2 || index === 3 ? .00015 : .005;
        if (Math.abs(current[index] - target[index]) > precision || Math.abs(velocity[index]) > precision * 8) settled = false;
      }
      if (settled) current = [...target];
      paint();
      frame = settled ? null : requestAnimationFrame(tick);
      if (settled) previousTime = null;
    }

    function animate() {
      if (frame === null) frame = requestAnimationFrame(tick);
    }

    function move(event: PointerEvent) {
      if (!allowed() || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
      // Read the fixed button, not its moving glass surface: the hit target
      // never chases the cursor or jitters when the surface deforms.
      const rect = button!.getBoundingClientRect();
      let x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      let y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      const length = Math.max(1, Math.hypot(x, y));
      x /= length;
      y /= length;
      const pull = rect.width * .05;
      target = [x * pull, y * pull, 1 + Math.abs(x) * .065 - Math.abs(y) * .04, 1 + Math.abs(y) * .065 - Math.abs(x) * .04, x * y * 1.5];
      animate();
    }

    function leave() {
      target = [...neutral];
      if (allowed()) animate();
      else stop();
    }

    function sync() {
      stop();
      button!.dataset.motion = !expanded && !reduced.matches && !document.hidden ? "running" : "paused";
    }

    sync();
    button.addEventListener("pointerenter", move);
    button.addEventListener("pointermove", move);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("pointercancel", leave);
    reduced.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("blur", stop);
    return () => {
      stop();
      button.dataset.motion = "paused";
      button.removeEventListener("pointerenter", move);
      button.removeEventListener("pointermove", move);
      button.removeEventListener("pointerleave", leave);
      button.removeEventListener("pointercancel", leave);
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("blur", stop);
    };
  }, [buttonRef, expanded]);

  return <button ref={buttonRef} type="button" className="chat-dock-orb" aria-label="Expand suggested questions"
    aria-expanded={expanded} aria-controls={controls} tabIndex={expanded ? -1 : 0} onClick={onExpand}>
    <span className="chat-dock-orb-surface" aria-hidden="true">
      <span className="chat-dock-orb-film" />
      <span className="chat-dock-orb-rim" />
      <span className="chat-dock-orb-glint" />
      <svg className="chat-dock-orb-star" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs><linearGradient id={starId} x1="22" y1="18" x2="43" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#7384ba" /><stop offset=".5" stopColor="#435481" /><stop offset="1" stopColor="#8794c8" /></linearGradient></defs>
        <path d="M30.9 19.6Q32 17.2 33.1 19.6C35.4 26.8 37.2 28.6 44.4 30.9Q46.8 32 44.4 33.1C37.2 35.4 35.4 37.2 33.1 44.4Q32 46.8 30.9 44.4C28.6 37.2 26.8 35.4 19.6 33.1Q17.2 32 19.6 30.9C26.8 28.6 28.6 26.8 30.9 19.6Z" fill={`url(#${starId})`} stroke="#ffffffb3" strokeWidth=".65" />
      </svg>
    </span>
  </button>;
}
