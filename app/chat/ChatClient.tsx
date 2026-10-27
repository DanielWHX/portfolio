"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import ProfileCard from "./ProfileCard";
import ContactCard from "./ContactCard";
import ProjectsCard from "./ProjectsCard";
import SkillsCard from "./SkillsCard";
import FunFactCard from "./FunFactCard";
import QuickQuestionIcon from "./QuickQuestionIcon";
import AnimatedText from "./AnimatedText";
import PortfolioIcon from "./PortfolioIcon";
import FollowupDock from "./FollowupDock";
import useFollowupQuestions from "./useFollowupQuestions";
import { getQuickQuestion, quickQuestions } from "@/lib/portfolio/quick-questions";
import { FUN_FACTS_REVISION } from "@/lib/portfolio/fun-facts";
import { explicitProject, resolveProject, type InterviewReference, type ProjectId } from "@/lib/portfolio/interview-context";

import { clearChatSession, readChatSession, saveChatSession, type ConversationMessage as Message } from "@/lib/portfolio/chat-session";

type ChatModule = Message["module"];

const MAX_USER_TURNS = 15;
const CHAT_REQUEST_TIMEOUT_MS = 35_000;

export default function ChatClient({ initialQuery }: { initialQuery: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [projectsActive, setProjectsActive] = useState(false);
  const projectRef = useRef<ProjectId | undefined>(undefined);
  const retryReference = useRef<{ content: string; reference: InterviewReference } | null>(null);
  const initialQuerySent = useRef(false);
  const sessionInitialized = useRef(false);
  const [sessionReady, setSessionReady] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const followReply = useRef(true);
  const requestInFlight = useRef(false);
  const { questions: followupQuestions, questionIds: followupQuestionIds, generating: generatingFollowups, revision: followupRevision,
    suspend: suspendFollowups, generate: generateFollowups,
    refresh: refreshFollowups, clear: clearFollowups } = useFollowupQuestions();

  const userTurns = messages.filter((message) => message.role === "user").length;
  const limitReached = userTurns >= MAX_USER_TURNS;
  const handleOverlayOpenChange = useCallback((open: boolean) => {
    setOverlayOpen(open);
    if (open) suspendFollowups();
  }, [suspendFollowups]);

  const sendMessage = useCallback(
    async (value: string, suppliedReference: InterviewReference = {}) => {
      const content = value.trim().slice(0, 1000);
      const turns = messages.filter((message) => message.role === "user").length;

      if (!content || requestInFlight.current) return;
      const preset = getQuickQuestion(content);
      setProjectsActive(preset?.label === "Projects");
      const reference = Object.keys(suppliedReference).length ? suppliedReference
        : retryReference.current?.content === content ? retryReference.current.reference : {};
      const selectedProject = explicitProject(content) ?? reference.projectId ?? projectRef.current;
      projectRef.current = preset?.label === "Fun Facts" || preset?.label === "Contact" || preset?.label === "Me" ? undefined : selectedProject;
      if (preset?.label === "Projects" && !projectRef.current) projectRef.current = "portfolio";
      const requestReference: InterviewReference = {
        ...(projectRef.current ? { projectId: projectRef.current } : {}),
        ...(reference.questionId ? { questionId: reference.questionId } : {}),
      };
      const nextContext = preset ? (preset.label === "Contact" ? null : preset.label) : undefined;
      const cachedIndex = preset ? messages.findIndex((message) => message.role === "assistant" && message.preset === preset.label) : -1;
      if (cachedIndex >= 0) {
        followReply.current = false;
        setError("");
        setMessages(messages.map((message, index) => index === cachedIndex ? { ...message, restored: true } : message));
        generateFollowups(nextContext, messages, projectRef.current);
        window.requestAnimationFrame(() => {
          const container = messagesRef.current;
          const answer = container?.querySelector<HTMLElement>(`[data-message-index="${cachedIndex}"]`);
          if (container && answer) {
            container.scrollTo({ top: answer.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 4, behavior: "instant" });
          }
        });
        return;
      }
      if (turns >= MAX_USER_TURNS) return;
      suspendFollowups(nextContext);
      saveChatSession(messages, content);
      requestInFlight.current = true;
      followReply.current = true;

      const nextMessages: Message[] = [...messages, { role: "user", content, ...requestReference }];
      setMessages(nextMessages);
      setDraft("");
      setError("");
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        CHAT_REQUEST_TIMEOUT_MS,
      );

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
            ...requestReference,
          }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          message?: string;
          module?: ChatModule;
          error?: string;
        };

        if (!response.ok || !payload.message) {
          throw new Error(payload.error || "The portfolio agent could not answer.");
        }

        const completedMessages: Message[] = [
          ...nextMessages,
          {
            role: "assistant",
            content: payload.message,
            module: payload.module,
            ...(preset ? { preset: preset.label } : {}),
            ...(preset?.label === "Fun Facts" || payload.module?.type === "fun_facts" ? { factsRevision: FUN_FACTS_REVISION } : {}),
          },
        ];
        setMessages(completedMessages);
        retryReference.current = null;
        generateFollowups(nextContext, completedMessages, projectRef.current);
      } catch (caught) {
        retryReference.current = { content, reference: requestReference };
        setMessages(messages);
        setDraft(content);
        setError(
          controller.signal.aborted
            ? "The response took too long. Please try again."
            : caught instanceof Error
            ? caught.message
            : "The portfolio agent could not answer. Please try again.",
        );
      } finally {
        window.clearTimeout(timeoutId);
        requestInFlight.current = false;
        setLoading(false);
      }
    },
    [messages, generateFollowups, suspendFollowups],
  );

  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;
    const saved = readChatSession();
    projectRef.current = saved.messages.filter(message => message.role === "user").at(-1)?.projectId ?? resolveProject(saved.messages);
    setMessages(saved.messages);
    setDraft(saved.draft);
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (sessionReady && !requestInFlight.current) saveChatSession(messages, draft);
  }, [sessionReady, messages, draft, loading]);

  useEffect(() => {
    if (!sessionReady || initialQuerySent.current) return;
    initialQuerySent.current = true;
    if (!initialQuery) return;
    window.history.replaceState({}, "", "/chat");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the URL-requested conversation once, after session hydration.
    void sendMessage(initialQuery);
  }, [sessionReady, initialQuery, sendMessage]);

  useEffect(() => {
    const container = messagesRef.current;
    const latest = container?.querySelector<HTMLElement>(`[data-message-index="${messages.length - 1}"]`);
    if (!container || !latest || !messages.length) return;
    if (messages[messages.length - 1].role === "user") {
      container.scrollTop = container.scrollHeight;
    } else if (followReply.current) {
      const top = latest.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 4;
      container.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [messages]);

  function startNewChat() {
    projectRef.current = undefined;
    retryReference.current = null;
    setProjectsActive(false);
    clearFollowups();
    clearChatSession();
    setMessages([]);
    setDraft("");
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  const handleProjectChange = useCallback((projectId: ProjectId) => {
    if (!projectsActive || requestInFlight.current || projectRef.current === projectId) return;
    projectRef.current = projectId;
    generateFollowups("Projects", messages, projectId);
  }, [projectsActive, messages, generateFollowups]);

  return (
    <div className="chat-body">
      <div className="chat-messages" ref={messagesRef} aria-live="polite" aria-busy={loading}
        onScroll={() => {
          const container = messagesRef.current;
          if (loading && container) followReply.current = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
        }}>

        {sessionReady && messages.length === 0 && !loading ? (
          <p className="chat-empty">
            Ask about my work, school, fitness, or your next SaaS idea.
          </p>
        ) : null}

        {messages.map((message, index) => (
          <div className={`chat-turn chat-turn-${message.role}${message.restored ? " chat-turn-restored" : ""}`} data-message-index={index} key={`${message.role}-${index}`}>
            {message.role === "assistant" && message.module?.type === "profile" ? (
              <ProfileCard profile={message.module.profile} />
            ) : message.role === "assistant" && message.module?.type === "skills" ? (
              <SkillsCard />
            ) : message.role === "assistant" && message.module?.type === "projects" ? (
              <ProjectsCard active={projectsActive && !loading && !overlayOpen} onProjectChange={handleProjectChange} />
            ) : message.role === "assistant" && message.module?.type === "contact" ? (
              <ContactCard contact={message.module.contact} />
            ) : message.role === "assistant" && (message.module?.type === "fun_facts" || message.preset === "Fun Facts") ? (
              <FunFactCard summary={message.content} onOverlayOpenChange={handleOverlayOpenChange} />
            ) : (
              <div className={`chat-message chat-message-${message.role}`}>
                {message.role === "assistant" ? <AnimatedText text={message.content} /> : message.content}
              </div>
            )}
          </div>
        ))}

        {loading ? <div className="chat-loading"><span className="chat-loading-dots" aria-hidden="true"><i /><i /><i /></span><span>Thinking…</span></div> : null}
      </div>

      {error ? (
        <p className="chat-error" role="alert">
          {error}
        </p>
      ) : null}

      <FollowupDock visible={!overlayOpen} questions={followupQuestions} questionIds={followupQuestionIds} revision={followupRevision} generating={generatingFollowups}
        disabled={!sessionReady || loading || limitReached} onRefresh={refreshFollowups}
        onSelect={(question, questionId) => {
          void sendMessage(question, { ...(projectRef.current ? { projectId: projectRef.current } : {}), ...(questionId ? { questionId } : {}) }).then(() => window.requestAnimationFrame(() => {
            document.getElementById("chat-query")?.focus({ preventScroll: true });
          }));
        }}>

      <nav className="chat-quick-questions" aria-label="Quick questions">
        {quickQuestions.map(({ label, tone, query }) => (
          <button key={label} type="button" className={`chat-quick-question tone-${tone}`}
            disabled={!sessionReady || loading || (limitReached && !messages.some((message) => message.preset === label))} onClick={() => void sendMessage(query)}>
            <span className="chat-quick-icon"><QuickQuestionIcon label={label} /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      </FollowupDock>

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-query">
          Ask about Hongxiang
        </label>
        <input
          id="chat-query"
          value={draft}
          onChange={(event) => { setDraft(event.target.value); retryReference.current = null; }}
          placeholder={limitReached ? "Question limit reached" : "Ask about me..."}
          autoComplete="off"
          maxLength={1000}
          disabled={!sessionReady || loading || limitReached}
          required
        />
        <button
          type="submit"
          disabled={!sessionReady || loading || limitReached || !draft.trim()}
          aria-label="Send question"
        >
          <PortfolioIcon name="arrow-up" />
        </button>
      </form>

      <div className="chat-footer">
        <p className="chat-disclosure">
          Hongxiang&apos;s AI portfolio
        </p>
        <button type="button" className="chat-reset" disabled={!sessionReady || loading || (!messages.length && !draft)} onClick={startNewChat}>
          New chat
        </button>
      </div>
    </div>
  );
}
