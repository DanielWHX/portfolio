# Hongxiang Wang — Portfolio

Interactive portfolio for Hongxiang Wang, a full-stack software engineer.

## Features

- Minimal single-screen introduction and question interface
- Conversational portfolio voice powered by `gpt-5.6-luna`
- Read-only `get_resume_profile` tool backed by approved resume facts and shared interests
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

Create `.env.local` with a newly generated runtime key (never commit it):

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
Me and Contact can return cards; Projects, Skills, and Fun Facts currently use text answers.
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

Before release, also check the real model on the private deployed site:

- Sign in as the site owner and ask `What are your skills?`.
- Confirm a readable text answer appears and no Profile Card is shown.
- Confirm the answer agrees with the approved resume and Thinking stops.

Mocks verify the UI and API contract; this live check verifies real-model behavior.

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

## Chat motion

Cards and portraits enter with a short staggered slide. Answer text reveals over
at most about 2.4 seconds after the complete JSON response arrives; this is a
frontend presentation effect, not API streaming. Existing messages do not replay
when a new question or Copy action updates the page. Reduced-motion preferences
disable these animations.

The five quick questions continue the current conversation. New replies scroll
to their beginning unless the visitor scrolls up while waiting. Profile and
Contact retain their existing data and copy actions.

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
