import SplashCursor from "./SplashCursor";

import { quickQuestions } from "@/lib/portfolio/quick-questions";

export default function Home() {
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
        Hongxiang
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <p className="greeting">
          Hey, I&apos;m Hongxiang <span aria-hidden="true">👋</span>
        </p>
        <h1 id="hero-title">Full-Stack Engineer</h1>

        <img
          className="portrait"
          src="/hongxiang-avatar.png"
          width={1229}
          height={1280}
          alt="Muscular pink character representing Hongxiang Wang"
        />

        <form className="query-box" action="/chat" method="get">
          <label className="sr-only" htmlFor="portfolio-query">
            Ask Hongxiang anything
          </label>
          <input
            id="portfolio-query"
            name="query"
            type="text"
            placeholder="Ask about me..."
            autoComplete="off"
            maxLength={1000}
            required
          />
          <button type="submit" aria-label="Send question">
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <nav className="quick-options" aria-label="Quick questions">
          {quickQuestions.map((option) => {
            const content = (
              <>
                <span aria-hidden="true">{option.icon}</span>
                <strong>{option.label}</strong>
              </>
            );

            return (
              <a
                key={option.label}
                className={`quick-option tone-${option.tone}`}
                href={`/chat?query=${encodeURIComponent(option.query)}`}
              >
                {content}
              </a>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
