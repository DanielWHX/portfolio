"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import type { ResumeOverviewCard } from "@/lib/portfolio/resume-profile";
import type { ContactCardData } from "@/lib/portfolio/contact-profile";
import ProfileCard from "./ProfileCard";
import ContactCard from "./ContactCard";

type ProfileModule = {
  type: "profile";
  profile: ResumeOverviewCard;
};

type ChatModule = ProfileModule | { type: "contact"; contact: ContactCardData };

type Message = {
  role: "user" | "assistant";
  content: string;
  module?: ChatModule;
};

const MAX_USER_TURNS = 15;
const CHAT_REQUEST_TIMEOUT_MS = 35_000;

export default function ChatClient({ initialQuery }: { initialQuery: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialQuerySent = useRef(false);

  const userTurns = messages.filter((message) => message.role === "user").length;
  const limitReached = userTurns >= MAX_USER_TURNS;

  const sendMessage = useCallback(
    async (value: string) => {
      const content = value.trim().slice(0, 1000);
      const turns = messages.filter((message) => message.role === "user").length;

      if (!content || loading || turns >= MAX_USER_TURNS) return;

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
        setLoading(false);
      }
    },
    [loading, messages],
  );

  useEffect(() => {
    if (!initialQuery || initialQuerySent.current) return;

    initialQuerySent.current = true;
    window.history.replaceState({}, "", "/chat");
    void sendMessage(initialQuery);
  }, [initialQuery, sendMessage]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  return (
    <div className="chat-body">
      <div className="chat-messages" aria-live="polite" aria-busy={loading}>
        {messages.length === 0 && !loading ? (
          <p className="chat-empty">
            Ask about my work, school, fitness, or your next SaaS idea.
          </p>
        ) : null}

        {messages.map((message, index) =>
          message.role === "assistant" && message.module?.type === "profile" ? (
            <ProfileCard
              key={`${message.role}-${index}`}
              profile={message.module.profile}
            />
          ) : message.role === "assistant" && message.module?.type === "contact" ? (
            <ContactCard
              key={`${message.role}-${index}`}
              contact={message.module.contact}
              message={message.content}
            />
          ) : (
            <div
              className={`chat-message chat-message-${message.role}`}
              key={`${message.role}-${index}`}
            >
              {message.content}
            </div>
          ),
        )}

        {loading ? <div className="chat-loading">Thinking…</div> : null}
      </div>

      {error ? (
        <p className="chat-error" role="alert">
          {error}
        </p>
      ) : null}

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
          disabled={loading || limitReached}
          required
        />
        <button
          type="submit"
          disabled={loading || limitReached || !draft.trim()}
          aria-label="Send question"
        >
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className="chat-disclosure">
        Hongxiang&apos;s AI portfolio · Shared background, interests, and conversation.
      </p>
    </div>
  );
}
