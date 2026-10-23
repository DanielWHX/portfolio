# Question Bank 公开快照 · 发布授权与内容记录

状态：`release-authorized` · revision：`2026-10-23-question-bank-1`

用户于 2026-10-23 明确要求发布最新追问系统，作为本快照随版本发布的授权依据；这不代表用户已逐题审阅全部 40 题。原有问答和事实边界保持不变，本次发布验证及服务器上线结果另行记录。

## 内容范围与整理规则

- 40 题：Lyntra 14、JChatMind 17、通用方法 9。只保留英文问题、简短答案、中英匹配关键词和事实边界；Notion 原文与中文备考备注不入库。
- Notion 是编辑源；整理后的 JSON 随版本更新。网站运行时不访问 Notion，不新增 Vector Database 或分类模型调用。
- 第一条建议由相关题目启发，第二条沿当前对话延伸；不固定轮播原题。回答默认 2–4 句。
- 页面只收到问题和题目 ID；答案快照留在服务端，但 AI 回答会使用其中公开内容。

## 保留的事实边界与内容核对重点

| 位置 | 已采用的边界 | 你的确认重点 |
| --- | --- | --- |
| qb-01–08 / 10 / 12–13 / 21–22 · Lyntra | 区分本人贡献、团队结果、已有代码和 AI coding support；未宣称外部日历整合或生产上线 | 这些个人贡献是否都准确，是否有不适合公开的细节 |
| Lyntra 原有简介 | 原资料使用 Led Adaptive Scheduling 等措辞；题库描述更保守，不据此扩大领导职责 | 后续如需收紧原简介，单独修改；本次未覆盖原资料 |
| qb-23–34 · JChatMind | 说明实现方式；不将代码行为自动归为个人从零实现 | SSE 为 message-level；embedding 为 section title；请确认与你要展示的版本一致 |
| qb-37 · history query | 记作已有文档中的历史问题；不宣称你本人发现或修复，也不称目前仍有 Bug | 是否保留该例作为技术理解的展示 |
| qb-11 / 36 / 38–40 | 保留 would / 拟议方案；无已实现的恢复、扩容、性能提升或成本下降数字 | 方案是否符合你自己的理解 |

开发阶段与 Portfolio 项目简介/Case Study 的已确认演示状态比对，未发现直接矛盾；该比对不等于用户逐项核对新增的内部实现细节。上表保留为后续内容校对重点，不把旧仓库修复或未来设想补写为个人业绩。

## 审阅方式

后续可按 ID 提修改，例如“qb-25 保留；qb-37 不公开”，再随下一版本更新公开快照。每次发布和服务器部署结果单独记录。

## 公开问答与开发验证记录

以下为此前本地开发阶段的真实生成示例，不是固定轮播文案，也不代表本次发布版本已完成验收；本次 release 的 Build/API 回归和部署验收需另行执行并记录：

- JChatMind 的中断/重启回答明确区分当前局限与拟议的持久化、重试机制；后续实际生成：“What idempotency key or persisted status would you propose to prevent duplicate work after a reconnect or restart?”
- 手动中文问过 Lyntra 冲突处理后，实际生成：“在 Lyntra 中，你具体负责了哪些超出基础日历展示功能的后端改进？”以及“如果未来实现依赖约束，你会如何阻止子任务被安排到前置任务之前？”
- 问是否本人修复 history bug，真实回答为无法确认本人发现/修复；未将未确认归属改为肯定或否定的个人经历。
- 本地 API 有间歇性网络连接失败；成功的问答与最后两次定点追问均已复核，失败不作为验收成功。完整真实检查可用 README 中的脚本重跑。

### Lyntra

#### qb-01 · contribution

**Q:** Given a rudimentary backend system, what did you personally build or improve that went beyond the basics?

**A:** At Lyntra, the early calendar could display events but could not fully manage them. I worked on the backend logic for updating and saving internal events, then added natural-language scheduling with AI coding support. This helped turn a calendar viewer into a working scheduling prototype, rather than just a page of suggestions.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：personal contribution, personally build, beyond basics, backend, 个人贡献, 亲自, 后端贡献

#### qb-02 · rescheduling

**Q:** Can you describe a backend feature or improvement you built that went beyond the basic requirements or the project's original scope?

