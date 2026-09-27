import type { Metadata } from "next";
import OrbitDeskDemo from "./OrbitDeskDemo";
import LiveDemo from "./LiveDemo";
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
  let liveDemoUrl: string | undefined;
  try {
    const url = new URL(process.env.JCHATMIND_DEMO_URL ?? "");
    if (url.protocol === "https:" && !url.username && !url.password && url.hostname !== "localhost") liveDemoUrl = url.href;
  } catch { /* Keep the verified walkthrough until the original backend is deployed. */ }
  return <main className="case-page jcm-page">
    <div className="case-wrap">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
      <nav className="case-nav" aria-label="Case study navigation"><a className="case-back" href="/chat?query=projects">← Back to projects</a><a className="case-wordmark" href="/" aria-label="Hongxiang Wang portfolio home">Hongxiang Wang</a></nav>

      <header className="case-hero jcm-hero">
        <h1>JChatMind</h1>
        <p className="case-lead">An AI support assistant that answers from your knowledge base.</p>
        <div className="jcm-hero-actions">
          <ul className="case-stack" aria-label="Core technologies"><li>Java</li><li>Spring Boot</li><li>Spring AI</li><li>pgvector</li></ul>
          <a className="jcm-demo-link" href={liveDemoUrl ? "#live-demo" : "#demo"}>{liveDemoUrl ? "Try it live" : "Explore the demo"} <span aria-hidden="true">↘</span></a>
        </div>
      </header>

      {liveDemoUrl && <LiveDemo url={liveDemoUrl} />}

      <section className="jcm-section" id="demo" aria-labelledby="jcm-demo-title">
        <div className="case-section-heading"><h2 id="jcm-demo-title">Demo</h2><p>OrbitDesk · Fictional SaaS scenario · Recorded screenshots</p></div>
        <OrbitDeskDemo />
      </section>

      <section className="jcm-section" aria-labelledby="jcm-references-title">
        <div className="case-section-heading"><h2 id="jcm-references-title">Sources</h2><p><mark className="jcm-inline-mark">Yellow highlights the original handbook.</mark></p></div>
        <div className="jcm-reference-grid">
          {references.map((reference) => <article className="jcm-reference-card" key={reference.file}>
            <a href={`${root}/references/${reference.file}.jpg`} target="_blank" rel="noreferrer" aria-label={`Open highlighted ${reference.title.toLowerCase()} screenshot at full size`}><img src={`${root}/references/${reference.file}.jpg`} width={reference.width} height={reference.height} loading="lazy" alt={`Annotated handbook source with yellow highlights: ${reference.title}.`} /></a>
            <div><h3>{reference.title}</h3><p>{reference.description}</p><a href={`${root}/references/${reference.file}.html`} target="_blank" rel="noreferrer">Read highlighted source ↗</a></div>
          </article>)}
        </div>
        <div className="jcm-source-footer"><a href={`${root}/references/00-configured-knowledge-base.jpg`} target="_blank" rel="noreferrer">See the configured knowledge base ↗</a></div>
      </section>

      <section className="jcm-details-section" aria-label="Complete conversation and demonstration scope">
        <details className="jcm-details"><summary>Architecture</summary><p>React → Spring Boot / Spring AI → PostgreSQL + pgvector.</p><p>KnowledgeTool retrieves relevant documents; getDate supplies the trial start date. Ollama generates embeddings, and DeepSeek generates the recorded replies.</p></details>
        <details className="jcm-details"><summary>Explore the complete conversation <span>8 consecutive captures</span></summary><p>Eight original captures. Select an image to view it at full size.</p><div className="jcm-complete-gallery">{captures.map(([file, label], index) => <figure key={file}><a href={`${root}/chat/${file}.jpg`} target="_blank" rel="noreferrer"><img src={`${root}/chat/${file}.jpg`} width="1280" height="655" loading="lazy" alt={`Full conversation capture ${index + 1}: ${label}.`} /></a><figcaption><span>{String(index + 1).padStart(2, "0")}</span>{label}</figcaption></figure>)}</div></details>
        <details className="jcm-details"><summary>Scope & accuracy notes <span>What the evidence establishes</span></summary><div className="jcm-accuracy-copy"><p><strong>A real app, a fictional business.</strong> OrbitDesk and its policies are sample data. The captures show a stored JChatMind conversation, not live customer operations. The highlighted reference pages are annotated source views, not the app’s document viewer.</p><p><strong>Supported main results.</strong> The source supports the Team plan recommendation, $144 and $216 monthly totals, the recorded trial expiry of 2026-10-05, and escalation of the SSO question. The date tool returned 2026-09-21 during the recording; it is not the current date.</p><p><strong>Original replies, including their limitations.</strong> The follow-up contains an awkward intermediate equation, and one trial note still refers to eight people after the team grows to twelve. The handbook also leaves a maximum team size unspecified; that is not a verified promise of unlimited seats. These details remain visible in the screenshots.</p><p><strong>A defined action boundary.</strong> The final reply is a draft. No message was sent, no account was changed, and no customer was charged. This scenario demonstrates a documented uncertainty rule, not perfect accuracy for every possible question.</p><a href={`${root}/source/orbitdesk-handbook.md`} target="_blank" rel="noreferrer">Read the original handbook ↗</a></div></details>
      </section>

      <footer className="case-footer"><a className="case-back" href="/chat?query=projects">← Back to projects</a><a href="/chat?query=Tell%20me%20about%20JChatMind%20and%20its%20Java%20backend.">Ask about JChatMind ↗</a></footer>
    </div>
  </main>;
}
