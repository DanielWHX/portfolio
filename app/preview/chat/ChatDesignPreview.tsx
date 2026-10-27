"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedText from "@/app/chat/AnimatedText";
import ProfileCard from "@/app/chat/ProfileCard";
import ProjectsCard from "@/app/chat/ProjectsCard";
import SkillsCard from "@/app/chat/SkillsCard";
import ContactCard from "@/app/chat/ContactCard";
import FunFactCard from "@/app/chat/FunFactCard";
import FollowupDock from "@/app/chat/FollowupDock";
import PortfolioIcon from "@/app/chat/PortfolioIcon";
import QuickQuestionIcon from "@/app/chat/QuickQuestionIcon";
import { quickQuestions } from "@/lib/portfolio/quick-questions";
import { getResumeOverviewCard } from "@/lib/portfolio/resume-profile";
import { contactProfile } from "@/lib/portfolio/contact-profile";

type Section = (typeof quickQuestions)[number]["label"];
const summary = "I build practical software with Python, Java and AI. Outside engineering, I enjoy lifting, travelling and exchanging ideas with people from different places.";
const facts = "Outside code, I like a change of perspective, whether I’m skydiving, lifting or meeting people from different places. I also make time for Apex Legends and LeetCode.";
const questions: Record<Section, string[]> = {
  Me: ["What shaped your approach to building software?", "What do you enjoy about working across the stack?", "How have your projects influenced your interests?", "What would you like to build next?"],
  Projects: ["What was the most interesting engineering tradeoff in JChatMind?", "How did you approach rescheduling in Lyntra?", "What did you learn from connecting AI to a real product?", "Which part of your work would you improve next?"],
  Skills: ["How have you used Python and Java in your projects?", "What did you learn from building AI workflows?", "How do you connect frontend work with backend APIs?", "What do you enjoy about backend engineering?"],
  "Fun Facts": ["What do you enjoy about strength training?", "What did you learn through your Whatnot collaboration?", "What games do you enjoy playing?", "What do you enjoy about meeting people from different places?"],
  Contact: ["How can I reach you?", "Where can I find your work?"],
};

export default function ChatDesignPreview() {
  const [section, setSection] = useState<Section>("Projects");
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const candidates = questions[section];
  const shownQuestions = [candidates[revision % candidates.length], candidates[(revision + 1) % candidates.length]];

  useEffect(() => { messagesRef.current?.scrollTo({ top: 0, behavior: "instant" }); }, [section, question]);

  function selectSection(next: Section) { setSection(next); setQuestion(""); }

  return <main className="chat-page chat-design chat-design-preview">
    <section className="chat-shell" aria-label="Chat design preview">
      <header className="chat-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Match the native navigation in the real chat. */}
        <a className="chat-back" href="/" aria-label="Back to portfolio"><PortfolioIcon name="arrow-left" /></a>
        <span className="chat-avatar" aria-hidden="true" />
      </header>
      <div className="chat-body">
        <div className="chat-messages" ref={messagesRef}>
          <div className="chat-turn chat-turn-user"><div className="chat-message chat-message-user">{question || quickQuestions.find(item => item.label === section)!.query}</div></div>
          <div className="chat-turn chat-turn-assistant" key={question || section}>
            {question ? <div className="chat-message chat-message-assistant"><AnimatedText text="This is a sample answer for reviewing typography and motion. The design preview does not send questions to AI." /></div>
              : section === "Me" ? <ProfileCard profile={getResumeOverviewCard(summary)} />
              : section === "Projects" ? <ProjectsCard />
              : section === "Skills" ? <SkillsCard />
              : section === "Contact" ? <ContactCard contact={contactProfile} />
              : <FunFactCard summary={facts} onOverlayOpenChange={setOverlayOpen} />}
          </div>
        </div>
        <FollowupDock visible={!overlayOpen && section !== "Contact"} questions={shownQuestions} revision={revision} generating={false} disabled={false}
          onRefresh={() => setRevision(value => value + 1)} onSelect={setQuestion}>
          <nav className="chat-quick-questions" aria-label="Quick questions">
            {quickQuestions.map(item => <button key={item.label} type="button" className={`chat-quick-question tone-${item.tone}`} onClick={() => selectSection(item.label)}>
              <span className="chat-quick-icon"><QuickQuestionIcon label={item.label} /></span><span>{item.label}</span>
            </button>)}
          </nav>
        </FollowupDock>
        <form className="chat-form" onSubmit={event => { event.preventDefault(); if (draft.trim()) { setQuestion(draft.trim()); setDraft(""); } }}>
          <label className="sr-only" htmlFor="preview-query">Try the preview input</label>
          <input id="preview-query" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask about me..." autoComplete="off" maxLength={1000} />
          <button type="submit" aria-label="Send sample question" disabled={!draft.trim()}><PortfolioIcon name="arrow-up" /></button>
        </form>
        <div className="chat-footer"><p className="chat-disclosure">Design preview · Sample content · No AI calls</p><button type="button" className="chat-reset" onClick={() => { setQuestion(""); setDraft(""); }}>Reset</button></div>
      </div>
    </section>
  </main>;
}
