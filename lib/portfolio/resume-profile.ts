export const resumeProfile = {
  source: "Hongxiang_wang_resume_revised.pdf",
  name: "Hongxiang Wang",
  headline: "Full-Stack Engineer",
  education: [
    {
      school: "University of Illinois Urbana-Champaign (UIUC)",
      degree: "Master of Computer Science (MCS)",
      period: "Aug. 2026 - Apr. 2028",
    },
    {
      school: "The Ohio State University",
      degree: "Bachelor of Art and Science in Computer Science",
      period: "Aug. 2021 - Apr. 2026",
    },
  ],
  experience: [
    {
      organization: "Petro-CyberWorks Information Technology Co., Ltd. (PCITC)",
      role: "Back-end Engineering Intern",
      period: "May. 2026 - Aug. 2026",
      focus:
        "Spring Boot inventory workflows, REST APIs, MyBatis-Plus, MySQL, Swagger/OpenAPI, SQL, application logs, and JDWP debugging.",
    },
    {
      organization: "Lyntra LLC",
      role: "Full-stack Developer Intern",
      period: "Nov. 2025 - Mar. 2026",
      focus:
        "Node.js and TypeScript services for AI-assisted scheduling, including adaptive plans, LLM task generation, natural-language calendar operations, and OAuth2 Calendar/Canvas ingestion.",
    },
    {
      organization: "The Ohio State University",
      role: "Back-end Developer / Researcher",
      period: "Jan. 2025 - Dec. 2025",
      focus:
        "Containerized O-RAN edge-computing research using Docker, Kubernetes, REST APIs, AI-assisted decision support, and CI/CD-oriented data synchronization.",
    },
  ],
  skills: {
    languages: [
      "Python",
      "Java",
      "JavaScript",
      "TypeScript",
      "C++",
      "C#",
      "SQL",
      "HTML/CSS",
    ],
    frameworks: [
      "Spring Boot",
      "MyBatis",
      "Node.js",
      "FastAPI",
      "Flask",
      "Next.js",
      "React",
      "Tailwind",
    ],
    tools: [
      "Docker",
      "Kubernetes",
      "Maven",
      "Nginx",
      "Redis",
      "MySQL",
      "MongoDB",
      "Azure",
      "Linux",
      "Git",
    ],
  },
} as const;

export type ResumeOverviewCard = {
  name: string;
  headline: string;
  summary: string;
  education: readonly string[];
  experience: readonly string[];
  skills: readonly string[];
};

const resumeOverviewCard: Omit<ResumeOverviewCard, "summary"> = {
  name: resumeProfile.name,
  headline: resumeProfile.headline,
  education: [
    "UIUC - Master of Computer Science, 2026-2028",
    "The Ohio State University - Computer Science, 2021-2026",
  ],
  experience: [
    "PCITC - Back-end Engineering Intern",
    "Lyntra - Full-stack Developer Intern",
    "Ohio State - Back-end Developer / Researcher",
  ],
  skills: ["TypeScript", "Java", "Python", "React", "Spring Boot", "Docker"],
};

export function getResumeProfile() {
  return resumeProfile;
}

export function getResumeOverviewCard(summary: string): ResumeOverviewCard {
  return { ...resumeOverviewCard, summary };
}
