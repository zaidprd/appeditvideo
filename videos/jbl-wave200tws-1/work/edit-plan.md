# Edit Plan — jbl-wave200tws-1 (JBL Wave 200TWS affiliate review)

**Mode**: audio-only, faceless (pure voice + TSX visuals)
**Master**: `output/master-audio.mp4` (1080×1920, dark ink bg, voice only, 90s)
**Duration target**: ~89s (full transcript)

## Transcript (171 kata, bahasa Indonesia, 79% confidence)

```
[00.45 - 10.31] HOOK       "Headset JBL ini sekarang harganya udah jauh lebih
                             murah, tapi di tahun sekarang masih layak dibeli
                             atau cuman menang nama JBL aja."
[11.58 - 20.57] INTRO      "Ini JBL Wave 200TWS, TWS entry level dari JBL yang
                             fokus di kualitas suara dibanding fitur-fitur mewah."
[21.82 - 28.20] PRO #1     "Hal yang paling terasa tentu karakter suara JBL.
                             Bassnya cukup nendang, vokalnya tetap jelas."
                             (note: transcript menyebut "Web 200 TWS" — itu error
                             recognizer, kita pakai "Wave 200 TWS" di shot)
[33.62 - 42.60] PRO #2     "Desainnya juga ringan dan nyaman dipakai dalam
                             waktu lama. Pairing ke HP cepat, tinggal buka casing
                             langsung terhubung."
                             (note: transcript menyebut "Piring" — itu error,
                             should be "Pairing")
[44.32 - 49.10] PRO #3     "Baterainya juga cukup awet untuk dipakai aktivitas
                             sehari-hari."
[49.24 - 60.76] CON #1     "tapi ada beberapa kekurangan. TWS ini belum punya
                             Active Noise Cancelling atau ANC, jadi saat dipakai
                             di tempat ramai, suara luar masih cukup terdengar."
[62.62 - 68.46] CON #2     "Selain itu juga belum ada aplikasi untuk mengatur
                             EQ atau fitur kontrol yang lebih lengkap."
[69.78 - 89.57] VERDICT    "Kalau kamu cari TWS dengan kualitas suara yang enak
                             dari brand terpercaya, JBL Wave 200TWS masih layak
                             dipertimbangkan. Tapi kalau prioritasmu ANC dan fitur
                             lebih lengkap, ada pilihan lain di harga yang mirip.
                             Kalau penasaran harganya sekarang, cek link di
                             keranjang kuning."
```

## Shot plan (9 TSX cutaways)

| # | id | type | master_in | master_out | duration | cue |
|---|---|---|---|---|---|---|
| 1 | HookQuestion | cutaway | 0.00 | 10.50 | 10.5s | "Headset JBL... masih layak?" + product image |
| 2 | ProductSpec | cutaway | 10.50 | 21.50 | 11.0s | "JBL Wave 200TWS" spec card |
| 3 | ProsBass | cutaway | 21.50 | 33.00 | 11.5s | "BASS NENDANG" + product image side |
| 4 | ProsDesign | cutaway | 33.00 | 44.00 | 11.0s | "RINGAN & CEPAT PAIRING" |
| 5 | ProsBattery | cutaway | 44.00 | 49.50 | 5.5s | "BATERAI AWET" |
| 6 | ConsNoANC | cutaway | 49.50 | 62.00 | 12.5s | "TANPA ANC" |
| 7 | ConsNoApp | cutaway | 62.00 | 69.50 | 7.5s | "TANPA APP" |
| 8 | VerdictCard | cutaway | 69.50 | 89.57 | 20.0s | "✓ Plus / ✗ Minus + CTA" |

**Total**: 9 shots, 89.57s, no gap.

## Style decisions

- **Background**: dark ink (#1a1a2e) full screen
- **Accent**: indigo (#6366F1) untuk pros, pink (#e8879f) untuk cons
- **Product image**: `media/projects/jbl-wave200tws-1/products/jbl-wave-200tws-black-rpndqo0rl.jpg` (1000×1000 white bg)
- **Typography**: Space Grotesk untuk headline, Inter untuk body
- **NO MUSIC**: pure voice + functional SFX only (skip mix_sfx step per brand-zaid.md)

## What we're NOT doing

- ❌ Background music (brand-zaid.md audio policy)
- ❌ SFX pass (--no-sfx default)
- ❌ Voice cleanup with RNNoise (recording clean per stats: peak -0.27 dBFS, RMS -18.4 dBFS)
- ❌ Re-record (user at office, voice memo is final take)
- ❌ Mention specific price (per user instruction, biar penasaran)
