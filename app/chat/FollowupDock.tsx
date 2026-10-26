"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import FollowupQuestions, { type FollowupQuestionsProps } from "./FollowupQuestions";
import FollowupBubble from "./FollowupBubble";
import "./followup-dock.css";

export default function FollowupDock({ visible = true, children, ...followups }: FollowupQuestionsProps & {
  visible?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const [panelHeight, setPanelHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const frameId = useId();
  const available = visible && followups.questions.length === 2;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !available) return;
    // Read the untransformed box, not a scaled DOMRect during the fold.
    const observer = new ResizeObserver(([entry]) => setPanelHeight(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [available]);

  function collapse() {
    setExpanded(false);
    window.requestAnimationFrame(() => bubbleRef.current?.focus({ preventScroll: true }));
  }

  function expand() {
    setExpanded(true);
    window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>(".chat-followups-collapse")?.focus({ preventScroll: true }));
  }

  return <div className="chat-dock" data-available={available} data-expanded={available && expanded}>
    <div id={frameId} className="chat-dock-panel" style={{ height: available && expanded ? panelHeight : 0 }}
      aria-hidden={!available || !expanded} inert={!available || !expanded}>
      {available ? <div ref={panelRef} className="chat-dock-panel-inner" data-ready={panelHeight > 0}>
        <FollowupQuestions {...followups} onCollapse={collapse} />
      </div> : null}
    </div>
    <div className="chat-dock-controls">
      <div className="chat-dock-orb-slot" aria-hidden={!available || expanded} inert={!available || expanded}>
        {available ? <FollowupBubble buttonRef={bubbleRef} expanded={expanded} controls={frameId} onExpand={expand} /> : null}
      </div>
      {children}
    </div>
  </div>;
}
