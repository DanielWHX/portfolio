# Contributing

Start with the [README](README.md) for the product and [CONTEXT.md](CONTEXT.md) for project vocabulary. The [Chinese handbook](docs/handbook/README.md) explains the architecture, message flow, browser state and operations.

## Report a problem or propose a feature

Search [existing issues](https://github.com/DanielWHX/portfolio/issues) first, then use the Bug report or Feature request form. Bug reports should include reproducible steps, expected and actual behavior, and the browser/device. Feature requests should describe a use case and observable acceptance criteria.

## Run locally

Use Node.js **22.13 or newer** and the locked dependencies:

```bash
npm ci
npm run dev
```

Open the URL printed by the development server, normally `http://localhost:3000`.

For real AI requests, create an ignored `.dev.vars` file with your own `OPENAI_API_KEY` and restart the dev server. Keep credentials out of commits, issues and PRs. Runtime configuration and the Node deployment target are documented in [development and operations](docs/handbook/04-development-and-operations.md).

For UI work without a model key, use `/preview/chat`, `/preview/fun-facts` or `/preview/followups`. These development-only routes show labelled sample content and make no model requests; production returns 404.

## Make a focused change

- Read the relevant source, docs and recent commits before editing. Use a separate branch, such as `codex/fix-contact-copy`, and preserve unrelated local changes.
- Keep one behavior and one clear verification path per change. Verify observable behavior through public interfaces.
- Keep personal facts in the approved profile sources. The Agent writes grounded prose; React owns the cards. Consult [Agent and data](docs/handbook/02-agent-and-data.md) before changing that contract.
- Update relevant documentation when behavior changes. Add vocabulary to `CONTEXT.md` when a term becomes stable; add an ADR only for a consequential decision with real tradeoffs.

## Verify the change

For application changes, the standard checks are:

```bash
npx playwright install chromium
npm test
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run lint
```

If Google Chrome is already installed, `PLAYWRIGHT_CHANNEL=chrome npm test` can use it instead of installing Chromium.

`npm test` builds the app, runs mocked API tests, and starts a production server at `127.0.0.1:3103` for Playwright. It does not require a live API key. Keep that port available; failed browser runs retain traces in `test-results/`.

For a focused follow-up after a successful build, use `npm run test:api` or `npm run test:ui -- tests/browser/<file>.spec.ts` as appropriate. UI changes should be checked on desktop and mobile, including 320px layouts when relevant.

Documentation-only changes need accurate commands, working links and valid template syntax; a full application test run is unnecessary. In the PR, state what you actually checked and explain anything not verified.

## Open a pull request

Use a descriptive commit and PR title, for example `fix: restore focus after closing photos` or `docs: clarify local setup`. Complete the PR template with the problem, resulting change, validation and deployment requirements. Add screenshots for visible UI changes.

Follow the [release and deployment procedure](docs/handbook/04-development-and-operations.md) when publishing a version or changing production. A source merge or GitHub Release does not update the running server; record production acceptance separately.
