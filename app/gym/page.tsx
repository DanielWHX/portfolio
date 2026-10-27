import type { Metadata } from "next";
import BigThreeRecord from "../chat/BigThreeRecord";

export const metadata: Metadata = {
  title: "Big Three Record | Hongxiang Wang",
  description: "Hongxiang’s squat 200 kg, bench press 160 kg and deadlift 200 kg personal records, with training videos.",
};

export default function GymPage() {
  return <main className="big-three-page">
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation avoids the pinned vinext Link runtime error. */}
    <nav className="big-three-page-nav" aria-label="Big Three Record navigation"><a href="/chat?query=Fun%20Facts">← Back to Fun Facts</a><a href="/">Hongxiang Wang <span aria-hidden="true">↗</span></a></nav>
    <BigThreeRecord />
  </main>;
}
