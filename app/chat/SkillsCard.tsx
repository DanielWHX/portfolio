import type { ReactNode } from "react";
import { skillGroups, skillsFocus } from "@/lib/portfolio/skills-profile";

type SkillGroup = (typeof skillGroups)[number]["id"];
const highlighted = new Set<string>(skillsFocus.highlighted);

function CategoryIcon({ category }: { category: SkillGroup }) {
  const paths: Record<SkillGroup, ReactNode> = {
    backend: <><rect x="4" y="4" width="16" height="6" rx="2" /><rect x="4" y="14" width="16" height="6" rx="2" /><path d="M8 7h.01M8 17h.01M12 7h5M12 17h5" /></>,
    ai: <><rect x="6" y="6" width="12" height="12" rx="3" /><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4M10 10h4v4h-4z" /></>,
    frontend: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16" />,
    data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
    tools: <path d="M7 18H6a4 4 0 0 1-.8-7.9 7 7 0 0 1 13.4-1.9A5 5 0 0 1 18 18h-1M9 16l-3 3 3 3m6-6 3 3-3 3m-2-7-2 8" />,
    collaboration: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[category]}</svg>;
}

export default function SkillsCard() {
  return (
    <article className="skills-card" aria-label="Hongxiang's skills">
      <header className="skills-card-header">
        <h2>Skills &amp; Expertise<span aria-hidden="true">.</span></h2>
        <p className="skills-intro"><strong>Python &amp; Java backend.</strong> AI workflows. Full-stack delivery.</p>
      </header>

      <div className="skills-categories">
        {skillGroups.map(category => (
          <section className={`skills-category skills-category-${category.id}`} key={category.id}>
            <div className="skills-category-heading">
              <span className="skills-category-icon"><CategoryIcon category={category.id} /></span>
              <h3>{category.title}</h3>
            </div>
            <ul className="skills-tags" aria-label={category.title}>
              {category.skills.map(skill => <li key={skill} className={highlighted.has(skill) ? "skills-tag-primary" : undefined}>{skill}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
