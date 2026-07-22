#!/usr/bin/env python3
"""
gen_sfx.py — grow the shared SFX library (media/library/sfx/) from a palette spec,
sourcing clips from Freesound (CC0 / CC-BY) instead of ElevenLabs.

Step-4 (SFX) library builder for the AI Video Editor. Reads media/library/sfx/palette.json
(generic, reusable sound recipes), and for every sound that is NOT already on disk it
fetches a matching clip from Freesound via the public API (https://freesound.org/apiv2/),
peak-normalizes it for consistent mixing headroom, measures duration + loudness, and
(re)writes media/library/sfx/catalog.json — the library manifest that tools/mix_sfx.py
reads.

LIBRARY-FIRST: existing clips are skipped (never re-billed) unless --force. The library
is the durable, cross-project asset; each video is one draw from it.

Search strategy per palette entry:
  - Extract search keywords from the sound's id (split on '-', drop suffixes like 'soft'),
    tags, and the leading words of the prompt (the prose often names the sound directly:
    "A short, soft air whoosh ..." -> ['whoosh', 'soft', 'air']).
  - Search Freesound with those keywords + a duration filter (target_dur * 0.5 .. * 1.8).
  - Pick the best CC0 / CC-BY result closest in duration; license-penalize CC-BY so CC0 wins
    on equal duration. Skip results flagged non-commercial (NC) — YouTube-safe needs CC0/CC-BY.

Usage:
  python tools/gen_sfx.py                 # fetch any missing palette sounds from Freesound
  python tools/gen_sfx.py --force         # refetch all (re-downloads, may pick different clip)
  python tools/gen_sfx.py --only id1,id2  # just these ids
  python tools/gen_sfx.py --dry-run       # show what WOULD be fetched, no API calls
  python tools/gen_sfx.py --renorm        # re-balance existing clips to target LUFS, no API

Needs FREESOUND_API_TOKEN in .env (see .env.example). ffmpeg/ffprobe on PATH.
"""
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "media", "library", "sfx")
PALETTE = os.path.join(SFX_DIR, "palette.json")
CATALOG = os.path.join(SFX_DIR, "catalog.json")
API_BASE = "https://freesound.org/apiv2"

# license filtering — what Freesound returns in `license` field:
#   "Creative Commons 0"          -> CC0, OK for any use
#   "Attribution"                 -> CC-BY, OK with credit
#   "Attribution NonCommercial"   -> CC-BY-NC, NOT OK for monetized YouTube (skip)
#   "NonCommercial"               -> skip
PREFERRED_LICENSE_ORDER = {
    "Creative Commons 0": 0,
    "Attribution": 1,
    "Sampling+": 9,  # also-OK but unusual for SFX
}


def load_env():
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1).strip() if False else line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def run_capture(cmd):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe_duration(path):
    out = run_capture(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                       "-of", "default=nw=1:nk=1", path]).strip()
    try:
        return round(float(out), 3)
    except ValueError:
        return None


def measure_peak_db(path):
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect",
                       "-f", "null", os.devnull])
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", out)
    return float(m.group(1)) if m else None


def measure_lufs(path):
    """Best-effort integrated loudness (ebur128). Unreliable for <1s transients; informational."""
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", os.devnull])
    ms = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", out)
    try:
        return float(ms[-1]) if ms else None
    except ValueError:
        return None


def apply_gain(path, gain_db):
    if abs(gain_db) < 0.1:
        return True
    tmp = path + ".norm.mp3"
    run_capture(["ffmpeg", "-y", "-hide_banner", "-i", path, "-af", f"volume={gain_db:.2f}dB",
                 "-c:a", "libmp3lame", "-q:a", "2", tmp])
    if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
        return True
    if os.path.exists(tmp):
        os.remove(tmp)
    return False


def normalize_clip(path, target_lufs, ceiling_db):
    """Loudness-normalize to target_lufs so gain_db in a plan is perceptually meaningful,
    but never let the peak exceed ceiling_db (single re-encode). Falls back to a plain
    peak-to-ceiling normalize for transients too short for a reliable ebur128 reading."""
    lufs = measure_lufs(path)
    peak = measure_peak_db(path)
    if peak is None:
        return None, None
    if lufs is None or lufs < -50:  # ebur128 gated the clip — peak-normalize instead
        apply_gain(path, ceiling_db - peak)
    else:
        gain = target_lufs - lufs
        if peak + gain > ceiling_db:      # would clip -> clamp to the ceiling
            gain = ceiling_db - peak
        apply_gain(path, gain)
    return measure_lufs(path), measure_peak_db(path)


# ---------- Freesound search + download --------------------------------------

