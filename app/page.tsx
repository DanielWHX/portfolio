import SplashCursor from "./SplashCursor";

const quickOptions = [
  {
    label: "Me",
    icon: "☺",
    tone: "cyan",
    query: "Who are you? I want to know more about you.",
  },
  {
    label: "Projects",
    icon: "▣",
    tone: "green",
    query: "Show me your projects.",
  },
  {
    label: "Skills",
    icon: "◇",
    tone: "violet",
    query: "What are your strongest skills?",
  },
  {
    label: "Fun",
    icon: "✦",
    tone: "pink",
    query: "What do you enjoy outside of engineering?",
  },
  {
    label: "Contact",
    icon: "⌁",
    tone: "amber",
    query: "How can I contact you?",
  },
] as const;

type HomeProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.query) ? params.query[0] : params.query;
  const query = (rawQuery ?? "").trim().slice(0, 160);

  return (
    <main className="single-page">
      <SplashCursor
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={0.5}
        VELOCITY_DISSIPATION={3}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
        SHADING
        TRANSPARENT
        RAINBOW_MODE
      />

      <div className="name-watermark" aria-hidden="true">
        HXW
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <div className="brand-mark" aria-hidden="true">
          HW
        </div>

        <p className="greeting">
          Hey, I&apos;m Hongxiang <span aria-hidden="true">👋</span>
        </p>
        <h1 id="hero-title">Full-Stack Engineer</h1>

        <div
          className="portrait"
          role="img"
          aria-label="Stylized avatar representing Hongxiang Wang"
        >
          🧑🏻
        </div>

        <form className="query-box" action="/" method="get">
          <label className="sr-only" htmlFor="portfolio-query">
            Ask Hongxiang anything
          </label>
          <input
            id="portfolio-query"
            name="query"
            type="text"
            defaultValue={query}
            placeholder="Ask me anything..."
            autoComplete="off"
            maxLength={160}
            required
          />
          <button type="submit" aria-label="Send question">
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <nav className="quick-options" aria-label="Quick questions">
          {quickOptions.map((option) => (
            <a
              key={option.label}
              className={`tone-${option.tone}`}
              href={`/?query=${encodeURIComponent(option.query)}`}
            >
              <span aria-hidden="true">{option.icon}</span>
              <strong>{option.label}</strong>
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
