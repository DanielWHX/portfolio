"use client";

import { useEffect, useRef, useState } from "react";
import { portfolioProjects } from "@/lib/portfolio/projects";

const covers: Record<string, { category: string; image?: string; href?: string }> = {
  lyntra: { category: "AI Scheduling", image: "/projects/lyntra/calendar.jpg", href: "/projects/lyntra" },
  jchatmind: { category: "AI Assistant", image: "/projects/jchatmind/chat/04-date-tool-and-trial.jpg", href: "/projects/jchatmind" },
  brainstem: { category: "Capstone" },
  pcitc: { category: "Backend Engineering" },
  edge: { category: "Research" },
};

export default function ProjectsCard() {
  const track = useRef<HTMLUListElement>(null);
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

  function move(direction: number) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + parseFloat(getComputedStyle(el).columnGap);
    el.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <article className="projects-card" aria-label="Hongxiang's projects">
      <header className="projects-heading"><h2>Project</h2></header>
      <ul className="project-track" ref={track} onScroll={updateEdges} aria-label="Projects">
        {portfolioProjects.map(project => {
          const cover = covers[project.id];
          const content = <>
            <div className="project-tile-heading"><p>{cover.category}</p><h3>{project.name}</h3></div>
            {cover.image ? <img className="project-tile-image" src={cover.image} alt={`${project.name} app preview`} loading="lazy"/> : <div className="project-tile-art" aria-hidden="true"><span/><span/><span/></div>}
            {!cover.href && <span className="project-coming">Case study coming soon</span>}
          </>;
          return <li key={project.id}>
            {cover.href ? <a className={`project-tile project-tile-${project.id}`} href={cover.href} aria-label={`Explore ${project.name} case study`}>{content}</a> : <div className={`project-tile project-tile-${project.id}`}>{content}</div>}
          </li>;
        })}
      </ul>
      <div className="project-pagination" aria-label="Project navigation">
        <button type="button" aria-label="Previous projects" disabled={edges.start} onClick={() => move(-1)}>←</button>
        <button type="button" aria-label="Next projects" disabled={edges.end} onClick={() => move(1)}>→</button>
      </div>
    </article>
  );
}
