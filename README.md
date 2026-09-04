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

```bash
npm test
npm run lint
```

## Acknowledgements

The fluid simulation is adapted from [React Bits Splash Cursor](https://www.reactbits.dev/animations/splash-cursor). See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for its license notice.
