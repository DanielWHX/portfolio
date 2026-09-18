import type { Metadata } from "next";
import DemoVideo from "./DemoVideo";

export const metadata: Metadata = {
  title: "Lyntra — Adaptive AI Scheduling | Hongxiang Wang",
  description: "A case study in AI-assisted planning: Adaptive Scheduling, AI Agent integration, and calendar-aware Task Breakdown by Hongxiang Wang.",
};

export default function LyntraCaseStudy() {
  return <main className="case-page">
    <div className="case-wrap">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
      <nav className="case-nav" aria-label="Case study navigation"><a className="case-back" href="/chat?query=projects">← Back to projects</a><a className="case-wordmark" href="/" aria-label="Hongxiang Wang portfolio home">HXW<span> / SELECTED WORK</span></a></nav>
      <header className="case-hero">
        <div className="case-kicker"><span className="case-project-name">LYNTRA</span><span>AI-ASSISTED PLANNING</span><span className="case-status">Functional prototype</span></div>
        <h1>A calendar that <span>adapts.</span></h1>
        <p className="case-lead">Turn a big goal into clear next steps.<br/>Turn a scheduling conflict into a workable plan.</p>
        <div className="case-hero-bottom"><p>I led the design of <strong>Adaptive Scheduling</strong>, connecting AI agents, Task Breakdown, and calendar logic in a student planning application.</p><a className="case-primary" href="#demo">Watch the demo <span aria-hidden="true">↘</span></a></div>
        <dl className="case-facts"><div><dt>MY ROLE</dt><dd>Adaptive Scheduling Lead<small>Backend & AI Agent Integration</small></dd></div><div><dt>CONTEXT</dt><dd>Lyntra LLC<small>Full-stack Developer Internship</small></dd></div><div><dt>CORE STACK</dt><dd>Python · Flask · PostgreSQL<small>React Native / Expo · TypeScript · LLM APIs</small></dd></div></dl>
      </header>

      <section className="case-demo" id="demo" aria-labelledby="demo-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">01 / THE PRODUCT</p><h2 id="demo-title">See the plan change.</h2></div><p>68 seconds · English captions<br/>Recorded local prototype · Sample data</p></div>
        <DemoVideo/>
        <p className="case-video-caption">A goal becomes a task preview. A calendar conflict becomes a saved change. An existing subtask becomes a focused work session.</p>
      </section>

      <section className="case-contributions" aria-labelledby="contributions-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">02 / MY CONTRIBUTION</p><h2 id="contributions-title">From conversation to action.</h2></div><p>Three connected responsibilities.<br/>One coherent planning experience.</p></div>
        <div className="case-contribution-grid">
          <article><span className="case-feature-icon" aria-hidden="true">↔</span><p className="case-small-label">ADAPTIVE SCHEDULING</p><h3>Make room for change.</h3><p>Designed the scheduling flow to check occupied time, find an available slot, and preserve task duration when a requested time conflicts.</p></article>
          <article><span className="case-feature-icon" aria-hidden="true">✧</span><p className="case-small-label">AI AGENT INTEGRATION</p><h3>Understand the request.</h3><p>Connected natural-language intent to backend calendar operations, keeping language interpretation separate from validation and persistence.</p></article>
          <article><span className="case-feature-icon" aria-hidden="true">≡</span><p className="case-small-label">TASK BREAKDOWN</p><h3>Give a goal a starting point.</h3><p>Integrated AI-generated subtasks, time estimates, and calendar availability into an actionable preview of suggested work blocks.</p></article>
        </div>
      </section>

      <section className="case-flow" aria-labelledby="flow-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">03 / THE CORE WORKFLOW</p><h2 id="flow-title">Ask naturally. Schedule carefully.</h2></div></div>
        <p className="case-section-intro">The AI identifies what should change. Scheduling logic checks whether that change fits. The saved calendar is the result the user can trust.</p>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to focus this horizontally scrollable diagram region. */}
        <figure className="case-diagram"><div className="case-diagram-viewport" role="region" aria-label="Diagram; scroll horizontally on small screens" tabIndex={0}><a href="/projects/lyntra/workflow.svg" target="_blank" rel="noreferrer" aria-label="Open Adaptive AI scheduling workflow at full size"><img src="/projects/lyntra/workflow.svg" width="1280" height="920" loading="lazy" alt="Adaptive AI scheduling: request a change, interpret intent, check the calendar, resolve conflicts, save and review. A 14:00 task requested at an occupied 10:00 slot moves to 11:00–12:00." /></a></div><figcaption><span>A concrete conflict, resolved without moving the existing meeting.</span><a href="/projects/lyntra/workflow.svg" target="_blank" rel="noreferrer">View full size ↗</a><span className="case-swipe-hint">Swipe the diagram to explore →</span></figcaption></figure>
        <div className="case-callout"><span aria-hidden="true">↳</span><p><strong>The important boundary:</strong> AI proposes an interpretation; application logic checks availability and saves the change.</p></div>
      </section>

      <section className="case-architecture" aria-labelledby="architecture-title">
        <div className="case-section-heading"><div><p className="projects-eyebrow">04 / SYSTEM DESIGN</p><h2 id="architecture-title">Clear layers. Connected decisions.</h2></div></div>
        <p className="case-section-intro">A web and mobile interface talks to a modular Flask backend. AI interpretation, scheduling checks, and shared calendar data each have a clear responsibility.</p>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to focus this horizontally scrollable diagram region. */}
        <figure className="case-diagram"><div className="case-diagram-viewport" role="region" aria-label="Diagram; scroll horizontally on small screens" tabIndex={0}><a href="/projects/lyntra/architecture.svg" target="_blank" rel="noreferrer" aria-label="Open Lyntra architecture at full size"><img src="/projects/lyntra/architecture.svg" width="1280" height="920" loading="lazy" alt="Expo and React Native interface connects over HTTP with JWT authentication to one Flask application. Internal modules handle AI interpretation, scheduling validation, and shared calendar context, connected to an external LLM API and PostgreSQL." /></a></div><figcaption><span>Simplified logical architecture of the demonstrated scheduling flow.</span><a href="/projects/lyntra/architecture.svg" target="_blank" rel="noreferrer">View full size ↗</a><span className="case-swipe-hint">Swipe the diagram to explore →</span></figcaption></figure>
        <div className="case-design-notes"><div><h3>AI with a defined job</h3><p>Use the model for interpretation and task generation, with explicit scheduling rules around its output.</p></div><div><h3>One calendar context</h3><p>Use shared busy-time data so task previews and rescheduling decisions account for existing commitments.</p></div><div><h3>Visible saved state</h3><p>Confirm calendar changes through the backend and surface save failures so the interface reflects what was stored.</p></div></div>
      </section>

      <section className="case-outcome" aria-labelledby="outcome-title"><div><p className="projects-eyebrow">05 / WHAT THIS DEMONSTRATES</p><h2 id="outcome-title">More than an AI chat box.</h2><p>A working connection between language, application rules, and persistent calendar state.</p></div><div className="case-outcome-detail"><p>The local demo shows a one-hour task moved from 14:00 to 11:00 after a requested 10:00 slot conflicts with a meeting. The meeting stays in place, and the change is saved.</p><p className="case-scope"><strong>Current scope</strong> · User-requested rescheduling and Task Breakdown previews are demonstrated. Continuous background replanning and the complete preview-to-calendar workflow remain in development.</p></div></section>

      <footer className="case-footer"><div><p className="projects-eyebrow">KEEP EXPLORING</p><h2>Curious about the decisions behind it?</h2><a className="case-primary" href="/chat?query=Tell%20me%20about%20your%20Adaptive%20Scheduling%20design%20for%20Lyntra.">Ask about Lyntra <span aria-hidden="true">↗</span></a></div><a className="case-back" href="/chat?query=projects">← Back to projects</a><p>Hongxiang Wang · Selected work</p></footer>
    </div>
  </main>;
}
