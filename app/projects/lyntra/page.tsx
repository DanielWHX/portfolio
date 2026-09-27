import type { Metadata } from "next";
import DemoVideo from "./DemoVideo";

export const metadata: Metadata = {
  title: "Lyntra — Adaptive AI Scheduling | Hongxiang Wang",
  description: "AI-assisted scheduling and task planning. My work on calendar conflict resolution, AI Agent integration, and Task Breakdown at Lyntra.",
};

const diagrams = [
  { title: "Scheduling workflow", file: "workflow", description: "AI interprets the request. Scheduling rules check availability before saving.", alt: "A task requested at an occupied 10:00 slot moves to 11:00–12:00, preserving its duration and the existing meeting." },
  { title: "Architecture", file: "architecture", description: "React Native / Expo → Flask → PostgreSQL, with an external LLM for intent and task generation.", alt: "Expo and React Native connect to a modular Flask backend for AI interpretation, scheduling validation, and calendar context. PostgreSQL stores calendar state." },
];

export default function LyntraCaseStudy() {
  return <main className="case-page">
    <div className="case-wrap">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
      <nav className="case-nav" aria-label="Case study navigation"><a className="case-back" href="/chat?query=projects">← Back to projects</a><a className="case-wordmark" href="/" aria-label="Hongxiang Wang portfolio home">Hongxiang Wang</a></nav>
      <header className="case-hero">
        <h1>Lyntra</h1>
        <nav className="case-official-links" aria-label="Lyntra official website">
          <a href="https://www.lyntra.net/students/" target="_blank" rel="noopener noreferrer">Official website ↗</a>
          <a href="https://www.lyntra.net/about-us/who-we-are" target="_blank" rel="noopener noreferrer">Meet the team ↗</a>
        </nav>
        <p className="case-lead">AI scheduling that resolves calendar conflicts and breaks goals into tasks.</p>
        <p className="case-role">My role: Adaptive Scheduling, AI Agent integration & Task Breakdown · Lyntra internship</p>
        <ul className="case-stack" aria-label="Core technologies"><li>Python</li><li>Flask</li><li>PostgreSQL</li><li>React Native</li></ul>
      </header>

      <section className="case-demo" id="demo" aria-labelledby="demo-title">
        <div className="case-section-heading"><h2 id="demo-title">Demo</h2><p>68 seconds · English captions · Local prototype</p></div>
        <DemoVideo />
        <p className="case-result"><strong>Conflict resolved:</strong> requested 10:00 → saved 11:00–12:00. The existing meeting stays put.</p>
      </section>

      <section className="case-contributions" aria-labelledby="contributions-title">
        <div className="case-section-heading"><h2 id="contributions-title">My contribution</h2></div>
        <div className="case-contribution-grid">
          <article><h3>Conflict-aware scheduling</h3><p>Find a free slot while preserving task duration.</p></article>
          <article><h3>AI → calendar actions</h3><p>Connect natural-language requests to validated backend operations.</p></article>
          <article><h3>Task Breakdown</h3><p>Turn a goal into subtasks, time estimates, and a schedule preview.</p></article>
        </div>
      </section>

      <section className="case-technical" aria-label="Technical details">
        {diagrams.map(diagram => <details className="case-details" key={diagram.file}>
          <summary>{diagram.title}</summary>
          <p>{diagram.description}</p>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users can scroll the diagram on small screens. */}
          <figure className="case-diagram"><div className="case-diagram-viewport" role="region" aria-label={`${diagram.title}; scroll horizontally on small screens`} tabIndex={0}><a href={`/projects/lyntra/${diagram.file}.svg`} target="_blank" rel="noreferrer" aria-label={`Open ${diagram.title.toLowerCase()} at full size`}><img src={`/projects/lyntra/${diagram.file}.svg`} width="1280" height="920" loading="lazy" alt={diagram.alt} /></a></div><figcaption><a href={`/projects/lyntra/${diagram.file}.svg`} target="_blank" rel="noreferrer">View full size ↗</a><span className="case-swipe-hint">Swipe to explore →</span></figcaption></figure>
        </details>)}
      </section>
      <p className="case-scope">Prototype scope: user-requested rescheduling and task previews. Background replanning and preview-to-calendar acceptance are still in development.</p>
      <footer className="case-footer"><a className="case-back" href="/chat?query=projects">← Back to projects</a><a href="/chat?query=Tell%20me%20about%20your%20Adaptive%20Scheduling%20design%20for%20Lyntra.">Ask about Lyntra ↗</a></footer>
    </div>
  </main>;
}
