import { resumeSkills, skillsFocus } from "@/lib/portfolio/skills-profile";

const categories = [
  { key: "languages", title: "Languages", mark: "01", icon: "{ }" },
  { key: "frameworks", title: "Frameworks", mark: "02", icon: "⌘" },
  { key: "tools", title: "Tools", mark: "03", icon: ">_" },
] as const;
const highlighted = new Set<string>(skillsFocus.highlighted);

export default function SkillsCard() {
  return (
    <article className="skills-card" aria-label="Hongxiang's skills">
      <header className="skills-card-header">
        <p className="skills-eyebrow"><span aria-hidden="true">◇</span> MY ENGINEERING TOOLKIT</p>
        <h2>Python &amp; Java.<span>Backend engineering.</span></h2>
        <p className="skills-intro">I build backend services, integrate AI workflows, and connect them to usable interfaces.</p>
        <ul className="skills-capabilities" aria-label="Primary focus">{skillsFocus.capabilities.map(item => <li key={item}>{item}</li>)}</ul>
      </header>

      <div className="skills-categories">
        {categories.map(category => (
          <section className="skills-category" key={category.key}>
            <div className="skills-category-heading"><span className="skills-category-icon" aria-hidden="true">{category.icon}</span><h3>{category.title}</h3><span className="skills-category-number" aria-hidden="true">{category.mark}</span></div>
            <ul className="skills-tags" aria-label={category.title}>
              {resumeSkills[category.key].map(skill => <li key={skill} className={highlighted.has(skill) ? "skills-tag-primary" : undefined}>{skill}</li>)}
            </ul>
          </section>
        ))}
      </div>

      <section className="skills-evidence" aria-label="Skills in practice">
        <div className="skills-evidence-heading"><h3>Applied in real work</h3><span>Experience behind the stack</span></div>
        <div className="skills-evidence-grid">{skillsFocus.experience.map(experience => (
          <section className="skills-experience" key={experience.project}>
            <p className="skills-experience-label">{experience.label}</p>
            <h4>{experience.project}</h4>
            <p>{experience.description}</p>
            {experience.href ? <a href={experience.href}>Explore the case study <span aria-hidden="true">↗</span></a> : null}
          </section>
        ))}</div>
        <p className="skills-supporting">Full-stack range <span aria-hidden="true">↗</span> TypeScript and React help me connect backend logic to the user experience.</p>
      </section>
    </article>
  );
}
