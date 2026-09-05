import ChatClient from "./ChatClient";

type ChatPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.query) ? params.query[0] : params.query;
  const initialQuery = (rawQuery ?? "").trim().slice(0, 1000);

  return (
    <main className="chat-page">
      <section className="chat-shell" aria-labelledby="chat-title">
        <header className="chat-header">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
          <a className="chat-back" href="/" aria-label="Back to portfolio">
            <span aria-hidden="true">←</span>
          </a>
          <span className="chat-avatar" aria-hidden="true" />
          <div>
            <h1 id="chat-title">Ask about me</h1>
            <p>Hongxiang&apos;s portfolio agent</p>
          </div>
        </header>

        <ChatClient initialQuery={initialQuery} />
      </section>
    </main>
  );
}
