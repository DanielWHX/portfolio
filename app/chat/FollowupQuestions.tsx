"use client";

export default function FollowupQuestions({ questions, questionIds = [], revision, generating, disabled, onRefresh, onSelect }: {
  questions: string[];
  questionIds?: (string | null)[];
  revision: number;
  generating: boolean;
  disabled: boolean;
  onRefresh: () => void;
  onSelect: (question: string, questionId?: string) => void;
}) {
  if (questions.length !== 2) return null;

  return (
    <section className="chat-followups" aria-label="Suggested questions">
      <div className="chat-followups-heading">
        <h2>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
            <path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z" />
          </svg>
          You could ask
        </h2>
        <button type="button" className="chat-followups-refresh" aria-label="Generate new questions" disabled={disabled || generating} onClick={onRefresh}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 7v5h-5M19 12a7 7 0 1 0-2 5M20 12l-3-5" />
          </svg>
          New ideas
        </button>
      </div>
      <div className="chat-followups-questions" aria-live="polite" aria-busy={generating}>
        {questions.map((question, index) => (
          <button key={`${revision}-${index}`} type="button" className="chat-followup" disabled={disabled} onClick={() => onSelect(question, questionIds[index] ?? undefined)}>
            <span>{question}</span>
            <span className="chat-followup-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div className="chat-followups-tail" aria-hidden="true" />
    </section>
  );
}
