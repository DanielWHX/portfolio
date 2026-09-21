import { portfolioProjects } from "@/lib/portfolio/projects";

export default function ProjectsCard() {
  return <article className="projects-card" aria-label="Hongxiang's projects">
    <header className="projects-heading"><p className="projects-eyebrow">SELECTED WORK</p><h2>Ideas, built into software.</h2><p>A closer look at the systems I help design and build.</p></header>
    <a className="project-feature" href="/projects/lyntra" aria-label="Explore Lyntra case study">
      <div className="project-cover"><img src="/projects/lyntra/calendar.jpg" alt="Lyntra calendar and AI scheduling demonstration" width="1920" height="1080"/><span className="project-cover-label">01 / FEATURED</span><span className="project-cover-play" aria-hidden="true">↗</span></div>
      <div className="project-feature-content"><p className="projects-eyebrow">AI SCHEDULING · INTERNSHIP</p><h3>Lyntra <span aria-hidden="true">↗</span></h3><p>{portfolioProjects[0].summary}</p><div className="project-tags"><span>Adaptive Scheduling</span><span>AI Agent</span><span>Task Breakdown</span></div><span className="project-explore">Explore the case study <span aria-hidden="true">→</span></span></div>
    </a>
    <a className="project-secondary" href="/projects/jchatmind" aria-label="Explore JChatMind case study">
      <div className="project-secondary-cover"><img src="/projects/jchatmind/chat/04-date-tool-and-trial.jpg" alt="JChatMind retrieves a trial policy, calls the date tool, and calculates an expiry date" width="1280" height="655" loading="lazy"/><span>02 / FULL-STACK AI</span></div>
      <div className="project-secondary-content"><p className="projects-eyebrow">JAVA BACKEND · KNOWLEDGE-GROUNDED AI</p><h3>JChatMind <span aria-hidden="true">↗</span></h3><p>{portfolioProjects[1].summary}</p><div className="project-tags"><span>Spring Boot</span><span>Spring AI</span><span>RAG & Tool Use</span></div><span className="project-explore">Explore the case study <span aria-hidden="true">→</span></span></div>
    </a>
    <div className="project-upcoming-heading"><h3>More from my work</h3><span>Details in progress</span></div>
    <div className="project-placeholders">{portfolioProjects.slice(2).map((project, index) => <section className="project-placeholder" key={project.id}><span className="project-number">0{index + 3}</span><div><p className="project-category">{project.category}</p><h4>{project.name}</h4><p>{project.summary}</p><span className="project-coming">{project.status}</span></div></section>)}</div>
  </article>;
}