**A:** One improvement was conflict-aware rescheduling. Instead of only changing an event's start time, the backend checked occupied slots and preserved the event's duration. In automatic mode, it could move the task to an available slot and save the result, so the user did not have to rebuild the schedule manually.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：rescheduling, conflict, duration, 冲突, 重新安排, 时长, 自动调整, schedule conflict, conflicts

#### qb-03 · contribution

**Q:** What was your specific contribution to the backend system?

**A:** My main focus was calendar operations and AI-assisted scheduling. I helped connect natural-language requests to backend actions and worked on saving calendar changes. I also researched Canvas integration limits. I used AI coding tools for implementation, so I separate the work I contributed from existing code and team contributions.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：specific contribution, calendar operations, 负责, 贡献, 分工

#### qb-04 · scheduling-validation

**Q:** What was the most challenging feature you implemented, and how did you approach it?

**A:** One difficult part was connecting LLM output with real calendar changes. A model can suggest a time, but that does not mean the time is valid or available. I broke the workflow into request parsing, event lookup, conflict checking, and saving. This separated flexible language understanding from rules the backend needed to enforce.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：LLM output, calendar changes, validation, challenging, 调度验证, 业务规则, 最难

#### qb-05 · contribution

**Q:** Did you build any features from scratch, or were you mainly working with existing code?

**A:** I worked with existing code and new features. I extended the calendar behavior and connected natural-language requests to backend operations, using AI coding tools for support. My contribution was adding and connecting these capabilities, not building every part of the platform from scratch.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：from scratch, existing code, 手写, 从零, 已有代码

#### qb-06 · initiative

**Q:** Can you give an example of a time when you went above and beyond what was expected of you?

**A:** At Lyntra, I wanted the calendar to do more than display imported events. I worked on editable internal events, then added a text-based way to change schedules. The result was a prototype where users could request a change and have the backend check conflicts and save the updated event.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：above and beyond, expected, 主动, 超出要求

#### qb-07 · initiative

**Q:** Have you ever identified an opportunity for improvement and implemented it without being asked?

**A:** I noticed a gap between showing a schedule and actually managing it. Users could see events, but the app lacked complete backend logic for changing them. I took the initiative to work on that gap before adding more AI features, so model output could lead to a real calendar update.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：without being asked, opportunity, 主动改进, 展示日程

#### qb-08 · natural-language

**Q:** Did you introduce any additional functionality that wasn't part of the original requirements?

**A:** Yes. I added natural-language calendar requests on top of the internal calendar workflow. A user could describe a scheduling change instead of editing each field. The LLM interpreted the request, while backend code checked the event and its timing before saving the change.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：natural-language, additional functionality, 自然语言, 新增功能

#### qb-10 · mvp-tradeoff

**Q:** What trade-offs did you consider when designing your backend system?

**A:** At Lyntra, we had to choose between waiting for full external integrations and testing the core feature sooner. We narrowed the first version to PDF upload and task breakdown. Users had to provide files manually, but we could explore useful task generation without making progress depend on every external integration.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：trade-off, PDF, external integrations, MVP, 取舍, 外部集成

#### qb-11 · reliability

**Q:** How did you ensure your backend system was scalable and reliable?

**A:** For the prototype, I focused on correct behavior before scale: checking inputs, handling conflicts, and making sure saved data matched what the interface showed. I would measure slow requests and concurrent use before claiming scalability. Queues, indexes, or more workers should address a measured bottleneck, not just make the architecture look more complex.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：scalable, reliable, scale, 可靠性, 可扩展, 并发

#### qb-12 · integration-limits

**Q:** Tell me about a technical problem you encountered that wasn't covered by the initial requirements.

**A:** We initially treated calendar import as a simple step, but external access and integration limits became blockers. I researched the available options and helped narrow the first version to user-provided input. This kept task generation moving while full Canvas and Google Calendar integration remained separate work.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：Canvas, Google Calendar, integration limits, 外部平台, 集成限制

#### qb-13 · integration-limits

**Q:** Can you describe a time when you had to figure something out independently?

**A:** I researched Canvas integration when the team was unsure how to access course data. I found that an open-source codebase did not mean we could freely access a school's hosted data. I compared access options and documented the limits so the team could choose a realistic approach before investing more implementation effort.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：Canvas, independently research, hosted data, 独立研究, 学校数据, 开源

#### qb-21 · requirements

**Q:** Tell me about a time you turned an unclear goal into an achievable plan.

