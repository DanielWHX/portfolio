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

export const jchatmindCaseStudy = {
  url: "/projects/jchatmind",
  purpose: "A full-stack AI assistant that combines knowledge-base retrieval, conversation context, and tool calls for grounded customer-support answers.",
  architecture: "React and TypeScript interface with a Java Spring Boot and Spring AI backend. PostgreSQL stores conversations and knowledge documents; pgvector supports retrieval with local Ollama embeddings. The demonstrated conversation uses DeepSeek for language generation.",
  demonstrated: [
    "An eight-person team requests CSV exports and Slack alerts. The agent retrieves the OrbitDesk handbook, recommends Team at USD 18 per user per month, and calculates USD 144 per month.",
    "A follow-up changes the team to twelve people. The final monthly total is recalculated as USD 216.",
    "The recorded getDate tool returns 2026-09-21. The handbook's fourteen-calendar-day trial rule gives an expiry date of 2026-10-05.",
    "SAML SSO is unspecified in the sample handbook, so the answer recommends confirmation with the product team.",
    "The agent combines these facts in a customer reply draft. No message is sent and no billing or account changes occur.",
  ],
  status: "Screenshot-based English case study with all five questions, eight original app captures, and three annotated handbook references. OrbitDesk is a fictional SaaS demonstration, not a real customer deployment.",
  limitations: "Original answers are preserved. A follow-up equation is worded awkwardly, a trial note retains the old eight-person count, and an unspecified maximum is sometimes shortened to no maximum. The main totals and expiry date are verified; the example does not establish perfect accuracy or production readiness.",
} as const;

export const portfolioProjects = [
  { id: "lyntra", name: "Lyntra", category: "AI scheduling · Internship", summary: "Turning natural-language requests into conflict-aware calendar changes and actionable task plans.", role: "Led Adaptive Scheduling design, AI Agent integration, and Task Breakdown.", stack: ["React Native", "TypeScript", "Flask", "PostgreSQL"], status: "Featured case study" },
  { id: "jchatmind", name: "JChatMind", category: "Java backend · Full-stack AI", summary: "Knowledge-grounded answers, multi-turn context, and tool use—shown through a customer-support workflow with traceable source evidence.", stack: ["Java", "Spring Boot", "Spring AI", "React", "PostgreSQL"], status: "Interactive case study" },
  { id: "brainstem", name: "Interactive Brainstem", category: "Ohio State · Capstone", summary: "A frontend learning experience for exploring brainstem anatomy.", status: "Case study coming soon" },
  { id: "pcitc", name: "Enterprise Inventory Workflows", category: "PCITC · Backend internship", summary: "Requirements analysis and CRUD contributions to enterprise inventory workflows.", status: "Case study coming soon" },
  { id: "edge", name: "O-RAN Research Environment", category: "Ohio State · Research", summary: "Docker and Kubernetes environment setup for an edge-computing research project.", status: "Case study coming soon" },
] as const;

export function isProjectsOverviewRequest(text: string) {
  return text === PROJECTS_QUERY || /^(?:show (?:me )?(?:your |my )?projects|projects|项目|展示项目)[.!?。？]?$/i.test(text.trim());
}
