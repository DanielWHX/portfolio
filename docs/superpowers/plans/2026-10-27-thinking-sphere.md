# Hover Thinking Sphere

**Goal:** Replace the always-moving rainbow film with a still glass bubble / four-point star that transitions into a blue-violet and pink liquid sphere on hover.

**Reference:** https://dribbble.com/shots/25202172-Thinking-Reaction-for-AI-sphere-by-Gleb-Kuznetsov . The official static frame was inspected. The shot's animation could not be read, so this is a procedural interpretation of the material and frame, not a verified frame-for-frame copy of the original animation. No reference media is included in the app.

**Design:** A common frosted sphere shell stays visible throughout. The star fades and slightly recedes as the saturated, shaded liquid ribbon emerges. On leave, the same blend reverses without resetting its phase. The 48px / 44px button and neighboring presets stay fixed. Idle consumes no animation frames. Keyboard focus can provide the same preview; touch and reduced motion use the still icon and retain the normal expand action.

**Architecture:** Keep the FollowupDock interface unchanged. A small Canvas 2D renderer in `thinking-sphere.ts` owns the liquid appearance; one effect in FollowupBubble owns input, blend, phase and lifecycle. Reuse buffers, update CSS variables without React state per frame, cancel frames on blur/hidden/expanded/unmount. Keep the glass/star fallback when Canvas is unavailable. No new dependency, API request or video asset.

## Steps

- [x] Update bubble browser checks for still idle, hover liquid, smooth reversal, stable hit target, normal click, reduced motion, touch and Canvas fallback. Run the idle check against the old continuous film and verify failure.
- [x] Add the procedural painter and replace the old magnetic / film animation with one reversible hover controller.
- [x] Replace sphere-specific CSS, leaving dock folding, focus and mobile geometry intact.
- [x] Verify actual renders at rest, entering, thinking and leaving; inspect a large labelled local material preview as well as the real 48px button.
- [x] Run build, TypeScript, lint, relevant dock/media tests and the full browser regression. Keep API behavior unchanged and record mocked checks separately.
- [x] Update README, CONTEXT and Unreleased changelog, save a local commit. Do not publish without a release request.

## Tight verification loop

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:ui -- tests/browser/followup-bubble.spec.ts
npm run build
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run lint
PLAYWRIGHT_CHANNEL=chrome npm test
git diff --check
```

## Acceptance

- Baseline idle check failed as intended because the previous film and rim continued animating without hover.
- Build, TypeScript and lint passed; three existing image warnings remain.
- All 14 bubble/dock checks passed, followed by 30 mocked API and 87 browser checks.
- Reviewed static, live and return states on the real button and at a magnified material-study size. No graphics errors were observed. Hit target and nearby shortcuts remain fixed.
- The original clip could not be retrieved. The implementation follows the inspected official still's blue-violet ribbon, pink edge light and frosted shell; exact original motion has not been verified.
- No new dependency or public asset. Runtime API behavior is unchanged. Work is saved locally, with no GitHub or server deployment.

## 2026-10-28 rotation correction

The owner supplied a recording of the reference and reported missing automatic
rotation. The old renderer used a bounded sine roll of only ±0.2 radians; its
pixel-change check could pass on a slight wobble. Replace only the renderer with
a closed liquid volume: precomputed mesh / normals, continuous time-based yaw,
perspective projection, depth ordering and soft blue / pink lighting. Keep the
existing lifecycle, blend spring, stationary glass shell and dock interface.

Add a public browser check that holds the pointer still and measures the visible
liquid passing through broad and foreshortened views. It failed on the old painter
(maximum vertical / horizontal variance 0.382 against >1.25). Recheck the hover,
reversal, idle, touch, reduced-motion, Canvas fallback and dock cases; inspect
normal and enlarged frames and sample frame pacing locally. The supplied recording
informs the visual direction; no reference media is bundled and exact reproduction
is not claimed.

## 2026-10-28 supplied-slice correction

The owner supplied 33 screenshots at 0.1s intervals. These expose a different
motion: a broad S-shaped fold becomes a filled round sphere, while the previous
thin mesh shrank into a bead. Replace the approximate mesh with a cropped frame
atlas and display-rate interpolation. A 15-frame lag has the lowest sampled
interior RGB difference (4.765 versus 11.841 at 16 frames); use the first 15 frames
for one 1.5s cycle, not the full 3.3s archive. Crop / provenance / encoding details
are in `public/ai/README.md`. The original 39 MB screenshots stay outside the repo.

The renderer retains the small draw / resize / clear interface and adds a ready
promise. A pending or failed asset keeps the static star. The controller remembers
input intent while loading, but clears it on leave, blur and media changes; a
disposed effect ignores completion. Existing dock, spring and keyboard behavior
remain in place. The runtime uses the reference-derived asset and is no longer
described as procedural 3D.

Replace the incorrect edge-on variance assertion with a visible coverage check
for folded and filled phases. Add multi-loop pose consistency, failed loading,
hover during loading and completion after blur. The old mesh failed the filled
phase; the initial 33-frame playback failed multi-loop consistency; the initial
ready callback failed the blur test. Verify all bubble / dock cases, normal and
enlarged playback, build, TypeScript and lint before saving a local commit.

Acceptance: build, TypeScript and all 19 bubble / dock checks passed; ESLint has
no errors and three existing image warnings. Pixel comparison uses a paused test
clock: unpaused screenshot readback added 81ms to the expected 7500ms interval;
the controlled five-loop comparison has a mean channel difference of 1.035.
Normal-size and magnified playback are inspected separately. No API or server
release is part of this correction.
