#!/usr/bin/env python3
"""
pipeline/validar_trifecta.py
Lanza 3 jobs simultáneos a Ray Flash 2 (uno por canal A/B/C) y descarga los resultados.
Idempotente — si se interrumpe, reanuda desde pipeline/trifecta_state.json.

Usage:
  python3 pipeline/validar_trifecta.py
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests

# ─── Paths ────────────────────────────────────────────────────────────────────
PIPELINE_DIR = Path(__file__).parent
ENV_PATH     = PIPELINE_DIR / ".env"
CONFIG_PATH  = PIPELINE_DIR / "PROMPTS_CONFIG.json"
STATE_PATH   = PIPELINE_DIR / "trifecta_state.json"
OUTPUT_DIR   = Path.home() / "Desktop" / "VALIDACION_TRIFECTA"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
RAY_API_KEY = os.getenv("RAY_API_KEY", "")
API_URL     = "https://api.lumalabs.ai/dream-machine/v1/generations"
POLL_EVERY  = 30   # seconds between status checks

# ─── Jobs ─────────────────────────────────────────────────────────────────────
JOBS = [
    {
        "id":       "A",
        "canal":    "CANAL_A_EJERCICIO",
        "tecnica":  "Full-body burpee with solid dumbbells on a Bosu ball. Correct collision physics and seamless 9s loop.",
        "output":   "VIDEO_CANAL_A_BURPEE.mp4",
    },
    {
        "id":       "B",
        "canal":    "CANAL_B_OSTEOPATIA",
        "tecnica":  "Cervical spine HVLA mobilization. Therapist hands placed firmly on the atlas vertebra performing a high-velocity thrust.",
        "output":   "VIDEO_CANAL_B_OSTEOPATIA.mp4",
    },
    {
        "id":       "C",
        "canal":    "CANAL_C_ESTIRAMIENTO",
        "tecnica":  "Standing hamstring stretch. Model leans forward, back straight, glowing cyan in the posterior leg muscles.",
        "output":   "VIDEO_CANAL_C_ESTIRAMIENTO.mp4",
    },
]

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def ray_headers():
    return {
        "Authorization": f"luma-api-key {RAY_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

def submit(prompt: str) -> str:
    payload = {
        "model":        "ray-flash-2",
        "prompt":       prompt,
        "aspect_ratio": "16:9",
        "resolution":   "1080p",
        "duration":     "9s",
        "loop":         True,
    }
    resp = requests.post(API_URL, headers=ray_headers(), json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()["id"]

def check_status(ray_id: str) -> dict:
    resp = requests.get(f"{API_URL}/{ray_id}", headers=ray_headers(), timeout=30)
    resp.raise_for_status()
    return resp.json()

def download(url: str, dest: Path):
    resp = requests.get(url, stream=True, timeout=120)
    resp.raise_for_status()
    total = int(resp.headers.get("content-length", 0))
    downloaded = 0
    with open(dest, "wb") as f:
        for chunk in resp.iter_content(chunk_size=1024 * 64):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f"\r    {dest.name}: {pct:.1f}%", end="", flush=True)
    print(f"\r    ✅ {dest.name} ({downloaded // 1024} KB)")

def status_line(state):
    parts = []
    for job in JOBS:
        jid = job["id"]
        s = state.get(jid, {})
        if s.get("downloaded"):
            parts.append(f"[{jid}: ✅ done]")
        elif s.get("ray_id"):
            parts.append(f"[{jid}: {s.get('state', 'queued')}]")
        else:
            parts.append(f"[{jid}: pending]")
    return "  ".join(parts)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not RAY_API_KEY:
        print("ERROR: RAY_API_KEY not set in pipeline/.env")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    config = load_json(CONFIG_PATH, {})
    state  = load_json(STATE_PATH, {})

    # ── STEP 1: Submit all jobs (parallel — no sleep between) ─────────────────
    print("=" * 60)
    print("  VALIDACIÓN TRIFECTA — Ray Flash 2")
    print("=" * 60)
    print()
    print("[1/3] Enviando los 3 jobs a Ray Flash 2...")

    for job in JOBS:
        jid = job["id"]
        if state.get(jid, {}).get("ray_id"):
            print(f"  Canal {jid}: ya enviado → {state[jid]['ray_id'][:8]}... (skip)")
            continue

        canal_cfg = config.get(job["canal"], {})
        style     = canal_cfg.get("style", "")
        prompt    = f"{job['tecnica']} {style}"

        print(f"  Canal {jid} ({job['canal']})... ", end="", flush=True)
        try:
            ray_id = submit(prompt)
            state[jid] = {"ray_id": ray_id, "state": "queued", "downloaded": False}
            save_json(STATE_PATH, state)
            print(f"✓ {ray_id[:8]}...")
        except Exception as e:
            print(f"✗ ERROR: {e}")
            state[jid] = {"ray_id": "", "state": "error", "downloaded": False}
            save_json(STATE_PATH, state)

    # ── STEP 2: Poll until all complete ───────────────────────────────────────
    print()
    print("[2/3] Generando... (poll cada 30s)")

    while True:
        all_done = True

        for job in JOBS:
            jid = job["id"]
            s   = state.get(jid, {})

            if s.get("downloaded") or not s.get("ray_id"):
                continue

            all_done = False

            try:
                info = check_status(s["ray_id"])
                s["state"] = info.get("state", "unknown")
                state[jid] = s

                if info["state"] == "completed":
                    video_url = info.get("assets", {}).get("video")
                    if video_url:
                        s["video_url"] = video_url
                        state[jid] = s
                        save_json(STATE_PATH, state)

                elif info["state"] == "failed":
                    reason = info.get("failure_reason", "unknown")
                    print(f"\n  Canal {jid}: ✗ FAILED — {reason}")
                    s["downloaded"] = True  # mark done so we skip it
                    state[jid] = s
                    save_json(STATE_PATH, state)

            except Exception as e:
                print(f"\n  Canal {jid}: poll error — {e}")

        print(f"  {status_line(state)}", flush=True)

        # Download any completed-but-not-downloaded
        for job in JOBS:
            jid  = job["id"]
            s    = state.get(jid, {})
            dest = OUTPUT_DIR / job["output"]

            if s.get("state") == "completed" and not s.get("downloaded") and s.get("video_url"):
                print(f"\n[3/3] Descargando Canal {jid}...")
                try:
                    download(s["video_url"], dest)
                    s["downloaded"] = True
                    state[jid] = s
                    save_json(STATE_PATH, state)
                except Exception as e:
                    print(f"  ✗ Error descargando: {e}")

        # Check if all jobs finished
        all_done = all(
            state.get(j["id"], {}).get("downloaded")
            for j in JOBS
            if state.get(j["id"], {}).get("ray_id")
        )

        if all_done:
            break

        time.sleep(POLL_EVERY)

    # ── STEP 3: Summary ───────────────────────────────────────────────────────
    print()
    print("=" * 60)
    print("  TRIFECTA COMPLETA")
    print("=" * 60)
    for job in JOBS:
        dest = OUTPUT_DIR / job["output"]
        size = f"{dest.stat().st_size // 1024} KB" if dest.exists() else "MISSING"
        print(f"  {job['output']}: {size}")
    print()
    print(f"  📁 {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
