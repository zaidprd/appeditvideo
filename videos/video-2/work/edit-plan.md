# edit-plan — video-2 (blender portable ad)

**Master:** `videos/video-2/output/preview-natural.mp4` (8s, 848×478 landscape)
**Transcript spine:** `videos/video-2/work/edited-transcript.json` (17 kata)
**Style:** punchy short ad — fast hooks, no fluff.

## Transcript (17 kata, 8 detik, single take)

```
00:00 — 00:01   "Cuma butuh beberapa detik aja"            (setup)
00:01 — 00:03   "lihat halusnya."                          (proof)
00:03 — 00:05   "Dan rasanya enak banget."                  (sensory)
00:05 — 00:08   "Kalian harus coba blender portable ini."  (CTA)
```

## Shots (3 cutaways)

| # | id | master_in_s | master_out_s | cue |
|---|---|---|---|---|
| 1 | SpeedText | 0.50 | 2.50 | "beberapa detik" — counter 0 → 5 |
| 2 | SensoryPop | 3.50 | 5.50 | "enak banget" — two-word reveal + check |
| 3 | ProductCTA | 5.80 | 7.80 | "blender portable ini" — product call-out + CTA pill |

**Coverage:** 6.0s of shots / 8.0s total = 75% visual. Heavier than video-1 because it's an 8s ad — every second has to earn its keep.

## Talking-head passes kept

- 0.0–0.5s: opening hook ("Cuma butuh...")
- 2.5–3.5s: proof moment ("lihat halusnya")
- 5.5–5.8s: micro-breath before CTA
- 7.8–8.0s: closing fade

## What I'm NOT doing in v1

- No music (step separate — would need a bed track)
- No voice cleanup (RNNoise) — recording already sounds clean per the transcript confidence scores (mostly 0.8+)
- No overlays — full-screen cutaways only, since this is short-form

## Resolution note

Master is 848×478 landscape @ 24fps. Shots authored at the same dimensions (no upscale — bake.py will pad/scale only as needed and the source/master match avoids distortion).