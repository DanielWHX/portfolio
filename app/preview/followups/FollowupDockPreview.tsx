"use client";

import { useState } from "react";
import FollowupDock from "@/app/chat/FollowupDock";
import QuickQuestionIcon from "@/app/chat/QuickQuestionIcon";
import SkillsCard from "@/app/chat/SkillsCard";
import { quickQuestions } from "@/lib/portfolio/quick-questions";

const samples = [
  ["How do you connect AI workflows to reliable backend APIs?", "How did your Java and Python projects differ?"],
  ["What did you build with Spring Boot?", "How does Lyntra handle scheduling conflicts?"],
];

export default function FollowupDockPreview() {
  const [ideas, setIdeas] = useState(0);
  const [draft, setDraft] = useState("");
  return <main className="chat-page">
    <section className="chat-shell" aria-label="Follow-up motion preview">
      <header className="chat-header"><span className="chat-avatar" aria-hidden="true" /><h1 className="sr-only">Follow-up dock design preview</h1></header>
      <div className="chat-body">
        <div className="chat-messages"><SkillsCard /></div>
        <FollowupDock questions={samples[ideas % samples.length]} revision={ideas} generating={false} disabled={false}
          onRefresh={() => setIdeas(value => value + 1)} onSelect={question => setDraft(question)}>
          <nav className="chat-quick-questions" aria-label="Quick questions">
            {quickQuestions.map(({ label, tone, query }) => <button type="button" key={label} className={`chat-quick-question tone-${tone}`} onClick={() => setDraft(query)}>
              <span className="chat-quick-icon"><QuickQuestionIcon label={label} /></span><span>{label}</span>
            </button>)}
          </nav>
        </FollowupDock>
        <form className="chat-form" onSubmit={event => event.preventDefault()}>
          <label className="sr-only" htmlFor="preview-query">Ask about Hongxiang</label>
          <input id="preview-query" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask about me..." />
          <button type="submit" aria-label="Send question" disabled><span aria-hidden="true">↑</span></button>
        </form>
        <div className="chat-footer"><p className="chat-disclosure">Design preview · Sample questions · No AI request</p></div>
      </div>
    </section>
  </main>;
}
