# Hongxiang Wang — Portfolio

Interactive portfolio for Hongxiang Wang, a full-stack software engineer.

## Features

- Minimal single-screen introduction and question interface
- Me-only portfolio agent powered by `gpt-5.6-luna`
- Read-only `get_resume_profile` tool backed by approved resume facts
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

This first slice supports questions about Hongxiang's background, education,
experience, and skills. Projects, Fun, and Contact remain planned.

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

After a successful build, use `npm run test:api` or `npm run test:ui` to rerun
only the relevant checks. Browser failures save traces under `test-results/`.

Before release, also check the real model on the private deployed site:

- Sign in as the site owner and ask `What are your skills?`.
- Confirm a readable text answer appears and no Profile Card is shown.
- Confirm the answer agrees with the approved resume and Thinking stops.

Mocks verify the UI and API contract; this live check verifies real-model behavior.

## Acknowledgements

The fluid simulation is adapted from [React Bits Splash Cursor](https://www.reactbits.dev/animations/splash-cursor). See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for its license notice.
