import type { Metadata } from "next";
import OrbitDeskDemo from "./OrbitDeskDemo";
import "./jchatmind.css";

export const metadata: Metadata = {
  title: "JChatMind — Answers with Evidence | Hongxiang Wang",
  description: "Explore a JChatMind business conversation: knowledge retrieval, follow-up questions, date-tool use, and source-backed customer reply drafts with Spring Boot and Spring AI.",
};

const root = "/projects/jchatmind";
const captures = [
  ["01-conversation-start", "Customer request & knowledge retrieval"],
  ["02-plan-and-follow-up", "Plan recommendation & follow-up"],
  ["03-twelve-person-pricing", "Twelve-person pricing"],
  ["04-date-tool-and-trial", "Date-tool use & trial expiry"],
  ["05-sso-uncertainty", "Trial details & SSO question"],
  ["06-draft-request-and-grounding", "Escalation & draft request"],
  ["07-customer-reply", "Customer-facing reply"],
  ["08-conversation-end", "Grounding notes & completion"],
] as const;
const references = [
  { file: "01-pricing", title: "Pricing & plan features", description: "$18 per user → $144 for eight, $216 for twelve.", width: 1905, height: 900 },
  { file: "02-trial", title: "Trial policy & tool evidence", description: "Recorded date + 14 calendar days → trial expiry.", width: 1920, height: 830 },
  { file: "03-boundaries", title: "Uncertainty & action boundaries", description: "Confirm SSO with the product team. Draft only.", width: 1920, height: 830 },
] as const;

