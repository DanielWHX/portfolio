# Hongxiang Wang — Portfolio

Interactive portfolio for Hongxiang Wang, a full-stack software engineer.

Current source release: **v0.2.4 — Refined Visuals & Motion**.

## Features

- Minimal single-screen introduction and question interface
- Conversational portfolio voice powered by `gpt-5.6-luna`
- Read-only `get_resume_profile` tool backed by approved resume facts and shared interests
- Two context-aware AI follow-up suggestions that fold into a still glass-star bubble, with a hover-triggered liquid thinking effect, linked shortcut movement and reduced-motion support
- Photo-led Fun Facts with a skydiving lightbox, a compact introduction and on-demand interest destinations
- Personal Profile Card with a corrected portrait, university logos, and sourced rankings
- Contact Card with copy buttons for email, phone, GitHub, LinkedIn, and WeChat
- WebGL fluid cursor with colorful, fading ink trails
- Glassmorphism controls layered above the animation
- Responsive desktop and mobile layouts
- Accessible labels, reduced-motion support, and click-through canvas behavior

## Tech stack

- React 19
- TypeScript
- Vite and Vinext
- Cloudflare Worker-compatible runtime

## Local development

Requires Node.js 22.13 or newer.

Create `.dev.vars` in the project root with a runtime key (never commit it):

```bash
OPENAI_API_KEY=your_new_key_here
```

Any key previously shared in a chat or screenshot must be revoked rather than reused.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The agent can discuss Hongxiang's background and interests, as well as general
conversation, technology, fitness, and SaaS ideas. Personal claims stay grounded
in the shared profile. All five quick questions are available on the homepage and above the chat input.
Me, Contact, Projects, and Skills can return cards. Fun Facts starts with a skydiving
photo and a compact AI summary, followed by Big Three Record, LeetCode notes, Whatnot and travel Footprints entries;
Big Three Record opens a simple borderless video dialog with Squat, Bench press and Deadlift tabs, self-reported personal records and the supplied training clips. Its chat overlay follows the conversation's neutral typography and controls, with no game or impact effects. Videos play only when requested and stop when switching tabs or closing the dialog; Whatnot opens the supplied account link, while Footprints remains coming soon.
Ask for contact details in English or Chinese to receive a Contact Card.

## Verification

Install the locked dependencies and Chromium once:

```bash
npm ci
npx playwright install chromium
```

Run the complete build, Worker API checks, and browser regression suite:

```bash
npm test
npm run lint
```

If Google Chrome is already installed, `PLAYWRIGHT_CHANNEL=chrome npm test`
can use it instead of downloading Chromium.

The automated checks use mock responses and do not require an OpenAI API key.
Browser tests start the built app on `127.0.0.1:3103` and stop it when finished.
They cover an initial-question failure, a failed follow-up, and a stalled request:
the question must be restored, Thinking must stop, and retry must send a valid
conversation without duplicate user messages. Skills answers must render as text.
Desktop and mobile navigation checks enter a conversation from Me, receive a
Profile Card, and verify that the back arrow restores the actual homepage.
Contact checks verify all five clipboard values without navigation, successful
copy feedback and the manual-copy fallback, valid follow-ups, and return navigation.

After a successful build, use `npm run test:api` or `npm run test:ui` to rerun
only the relevant checks. Browser failures save traces under `test-results/`.

For a server deployment, separately check the real model on the private deployed site:

- Sign in as the site owner and ask `What are your skills?`.
- Confirm the current Skills Card appears for the broad preset and a focused follow-up receives a readable text answer.
- Confirm the answer agrees with the approved resume and Thinking stops.

Mocks verify the source release's UI and API contract; this separate live check verifies real-model behavior and deployment acceptance.

The Cloudflare development Worker reads `.dev.vars`; when that file exists,
Wrangler skips `.env*` and host environment variables for its bindings. Restart
`npm run dev` after changing the key. A 503 response saying the agent is not
configured means the running local Worker has no key. Production server secrets
are separate and are not copied automatically to local checkouts.

## Suggested questions

After a successful Me, Projects, Skills, or Fun Facts answer, two relevant
questions appear above the five shortcuts. They use the approved profile and
project facts plus the recent conversation. Clicking one sends a normal chat
question; New ideas generates a fresh pair. The last 12 displayed suggestions
and recently asked questions are excluded to reduce repetition. Unknown personal
details such as nationality, visa status, and sponsorship are not suggested.

