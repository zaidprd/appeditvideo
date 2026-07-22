#!/usr/bin/env python3
"""
gen_thumbnail_local.py — local thumbnail generator using PIL/Pillow.

Drop-in replacement for the Gemini-backed tools/gen_thumbnail.py for users
without a Nano Banana Pro / Gemini key. Renders three "thumbnail bets" from
a single config:
  - bold colored background (brand palette)
  - big hook word (display font, ~96-160px)
  - subtitle pill (rounded, brand accent)
  - subtle decorative elements (gradient, grid)

YouTube-spec output: 1280x720 JPG, optimized to <=2MB.

Usage:
  python tools/gen_thumbnail_local.py videos/video-2 --title "BLENDER PORTABLE" --hook "5 DETIK" --sub "cuma butuh 5 detik"
  python tools/gen_thumbnail_local.py videos/video-2 --niche ai-news --title "JBL WAVE 200TWS" --hook "REVIEW" --sub "20 jam battery"
  python tools/gen_thumbnail_local.py videos/video-2 --variants 3

Niches (color palettes per niche — pick what fits the content tone):
  affiliate  (default) bright indigo + yellow accent, energetic but clean
  seo        cream + dark ink + subtle indigo, trust / professional
  ai-news    dark ink + teal accent, tech feel
  calm       cream + muted colors, very neutral, content-first

Output:
  videos/video-2/packaging/thumbs/A.jpg
  videos/video-2/packaging/thumbs/B.jpg
  videos/video-2/packaging/thumbs/C.jpg
"""
import argparse
import copy
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Brand palette (mirror of brand.md §3)
PALETTE = {
    "indigo": "#6366F1",
    "violet": "#9b7cc4",
    "teal":   "#4db8a8",
    "green":  "#4ecdc4",
    "yellow": "#f5d76e",
    "pink":   "#e8879f",
    "ink":    "#1a1a2e",
    "muted":  "#6b6b7b",
    "paper":  "#fffef7",
    "cream":  "#faf8f5",
}

# Per-niche palette overrides. Each entry is a partial dict; values missing
# from the override fall back to PALETTE. The "extras" key is consumed by the
# variant builders for niche-specific touches (e.g. bg gradient endpoints).
NICHES = {
    "affiliate": {
        # default energetic: bright indigo bg + yellow hook accent
        "_label": "bright indigo + yellow accent — energetic, clean",
    },
    "seo": {
        # trust/professional: cream bg, dark ink text, subtle indigo accent
        "_label": "cream + dark ink + subtle indigo — trust, professional",
        "paper":  "#fbf7ee",
        "cream":  "#f5efe1",
        "ink":    "#0f172a",
        "muted":  "#475569",
        "indigo": "#3730a3",
        # extras used by variant builders
        "bg_top": "#fbf7ee",
        "bg_bot": "#f5efe1",
    },
    "ai-news": {
        # tech feel: dark ink bg, teal accent
        "_label": "dark ink + teal accent — tech feel",
        "ink":    "#0b1220",
        "paper":  "#e6edf3",
        "teal":   "#22d3ee",
        "indigo": "#1e293b",
        "yellow": "#67e8f9",
        "muted":  "#94a3b8",
        "bg_top": "#0b1220",
        "bg_bot": "#111827",
        "stripe": "#22d3ee",
    },
    "calm": {
        # very neutral, content-first
        "_label": "cream + muted — very neutral, content-first",
        "paper":  "#f7f4ec",
        "cream":  "#efe9d9",
        "ink":    "#2b2a26",
        "muted":  "#7a7669",
        "indigo": "#8a8377",
        "teal":   "#9aa18c",
        "yellow": "#d9d2bd",
        "violet": "#b3a999",
        "green":  "#9aa18c",
        "pink":   "#c4a89c",
        "bg_top": "#f7f4ec",
        "bg_bot": "#efe9d9",
        "stripe": "#8a8377",
    },
}


def palette_for(niche):
    """Return a palette dict for the given niche (deep-copied, fallback to PALETTE)."""
    base = copy.deepcopy(PALETTE)
    override = NICHES.get(niche, {}).copy()
    # pop internal label
    override.pop("_label", None)
    base.update(override)
    return base