STOPWORDS = {"a", "an", "the", "for", "of", "with", "and", "or", "in", "on", "to", "is", "it",
             "this", "that", "as", "at", "by", "be", "not", "no", "but", "from", "into",
             "soft", "premium", "restrained", "single", "gentle", "subtle", "calm", "clean",
             "high", "low", "very", "like", "app", "menu", "high-end", "understated", "rounded",
             "warm", "smooth", "gentle", "short", "long", "tiny", "small", "subtle", "dry",
             "deep", "drawn-out", "music", "sound", "sound.", "sound.", "sound,"}


def extract_keywords(sound: dict) -> list[str]:
    """Derive a small keyword set from id + tags + prompt leading words. Ordered by priority."""
    kws: list[str] = []

    # 1) id (drop generic suffixes like 'soft', numeric suffixes, etc.)
    for tok in re.split(r"[-_]", sound["id"]):
        tok = tok.lower().strip()
        if tok and tok not in STOPWORDS and not tok.isdigit():
            kws.append(tok)

    # 2) tags (already keyword-shaped)
    for tag in sound.get("tags", []):
        tag = tag.lower().strip()
        if tag and tag not in STOPWORDS and tag not in kws:
            kws.append(tag)

    # 3) prompt: pull the first ~10 content words (skip stopwords + pure-punctuation tokens)
    prompt_words = re.findall(r"[a-z][a-z'-]+", sound.get("prompt", "").lower())
    for w in prompt_words[:30]:
        if w not in STOPWORDS and w not in kws and len(w) > 2:
            kws.append(w)
            if len(kws) >= 10:
                break

    return kws[:8]


def search_freesound(token: str, keywords: list[str], target_dur: float) -> list[dict]:
    """Return up to 15 candidate clips from Freesound, sorted by suitability."""
    # duration filter: target * 0.5 to target * 1.8 (broader on the long side for fades)
    dmin, dmax = round(target_dur * 0.5, 2), round(target_dur * 1.8, 2)
    q = " ".join(keywords[:5])  # top 5 keywords
    params = {
        "query": q,
        "filter": f"duration:[{dmin} TO {dmax}]",
        "fields": "id,name,duration,license,username,previews,tags",
        "sort": "rating_desc",
        "page_size": "15",
        "token": token,
    }
    url = f"{API_BASE}/search/?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "claude-youtube-editor/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
    return data.get("results", [])


def rank_results(results: list[dict], target_dur: float) -> dict | None:
    """Pick the best result: prefer CC0 (license rank 0), then shortest duration gap."""
    if not results:
        return None
    def score(r):
        lic_rank = PREFERRED_LICENSE_ORDER.get(r.get("license", ""), 99)
        dur_gap = abs(float(r.get("duration", 0)) - target_dur)
        return (lic_rank, dur_gap)
    return sorted(results, key=score)[0]


