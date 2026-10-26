# Crystal follow-up bubble implementation plan

**Goal:** restore both thought-bubble tail circles, and follow the owner's supplied glass/rainbow/star reference with continuous light and gentle magnetic deformation.

**Architecture:** keep FollowupDock's layout, fold state and API behavior. Draw the icon using CSS optical layers and a small SVG star. A self-contained native button owns pointer spring motion; its hit area stays stationary, and all visual movement stays within that area.

**Tech stack:** React, TypeScript, CSS, SVG, requestAnimationFrame, Playwright. No new dependency or image-generation request.

## Design and scope

- CSS/SVG is selected for crisp scaling and independently moving light. A static bitmap limits deformation; a new WebGL renderer adds unnecessary runtime weight for one small control.
- Keep the current 48px / mobile 44px hit area and six-control composer bounds. Use an inset clear shell, fine iridescent rim, slow moving inner film, restrained specular highlights and one small four-point star.
- Mouse/pen hover gently pulls and stretches the visual surface toward the pointer; leaving returns it through a damped spring. Touch and reduced motion keep a static, usable control. Hidden/background states stop pointer motion and pause optical loops.
- Investigate the expanded clip polygon against the tail's negative bottom margin. Fix the content's actual measured extent instead of hiding the original tail or drawing a replacement.
- Preserve draft, references, quota, cache, keyboard control and fold transitions. The owner accepted the local preview and authorized GitHub release v0.2.3; server deployment is outside this release.
- References: owner-supplied PNG; Apple HIG Materials; Codrops Magnetic Buttons. These are visual/motion inspiration, not copied source or claims of native Apple rendering.

## Steps

- [x] Add public-browser checks in `tests/browser/followup-bubble.spec.ts`: both tail dots are painted, surface pulls/deforms/returns without moving the hit target, inner light continues at rest, reduced motion resets movement.
- [x] Run the new checks against the old build and confirm failures identify clipping and missing magnetic surface.
- [x] Fix the tail extent in `app/chat/followup-dock.css`; verify the tail test alone.
- [x] Implement `app/chat/FollowupBubble.tsx`, integrate it in `FollowupDock.tsx`, and replace the old opaque orb styling in `followup-dock.css`.
- [x] Run build, TypeScript, lint, API and relevant browser regressions; inspect local preview and record exact results in CHANGELOG/CONTEXT. Retain the existing uncommitted Fun Facts changes.


## Verification record

- Red: all four new tests failed for the expected missing surface and clipped tail; both tail samples returned `[false, false]`.
- Minimal tail fix: both tail tests passed after removing the dock-specific negative bottom margin.
- Green: the four new tests and six existing dock regressions passed; build, TypeScript and 30 API regressions passed. Lint retained only six existing image warnings.
- Review: scoped independent static review found no Critical/Important issue. Review artifacts show the new glass icon; the owner accepted the aesthetic result before authorizing this release.

- Release verification: v0.2.3 passed build, TypeScript, 30 API and 88 browser checks; lint has no errors and six existing image warnings. GitHub source publication and production server deployment remain separate.
