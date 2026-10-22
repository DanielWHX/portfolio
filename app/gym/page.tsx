import type { Metadata } from "next";
import TopGymCard from "../chat/TopGymCard";
import "./preview.css";

export const metadata: Metadata = {
  title: "Big Three Record | Hongxiang Wang",
  description: "Hongxiang’s squat 200 kg, bench press 160 kg and deadlift 200 kg, with a playable pixel gym and real lifting clips.",
};

export default async function GymPage({ searchParams }: { searchParams: Promise<{ theme?: string | string[] }> }) {
  const params = await searchParams;
  const theme = params.theme === "arcade" ? "arcade" : "iron";
  const preview = params.theme === "arcade" || params.theme === "iron";
  return <main className="gym-page" data-theme={theme} data-gym-impact-root>
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
    <nav className="gym-page-nav" aria-label="Big Three Record navigation"><a href="/chat?query=Fun%20Facts">← Back to Fun Facts</a><a href="/">Hongxiang Wang <span aria-hidden="true">↗</span></a></nav>
    {preview ? <nav className="gym-design-preview" aria-label="Compare design previews"><span>DESIGN PREVIEW</span><a href="/gym?theme=arcade" aria-current={theme === "arcade" ? "page" : undefined}>01 / Arcade</a><a href="/gym?theme=iron" aria-current={theme === "iron" ? "page" : undefined}>02 / Iron & Concrete</a></nav> : null}
    <TopGymCard theme={theme} />
  </main>;
}
