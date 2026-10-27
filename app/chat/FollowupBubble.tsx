"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { createThinkingSphere } from "./thinking-sphere";

export default function FollowupBubble({ buttonRef, expanded, controls, onExpand }: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  expanded: boolean;
  controls: string;
  onExpand: () => void;
}) {
  const starId = `bubble-star-${useId().replace(/:/g, "")}`;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    if (!button || !canvas) return;
    // Preserve the last painted frame while the dock folds the button away.
    if (expanded) { button.dataset.motion = "paused"; return; }
    const renderer = createThinkingSphere(canvas);
    if (!renderer) { button.dataset.motion = "idle"; return; }
    let blend = 0;
    let target = 0;
    let velocity = 0;
    let phase = 0;
    let frame: number | null = null;
    let previousTime: number | null = null;
    let ready = false;
    let disposed = false;
    let engaged = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const canEngage = () => !reduced.matches && fine.matches && !document.hidden;
    const allowed = () => ready && canEngage();

    function paint() {
      button!.style.setProperty("--orb-activity", blend.toFixed(5));
      if (blend > 0) renderer!.draw(phase, blend);
      else renderer!.clear();
    }

    function cancelFrame() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    }

    function reset() {
      cancelFrame();
      engaged = false;
      blend = target = velocity = 0;
      button!.dataset.motion = allowed() ? "idle" : "paused";
      paint();
    }

    function tick(time: number) {
      if (!allowed()) { reset(); return; }
      const dt = Math.min((time - (previousTime ?? time - 16.67)) / 1000, 1 / 30);
      previousTime = time;
      velocity += ((target - blend) * 240 - velocity * 30) * dt;
      blend = Math.max(0, Math.min(1, blend + velocity * dt));
      if (Math.abs(target - blend) < .001 && Math.abs(velocity) < .008) { blend = target; velocity = 0; }
      phase += dt;
      paint();
      // There is no RAF loop at rest; a thinking sphere only runs while engaged.
      if (blend === 0 && target === 0) {
        frame = null;
        previousTime = null;
        button!.dataset.motion = "idle";
      } else frame = requestAnimationFrame(tick);
    }

    function animate() {
      if (frame === null) frame = requestAnimationFrame(tick);
    }

    function enter(event: PointerEvent) {
      if (!canEngage() || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
      engaged = true;
      if (!ready) return;
      target = 1;
      button!.dataset.motion = "thinking";
      animate();
    }

    function leave() {
      engaged = false;
      target = 0;
      if (allowed() && blend > 0) { button!.dataset.motion = "settling"; animate(); }
      else reset();
    }

    function focus() {
      if (!canEngage() || !button!.matches(":focus-visible")) return;
      engaged = true;
      if (!ready) return;
      target = 1;
      button!.dataset.motion = "thinking";
      animate();
    }

    reset();
    void renderer.ready.then(loaded => {
      if (disposed) return;
      ready = loaded;
      if (allowed() && engaged) {
        target = 1;
        button.dataset.motion = "thinking";
        animate();
      } else reset();
    });
    const resize = new ResizeObserver(() => { renderer.resize(); paint(); });
    resize.observe(canvas);
    button.addEventListener("pointerenter", enter);
    button.addEventListener("pointermove", enter);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("pointercancel", leave);
    button.addEventListener("focus", focus);
    button.addEventListener("blur", leave);
    reduced.addEventListener("change", reset);
    fine.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    window.addEventListener("blur", reset);
    return () => {
      disposed = true;
      cancelFrame();
      resize.disconnect();
      button.dataset.motion = "paused";
      button.removeEventListener("pointerenter", enter);
      button.removeEventListener("pointermove", enter);
      button.removeEventListener("pointerleave", leave);
      button.removeEventListener("pointercancel", leave);
      button.removeEventListener("focus", focus);
      button.removeEventListener("blur", leave);
      reduced.removeEventListener("change", reset);
      fine.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
      window.removeEventListener("blur", reset);
    };
  }, [buttonRef, expanded]);

  return <button ref={buttonRef} type="button" className="chat-dock-orb" aria-label="Expand suggested questions"
    aria-expanded={expanded} aria-controls={controls} tabIndex={expanded ? -1 : 0} onClick={onExpand}>
    <span className="chat-dock-orb-surface" aria-hidden="true">
      <canvas ref={canvasRef} className="chat-dock-orb-liquid" />
      <span className="chat-dock-orb-glint" />
      <svg className="chat-dock-orb-star" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs><linearGradient id={starId} x1="22" y1="18" x2="43" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#7384ba" /><stop offset=".5" stopColor="#435481" /><stop offset="1" stopColor="#8794c8" /></linearGradient></defs>
        <path d="M30.9 19.6Q32 17.2 33.1 19.6C35.4 26.8 37.2 28.6 44.4 30.9Q46.8 32 44.4 33.1C37.2 35.4 35.4 37.2 33.1 44.4Q32 46.8 30.9 44.4C28.6 37.2 26.8 35.4 19.6 33.1Q17.2 32 19.6 30.9C26.8 28.6 28.6 26.8 30.9 19.6Z" fill={`url(#${starId})`} stroke="#ffffffb3" strokeWidth=".65" />
      </svg>
    </span>
  </button>;
}