**A:** At Lyntra, the goal was to import coursework and let AI plan each student's day. I helped separate it into data input, task breakdown, and scheduling. Canvas and Google integrations were not ready, so we narrowed the first version to PDF upload and suggested subtasks. This gave us a smaller prototype to develop and evaluate, while full integration and automatic daily planning remained later goals.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：unclear goal, PDF, MVP, ambiguous, 模糊需求, 范围收敛

#### qb-22 · goal

**Q:** Tell me about a time when you set a challenging goal for yourself and successfully achieved it.

**A:** At Lyntra, I wanted to turn our calendar viewer into a working scheduling system. I split the goal into two stages: first, updating and saving internal events; then, changing schedules through simple text requests. I worked on the backend logic with AI coding support. The prototype could handle scheduling requests, check conflicts, and save changes. I learned to reach a bigger goal through smaller, testable steps.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：challenging goal, calendar viewer, achieve, 高目标, 挑战目标, 可执行日程

### JChatMind

#### qb-23 · message-flow

**Q:** Walk me through what happens when a user sends a message in JChatMind.

**A:** The frontend sends an HTTP request to the Controller. The Service saves the message and publishes a ChatEvent. An asynchronous Listener uses the Factory to prepare the Agent's model, history, and tools. The Agent runs its Think–Execute loop. Assistant messages and tool results are saved in PostgreSQL and pushed to the frontend through SSE.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：message flow, ChatEvent, Listener, SSE, 消息流程, 消息链路, 请求流程

#### qb-24 · async

**Q:** Why use an asynchronous EventListener and SSE instead of calling the LLM synchronously in the Controller?

**A:** Model calls and tools can take several steps. We save the message and start the Agent in a separate thread, so the submission request does not wait for the full workflow. SSE sends messages as they become available. This improves responsiveness, but does not make the model itself faster or guarantee that background work survives a restart.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：asynchronous, EventListener, Controller, separate thread, 异步, 监听器, 线程

#### qb-25 · sse

**Q:** Why SSE instead of WebSocket? Is JChatMind streaming every token?

**A:** User input already goes through normal HTTP requests, so we mainly need server-to-client updates. SSE fits that need without adding a bidirectional WebSocket channel. In the reviewed Agent path, JChatMind pushes completed assistant messages and tool results. That is message-level streaming, not token-by-token output.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：SSE, WebSocket, token, streaming, 流式, 逐字, 推送

#### qb-26 · tool-calling

**Q:** How does Tool Calling work in JChatMind?

**A:** The backend sends the model tool names, descriptions, and input definitions. The model can return a tool name and arguments. Spring AI's tool support maps that request to a Java method. The backend executes it and adds the result to the conversation. The model can then answer or request another tool.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：tool calling, tool call, Java method, 工具调用, 工具执行

#### qb-27 · factory

**Q:** What does JChatMindFactory do, and why use a Factory?

**A:** The Factory builds an Agent runtime from its configuration. It loads the model choice, conversation history, allowed tools, and knowledge bases, then creates a JChatMind instance. This keeps setup code out of the Listener and Agent loop. Different Agent configurations can reuse the same execution logic.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：Factory, runtime, configuration, 工厂, 组装, 配置

#### qb-28 · abstraction

**Q:** What do abstraction and decoupling mean in this project?

**A:** Abstraction means using a common interface without handling every implementation detail. For example, the Agent uses ChatClient rather than separate provider-specific calls. Decoupling means reducing dependencies between responsibilities. The Factory handles setup, while the Agent handles execution. Changes to setup can stay more local, although the modules still depend on shared interfaces.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：abstraction, decoupling, interface, 抽象, 解耦, 接口

#### qb-29 · model-registry

**Q:** What are Spring AI and ChatClientRegistry?

**A:** Spring AI is a Java framework, not a model or a separate server. It provides interfaces such as ChatClient and tool support. ChatClientRegistry is a project class that holds named ChatClient objects. The Factory uses the Agent's configured model name to select one. It is configuration-based selection, not automatic selection of the best model.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：Spring AI, ChatClientRegistry, model selection, Registry, 模型选择, 注册表

#### qb-30 · rag

**Q:** How does the RAG pipeline work in JChatMind?