Main answers retain the existing tab-local cache. Repeating a preset immediately
focuses its cached answer while `/api/followups` generates new questions in the
background. Each suggestion generation makes one additional bounded model call;
it is not free just because the main answer is cached. Rapid switches cancel
outdated requests, and failed generation never blocks the answer or input.
Contact, New chat, and the 15-question limit hide suggestions. There is no static
question-bank fallback and no claim that this Portfolio currently queries a
live vector database.

## Interview Question Bank

The 40 curated entries and factual boundaries are recorded in [docs/question-bank-review.md](docs/question-bank-review.md). The owner authorized release of the latest follow-up system on 2026-10-23; this records release authorization, not a claim that every entry was individually reviewed. The server-only snapshot is `lib/agent/interview-bank.snapshot.json`, revision `2026-10-23-question-bank-1`, status `release-authorized`. Do not copy the raw Notion page or preparation notes into this repo. Updates are released with the app, with no runtime Notion access.

Projects follows the settled carousel selection; explicit project names in a question override that selection. One model call generates a bank-inspired question plus a conversational extension, carrying aligned `questionIds` alongside the existing `questions`. Clicking sends the optional reference to `/api/chat`; typed questions use project/Chinese-English keyword matching (at most four answers). No extra model classifier or vector database is involved. Fun Facts/Contact keep their original directions. Answers preserve personal/team, current/proposed and historical-fix boundaries.

To exercise real local models after configuring the ignored runtime key, run `node scripts/evaluate-interview-bank.mjs http://127.0.0.1:3121`. This sends the curated portfolio facts and test questions to the configured model; mock tests alone do not establish factual response quality. The review document's generated examples and earlier passing checks are development evidence; this release requires its own build/API regression checks and deployment acceptance record.

## Conversational acceptance check

With the version under review running and its runtime key configured:

```bash
node scripts/evaluate-persona.mjs http://127.0.0.1:3104
```

This makes real model requests. It checks response shape and prints answers
for human review: contact requests, general GitHub questions, current education,
introduction, interests, SaaS, a coding joke, unshared personal details, and AI identity. Mock tests do not establish real-model
personality. Evaluate against the new app version, not an older deployment.

## Profile content and sources

Portrait editing and school-logo sources are recorded in `public/ASSET_SOURCES.md`.
School ranking links are stored with the profile data and visible in the card:

