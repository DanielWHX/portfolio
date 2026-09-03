# Hongxiang Wang — Portfolio

Interactive single-page portfolio for Hongxiang Wang, a full-stack software engineer.

## Features

- Minimal single-screen introduction and question interface
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

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npm run lint
```

## Acknowledgements

The fluid simulation is adapted from [React Bits Splash Cursor](https://www.reactbits.dev/animations/splash-cursor). See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for its license notice.
