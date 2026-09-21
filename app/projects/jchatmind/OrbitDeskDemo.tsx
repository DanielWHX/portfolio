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
    title: "Choose a plan from the handbook.",
    description: "An eight-person team needs CSV exports and Slack alerts. The agent retrieves the plan rules before recommending Team.",
    result: "8 × $18 = $144 / month",
    resultLabel: "Verified calculation · before taxes",
    reference: "01-pricing",
    referenceLabel: "Pricing & plan features",
    evidence: "The handbook supplies the per-user rate and included features. The customer-specific total is calculated from those facts.",
    captures: [0, 1],
  },
  {
    label: "Follow up",
    title: "Continue with a larger team.",
    description: "The customer changes the team size to twelve. The conversation keeps the selected plan and calculates the next full month’s cost.",
    result: "12 × $18 = $216 / month",
    resultLabel: "Verified calculation · $72 increase",
    reference: "01-pricing",
    referenceLabel: "Per-user pricing & billing rule",
    evidence: "The final amount is supported. The original response uses an awkward intermediate equation; it remains visible in the capture.",
    captures: [1, 2],
  },
  {
    label: "Use a tool",
    title: "Combine a live tool with policy.",
    description: "The agent calls getDate, then applies the handbook’s fourteen-day trial rule to the date returned during this conversation.",
    result: "Trial expiry: 2026-10-05",
    resultLabel: "Recorded date: 2026-09-21 · +14 days",
    reference: "02-trial",
    referenceLabel: "Trial policy & date-tool evidence",
    evidence: "The starting date comes from the recorded tool result. The handbook provides the rule; the expiry date is a derived answer.",
    captures: [3, 4],
  },
  {
    label: "Check limits",
    title: "Recognize what is not specified.",
    description: "A question about SAML SSO reaches a documented boundary. The agent recommends confirmation with the product team.",
    result: "SSO needs confirmation",
    resultLabel: "Unspecified does not mean unsupported",
    reference: "03-boundaries",
    referenceLabel: "Unknown features & escalation",
    evidence: "This example follows an explicit uncertainty rule in the handbook. It is evidence for this scenario, not a universal accuracy claim.",
    captures: [4, 5],
  },
  {
    label: "Draft a reply",
    title: "Turn the findings into a reply.",
    description: "A customer-facing draft brings together twelve-person pricing, the trial expiry, and the open SSO question in one response.",
    result: "Draft prepared. Not sent.",
    resultLabel: "No account or billing changes",
    reference: "03-boundaries",
    referenceLabel: "Customer drafts & action boundaries",
    evidence: "The reply synthesizes the preceding evidence. Drafting is the demonstrated action; no email is sent and no trial is created.",
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
        <p className="jcm-capture-hint">Select a stage, then browse its screenshots. Open any image at full size to read every detail.</p>
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
