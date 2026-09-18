export const PROJECTS_QUERY = "Tell me about projects from your listed work and research experience.";

export const lyntraCaseStudy = {
  url: "/projects/lyntra",
  role: "Led Adaptive Scheduling design, AI Agent integration, and Task Breakdown.",
  purpose: "Help students turn goals into steps and fit work around changing calendar commitments.",
  architecture: "The demonstrated local prototype uses an Expo / React Native frontend, a modular Python Flask backend, PostgreSQL for calendar state, and an external LLM API. AI interpretation, scheduling validation, and shared calendar context are internal backend modules, not separate microservices.",
  demonstrated: [
    "User-requested natural-language rescheduling with calendar conflict checks and saved changes.",
    "A one-hour task originally at 14:00 is requested at 10:00. A meeting occupies 10:00–11:00, so the task is saved at 11:00–12:00 and the meeting stays unchanged.",
    "Task Breakdown generates subtasks, time estimates, and calendar-aware preview blocks.",
    "A separate existing subtask can be opened in Focus mode, broken into microsteps, and marked complete.",
  ],
  inDevelopment: ["Continuous background replanning", "The complete Task Breakdown preview-to-calendar acceptance workflow", "Dependency enforcement between generated subtasks"],
  status: "Functional local prototype with a recorded 68-second English-captioned demo. External calendar integrations and production scale are not validated in this case study.",
} as const;

export const portfolioProjects = [
  { id: "lyntra", name: "Lyntra", category: "AI scheduling · Internship", summary: "Turning natural-language requests into conflict-aware calendar changes and actionable task plans.", role: "Led Adaptive Scheduling design, AI Agent integration, and Task Breakdown.", stack: ["React Native", "TypeScript", "Flask", "PostgreSQL"], status: "Featured case study" },
  { id: "jchatmind", name: "JChatMind", category: "Full-stack AI", summary: "An AI application bringing together a conversational interface and backend agent workflows.", status: "Case study coming soon" },
  { id: "brainstem", name: "Interactive Brainstem", category: "Ohio State · Capstone", summary: "A frontend learning experience for exploring brainstem anatomy.", status: "Case study coming soon" },
  { id: "pcitc", name: "Enterprise Inventory Workflows", category: "PCITC · Backend internship", summary: "Requirements analysis and CRUD contributions to enterprise inventory workflows.", status: "Case study coming soon" },
  { id: "edge", name: "O-RAN Research Environment", category: "Ohio State · Research", summary: "Docker and Kubernetes environment setup for an edge-computing research project.", status: "Case study coming soon" },
] as const;

export function isProjectsOverviewRequest(text: string) {
  return text === PROJECTS_QUERY || /^(?:show (?:me )?(?:your |my )?projects|projects|项目|展示项目)[.!?。？]?$/i.test(text.trim());
}
