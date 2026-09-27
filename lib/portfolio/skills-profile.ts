export const SKILLS_QUERY = "What are your strongest skills?";

// Keep the resume's categories and complete lists in one shared source.
export const resumeSkills = {
  languages: ["Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "HTML/CSS"],
  frameworks: ["Spring Boot", "MyBatis", "Node.js", "FastAPI", "Flask", "Next.js", "React", "Tailwind"],
  tools: ["Docker", "Kubernetes", "Maven", "Nginx", "Redis", "MySQL", "MongoDB", "Azure", "Linux", "Git"],
} as const;

// Capability groups for the card; retain the original resume lists above.
// AI and retrieval tags come from the Lyntra and JChatMind case studies.
export const skillGroups = [
  { id: "backend", title: "Backend & Systems", skills: ["Python", "Java", "Spring Boot", "Flask", "FastAPI", "MyBatis", "Node.js", "REST APIs", "C++", "C#"] },
  { id: "ai", title: "AI & Agent Workflows", skills: ["Spring AI", "RAG", "LLM Integration", "Tool Calling", "Ollama"] },
  { id: "frontend", title: "Frontend Development", skills: ["TypeScript", "JavaScript", "React", "Next.js", "Tailwind", "HTML/CSS"] },
  { id: "data", title: "Data & Storage", skills: ["SQL", "PostgreSQL", "pgvector", "MySQL", "Redis", "MongoDB"] },
  { id: "tools", title: "Tools & Cloud", skills: ["Docker", "Git", "Linux", "Maven", "Nginx", "Azure", "Kubernetes"] },
  { id: "collaboration", title: "Soft Skills", skills: ["Problem-Solving", "Collaboration", "Requirements Analysis", "Adaptability"] },
] as const;

export const skillsFocus = {
  primaryLanguages: ["Python", "Java"],
  headline: "Python & Java backend engineering",
  summary: "My primary focus is backend engineering with Python and Java: building APIs, connecting data, and integrating AI workflows. I also work across the stack with TypeScript and React.",
  highlighted: ["Python", "Java", "Spring Boot", "Flask"],
  capabilities: ["Backend APIs", "Data workflows", "AI integration"],
  groups: skillGroups,
  experience: [
    {
      project: "Lyntra",
      label: "PYTHON · FLASK · AI INTEGRATION",
      description: "Led Adaptive Scheduling design, connecting Flask APIs, LLM integration, calendar conflict checks, and Task Breakdown.",
      href: "/projects/lyntra",
    },
    {
      project: "PCITC",
      label: "JAVA · SPRING BOOT · MYSQL",
      description: "Contributed to inventory requirements and CRUD workflows using Spring Boot, MyBatis, and MySQL.",
      href: null,
    },
  ],
  positioning: "Python and Java backend engineering are the primary focus. TypeScript and React support full-stack delivery. The complete resume lists describe the broader toolkit, not equal mastery. Do not assign proficiency scores, years of experience, or production-scale expertise. Kubernetes experience is environment setup, not cluster operations at scale.",
} as const;

const overviewRequests = new Set([
  "what are your strongest skills", "what are your skills", "show me your skills",
  "show your skills", "skills", "skill", "你的技能", "你擅长什么",
  "你最擅长什么", "介绍一下你的技能", "你会什么",
]);

export function isSkillsOverviewRequest(text: string) {
  return overviewRequests.has(text.trim().replace(/[.!?。？！]+$/u, "").trim().toLowerCase());
}
