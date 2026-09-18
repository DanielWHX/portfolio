"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import ProfileCard from "./ProfileCard";
import ContactCard from "./ContactCard";
import ProjectsCard from "./ProjectsCard";
import { isProjectsOverviewRequest } from "@/lib/portfolio/projects";
import AnimatedText from "./AnimatedText";
import { quickQuestions } from "@/lib/portfolio/quick-questions";

import { clearChatSession, readChatSession, saveChatSession, type ConversationMessage as Message } from "@/lib/portfolio/chat-session";

type ChatModule = Message["module"];

const MAX_USER_TURNS = 15;
const CHAT_REQUEST_TIMEOUT_MS = 35_000;

export default function ChatClient({ initialQuery }: { initialQuery: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialQuerySent = useRef(false);
  const sessionInitialized = useRef(false);
  const [sessionReady, setSessionReady] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const followReply = useRef(true);
  const requestInFlight = useRef(false);

  const userTurns = messages.filter((message) => message.role === "user").length;
  const limitReached = userTurns >= MAX_USER_TURNS;

  const sendMessage = useCallback(
    async (value: string) => {
      const content = value.trim().slice(0, 1000);
      const turns = messages.filter((message) => message.role === "user").length;

      if (!content || requestInFlight.current || turns >= MAX_USER_TURNS) return;
      saveChatSession(messages, content);
      requestInFlight.current = true;
      followReply.current = true;

      const nextMessages: Message[] = [...messages, { role: "user", content }];
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

        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: payload.message,
            module: payload.module,
          },
        ]);
      } catch (caught) {
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
    [messages],
  );

  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;
    const saved = readChatSession();
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
    // The homepage Me entry resumes an existing session without asking Me again.
    if (initialQuery === "Who are you?" && (messages.length || draft)) return;
    if (isProjectsOverviewRequest(initialQuery) && messages.at(-1)?.module?.type === "projects") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the URL-requested conversation once, after session hydration.
    void sendMessage(initialQuery);
  }, [sessionReady, initialQuery, sendMessage, messages, draft]);

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
    clearChatSession();
    setMessages([]);
    setDraft("");
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

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
            ) : message.role === "assistant" && message.module?.type === "projects" ? (
              <ProjectsCard />
            ) : message.role === "assistant" && message.module?.type === "contact" ? (
              <ContactCard contact={message.module.contact} message={message.content} />
            ) : (
              <div className={`chat-message chat-message-${message.role}`}>
                {message.role === "assistant" ? <AnimatedText text={message.content} /> : message.content}
              </div>
            )}
          </div>
        ))}

        {loading ? <div className="chat-loading">Thinking…</div> : null}
      </div>

      {error ? (
        <p className="chat-error" role="alert">
          {error}
        </p>
      ) : null}

      <nav className="chat-quick-questions" aria-label="Quick questions">
        {quickQuestions.map(({ label, icon, tone, query }) => (
          <button key={label} type="button" className={`chat-quick-question tone-${tone}`}
            disabled={!sessionReady || loading || limitReached} onClick={() => void sendMessage(query)}>
            <span className="chat-quick-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-query">
          Ask about Hongxiang
        </label>
        <input
          id="chat-query"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
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
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="chat-footer">
        <p className="chat-disclosure">
          Hongxiang&apos;s AI portfolio · Shared background, interests, and conversation.
        </p>
        <button type="button" className="chat-reset" disabled={!sessionReady || loading || (!messages.length && !draft)} onClick={startNewChat}>
          New chat
        </button>
      </div>
    </div>
  );
}
