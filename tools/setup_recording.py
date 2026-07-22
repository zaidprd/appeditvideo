#!/usr/bin/env python3
"""
setup_recording.py — verify recording setup for short-form content.

Usage:
  python tools/setup_recording.py path/to/test-recording.mp4
  python tools/setup_recording.py --standards   # print the recommended settings

Checks:
1. Resolution is portrait (height > width)
2. Frame rate is 30 (or warns if 24/60)
3. Audio peak < -3 dBFS (no clipping)
4. Audio RMS in -20 to -10 dBFS (good voice level)
5. Duration >= 5s (real test, not test pattern)
6. Codec is H.264 (universal compatibility)

Print:
  PASS: <check>
  WARN: <check> — <advice>
  FAIL: <check> — <fix>
"""
import subprocess
import sys
import os
import json


def ffprobe_json(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path],
        capture_output=True, text=True, check=True
    )
    return json.loads(r.stdout)


def main():
    args = sys.argv[1:]
    if "--standards" in args:
        print(__doc__.split("Usage:")[1].split("Checks:")[0])
        return
    if not args:
        sys.exit("usage: setup_recording.py test.mp4  OR  --standards")
    path = args[0]
    if not os.path.exists(path):
        sys.exit(f"file not found: {path}")

    info = ffprobe_json(path)
    streams = info.get("streams", [])
    v = next((s for s in streams if s["codec_type"] == "video"), None)
    a = next((s for s in streams if s["codec_type"] == "audio"), None)
    fmt = info.get("format", {})

    if not v:
        sys.exit("no video stream found")

    print(f"=== {os.path.basename(path)} ===")
    print(f"  resolution:  {v['width']}x{v['height']}")
    print(f"  codec:       {v['codec_name']}")
    print(f"  frame rate:  {v.get('r_frame_rate', '?')}")
    print(f"  duration:    {fmt.get('duration', '?')}s")
    if a:
        print(f"  audio:       {a['codec_name']} {a.get('sample_rate','?')}Hz {a.get('channels','?')}ch")
    print()

    checks = []

    # 1. Portrait orientation
    if v["height"] > v["width"]:
        checks.append(("PASS", "portrait orientation", f"{v['width']}x{v['height']}"))
    else:
        checks.append(("WARN", "portrait orientation", f"got {v['width']}x{v['height']}, want 1080x1920 — rotate HP or set portrait in camera"))

    # 2. Resolution (warn if not 1080p)
    if v["width"] == 1080 and v["height"] == 1920:
        checks.append(("PASS", "resolution 1080x1920", ""))
    else:
        checks.append(("WARN", "resolution", f"got {v['width']}x{v['height']}, want 1080x1920 — set HP to FHD portrait"))

    # 3. Frame rate
    fps_str = v.get("r_frame_rate", "")
    if fps_str == "30/1":
        checks.append(("PASS", "frame rate 30fps", ""))
    elif fps_str == "60/1":
        checks.append(("WARN", "frame rate 60fps", "file 2x lebih besar; ok tapi 30fps cukup untuk short-form"))
    elif fps_str == "24/1":
        checks.append(("WARN", "frame rate 24fps", "cinematic feel; untuk tutorial 30fps lebih natural"))
    else:
        checks.append(("WARN", "frame rate", f"got {fps_str}, want 30/1 — set HP ke 30fps"))

    # 4. Codec
    if v["codec_name"] == "h264":
        checks.append(("PASS", "codec H.264", "universal compatibility"))
    elif v["codec_name"] == "hevc":
        checks.append(("WARN", "codec HEVC", "bagus untuk size, tapi beberapa editor lama tidak support"))
    else:
        checks.append(("WARN", "codec", f"got {v['codec_name']}, prefer H.264"))

    # 5. Duration
    try:
        dur = float(fmt.get("duration", 0))
        if dur >= 5:
            checks.append(("PASS", f"duration {dur:.1f}s", "real recording detected"))
        else:
            checks.append(("WARN", "duration", f"{dur:.1f}s — too short for voice level check"))
    except ValueError:
        checks.append(("?", "duration", "could not parse"))

    # 6. Audio level
    if a:
        # Extract audio to temp WAV and check peak/RMS via numpy
        try:
            import numpy as np
            import wave
            tmp = path + ".tmp.wav"
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error",
                "-i", path, "-ar", "48000", "-ac", "1", "-f", "wav", tmp
            ], check=True)
            with wave.open(tmp, "rb") as w:
                n = w.getnframes()
                frames = w.readframes(n)
            os.remove(tmp)
            a_arr = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
            peak_db = 20 * np.log10(np.max(np.abs(a_arr)) + 1e-12)
            rms_db = 20 * np.log10(np.sqrt(np.mean(a_arr * a_arr)) + 1e-12)

            if peak_db > -3:
                checks.append(("FAIL", f"audio peak {peak_db:.1f} dBFS", "clipping! turunkan input gain atau mundur dari mic"))
            elif peak_db > -6:
                checks.append(("WARN", f"audio peak {peak_db:.1f} dBFS", "hot — sedikit clipping risk"))
            else:
                checks.append(("PASS", f"audio peak {peak_db:.1f} dBFS", "safe headroom"))

            if rms_db < -30:
                checks.append(("WARN", f"audio rms {rms_db:.1f} dBFS", "voice terlalu pelan — mungkin perlu di-boost nanti"))
            elif rms_db > -10:
                checks.append(("WARN", f"audio rms {rms_db:.1f} dBFS", "voice terlalu keras — bisa distorsi"))
            else:
                checks.append(("PASS", f"audio rms {rms_db:.1f} dBFS", "good voice level"))
        except Exception as e:
            checks.append(("?", "audio level", f"check failed: {e}"))

    # Print
    status_sym = {"PASS": "PASS", "WARN": "WARN", "FAIL": "FAIL", "?": "?"}
    for status, name, note in checks:
        sym = status_sym[status]
        line = f"  [{sym}] {name}"
        if note:
            line += f" — {note}"
        print(line)

    # Final verdict
    fails = sum(1 for s, _, _ in checks if s in ("FAIL",))
    warns = sum(1 for s, _, _ in checks if s in ("WARN",))
    print()
    if fails == 0 and warns == 0:
        print("PASS: ALL CHECKS PASS — recording setup siap untuk produksi.")
    elif fails == 0:
        print(f"WARN: {warns} warning(s) — bisa lanjut, tapi idealnya diperbaiki dulu.")
    else:
        print(f"FAIL: {fails} failure(s) — fix dulu sebelum produksi.")


if __name__ == "__main__":
    main()