**A:** During ingestion, Java code splits Markdown into sections. The current implementation embeds section titles and stores the vectors with the section content in PostgreSQL. At query time, KnowledgeTool embeds the query and retrieves up to three matching chunks through pgvector. Their text goes back to the model, which uses it to generate an answer.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：RAG pipeline, title, content, chunks, retrieval, 检索流程, 标题, 分块

#### qb-31 · embedding

**Q:** What does bge-m3 do? Does it split documents or generate answers?

**A:** bge-m3 is the embedding model used in this project. It turns text into a vector for similarity search. The Markdown parser splits the document, PostgreSQL stores the results, and the chat model generates the answer. Ollama runs the embedding model; it is not the database.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：bge-m3, Ollama, embedding, vector, 嵌入, 向量, 模型职责

#### qb-32 · retrieval-tool

**Q:** Is RAG a built-in tool that the LLM runs by itself?

**A:** RAG is a retrieve-then-generate workflow, not a built-in ability to read our database. JChatMind exposes retrieval through a custom KnowledgeTool. The model requests that tool, but Java code calls the embedding service and database. The retrieved text is then returned as a tool result for the model to use.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：RAG, KnowledgeTool, retrieve, built-in, 知识工具, 内置, 查询知识库

#### qb-33 · memory

**Q:** How does the Agent remember previous messages?

**A:** The application stores chat history in PostgreSQL and loads messages for the current session when creating the Agent. Runtime ChatMemory holds the context used for model calls. Tool results are added so the next call can use them. The model receives that context again; it does not automatically remember the whole conversation.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：history, ChatMemory, remember, conversation, 历史, 上下文, 记忆

#### qb-34 · database

**Q:** Are chat history and RAG data stored in different databases?

**A:** They can use the same PostgreSQL database but different tables. Chat messages record what users, assistants, and tools said. RAG chunks store reference text and embeddings. pgvector adds vector storage and search to PostgreSQL. Saving a user message does not automatically add it to the knowledge base.

**Boundary:** Describe the supplied implementation; do not infer personal authorship, production scale, or measured performance.

匹配关键词：PostgreSQL, pgvector, tables, different databases, 数据库, 聊天记录, 知识数据

#### qb-36 · rag-tradeoff

**Q:** What are the main trade-offs in JChatMind's RAG design?

**A:** Using PostgreSQL with pgvector avoids running a separate vector database, but chat and retrieval workloads share resources. Embedding only section titles is simple, but can miss answers found mainly in the body text. I would compare title-only retrieval with title-plus-content retrieval using a small set of known questions before choosing a change.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：title-only, title-plus-content, RAG trade-offs, 检索取舍, 只嵌入标题, 检索改进

#### qb-37 · history-bug

**Q:** Can you explain a concrete bug and its fix in JChatMind?

**A:** One documented bug was that the history query returned the oldest messages instead of the newest ones. Long conversations could therefore lose the latest question from the model's context. The fix selects the latest N records first, then returns them in chronological order. I would verify it with more than N messages and check that the newest question is included.

**Boundary:** A documented historical repository bug, not proof that Hongxiang personally discovered or fixed it. Do not present it as currently unfixed.

匹配关键词：oldest, newest, latest N, history bug, 历史消息bug, 最早, 最近消息

#### qb-38 · recovery

**Q:** What would you improve if the model times out, SSE disconnects, or the server restarts?

**A:** I would add timeouts, clear error states, and bounded retries for model and tool calls. SSE disconnection should not cancel a result that can still be saved. For work that must survive restarts, I would use persisted job state or a durable queue, and make retries safe so actions are not repeated accidentally.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：timeout, disconnect, restart, retry, queue, 超时, 断线, 重启, 重试, 中断, 断开, 恢复, dropped, restarted, disconnects, reconnect

#### qb-39 · authorization

**Q:** How would you prevent an Agent from accessing another user's data or performing unsafe actions?

**A:** I would verify the user on the backend and check permission for each session, document, and tool action. A model-generated ID is not proof of access. I would expose only the tools needed for the task and require confirmation for high-impact changes. Prompt instructions can help guide behavior, but they are not an authorization system.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：authorization, authentication, permission, unsafe, 用户权限, 授权, 越权, 安全

#### qb-40 · measurement

**Q:** How would you support a claim about lower LLM cost or faster RAG retrieval?

