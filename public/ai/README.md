# Thinking cycle asset

- Visual reference: [Thinking Reaction for AI sphere — Gleb Kuznetsov](https://dribbble.com/shots/25202172-Thinking-Reaction-for-AI-sphere-by-Gleb-Kuznetsov).
- Input: `animation_cycle_0.1s.zip`, supplied by the portfolio owner on 2026-10-28; 33 screenshots at 0.1-second intervals. The full screenshots and archive are not included in the repository.
- Input SHA-256: `9255d0cd7520dccabf1a8c3570098d9b81a6ebac2312bed82f86245dc11dc80a`.
- The lowest sampled pixel difference occurs at a 15-frame lag. Use `frame_000.png` through `frame_014.png` for one 1.5-second cycle; the remaining frames contain repetitions, rather than extending the loop to 3.3 seconds.
- Each 3840 × 2160 screenshot is cropped to the same 860 × 860 region at `(1480, 910)`, resized to 256 × 256 and packed into a 5-column, 3-row atlas. Crop inspection confirms no browser chrome, account information, cursor or selection boundary is included.
- `thinking-cycle.webp` is the cropped atlas, encoded at WebP quality 0.92. It is a reference-derived media asset, not a procedurally reconstructed 3D model.
- The Canvas renderer interpolates adjacent frames at display cadence, including the last/first pair, and masks the rectangular crop outside the sphere. The existing hover transition controls its opacity; the static star remains usable while loading or after a failed request.

To rebuild the PNG atlas from extracted frames:

```sh
ffmpeg -framerate 10 -i frame_%03d.png \
  -vf 'crop=860:860:1480:910,scale=256:256:flags=lanczos,tile=5x3:nb_frames=15' \
  -frames:v 1 thinking-cycle.png
```

Encode that PNG using `canvas.toDataURL("image/webp", 0.92)` in Chromium, or an
equivalent WebP encoder; conversion is a build-time operation, not a runtime service.
