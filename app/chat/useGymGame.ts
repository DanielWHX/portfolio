"use client";

import { useEffect, useRef, useState } from "react";
import type { LiftId } from "@/lib/portfolio/fitness-profile";

type Phase = "ready" | "charging" | "lifting" | "success" | "miss" | "rest";
const GREEN_START = 65;
const GREEN_END = 90;
const HOLD_MS = 1_800;

export default function useGymGame() {
  const [activity, setActivity] = useState<LiftId | "rest">("squat");
  const [phase, setPhase] = useState<Phase>("ready");
  const [power, setPower] = useState(0);
  const [reps, setReps] = useState<Record<LiftId, number>>({ squat: 0, bench: 0, deadlift: 0 });
  const phaseRef = useRef<Phase>("ready");
  const activityRef = useRef<LiftId | "rest">("squat");
  const [liftId, setLiftId] = useState<LiftId>("squat");
  const started = useRef(0);
  const frame = useRef(0);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startedLift = useRef<LiftId>("squat");
  const inputOwner = useRef<string | null>(null);

  function transition(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function cancelHold(owner?: string) {
    if (phaseRef.current !== "charging" || (owner && inputOwner.current !== owner)) return;
    inputOwner.current = null;
    cancelAnimationFrame(frame.current);
    setPower(0);
    transition("ready");
  }

  useEffect(() => {
    // Losing the page or focus must never leave a held input running.
    const interrupt = () => {
      if (phaseRef.current !== "charging") return;
      cancelAnimationFrame(frame.current);
      inputOwner.current = null;
      phaseRef.current = "ready";
      setPhase("ready");
      setPower(0);
    };
    const visibility = () => { if (document.hidden) interrupt(); };
    window.addEventListener("blur", interrupt);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(finishTimer.current);
      window.removeEventListener("blur", interrupt);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  function select(next: LiftId | "rest") {
    cancelAnimationFrame(frame.current);
    clearTimeout(finishTimer.current);
    inputOwner.current = null;
    activityRef.current = next;
    if (next !== "rest") setLiftId(next);
    setActivity(next);
    setPower(0);
    transition(next === "rest" ? "rest" : "ready");
  }

  function beginHold(owner: string) {
    const current = activityRef.current;
    if (current === "rest" || reps[current] >= 3 || !["ready", "success", "miss"].includes(phaseRef.current)) return false;
    inputOwner.current = owner;
    startedLift.current = current;
    started.current = performance.now();
    setPower(0);
    transition("charging");
    const tick = () => {
      if (phaseRef.current !== "charging") return;
      setPower(Math.min(100, ((performance.now() - started.current) / HOLD_MS) * 100));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return true;
  }

  function releaseHold(owner: string) {
    if (phaseRef.current !== "charging" || inputOwner.current !== owner) return;
    inputOwner.current = null;
    cancelAnimationFrame(frame.current);
    const result = Math.min(100, ((performance.now() - started.current) / HOLD_MS) * 100);
    setPower(result);
    if (result < GREEN_START || result > GREEN_END) {
      transition("miss");
      return;
    }
    transition("lifting");
    const lift = startedLift.current;
    finishTimer.current = setTimeout(() => {
      setReps(previous => ({ ...previous, [lift]: Math.min(3, previous[lift] + 1) }));
      transition("success");
    }, 650);
  }

  function newSet() {
    if (activity === "rest" || reps[activity] < 3) return;
    setReps(previous => ({ ...previous, [activity]: 0 }));
    setPower(0);
    transition("ready");
  }

  const count = activity === "rest" ? 0 : reps[activity];
  return { activity, liftId, phase, power, count, complete: count === 3, select, beginHold, releaseHold, cancelHold, newSet };
}
