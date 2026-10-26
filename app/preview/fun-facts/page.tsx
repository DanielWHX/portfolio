import { notFound } from "next/navigation";
import FunFactCard from "@/app/chat/FunFactCard";

// A local review surface for the real component, never a production shortcut
// around the Resume Agent or a fallback that pretends sample copy is AI output.
export default function FunFactsPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <main className="fun-facts-preview">
    <header className="fun-facts-preview-note">
      <h1>Fun Facts · Design preview</h1>
      <p>Sample introduction · No AI request</p>
    </header>
    <FunFactCard summary="Outside code, I like a change of perspective—whether I’m skydiving, lifting or exchanging ideas with people from different places. I also make time for Apex Legends and LeetCode." />
  </main>;
}
