"use client";

import { useEffect, useRef, useState } from "react";
import { portfolioProjects } from "@/lib/portfolio/projects";
import { isProjectId, type ProjectId } from "@/lib/portfolio/interview-context";
import PortfolioIcon from "./PortfolioIcon";

const covers: Record<string, { category: string; image?: string; href?: string }> = {
  portfolio: { category: "AI Portfolio", image: "/projects/portfolio/homepage.jpg", href: "/" },
  lyntra: { category: "AI Scheduling", image: "/projects/lyntra/calendar.jpg", href: "/projects/lyntra" },
  jchatmind: { category: "AI Assistant", image: "/projects/jchatmind/chat/04-date-tool-and-trial.jpg", href: "/projects/jchatmind" },
  brainstem: { category: "Capstone" },
  pcitc: { category: "Backend Engineering" },
  edge: { category: "Research" },
};

export default function ProjectsCard({ active = false, onProjectChange }: { active?: boolean; onProjectChange?: (projectId: ProjectId) => void }) {
  const track = useRef<HTMLUListElement>(null);
  const callback = useRef(onProjectChange);
  const [edges, setEdges] = useState({ start: true, end: false });

  function updateEdges() {
    const el = track.current;
    if (el) setEdges({ start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { callback.current = onProjectChange; }, [onProjectChange]);

  useEffect(() => {
    const el = track.current;
    if (!active || !el) return;
    let timer: ReturnType<typeof setTimeout>;
    let last: ProjectId | undefined;
    function settled(event?: Event) {
      clearTimeout(timer);
      const focused = event?.type === "focusin" ? (event.target as HTMLElement).closest<HTMLElement>("[data-project-id]") : null;
      timer = setTimeout(() => {
        const viewport = el!.closest(".chat-messages")?.getBoundingClientRect();
        const bounds = el!.getBoundingClientRect();
        if (document.hidden || (viewport && (bounds.bottom <= viewport.top || bounds.top >= viewport.bottom))) return;
        const cards = [...el!.querySelectorAll<HTMLElement>("[data-project-id]")];
        const visible = focused ?? cards.sort((a, b) => Math.abs(a.getBoundingClientRect().left - bounds.left) - Math.abs(b.getBoundingClientRect().left - bounds.left))[0];
        const id = visible?.dataset.projectId;
        if (isProjectId(id) && last !== id) { last = id; callback.current?.(id); }
      }, 160);
    }
    el.addEventListener("scroll", settled);
    el.addEventListener("focusin", settled);
    settled();
    return () => { clearTimeout(timer); el.removeEventListener("scroll", settled); el.removeEventListener("focusin", settled); };
  }, [active]);

  function move(direction: number) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + parseFloat(getComputedStyle(el).columnGap);
    el.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <article className="projects-card" aria-label="Hongxiang's projects">
      <header className="projects-heading"><h2>Project</h2>
        <div className="project-pagination" aria-label="Project navigation">
          <button type="button" aria-label="Previous projects" disabled={edges.start} onClick={() => move(-1)}><PortfolioIcon name="arrow-left" size={18} /></button>
          <button type="button" aria-label="Next projects" disabled={edges.end} onClick={() => move(1)}><PortfolioIcon name="arrow-right" size={18} /></button>
        </div>
      </header>
      <ul className="project-track" ref={track} onScroll={updateEdges} aria-label="Projects">
        {portfolioProjects.map(project => {
          const cover = covers[project.id];
          const content = <>
            <div className="project-tile-heading"><p>{cover.category}</p><h3>{project.name}</h3></div>
            {cover.image ? <img className="project-tile-image" src={cover.image} alt={`${project.name} app preview`} loading="lazy"/> : <div className="project-tile-art" aria-hidden="true"><span/><span/><span/></div>}
            {!cover.href && <span className="project-coming">Case study coming soon</span>}
          </>;
          return <li key={project.id} data-project-id={project.id}>
            {cover.href ? <a className={`project-tile project-tile-${project.id}`} href={cover.href} aria-label={project.id === "portfolio" ? "Visit Portfolio homepage" : `Explore ${project.name} case study`}>{content}</a> : <div className={`project-tile project-tile-${project.id}`}>{content}</div>}
          </li>;
        })}
      </ul>
    </article>
  );
}
