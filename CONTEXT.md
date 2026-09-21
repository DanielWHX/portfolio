# Portfolio vocabulary

- **Profile Card**: the code-rendered personal overview returned for a broad introduction. Portrait, schools, rankings, interests, and experience are owned by the application; the model supplies a short introduction.
- **Contact Card**: the code-rendered contact methods returned for a contact request. Email, phone, GitHub, LinkedIn, and WeChat are owned by the application and sourced from Hongxiang; the model selects the card and supplies a short lead-in.
- **Quick questions**: the same five prompts on the homepage and above the chat composer. Me, Projects, Skills, and Contact return cards; Fun Facts returns grounded text. Projects and Skills overview shortcuts return code-owned cards without an LLM request.
- **Answer reveal**: a frontend visual animation applied after the complete API response arrives, not model streaming. Text remains available to selection and assistive technology; reduced-motion preferences show it immediately.
- **Conversation session**: completed turns and the current draft retained in sessionStorage for the browser tab. Returning through Me resumes the conversation; New chat clears it. Interrupted requests return as drafts, never automatic retries. Restored cards use current approved data and skip entrance animations.
- **Shared profile**: resume facts plus personal details Hongxiang explicitly supplies, currently fitness, an interest in SaaS companies, and approved contact details. An interest is not a claim of business ownership.
- **Portfolio voice**: a first-person AI representation that can discuss general topics while grounding personal claims in the shared profile. It is not a live human chat.
- **School ranking**: a named category and edition with a source URL. National Universities rankings and Graduate Computer Science rankings are separate; CS #5 is not a separate MCS degree ranking.

The homepage's pink character and Fun Facts remain part of the current visual direction. The personal photograph belongs inside the Profile Card.

- **Projects Card**: selected work in chat. Lyntra is the first featured case study; JChatMind is the second working case-study link. Remaining entries are descriptive placeholders with no pretend destinations. Restored sessions rebuild the current card.
- **Lyntra Case Study**: the English /projects/lyntra page, with a captioned local demo, contributions, core workflow, and simplified logical architecture. It distinguishes working rescheduling and task previews from unfinished background replanning and preview acceptance.
- **JChatMind Case Study**: the English /projects/jchatmind page. Five OrbitDesk stages connect eight unchanged application screenshots to three highlighted source-document views. OrbitDesk is a fictional SaaS scenario. Source quotations, recorded tool results, and derived calculations remain distinct; notes preserve known answer wording limitations. Only approved visual assets and the sample handbook are published, not raw local API exports.

- **Skills Card**: the English skills overview, grouped exactly as the resume: Languages / Frameworks / Tools. Python and Java backend engineering are the primary focus; Flask and Spring Boot are highlighted with Lyntra and PCITC evidence. The broader toolkit does not imply equal expertise or proficiency ratings. Lists and positioning are shared with the agent from `lib/portfolio/skills-profile.ts`; restored cards always use current data.
