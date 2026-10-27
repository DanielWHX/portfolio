# Big Three Record training clips

Hongxiang supplied these three clips on 2026-10-22 for the portfolio. The lift names were identified by reviewing frames; no weight was inferred from the footage. The displayed personal records remain Hongxiang's separately self-reported figures, not a certification of the clips or competition results.

| Web asset | Source file | Original duration | Web duration | Dimensions | Web size | Poster frame |
| --- | --- | --- | --- | --- | --- | --- |
| `squat.mp4` | `607_1792650401.mp4` | 14.267 s | 14.279 s | 720 × 1280 | 3,018,520 bytes | 7 s |
| `bench.mp4` | `605_1792650394.mp4` | 17.533 s | 17.533 s | 720 × 1280 | 2,260,499 bytes | 4 s |
| `deadlift.mp4` | `606_1792650397.mp4` | 23.100 s | 23.100 s | 720 × 1280 | 3,568,037 bytes | 11 s |

All source clips already use web-compatible H.264 / `yuv420p` video and AAC mono audio at 44.1 kHz. Their long edge is already 1280 px and their total bitrate is approximately 1.0–1.7 Mbps, so remuxing preserves the complete original picture and audio without another lossy encode. Nothing is cropped, trimmed, stretched, or upscaled. The small container-duration difference on the squat clip comes from MP4 audio/video timing; stream payloads are preserved. The MP4 `moov` atom is moved before media data for progressive playback. Source container metadata is removed.

Processing command, repeated with the corresponding source filename and lift:

```sh
ffmpeg -i "$SOURCE" -map 0:v:0 -map '0:a?' -c copy \
  -movflags +faststart -map_metadata -1 "$LIFT.mp4"
```

Poster generation uses an existing frame from the web clip, retaining its complete portrait aspect ratio:

```sh
ffmpeg -ss "$POSTER_SECONDS" -i "$LIFT.mp4" -frames:v 1 \
  -vf 'scale=540:-2' -q:v 3 "$LIFT-poster.jpg"
```

The video tabs use `controls`, `playsInline`, `muted`, and `preload="none"` so visitors choose when to download and play a clip; unmuting exposes the retained original sound. Switching tabs or closing the record dialog stops and unloads the current player. The full portrait framing is retained.
