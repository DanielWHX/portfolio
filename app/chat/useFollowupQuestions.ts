"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeFollowupQuestion, parseFollowupResponse, type FollowupContext } from "@/lib/portfolio/followup-questions";
import type { ConversationMessage } from "@/lib/portfolio/chat-session";
import type { ProjectId } from "@/lib/portfolio/interview-context";

const REQUEST_TIMEOUT_MS = 18_000;
const GENERATION_DELAY_MS = 200;

export default function useFollowupQuestions() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIds, setQuestionIds] = useState<(string | null)[]>([]);
  const [generating, setGenerating] = useState(false);
  const [revision, setRevision] = useState(0);
  const context = useRef<FollowupContext | null>(null);
  const conversation = useRef<ConversationMessage[]>([]);
  const recent = useRef<string[]>([]);
  const recentIds = useRef<string[]>([]);
  const project = useRef<ProjectId | undefined>(undefined);
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    sequence.current++;
    controller.current?.abort();
    controller.current = null;
    if (delay.current) clearTimeout(delay.current);
    if (timeout.current) clearTimeout(timeout.current);
    delay.current = null;
    timeout.current = null;
  }, []);

  const suspend = useCallback((nextContext?: FollowupContext | null) => {
    cancel();
    if (nextContext !== undefined) {
      if (context.current !== nextContext || !nextContext) { setQuestions([]); setQuestionIds([]); }
      context.current = nextContext;
    }
    setGenerating(false);
  }, [cancel]);

  const generate = useCallback((nextContext: FollowupContext | null | undefined, messages: ConversationMessage[], projectId?: ProjectId) => {
    suspend(nextContext);
    if (project.current !== projectId) { setQuestions([]); setQuestionIds([]); }
    project.current = projectId;
    conversation.current = messages;
    const selectedContext = context.current;
    if (!selectedContext || messages.filter(message => message.role === "user").length >= 15) {
      setQuestions([]);
      return;
    }
    const asked = new Set(messages.filter(message => message.role === "user").map(message => normalizeFollowupQuestion(message.content)));
    setQuestions(previous => previous.some(question => asked.has(normalizeFollowupQuestion(question))) ? [] : previous);

    const requestSequence = sequence.current;
    const excluded = recent.current.slice(-12);
    const excludedIds = [...new Set([...recentIds.current, ...messages.filter(message => message.role === "user" && message.questionId).map(message => message.questionId!)])].slice(-40);
    setGenerating(true);
    delay.current = setTimeout(async () => {
      delay.current = null;
      const requestController = new AbortController();
      controller.current = requestController;
      timeout.current = setTimeout(() => requestController.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch("/api/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: selectedContext,
            messages: messages.slice(-6).map(({ role, content }) => ({ role, content })),
            exclude: excluded,
            ...(projectId ? { projectId } : {}),
            ...(excludedIds.length ? { excludeQuestionIds: excludedIds } : {}),
          }),
          signal: requestController.signal,
        });
        if (!response.ok) return;
        const result = parseFollowupResponse(await response.json(), { messages, exclude: excluded });
        if (sequence.current !== requestSequence || requestController.signal.aborted) return;
        setQuestions(result.questions);
        setQuestionIds(result.questionIds ?? [null, null]);
        recent.current = [...recent.current, ...result.questions].slice(-12);
        recentIds.current = [...new Set([...recentIds.current, ...(result.questionIds ?? []).filter((id): id is string => id !== null)])].slice(-40);
        setRevision(value => value + 1);
      } catch {
        // Suggestions are optional. A failed refresh must not interrupt the answer or draft.
      } finally {
        if (sequence.current === requestSequence) {
          if (timeout.current) clearTimeout(timeout.current);
          timeout.current = null;
          controller.current = null;
          setGenerating(false);
        }
      }
    }, GENERATION_DELAY_MS);
  }, [suspend]);

  const refresh = useCallback(() => generate(context.current, conversation.current, project.current), [generate]);
  const clear = useCallback(() => {
    suspend(null);
    conversation.current = [];
    recent.current = [];
    recentIds.current = [];
    project.current = undefined;
    setQuestionIds([]);
  }, [suspend]);

  useEffect(() => cancel, [cancel]);

  return { questions, questionIds, generating, revision, suspend, generate, refresh, clear };
}