export default function JChatMindCaseStudy() {
  return <main className="case-page jcm-page">
    <div className="case-wrap">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
      <nav className="case-nav" aria-label="Case study navigation"><a className="case-back" href="/chat?query=projects">← Back to projects</a><a className="case-wordmark" href="/" aria-label="Hongxiang Wang portfolio home">HXW<span> / SELECTED WORK</span></a></nav>

      <header className="case-hero jcm-hero">
        <div className="case-kicker"><span className="case-project-name">JCHATMIND</span><span>FULL-STACK AI</span><span className="case-status">Working local demo</span></div>
        <h1>Answers, <span>with the evidence.</span></h1>
        <p className="case-lead">A support conversation that retrieves knowledge,<br className="jcm-desktop-break" /> uses tools, and shows where its answers come from.</p>
        <div className="case-hero-bottom"><p>A <strong>Java backend</strong> connects a conversational interface to document retrieval and agent tools. Follow one business scenario from a customer’s first question to a grounded reply draft.</p><a className="case-primary" href="#demo">Explore the conversation <span aria-hidden="true">↘</span></a></div>
        <dl className="case-facts"><div><dt>BACKEND</dt><dd>Java · Spring Boot · Spring AI<small>Agent workflows & tool orchestration</small></dd></div><div><dt>KNOWLEDGE & INTERFACE</dt><dd>RAG · PostgreSQL / pgvector<small>React · TypeScript · Document embeddings</small></dd></div><div><dt>THE WALKTHROUGH</dt><dd>5 questions · 8 app captures<small>3 highlighted source references</small></dd></div></dl>
      </header>

      <section className="jcm-section" id="demo" aria-labelledby="jcm-demo-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">01 / THE BUSINESS SCENARIO</p><h2 id="jcm-demo-title">Meet the OrbitDesk support copilot.</h2></div><p>Recorded conversation · Sample SaaS policies<br />5 questions · Original app screenshots</p></div>
        <p className="jcm-section-intro">Which plan fits our team? What changes when we grow? When does our trial end? One conversation connects the handbook, customer context, and a date tool.</p>
        <OrbitDeskDemo />
      </section>

      <section className="jcm-section" aria-labelledby="jcm-references-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">02 / CHECK THE ANSWERS</p><h2 id="jcm-references-title">The source, right beside the story.</h2></div><p><mark className="jcm-inline-mark">Yellow = original handbook text</mark><br />Calculations are labeled separately</p></div>
        <p className="jcm-section-intro">These annotated reading views use the unchanged wording of the document uploaded to the agent’s knowledge base. They make each business rule easy to inspect.</p>
        <div className="jcm-reference-grid">
          {references.map((reference, index) => <article className="jcm-reference-card" key={reference.file}>
            <a href={`${root}/references/${reference.file}.jpg`} target="_blank" rel="noreferrer" aria-label={`Open highlighted ${reference.title.toLowerCase()} screenshot at full size`}><img src={`${root}/references/${reference.file}.jpg`} width={reference.width} height={reference.height} loading="lazy" alt={`Annotated handbook source with yellow highlights: ${reference.title}.`} /></a>
            <div><p className="jcm-eyebrow">REFERENCE {String(index + 1).padStart(2, "0")}</p><h3>{reference.title}</h3><p>{reference.description}</p><a href={`${root}/references/${reference.file}.html`} target="_blank" rel="noreferrer">Read highlighted source ↗</a></div>
          </article>)}
        </div>
        <div className="jcm-source-footer"><span>Original wording. Separate calculations. Reviewable results.</span><a href={`${root}/references/00-configured-knowledge-base.jpg`} target="_blank" rel="noreferrer">See the configured knowledge base ↗</a></div>
      </section>

      <section className="jcm-section" aria-labelledby="jcm-engineering-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">03 / THE ENGINEERING</p><h2 id="jcm-engineering-title">A backend behind the conversation.</h2></div></div>
        <div className="jcm-engineering-grid">
          <article><span className="jcm-engineering-number">01</span><h3>Retrieve relevant knowledge</h3><p>Document embeddings support semantic retrieval. The agent’s KnowledgeTool brings handbook content into the answer context.</p><span className="jcm-tech-label">RAG · Knowledge base</span></article>
          <article><span className="jcm-engineering-number">02</span><h3>Orchestrate the next step</h3><p>Spring AI connects the model to backend tools. The recorded getDate call supplies a concrete input for the trial calculation.</p><span className="jcm-tech-label">Spring Boot · Spring AI</span></article>
          <article><span className="jcm-engineering-number">03</span><h3>Keep the interaction visible</h3><p>The React interface presents messages and tool activity. Stored conversation history lets visitors follow the same sequence from start to finish.</p><span className="jcm-tech-label">React · Persistent chat history</span></article>
        </div>
      </section>

      <section className="jcm-details-section" aria-label="Complete conversation and demonstration scope">
        <details className="jcm-details"><summary>Explore the complete conversation <span>8 consecutive captures</span></summary><p>Every displayed question and answer is preserved. Adjacent captures overlap, and tool rows retain the app’s normal collapsed presentation. Select any screenshot to view it at full size.</p><div className="jcm-complete-gallery">{captures.map(([file, label], index) => <figure key={file}><a href={`${root}/chat/${file}.jpg`} target="_blank" rel="noreferrer"><img src={`${root}/chat/${file}.jpg`} width="1280" height="655" loading="lazy" alt={`Full conversation capture ${index + 1}: ${label}.`} /></a><figcaption><span>{String(index + 1).padStart(2, "0")}</span>{label}</figcaption></figure>)}</div></details>
        <details className="jcm-details"><summary>Scope & accuracy notes <span>What the evidence establishes</span></summary><div className="jcm-accuracy-copy"><p><strong>A real app, a fictional business.</strong> OrbitDesk and its policies are sample data. The captures show a stored JChatMind conversation, not live customer operations. The highlighted reference pages are annotated source views, not the app’s document viewer.</p><p><strong>Supported main results.</strong> The source supports the Team plan recommendation, $144 and $216 monthly totals, the recorded trial expiry of 2026-10-05, and escalation of the SSO question. The date tool returned 2026-09-21 during the recording; it is not the current date.</p><p><strong>Original replies, including their limitations.</strong> The follow-up contains an awkward intermediate equation, and one trial note still refers to eight people after the team grows to twelve. The handbook also leaves a maximum team size unspecified; that is not a verified promise of unlimited seats. These details remain visible in the screenshots.</p><p><strong>A defined action boundary.</strong> The final reply is a draft. No message was sent, no account was changed, and no customer was charged. This scenario demonstrates a documented uncertainty rule, not perfect accuracy for every possible question.</p><a href={`${root}/source/orbitdesk-handbook.md`} target="_blank" rel="noreferrer">Read the original handbook ↗</a></div></details>
      </section>

      <footer className="case-footer jcm-footer"><div><p className="projects-eyebrow">KEEP EXPLORING</p><h2>From a question to a traceable answer.</h2><a className="case-primary" href="/chat?query=Tell%20me%20about%20JChatMind%20and%20its%20Java%20backend.">Ask about JChatMind <span aria-hidden="true">↗</span></a></div><a className="case-back" href="/chat?query=projects">← Back to projects</a><p>Hongxiang Wang · Selected work</p></footer>
    </div>
  </main>;
}