# Windows font candidates (Pillow's fontloader walks the name)
FONT_DISPLAY_CANDIDATES = [
    "C:/Windows/Fonts/arialbd.ttf",    # Arial Bold (substitute for Space Grotesk Bold)
    "C:/Windows/Fonts/seguisb.ttf",    # Segoe UI Semibold
    "C:/Windows/Fonts/segoeui.ttf",    # Segoe UI
    "C:/Windows/Fonts/calibrib.ttf",   # Calibri Bold
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]
FONT_BODY_CANDIDATES = [
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/calibri.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def find_font(candidates):
    for p in candidates:
        if os.path.exists(p):
            return p
    raise FileNotFoundError("no usable font found in: " + ", ".join(candidates))


def font_at(path, size):
    return ImageFont.truetype(path, size)


def measure(draw, text, font):
    """Return (width, height) of text using textbbox."""
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    return r - l, b - t


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def vertical_gradient(w, h, top_hex, bot_hex):
    """Smooth vertical gradient. Top color -> bottom color."""
    top = hex_to_rgb(top_hex)
    bot = hex_to_rgb(bot_hex)
    img = Image.new("RGB", (w, h), top)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] * (1 - t) + bot[0] * t)
        g = int(top[1] * (1 - t) + bot[1] * t)
        b = int(top[2] * (1 - t) + bot[2] * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def radial_glow(w, h, center_xy, radius, color_hex, alpha=140):
    """Soft circular glow composited onto an RGBA layer."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = center_xy
    col = hex_to_rgb(color_hex) + (alpha,)
    # draw concentric circles fading
    for i in range(radius, 0, -8):
        a = int(alpha * (1 - i / radius) ** 1.4)
        if a < 1:
            continue
        c = hex_to_rgb(color_hex) + (a,)
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=c)
    return layer.filter(ImageFilter.GaussianBlur(radius // 6))


def draw_pill(draw, xy_box, radius, fill_hex, outline_hex=None):
    """Rounded-rectangle 'pill' background."""
    x0, y0, x1, y1 = xy_box
    fill = hex_to_rgb(fill_hex)
    if outline_hex:
        outline = hex_to_rgb(outline_hex)
        draw.rounded_rectangle(xy_box, radius=radius, fill=fill, outline=outline, width=2)
    else:
        draw.rounded_rectangle(xy_box, radius=radius, fill=fill)


def variant_A(out_path, title, hook, sub, font_disp, font_body, palette):
    """A: indigo gradient bg, huge hook word, pill subtitle.

    palette is the niche-specific override dict (falls back to PALETTE colors).
    """
    W, H = 1280, 720
    bg_top = palette.get("bg_top", palette["indigo"])
    bg_bot = palette.get("bg_bot", "#312e81")
    img = vertical_gradient(W, H, bg_top, bg_bot)
    # glow blob
    glow = radial_glow(W, H, (W // 2, H // 4), 480, palette["violet"], alpha=180)
    img.paste(glow, (0, 0), glow)
    glow2 = radial_glow(W, H, (int(W * 0.8), int(H * 0.7)), 380, palette["teal"], alpha=120)
    img.paste(glow2, (0, 0), glow2)
    img = img.convert("RGB")  # drop alpha so JPG save is clean
    draw = ImageDraw.Draw(img)

    # hook word (huge)
    f_hook = font_at(font_disp, 168)
    hw, hh = measure(draw, hook, f_hook)
    hx = (W - hw) // 2
    hy = 170
    # subtle dark shadow
    draw.text((hx + 4, hy + 4), hook, font=f_hook, fill=(0, 0, 0))
    draw.text((hx, hy), hook, font=f_hook, fill=palette["yellow"])

    # title (smaller, below)
    f_title = font_at(font_disp, 56)
    tw, th = measure(draw, title, f_title)
    tx = (W - tw) // 2
    ty = hy + hh + 30
    draw.text((tx, ty), title, font=f_title, fill=palette["paper"])

    # subtitle pill
    f_sub = font_at(font_body, 30)
    sw, sh = measure(draw, sub, f_sub)
    pad_x, pad_y = 36, 16
    pill_w = sw + pad_x * 2
    pill_h = sh + pad_y * 2
    px0 = (W - pill_w) // 2
    py0 = ty + th + 40
    draw_pill(draw, [px0, py0, px0 + pill_w, py0 + pill_h], pill_h // 2, palette["paper"])
    draw.text((px0 + pad_x, py0 + pad_y), sub, font=f_sub, fill=palette["ink"])

    img.save(out_path, "JPEG", quality=92, optimize=True, progressive=True)
    return img


def variant_B(out_path, title, hook, sub, font_disp, font_body, palette):
    """B: cream/paper bg, dark text, accent stripe at top — calmer, editorial."""
    W, H = 1280, 720
    img = Image.new("RGB", (W, H), hex_to_rgb(palette["paper"]))
    draw = ImageDraw.Draw(img)

    # accent stripe top
    stripe = palette.get("stripe", palette["indigo"])
    draw.rectangle([0, 0, W, 8], fill=hex_to_rgb(stripe))
    # accent dot bottom-right
    draw.ellipse([W - 220, H - 220, W - 20, H - 20], fill=hex_to_rgb(palette["yellow"]))

    # big hook (dark)
    f_hook = font_at(font_disp, 200)
    hw, hh = measure(draw, hook, f_hook)
    hx = (W - hw) // 2
    hy = 140
    # small accent underline
    draw.text((hx, hy), hook, font=f_hook, fill=hex_to_rgb(palette["ink"]))
    # accent rect under the hook
    underline_w = int(hw * 0.6)
    ux = hx + (hw - underline_w) // 2
    uy = hy + hh + 14
    draw.rectangle([ux, uy, ux + underline_w, uy + 8], fill=hex_to_rgb(stripe))

    # title (medium, dark)
    f_title = font_at(font_disp, 60)
    tw, th = measure(draw, title, f_title)
    tx = (W - tw) // 2
    ty = uy + 50
    draw.text((tx, ty), title, font=f_title, fill=hex_to_rgb(palette["ink"]))

    # subtitle (muted)
    f_sub = font_at(font_body, 32)
    sw, sh = measure(draw, sub, f_sub)
    sx = (W - sw) // 2
    sy = ty + th + 40
    draw.text((sx, sy), sub, font=f_sub, fill=hex_to_rgb(palette["muted"]))

    img.save(out_path, "JPEG", quality=92, optimize=True, progressive=True)
    return img


def variant_C(out_path, title, hook, sub, font_disp, font_body, palette):
    """C: dark ink bg, gradient text on hook word, teal glow — bold."""
    W, H = 1280, 720
    img = Image.new("RGB", (W, H), hex_to_rgb(palette["ink"]))
    # subtle glow
    glow = radial_glow(W, H, (W // 2, H // 3), 500, palette["indigo"], alpha=120)
    img.paste(glow, (0, 0), glow)
    glow2 = radial_glow(W, H, (int(W * 0.25), int(H * 0.85)), 380, palette["teal"], alpha=90)
    img.paste(glow2, (0, 0), glow2)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)

    # hook word — yellow + outline
    f_hook = font_at(font_disp, 180)
    hw, hh = measure(draw, hook, f_hook)
    hx = (W - hw) // 2
    hy = 160
    # 2px dark outline
    for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        draw.text((hx + dx, hy + dy), hook, font=f_hook, fill=(20, 20, 30))
    draw.text((hx, hy), hook, font=f_hook, fill=hex_to_rgb(palette["yellow"]))

    # title — paper, slightly smaller
    f_title = font_at(font_disp, 50)
    tw, th = measure(draw, title, f_title)
    tx = (W - tw) // 2
    ty = hy + hh + 30
    draw.text((tx, ty), title, font=f_title, fill=hex_to_rgb(palette["paper"]))

    # subtitle pill — teal
    f_sub = font_at(font_body, 28)
    sw, sh = measure(draw, sub, f_sub)
    pad_x, pad_y = 32, 14
    pill_w = sw + pad_x * 2
    pill_h = sh + pad_y * 2
    px0 = (W - pill_w) // 2
    py0 = ty + th + 36
    draw_pill(draw, [px0, py0, px0 + pill_w, py0 + pill_h], pill_h // 2, palette["teal"])
    draw.text((px0 + pad_x, py0 + pad_y), sub, font=f_sub, fill=hex_to_rgb(palette["ink"]))

    img.save(out_path, "JPEG", quality=92, optimize=True, progressive=True)
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", help="video dir, e.g. videos/video-2")
    ap.add_argument("--title", default="BLENDER PORTABLE")
    ap.add_argument("--hook",  default="5 DETIK")
    ap.add_argument("--sub",   default="cuma butuh 5 detik, lihat hasilnya")
    ap.add_argument("--variants", type=int, default=3, choices=[1, 2, 3])
    ap.add_argument("--letter", default=None, help="specific letter A/B/C (else render all --variants)")
    ap.add_argument(
        "--niche",
        default="affiliate",
        choices=["affiliate", "seo", "ai-news", "calm"],
        help="palette niche: affiliate (default energetic), seo (trust), ai-news (tech), calm (neutral)",
    )
    args = ap.parse_args()

    proj = args.project.rstrip("/")
    out_dir = os.path.join(proj, "packaging", "thumbs")
    os.makedirs(out_dir, exist_ok=True)

    palette = palette_for(args.niche)
    print(f"  niche: {args.niche}  ({NICHES[args.niche]['_label']})")

    font_disp = find_font(FONT_DISPLAY_CANDIDATES)
    font_body = find_font(FONT_BODY_CANDIDATES)

    variants = [args.letter] if args.letter else ["A", "B", "C"][: args.variants]
    builders = {"A": variant_A, "B": variant_B, "C": variant_C}

    for L in variants:
        fn = builders[L]
        out = os.path.join(out_dir, f"{L}.jpg")
        fn(out, args.title, args.hook, args.sub, font_disp, font_body, palette)
        sz = os.path.getsize(out)
        # re-encode down if > 2MB (YouTube max)
        if sz > 2_000_000:
            im = Image.open(out)
            for q in (88, 82, 76):
                im.save(out, "JPEG", quality=q, optimize=True, progressive=True)
                sz = os.path.getsize(out)
                if sz <= 2_000_000:
                    break
        print(f"  {L}.jpg  -> {os.path.relpath(out, ROOT)}  ({sz//1024}KB)")


if __name__ == "__main__":
    main()