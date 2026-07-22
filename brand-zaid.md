# Brand — Zaid's channel (tutorial + affiliate + AI news)

> Personal brand extension. The base look comes from `brand.md` (palette, fonts, motion). 
> This file adds the audio policy + 3 niche templates + content rules specific to Zaid.

## 1. Audio policy — NO MUSIC, voice-only

**MUSIK = TIDAK DIGUNAKAN.** Suara = voice asli + ambience natural + SFX functional saja.

Allowed:
- ✅ Voice (recording sendiri, calm/conversational tone)
- ✅ Ambience natural dari raw footage (keyboard typing, kipas angin, keramaian subtle)
- ✅ SFX functional WHOOSH (cut transition, max 1 per 5 detik)
- ✅ SFX functional POP/IMPACT (emphasis pada angka/janji, max 1 per 10 detik)
- ✅ SFX functional CHIME (closing CTA only)

Forbidden:
- ❌ Beat / melody / vocals / instrument — NEVER
- ❌ Background music bed sepanjang video
- ❌ Trending sounds TikTok (bukan hak cipta kita)
- ❌ "Elevator music" / stock music library

Default SFX behavior:
- SFX pass di-skip kecuali di-enable explicit per video
- Pakai `--no-sfx` flag di `mix_sfx.py` untuk skip (default behavior untuk konten Zaid)
- Override: tulis sfx-plan.json seperti biasa, run tanpa flag `--no-sfx` untuk enable

## 2. Aspect ratio

- **Default**: 9:16 portrait 1080×1920 (marketplace short-form native)
- Secondary: 16:9 landscape 1920×1080 (untuk YouTube long-form SEO tutorial)
- Set di `timeline.json` preview.width/height

## 3. Recording setup

- **Device**: HP Moto G45 5G
- **Resolution**: 1080p FHD
- **Frame rate**: 30fps
- **Orientation**: Portrait
- **Audio**: built-in mic (decent) — kalo ada budget, clip-on mic ke HP
- **Lighting**: ring light dari samping 45° atau depan miring
- **Background**: dinding cream + 1-2 dekorasi minimal (tanaman kecil / frame)

## 4. 3 niches + template mapping

### Niche A: Reels affiliate produk
- Hook pattern: pertanyaan problem (3 detik pertama)
- Demo: split-screen before/after atau product showcase
- Benefit list: 3 poin dengan fade-in
- CTA: "Cek harga di keranjang kuning" + arrow pointing down (atau generic)
- Templates used: HookQuestion, ProductSpec, VerdictCard
- Duration target: 30-60 detik

### Niche B: Tutorial SEO
- Hook pattern: problem statement (3 detik)
- Steps: numbered tutorial (StepNumber 1/2/3/...)
- Tool demo: screen recording + ToolMockup overlay
- CTA: "Full tutorial di channel" + subscribe reminder
- Templates used: HookProblem, StepNumber, ToolMockup
- Duration target: 60-120 detik (shorts), 5-15 menit (long-form)

### Niche C: Perkembangan AI
- Hook pattern: news headline (3 detik)
- Context: kenapa ini penting (mid section)
- Demo: tool screenshot / code mockup (CodeBlock)
- Opinion: green flag / red flag / verdict
- Templates used: NewsHeadline, CodeBlock, VerdictCard
- Duration target: 30-90 detik

## 5. Content rules

- **Tone**: calm, tutorial-style, tidak heboh (bukan "MrBeast loud")
- **Hook**: 3 detik pertama HARUS ada visual statement + voice hook
- **CTA**: setiap video harus ada call-to-action eksplisit
- **Voice energy**: medium-low (bukan whisper, bukan teriak)
- **Visual**: prefer cream + dark ink palette (professional), indigo accent

## 6. File organization

Per-video project di `videos/video-N/`:
- raw/ — rekaman mentah (source.mp4)
- work/audio/ — extracted WAV (16kHz mono)
- work/transcripts/ — AssemblyAI JSON
- work/edited-transcript.json — transcript cleaned
- work/timeline.json — shot plan dengan fps/width/height PORTRAIT
- work/sfx-plan.json — optional (biasanya kosong/default no-SFX)
- output/ — preview.mp4, preview-clean-sh.mp4, sfx.mp4 (atau langsung final)
- packaging/thumbs/ — A.jpg B.jpg C.jpg

## 7. Reusable template locations

- TSX shots: `remotion/src/shots/zaid-templates/`
- Thumbnail variants: `tools/gen_thumbnail_local.py` dengan --niche flag
- Voice cleanup: `tools/clean_voice.py --method rnnoise --model sh` (kalau ambient noisy)
