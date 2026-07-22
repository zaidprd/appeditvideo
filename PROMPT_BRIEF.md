# AI Assistant Brief — claude-youtube-editor (Zaid's fork)

> Attach this file when starting any new AI conversation about this project. It tells the assistant
> the pipeline, conventions, and constraints so you don't have to re-explain every time.

## What this project is

A Python + Remotion pipeline that turns a raw talking-head recording (MP4) into a finished short-
form video ready for upload. Pipeline runs locally, no GUI, no Claude Code subscription, no paid
APIs required (free-tier replacements throughout).

**Repository**: `E:\latihan\EDIT VIDEO\claude-youtube-editor`
**Personal fork**: `zaidprd/appeditvideo` (https://github.com/zaidprd/appeditvideo)
**Upstream**: `hassancs91/claude-youtube-editor` (MIT, full credit given in README)

## The pipeline (6 steps, run in order)

| # | Step | Tool | Input | Output |
|---|---|---|---|---|
| 1 | Cut | `tools/transcribe.py` + `tools/render_cuts.py` | `videos/<proj>/raw/source.mp4` | `output/preview-natural.mp4` + `work/edited-transcript.json` (word times) |
| 2 | Visuals | Remotion TSX shots + `tools/bake.py` | master + `work/timeline.json` | `output/<proj>-preview.mp4` (composite) |
| 3 | Voice | `tools/clean_voice.py --method rnnoise` | preview MP4 | preview-clean-sh.mp4 (RNNoise denoised, levels preserved) |
| 4 | SFX | `tools/mix_sfx.py` | preview-clean + `work/sfx-plan.json` | `<proj>-sfx.mp4` |
| 5 | Thumb | `tools/gen_thumbnail_local.py --niche <x>` | `--title --hook --sub` | `packaging/thumbs/{A,B,C}.jpg` (1280×720) |
| 6 | Upload | manual (TikTok/Shopee/YouTube Shorts) | final MP4 | posted |

## Hard constraints (DO NOT VIOLATE)

### Audio
- **NO MUSIC** in any final output. Voice + SFX functional + ambience only.
- Default SFX behavior: SKIPPED (use `--no-sfx` flag, or omit `sfx-plan.json`).
- SFX allowed if functional: whoosh (transition), pop/impact (emphasis), chime (CTA only).
- Per-cue gain_db rules (when SFX enabled): transitions -6/-8dB, payoffs -3/-5dB, bed -9/-11dB.

### Visual
- **Aspect**: 9:16 portrait 1080×1920 (mobile-first, marketplace native).
- **FPS**: 30 (NOT 60 — file 2× larger, not needed for short-form).
- **Palette**: read from `brand-zaid.md` (cream, dark ink, indigo accent).
- **Tone**: calm, tutorial-style — NO flashy bouncy animations.
- **Motion**: fade + rise entrance, ease-out, max scale pop 1.03.
- **Fonts**: Space Grotesk (display), Inter (body), JetBrains Mono (code) — already loaded in `remotion/src/fonts.ts`.

### Code
- TSX shots live in `remotion/src/shots/<project>/` (per-project) or `remotion/src/shots/zaid-templates/` (reusable).
- Each shot exports `compositionConfig = { id, durationInSeconds, fps, width, height }` as the source of truth.
- After adding/renaming a shot: run `cd remotion && npm run gen` (regenerates registry — DO NOT edit `registry.gen.tsx` by hand).
- Python tools read project paths from CWD (not ROOT) for project data; engine/library paths from ROOT.

## File layout per project

```
videos/<project-name>/
├── raw/
│   └── source.mp4                    # raw recording (NEVER commit)
├── work/
│   ├── audio/source.wav              # extracted mono 16kHz WAV
│   ├── transcripts/source.json       # full AssemblyAI response
│   ├── edited-transcript.json        # cleaned word-level timings (ms)
│   ├── edit-plan.md                  # human-readable edit plan (created by assistant)
│   ├── timeline.json                 # shot→master map (created by assistant)
│   ├── sfx-plan.json                 # optional, omit if --no-sfx
│   ├── analysis/                     # cuts.json + takes notes
│   └── render/                       # transient render segments (NEVER commit)
├── output/
│   ├── preview-natural.mp4           # master cut (voice only)
│   ├── <proj>-preview.mp4            # composited with TSX shots
│   ├── <proj>-preview-clean-sh.mp4   # RNNoise voice-cleaned
│   └── <proj>-sfx.mp4                # FINAL — ready to upload
└── packaging/
    └── thumbs/
        ├── A.jpg                     # variant 1 (YouTube 1280×720)
        ├── B.jpg                     # variant 2
        └── C.jpg                     # variant 3
        └── title.txt                 # one-line title for upload
```

## Pre-built tools (Zaid's fork additions)

These exist and work. Don't reinvent them — reference them:

| Tool | Purpose | Key flags |
|---|---|---|
| `tools/setup_recording.py <test.mp4>` | Verify HP recording setup (portrait, fps, codec, audio levels) | `--standards` (print spec) |
| `tools/transcribe.py <project-dir>` | Transcribe audio via AssemblyAI; reads `work/audio/*.wav` | `--force` re-transcribe |
| `tools/render_cuts.py <project-dir>` | Render master cut from `work/analysis/cuts.json` | `--style {tight,natural}` `--mode {preview,final}` |
| `tools/bake.py <timeline.json>` | Composite master + TSX shots into preview MP4 | `--end SEC` `--keep` |
| `tools/clean_voice.py <input.mp4>` | RNNoise voice cleanup (free, local) | `--method rnnoise --model sh` |
| `tools/mix_sfx.py <sfx-plan.json>` | Mix SFX cues over voice | `--no-sfx` (skip) `--print` (audit only) |
| `tools/gen_thumbnail_local.py <project>` | Generate 3 thumbnail JPG variants | `--niche {affiliate,seo,ai-news,calm}` `--title --hook --sub` |

## Pre-built TSX templates (portrait 1080×1920 @ 30fps)

In `remotion/src/shots/zaid-templates/`:

| Composition | Duration | When to use |
|---|---|---|
| `HookQuestion` | 3.0s | First 3 seconds — full-screen question, indigo underline on keyword |
| `ProductSpec` | 4.0s | Spec sheet — 4 items fade-in, cream bg + indigo accent on numbers |
| `StepNumber` | 3.0s | Tutorial step — big "01" number, dark ink bg + progress bar (currently 1 step; copy file for steps 2/3) |
| `VerdictCard` | 4.0s | Pros/cons — 2-column "✓ Plus" (teal) / "✗ Minus" (pink), cream bg + tagline |

## Three content niches Zaid makes

### Niche A — Marketplace affiliate reels (TikTok / Shopee)
- Hook pattern: question about a problem
- Structure: hook (3s) → product intro (10s) → spec (5s) → pros (15s) → cons (10s) → verdict + CTA (10s)
- CTA phrasing: "cek harga di keranjang kuning" / "link di bio" / "link di keranjang kuning"
- Target duration: 30–60s

### Niche B — SEO tutorial (YouTube Shorts + long-form)
- Hook pattern: problem statement ("Ranking stuck?")
- Structure: hook (3s) → step 1 (15s) → step 2 (15s) → step 3 (15s) → result + CTA (10s)
- CTA phrasing: "full tutorial di channel" + subscribe reminder
- Target duration: 60–120s (shorts), 5–15 min (long-form)

### Niche C — AI news / developments
- Hook pattern: news headline ("GPT-5 baru release…")
- Structure: hook (3s) → context (10s) → why it matters (15s) → demo / code (20s) → verdict (10s)
- CTA phrasing: "follow untuk update AI terbaru"
- Target duration: 30–90s

## Recording setup (the user records the voice, not the AI)

- **Device**: HP Moto G45 5G, portrait, 1080p FHD @ 30fps
- **Audio**: built-in mic (decent for short-form)
- **Lighting**: ring light from 45° side or front-mixed
- **Background**: cream wall + 1-2 minimal decor (small plant / frame)
- **Distance**: HP 1-1.5m from face, eye-level
- **Voice tone**: calm, conversational, medium-low energy (not whisper, not shout)

## Common assistant tasks

When the user asks for help, they typically want one of:

1. **New video from raw recording** — transcribe, plan shots, bake, generate thumb, finalize.
2. **New TSX template** — author a new shot from scratch in `remotion/src/shots/zaid-templates/` or `<project>/`.
3. **Fix bake / render issue** — usually fps mismatch, missing shot, wrong dimensions.
4. **Plan sfx-plan.json** — pick SFX from library, set cues synced to transcript word times.
5. **Audit final mix** — check peak/RMS, SFX-vs-voice ratio.
6. **Generate thumbnails** — pick niche + title + hook + sub.

## Verification before declaring anything "done"

Always check:
- `cd remotion && npx remotion compositions src/index.ts` lists the new shot
- `cd remotion && npm run gen` exits 0 after adding shots
- `venv/Scripts/python.exe tools/setup_recording.py <file>` for any new recording
- `ffprobe -v error -show_entries stream=... <output.mp4>` to confirm dimensions/fps/duration
- `ffmpeg -af astats ...` or Python RMS check for audio levels (peak < -0.5 dBFS, RMS -25 to -15 dBFS for voice)

## What NOT to do

- ❌ Don't add background music, trending sounds, or any non-functional audio.
- ❌ Don't commit raw MP4 footage, rendered outputs, `.env`, or `scratch/` files.
- ❌ Don't edit `remotion/src/registry.gen.tsx` or `shots.manifest.json` by hand — they're auto-generated.
- ❌ Don't hardcode colors, fonts, or easings in TSX — always import from `brand.ts` / `fonts.ts`.
- ❌ Don't suggest ElevenLabs, Gemini, or any paid API as a default — Zaid uses free alternatives.
- ❌ Don't recommend upscaling or padding footage — master and timeline dimensions must match.
- ❌ Don't add mock face refs or generate fake person images — Zaid uses real talking-head recordings.

## When the user gives you a task, you should respond by

1. Reading this brief + relevant existing files (`brand-zaid.md`, `CLAUDE.md`, `tools/*.py` headers).
2. Confirming you understand with a 2-3 line summary of what you'll do.
3. Listing which files you'll create or modify.
4. Asking for any missing info (recording path, niche, product details) — don't guess.
5. Doing the work step-by-step with verification at each stage.
6. Reporting results with file paths and metrics (fps, dimensions, RMS, etc.).
