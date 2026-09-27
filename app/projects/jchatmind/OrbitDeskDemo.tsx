"use client";

import { useState } from "react";
import ChatReplay from "./ChatReplay";

const assetRoot = "/projects/jchatmind";

const stages = [
  {
    label: "Recommend",
    title: "Recommend a plan",
    description: "CSV exports + Slack alerts → Team plan for eight people.",
    result: "8 × $18 = $144 / month",
    resultLabel: "Verified calculation · before taxes",
    reference: "01-pricing",
    referenceLabel: "Pricing & plan features",
    evidence: "Rate from the handbook; total calculated for the customer.",
  },
  {
    label: "Follow up",
    title: "Update the price",
    description: "The team grows to twelve. The agent keeps context and recalculates.",
    result: "12 × $18 = $216 / month",
    resultLabel: "Verified calculation · $72 increase",
    reference: "01-pricing",
    referenceLabel: "Per-user pricing & billing rule",
    evidence: "Final total verified. The original intermediate equation is awkwardly worded.",
  },
  {
    label: "Use a tool",
    title: "Calculate trial expiry",
    description: "getDate supplies the start date; the handbook supplies the 14-day rule.",
    result: "Trial expiry: 2026-10-11",
    resultLabel: "Recorded date: 2026-09-27 · +14 days",
    reference: "02-trial",
    referenceLabel: "Trial policy & date-tool evidence",
    evidence: "Recorded tool date, not today’s date.",
  },
  {
    label: "Check limits",
    title: "Handle an unknown",
    description: "SAML SSO is not documented. The agent asks for product-team confirmation.",
    result: "SSO needs confirmation",
    resultLabel: "Unspecified does not mean unsupported",
    reference: "03-boundaries",
    referenceLabel: "Unknown features & escalation",
    evidence: "Follows the handbook’s rule for unspecified features.",
  },
  {
    label: "Draft a reply",
    title: "Draft the response",
    description: "Combine pricing, trial expiry, and the open SSO question.",
    result: "Draft prepared. Not sent.",
    resultLabel: "No account or billing changes",
    reference: "03-boundaries",
    referenceLabel: "Customer drafts & action boundaries",
    evidence: "A draft only; no email sent or trial created.",
  },
] as const;

export default function OrbitDeskDemo() {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex];
  function selectStage(index: number) { setStageIndex(index); }

  return <div className="jcm-demo">
    <nav className="jcm-stages" aria-label="OrbitDesk demonstration stages">
      {stages.map((item, index) => <button
        type="button"
        key={item.label}
        aria-pressed={stageIndex === index}
        aria-controls="jcm-stage-content"
        onClick={() => selectStage(index)}
      ><span>{String(index + 1).padStart(2, "0")}</span>{item.label}<span aria-hidden="true">↗</span></button>)}
    </nav>

    <div className="jcm-stage" id="jcm-stage-content">
      <div className="jcm-capture-column">
        <ChatReplay stageIndex={stageIndex} selectStage={selectStage} />
        <p className="jcm-capture-hint">Scroll to read. Expand tool results to inspect the evidence.</p>
      </div>

      <aside className="jcm-stage-notes" aria-label="What this stage demonstrates">
        <div className="jcm-stage-heading" aria-live="polite" aria-atomic="true">
          <p className="jcm-eyebrow">Stage {String(stageIndex + 1).padStart(2, "0")} / 05</p>
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
        </div>
        <div className="jcm-result"><strong>{stage.result}</strong><span>{stage.resultLabel}</span></div>
        <a className="jcm-source-link" href={`${assetRoot}/references/${stage.reference}.html`} target="_blank" rel="noreferrer"><span className="jcm-source-swatch" aria-hidden="true" /><span>Read the highlighted source<small>{stage.referenceLabel}</small></span><span aria-hidden="true">↗</span></a>
        <p className="jcm-evidence-note">{stage.evidence}</p>
      </aside>
    </div>
  </div>;
}
