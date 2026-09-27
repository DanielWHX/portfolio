"use client";

import { useState } from "react";

const assetRoot = "/projects/jchatmind";

const conversationCaptures = [
  { file: "01-conversation-start", label: "The customer request and knowledge retrieval" },
  { file: "02-plan-and-follow-up", label: "Plan recommendation and the follow-up question" },
  { file: "03-twelve-person-pricing", label: "Pricing for a twelve-person team" },
  { file: "04-date-tool-and-trial", label: "The date tool and trial-expiry calculation" },
  { file: "05-sso-uncertainty", label: "Trial details and the SAML SSO question" },
  { file: "06-draft-request-and-grounding", label: "Escalation and the customer-reply request" },
  { file: "07-customer-reply", label: "The complete customer-facing draft" },
  { file: "08-conversation-end", label: "Grounding notes and the draft-only boundary" },
] as const;

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
    captures: [0, 1],
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
    captures: [1, 2],
  },
  {
    label: "Use a tool",
    title: "Calculate trial expiry",
    description: "getDate supplies the start date; the handbook supplies the 14-day rule.",
    result: "Trial expiry: 2026-10-05",
    resultLabel: "Recorded date: 2026-09-21 · +14 days",
    reference: "02-trial",
    referenceLabel: "Trial policy & date-tool evidence",
    evidence: "Recorded tool date, not today’s date.",
    captures: [3, 4],
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
    captures: [4, 5],
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
    captures: [5, 6, 7],
  },
] as const;

export default function OrbitDeskDemo() {
  const [stageIndex, setStageIndex] = useState(0);
  const [captureIndex, setCaptureIndex] = useState(0);
  const stage = stages[stageIndex];
  const captureNumber = stage.captures[captureIndex];
  const capture = conversationCaptures[captureNumber];
  const imageUrl = `${assetRoot}/chat/${capture.file}.jpg`;

  function selectStage(index: number) {
    setStageIndex(index);
    setCaptureIndex(0);
  }

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
        <figure className="jcm-capture">
          <div className="jcm-capture-bar"><span><i aria-hidden="true" />Original app capture</span><a href={imageUrl} target="_blank" rel="noreferrer">Open full size ↗</a></div>
          <a className="jcm-capture-image" href={imageUrl} target="_blank" rel="noreferrer" aria-label={`Open capture ${captureNumber + 1} at full size: ${capture.label}`}>
            <img key={capture.file} src={imageUrl} width="1280" height="655" alt={`JChatMind conversation: ${capture.label}.`} decoding="async" />
          </a>
          <figcaption className="jcm-capture-controls">
            <button type="button" disabled={captureIndex === 0} onClick={() => setCaptureIndex(captureIndex - 1)} aria-label="Previous screenshot in this stage">← Previous</button>
            <span role="status">Image {captureIndex + 1} / {stage.captures.length}<small>Capture {captureNumber + 1} of 8</small></span>
            <button type="button" disabled={captureIndex === stage.captures.length - 1} onClick={() => setCaptureIndex(captureIndex + 1)} aria-label="Next screenshot in this stage">Next →</button>
          </figcaption>
        </figure>
        <p className="jcm-capture-hint">Select a step. Open screenshots to read the details.</p>
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
