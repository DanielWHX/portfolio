import type { Metadata } from "next";
import TopGymCard from "../chat/TopGymCard";

export const metadata: Metadata = {
  title: "TopGym | Hongxiang Wang",
  description: "Play TopGym, a pixel gym featuring Hongxiang’s squat 200 kg, bench press 160 kg and deadlift 200 kg.",
};

export default function GymPage() {
  return <main className="gym-page">
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
    <nav className="gym-page-nav" aria-label="TopGym navigation"><a href="/chat?query=Fun%20Facts">← Back to Fun Facts</a><a href="/">Hongxiang Wang <span aria-hidden="true">↗</span></a></nav>
    <TopGymCard />
  </main>;
}