**A:** I would use a fixed test set and a clear baseline. For cost, I would compare input and output token usage at the relevant model prices, including retries. For latency, I would define whether I measured database search, embedding plus search, or the full response. I would report estimates separately from measured results and also check output quality.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：LLM cost, latency, baseline, 75%, 98%, sub-500ms, 成本, 延迟, 性能, 测量

### 通用方法与行为题

#### qb-09 · technology-choice

**Q:** How did you decide which technologies or frameworks to use?

**A:** I start with the project needs and the existing stack, rather than adding a new framework just because it is popular. I consider team familiarity, integration effort, and maintenance. For an AI backend, a framework such as Spring AI is useful when a shared model interface and tool support reduce repeated integration work.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：framework, choose technologies, Spring AI, 技术选型, 框架选择

#### qb-14 · ai-collaboration

**Q:** How do you collaborate with AI coding tools during software development?

**A:** I break a large task into smaller steps and give AI clear requirements and expected outputs. I use it to draft code, compare solutions, consider edge cases, and write tests. Then I review the changes and test each part before moving to the next step.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：AI coding, collaborate, task breakdown, AI协作, AI编程, 任务拆分

#### qb-15 · ai-verification

**Q:** How do you verify that AI-generated code is correct and reliable?

**A:** First, I check whether the main logic matches my requirements. Then I review the changes for unnecessary code or unexpected changes to APIs and dependencies. I run unit tests, edge cases, and regression tests. I use test results and my own understanding of the business logic, not just the AI's explanation, to judge the change.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：AI-generated code, verify, regression, AI代码, 验证代码, 回归测试

#### qb-16 · debugging

**Q:** If AI tools were unavailable, how would you approach debugging a backend issue?

**A:** First, I would reproduce the bug and check the logs. Then I would trace the request through the Controller, Service, Mapper, and Database to find where the data becomes wrong. I would use breakpoints, SQL queries, and API tests, make the smallest fix, and run regression tests.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：debug, without AI, Controller Service Mapper, 排查, 调试, 没有AI

#### qb-17 · debugging

**Q:** How do you trace dependencies and identify the root cause of an issue in a complex codebase?

**A:** I start from the failing API endpoint or function and follow the calls and data between modules. I use IDE search, logs, and breakpoints to compare expected and actual values. I look for the first point where they differ, then test a small fix rather than changing several modules at once.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：root cause, dependencies, call chain, 根因, 依赖, 调用链

#### qb-18 · ai-responsibility

**Q:** How do you decide which tasks to delegate to AI and which to handle yourself?

**A:** I use AI for repetitive code, first drafts, documentation, and test ideas. I keep responsibility for the requirements, business rules, and final review. For security or database changes, I check the design carefully and ask for review when needed. AI can suggest a solution, but it does not decide whether I should accept it.

**Boundary:** Keep personal contributions distinct from existing code, team outcomes and AI coding assistance; do not claim complete external integrations or production delivery.

匹配关键词：delegate to AI, security changes, responsibility, 分配任务, 最终判断, 安全改动

#### qb-19 · sql

**Q:** Given a transactions table with id, date, and amount, how would you calculate the total amount within a date range?

**A:** I use WHERE to filter the dates and SUM to add the amounts. For October 1 through October 5, I use an inclusive start and an exclusive October 6 end. COALESCE returns zero when the sum is NULL. No GROUP BY is needed for one total.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：transactions, SUM, date range, COALESCE, SQL, 日期范围, 求和

#### qb-20 · deployment-method

**Q:** How would you connect a frontend, backend, and database and verify that the system works after deployment?

**A:** I would first agree on the API request and response format. Then I would configure the API address, database connection, and secrets. I would test one flow end to end: create an event, confirm it was saved, refresh the page, and read it again. After deployment, I would check health endpoints and logs.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：frontend backend database, deployment, end to end, 部署验证, 前后端, 端到端

#### qb-35 · sql-constraints

**Q:** What are a Primary Key and a Foreign Key?

**A:** A Primary Key uniquely identifies a row and cannot be NULL. A Foreign Key checks that a reference points to an existing row in the referenced table. For example, a chunk can have its own ID and a doc_id linking it to a document. Naming a column doc_id alone does not create a Foreign Key constraint.

**Boundary:** Describe methods or proposed improvements without inventing delivered results, metrics, or leadership.

匹配关键词：primary key, foreign key, constraint, 主键, 外键, 约束