- [UIUC: #36 National Universities, U.S. News 2026](https://www.archive.admissions.illinois.edu/discover/illinois-facts).
- [Ohio State: #41 National Universities, U.S. News 2026](https://news.osu.edu/ohio-state-maintains-position-as-one-of-nations-top-public-universities-in-new-rankings/).
- [UIUC: #5 Graduate Computer Science, U.S. News 2026](https://siebelschool.illinois.edu/about/facts-and-rankings).

Fitness and interest in SaaS companies were supplied by Hongxiang. The portrait
is an AI-assisted edit of his supplied photograph. Neither interest implies a
specific workout record, business ownership, or other unshared biography.

## Acknowledgements

The fluid simulation is adapted from [React Bits Splash Cursor](https://www.reactbits.dev/animations/splash-cursor). See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for its license notice.

## JChatMind case study

The compact first screen contains the project name, one sentence, and the demo
entry point. The original Spring Boot / pgvector / Ollama application was
deployed on Tencent Lighthouse on 2026-10-23. Production enables the existing
inline guest experience with the server-side
`JCHATMIND_DEMO_URL=https://demo.hongxiangwang1017.com/demo`. Public HTTPS/API,
five real RAG questions and guest/admin isolation passed. Public browser
automation was explicitly rejected by automatic approval review, so visual
acceptance and the embedded desktop/mobile experience remain unverified in
that deployment. See [the deployment record](docs/deployment-v0.2.0.md).
The recorded walkthrough remains independently available; without a valid
configured URL, the entry shows availability status and links to that replay.
Admin APIs stay private and guest sessions are isolated. Do not use a localhost
URL in production.

The second project links to `/projects/jchatmind`. The English walkthrough uses
eight original local-app screenshots and three highlighted handbook references
to show five stages: recommendation, follow-up pricing, date-tool use, documented
uncertainty, and a customer reply draft. Desktop and phone visitors can change
stages, browse each stage's captures, and open full-size screenshots or readable
annotated source pages. The gallery is static evidence; browsing it does not call
JChatMind or an LLM and does not depend on localhost services.

Assets live in `public/projects/jchatmind/`; the original sample handbook is
included. Local API snapshots and credentials are not deployed. The page labels
OrbitDesk as a fictional SaaS example and retains the original answer limitations
in scope notes. Shared agent facts live in `lib/portfolio/projects.ts` under
`jchatmindCaseStudy`.

## Chat motion

The collapsed AI bubble stays still until hover or visible keyboard focus. Its
blue / pink liquid then follows a 1.5-second reference cycle even when the pointer
stops, changing between a folded wave and a full sphere. Fifteen tightly cropped
owner-supplied frames live in one 56 KB WebP atlas and blend at display cadence.
This is an asset-based animation, not a reconstructed 3D model. Leaving reverses
the existing transition. Pending / failed loading, touch and reduced motion keep
the static star. See `public/ai/README.md` for the source and rebuild notes.

The conversation uses a route-scoped system font, neutral text, borderless cards,
outline SVG icons and a quiet charcoal send action. Quick questions keep fine borders
and coloured icons; Profile interests use soft green and violet tags. Projects keep
their blue gradient covers and tilted screenshots, with navigation beside the heading.
Skills use deep blue for backend / AI focus, lighter blue for supporting project tools,
and a consistent grey surface for all other tags, including Soft Skills. These are
visual priorities, not proficiency scores. The homepage keeps its original design;
project-aware suggestions and the glass AI bubble retain their existing behavior.

Cards enter with one short upward fade. Complete answer text appears with a 320ms
fade and 6px movement after the JSON response arrives; it is a frontend effect,
not model streaming. There is no artificial letter-by-letter delay. Cached messages
do not replay when a new question or Copy action updates the page. Reduced-motion
preferences disable movement, including the suggestion dock's existing effects.

The five quick questions continue the current conversation. New replies scroll
to their beginning unless the visitor scrolls up while waiting. Profile and
Contact retain their existing data. Copy success shows only a check icon without
resizing the button; its accessible name confirms success, while clipboard failure
still offers manual-copy guidance.

## Conversation continuity

The browser tab retains completed turns and unsent drafts in sessionStorage.
Refresh or return through Me to continue without another automatic introduction.
Other homepage questions continue the saved conversation. Interrupted requests
restore as drafts for manual retry; they are never inserted as unmatched history
turns. New chat clears the session and resets the 15-question limit. Storage that
is unavailable or corrupt does not prevent ordinary chat. This is tab-local
storage, with no account sync or server-side conversation database.

Saved records contain only message text and card type. Profile and Contact cards
are rebuilt from the current approved data and do not replay old entrance or text
animations. On phones, the portrait and identity share a row, with the introduction
and interests at full width underneath so education appears earlier.

### Local Fun Facts design preview

`/preview/chat` previews the redesigned conversation with all five real cards,
sample content, the suggestion fold, photo and video overlays, and a local sample
input. It is explicitly labelled as a design preview, makes no API calls and returns
404 in production. Normal `/chat` continues to use the configured Resume Agent.

With the development server running, `/preview/fun-facts` shows the real photo-led card with clearly labelled sample copy and no API request. It is unavailable in production. The normal `/chat` flow still uses the Resume Agent; the photo viewer and Big Three Record do not call the model.

`/preview/followups` provides a development-only review of the real collapsible suggestion dock with sample questions. Toggle the chevron beside You could ask or the coloured star bubble; New ideas rotates local samples. It makes no API calls and returns 404 in production.

The follow-up preview includes the glass star bubble: it is completely still at rest. Hover with a fine pointer, or focus it by keyboard, to blend the star into a blue-violet and pink liquid sphere. Moving away reverses the same blend without restarting its phase. The fixed hit target and neighboring shortcuts stay still. Touch and reduced motion retain the static icon; Canvas-unavailable browsers keep the usable glass-star fallback. No animation frames run at rest, and blur, hidden documents, folding and unmount cancel work. Both original thought-bubble tail circles remain visible.

The liquid is a procedural Canvas 2D interpretation of [Gleb Kuznetsov's Thinking Reaction reference](https://dribbble.com/shots/25202172-Thinking-Reaction-for-AI-sphere-by-Gleb-Kuznetsov). Its official still was inspected; the original animation was not accessible, so no frame-for-frame motion match is claimed. No external media or new graphics library is included.
