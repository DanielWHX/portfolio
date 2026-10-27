# Chat Design System Implementation Plan

**Goal:** Refresh the conversation experience using aaabadcode's open portfolio layout and Orbita's restrained hierarchy and motion. Preserve the homepage and existing chat behavior.

**Architecture:** Add one chat-scoped design sheet and a small shared outline-icon component. Reuse all existing cards, native overlays, APIs, follow-up dock, cache and project selection. Publicly supplied content and links stay unchanged. No new dependency or runtime service.

**Tech Stack:** Existing React / TypeScript / Vinext, native CSS and SVG, Playwright.

**Execution:** Current agent, in the existing isolated worktree on `codex/chat-design-system`. This is a local design preview, not a GitHub or server release.

## Design

- Scope: `/chat`, its cards and training-video overlay. `/` and case studies keep their current appearance.
- Typography: native system sans, 15px body / 1.75 line height, 28–32px primary headings, 13px controls, 11–12px metadata. One neutral hierarchy instead of blue-grey labels everywhere.
- Palette: white, ink `#202124`, secondary `#747478`, surface `#f5f5f6`, divider `#ededf0`. Charcoal send action. Brand images, school marks, supplied photographs, yellow Whatnot mark and the glass AI bubble retain their colors.
- Layout: existing centered conversation and stable bottom composer. 840px shell, consistent content alignment, no enclosing chat panel. Cards become borderless; small surfaces and separators group secondary information.
- Icons: one 24px-viewbox, 1.6px rounded outline vocabulary. Replace UI emoji/letter placeholders, retaining meaningful text labels.
- Motion: complete answer arrives with a 320ms, 6px upward fade. Cards use one short reveal, without nested portrait/letter choreography. Cached answers stay still. Existing reversible suggestion fold and magnetic bubble remain; reduced motion still disables movement.
- No added analytics, resume download, sidebar, feature menu or fabricated content from the references.

## Tasks

- [x] Write a focused browser check for homepage isolation, borderless card presentation, visible complete answers and composer/dock fit at desktop and 320px. Run against the baseline and record its expected failure.
- [x] Create `app/chat/PortfolioIcon.tsx`; use it in `page.tsx`, `ChatClient.tsx`, `ProfileCard.tsx`, `ContactCard.tsx`, `ProjectsCard.tsx` and `BigThreeDialog.tsx`. Preserve accessible names and contact copy behavior.
- [x] Create `app/chat/chat-design.css`, scoped under `.chat-design` and `.chat-design-overlay`, and import it from the chat page. Restyle the shell, presets, suggestions, composer and all five card types. Do not change root font or homepage selectors.
- [x] Simplify `AnimatedText.tsx` to one complete text node. Update existing motion/session assertions to verify whole-answer reveal and static restored messages.
- [x] Add `/preview/chat` using existing real cards and sample content, clearly labelled, with no API calls and a production 404. Keep existing preview paths compatible.
- [x] Update the presentation-specific old border/color assertions; retain all cache, retry, suggestions, project selection, media, modal focus, draft, navigation and reduced-motion checks.
- [x] Run build, TypeScript, lint, API and browser checks. Review actual desktop/mobile screenshots for each card, dock expansion and the video overlay. Check that returning home preserves its original styling.
- [x] Update CONTEXT, README and Unreleased changelog with the final design and current verification. Save a local commit; do not publish without a release request.

## Verification commands

```sh
npm run build
PLAYWRIGHT_CHANNEL=chrome npm run test:ui -- tests/browser/chat-design.spec.ts
node node_modules/typescript/bin/tsc --noEmit
npm run lint
PLAYWRIGHT_CHANNEL=chrome npm test
git diff --check
```

## References inspected

- https://www.aaabadcode.com/chat — inspected public layout and computed font styles. The page uses a native system sans, centered open conversation, compact shortcuts and a bottom composer.
- https://dribbble.com/shots/25812177-Orbita-AI-Onboarding-Chat — page description and the owner's 14-second recording. Borrow hierarchy, quiet surfaces and smooth local transitions; its dashboard navigation is outside this portfolio change.
- Owner's Fastfolio screenshots support the preference for readable black/grey typography. The analytics screen is reference material, not a request to implement analytics.

## Acceptance

- Baseline check failed as intended: the Profile Card still had a 1px outer border.
- Build and TypeScript passed; ESLint: no errors, three existing native-image warnings.
- Thirty mocked API checks and all 83 browser checks passed. The earlier exact-class HTML assertion was updated to allow the scoped theme class.
- Full regression caught an actual restored Fun Facts entrance animation; the fix disables only the restored card's entrance, preserving user-triggered photo transitions. All six photo checks and the complete browser suite then passed.
- Reviewed five real cards at 1440px, 390px and 320px, plus dock folding and the training-video overlay. Preview made zero API requests.
- Homepage implementation and its global stylesheet are unchanged. Before/after home appearance checks pass through chat navigation at desktop and mobile widths.
- No new dependency, credential change, real-model evaluation or external deployment. Local changes only.