def download_preview(url: str, dest: str) -> bool:
    """Download a Freesound preview MP3 to dest."""
    req = urllib.request.Request(url, headers={"User-Agent": "claude-youtube-editor/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            with open(dest, "wb") as f:
                while True:
                    chunk = resp.read(1 << 16)
                    if not chunk:
                        break
                    f.write(chunk)
        return os.path.exists(dest) and os.path.getsize(dest) > 1024
    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        sys.stderr.write(f"  download failed: {e}\n")
        if os.path.exists(dest):
            os.remove(dest)
        return False


def fetch_from_freesound(token: str, sound: dict) -> tuple[bytes | None, dict]:
    """Search + rank + download. Returns (mp3_bytes_or_None, source_meta)."""
    kws = extract_keywords(sound)
    target_dur = float(sound.get("duration_s", 1.0))
    print(f"  searching Freesound: {kws[:5]}  (target {target_dur:.1f}s)")
    try:
        results = search_freesound(token, kws, target_dur)
    except (urllib.error.HTTPError, urllib.error.URLError) as e:
        return None, {"error": f"freesound search failed: {e}"}
    if not results:
        return None, {"error": "no results"}
    best = rank_results(results, target_dur)
    if not best:
        return None, {"error": "no rankable result"}
    preview_url = best.get("previews", {}).get("preview-hq-mp3") or best.get("previews", {}).get("preview-lq-mp3")
    if not preview_url:
        return None, {"error": "no preview URL"}
    license_name = best.get("license", "unknown")
    fname = best.get("name", "")
    fs_id = best.get("id")
    print(f"  -> picked id={fs_id}  dur={best.get('duration', 0):.2f}s  license={license_name}  name={fname!r}")
    tmp = os.path.join(SFX_DIR, "clips", f"._tmp_{sound['id']}.mp3")
    ok = download_preview(preview_url, tmp)
    if not ok:
        return None, {"error": "download failed"}
    with open(tmp, "rb") as f:
        data = f.read()
    os.remove(tmp)
    meta = {
        "freesound_id": fs_id,
        "name": fname,
        "duration_s": best.get("duration"),
        "license": license_name,
        "username": best.get("username"),
        "tags": best.get("tags", []),
        "page": f"https://freesound.org/people/{best.get('username', '')}/sounds/{fs_id}/",
    }
    return data, meta


# ---------- Main --------------------------------------------------------------

def main():
    args = sys.argv[1:]
    force = "--force" in args
    dry = "--dry-run" in args
    renorm = "--renorm" in args
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))

    with open(PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    target_lufs = d.get("target_lufs", -20.0)
    ceiling_db = d.get("ceiling_dbfs", -1.5)

    catalog = {"note": "", "clips": []}
    if os.path.exists(CATALOG):
        with open(CATALOG, encoding="utf-8") as f:
            catalog = json.load(f)
    catalog["note"] = ("Shared SFX library manifest for the AI Video Editor. Sourced from "
                       "Freesound (CC0 / CC-BY previews) by tools/gen_sfx.py — each clip is "
                       "loudness-normalized mp3 in media/library/sfx/clips/. Read by "
                       "tools/mix_sfx.py and /suggest-sfx. Grows every video (library-first). "
                       f"Loudness-normalized to ~{target_lufs} LUFS with a {ceiling_db} dBFS peak "
                       "ceiling, so a plan's per-cue gain_db is perceptually meaningful "
                       "(see each video's sfx-plan.json).")
    by_id = {c["id"]: c for c in catalog.get("clips", [])}

    clips_dir = os.path.join(SFX_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    env = load_env()
    token = env.get("FREESOUND_API_TOKEN", "").strip()

    def entry(s, rel, path, source_meta):
        lufs, peak = normalize_clip(path, target_lufs, ceiling_db)
        dur = probe_duration(path)
        print(f"   {s['id']}: dur={dur}s  peak={peak}dBFS  lufs={lufs}")
        lic = source_meta.get("license", "unknown")
        entry_out = {
            "id": s["id"], "file": rel, "category": s.get("category", ""),
            "tags": s.get("tags", []), "duration_s": dur, "peak_dbfs": peak,
            "loudness_lufs": lufs,
            "source": "freesound",
            "model": "freesound-search",
            "license": lic,
            "license_url": source_meta.get("page", ""),
            "freesound_id": source_meta.get("freesound_id"),
            "freesound_name": source_meta.get("name"),
            "freesound_user": source_meta.get("username"),
            "search_keywords": extract_keywords(s)[:5],
            "prompt": s["prompt"], "used_in": by_id.get(s["id"], {}).get("used_in", []),
        }
        return entry_out

    def write_catalog():
        order = [s["id"] for s in palette["sounds"]]
        catalog["clips"] = ([by_id[i] for i in order if i in by_id]
                            + [c for i, c in by_id.items() if i not in order])
        with open(CATALOG, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"\ncatalog -> {os.path.relpath(CATALOG, ROOT)}  ({len(catalog['clips'])} clips)")

    if renorm:
        n = 0
        for s in palette["sounds"]:
            if only and s["id"] not in only:
                continue
            rel = f"clips/{s['id']}.mp3"
            path = os.path.join(SFX_DIR, rel)
            if not os.path.exists(path):
                continue
            # Re-use existing source meta from the catalog
            existing = by_id.get(s["id"], {})
            by_id[s["id"]] = entry(s, rel, path, {
                "license": existing.get("license", "unknown"),
                "page": existing.get("license_url", ""),
                "freesound_id": existing.get("freesound_id"),
                "name": existing.get("freesound_name"),
                "username": existing.get("freesound_user"),
            })
            n += 1
        print(f"re-normalized {n} clips to ~{target_lufs} LUFS (ceiling {ceiling_db} dBFS)")
        write_catalog()
        return

    todo, skip, existing_missing = [], [], []
    for s in palette["sounds"]:
        if only and s["id"] not in only:
            continue
        rel = f"clips/{s['id']}.mp3"
        path = os.path.join(SFX_DIR, rel)
        if os.path.exists(path) and not force:
            skip.append(s["id"])
            continue
        todo.append((s, rel, path))

    print(f"palette: {len(palette['sounds'])} sounds | to fetch: {len(todo)} | skip (exist): {len(skip)}")
    if skip:
        print("  skipping (library-first):", ", ".join(skip))
    if dry:
        for s, rel, _ in todo:
            kws = extract_keywords(s)
            print(f"  WOULD fetch {s['id']} -> {rel}  ({s['duration_s']}s)  keywords={kws[:5]}")
        return
    if todo and not token:
        sys.exit("FREESOUND_API_TOKEN not set in .env — cannot search. (Add it, or use --dry-run.)")

    for s, rel, path in todo:
        print(f"\n-> {s['id']}  ({s['duration_s']}s)")
        audio, source_meta = fetch_from_freesound(token, s)
        if audio is None:
            print(f"  SKIP: {source_meta.get('error', '?')}")
            continue
        with open(path, "wb") as f:
            f.write(audio)
        by_id[s["id"]] = entry(s, rel, path, source_meta)

    write_catalog()


if __name__ == "__main__":
    main()