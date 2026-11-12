#!/usr/bin/env python3
"""
pipeline/batch_generator_ray.py
Sends 620 video generation orders to Luma AI using the Ray Flash 2 model (1080p).
Saves progress to pipeline/generation_status.json after every submission.
IDEMPOTENT — safe to restart if interrupted. Resumes from where it stopped.

Usage:
  python3 pipeline/batch_generator_ray.py

Setup (pipeline/.env):
  RAY_API_KEY=your_luma_api_key_here

Cost note: Ray Flash 2 generates 10s clips. We send 1 clip per exercise.
For 30s loops, run this script 3 times with different variation suffixes
(or accept 10s clips playing on loop in the player).
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR     = Path(__file__).parent.parent
ORDERS_PATH  = Path(__file__).parent / "video_orders.json"
STATUS_PATH  = Path(__file__).parent / "generation_status.json"
ENV_PATH     = Path(__file__).parent / ".env"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
RAY_API_KEY  = os.getenv("RAY_API_KEY", "")
API_URL      = "https://api.lumalabs.ai/dream-machine/v1/generations"
SLEEP_OK     = 15   # seconds between successful submissions
SLEEP_RETRY  = 60   # seconds to wait on rate limit (429)
MAX_RETRIES  = 3

# Ray Flash 2 parameters
MODEL        = "ray-flash-2"
RESOLUTION   = "1080p"
DURATION     = "9s"    # 9s seamless loop per clip.
ASPECT_RATIO = "16:9"

# Visible Body style template — {grupo_articular} is substituted per entry
STYLE_SUFFIX_TEMPLATE = (
    "Scientific medical visualization, Visible Body style, "
    "semi-transparent skin revealing {grupo_articular} anatomy, "
    "hyper-realistic muscle fibers and bone textures, "
    "cinematic surgical studio lighting, 8K render, "
    "isolated on solid white background, "
    "seamless 9s loop, no human faces, "
    "focus only on the musculoskeletal action."
)

# Extra suffix for Canal B (osteopathy) entries
CANAL_B_SUFFIX = (
    "Show therapist hand placement, patient positioning, "
    "and corrective impulse in one fluid 9-second seamless loop."
)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def build_prompt(base_prompt: str, grupo_articular: str = "", canal: str = "A") -> str:
    style = STYLE_SUFFIX_TEMPLATE.format(grupo_articular=grupo_articular or "musculoskeletal")
    prompt = f"{base_prompt}. {style}"
    if canal == "B":
        prompt = f"{prompt} {CANAL_B_SUFFIX}"
    return prompt

def submit_to_ray(prompt: str) -> dict:
    """Submit a Ray Flash 2 generation. Returns API response dict."""
    headers = {
        "Authorization": f"luma-api-key {RAY_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "model":        MODEL,
        "prompt":       prompt,
        "aspect_ratio": ASPECT_RATIO,
        "resolution":   RESOLUTION,
        "duration":     DURATION,
        "loop":         True,
    }
    resp = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not RAY_API_KEY:
        print("ERROR: RAY_API_KEY not set in pipeline/.env")
        sys.exit(1)

    orders = load_json(ORDERS_PATH, [])
    if not orders:
        print("ERROR: pipeline/video_orders.json is empty. Run generate_video_orders.py first.")
        sys.exit(1)

    status = load_json(STATUS_PATH, {})

    already = sum(1 for v in status.values() if v.get("ray_id"))
    total   = len(orders)

    print(f"Therapia Global — Ray Flash 2 Batch Generator")
    print(f"Model: {MODEL} | Resolution: {RESOLUTION} | Duration: {DURATION} | Aspect: {ASPECT_RATIO}")
    print(f"Total orders: {total} | Already submitted: {already} | To submit: {total - already}")
    print("-" * 65)

    submitted = 0
    skipped   = 0
    failed    = 0

    for i, order in enumerate(orders, 1):
        registry_id = order["id"]
        raw_prompt  = order["prompt"]

        # ── Skip if already submitted ──────────────────────────────────────
        if registry_id in status and status[registry_id].get("ray_id"):
            skipped += 1
            continue

        grupo_articular = order.get("grupo_articular", "")
        canal_order     = order.get("canal", "A")
        enhanced_prompt = build_prompt(raw_prompt, grupo_articular, canal_order)
        print(f"[{i}/{total}] {registry_id} ({grupo_articular} / canal {canal_order})")

        # ── Submit with retry logic ────────────────────────────────────────
        ray_id = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                result = submit_to_ray(enhanced_prompt)
                ray_id = result.get("id", "")
                if not ray_id:
                    raise ValueError(f"No ID in response: {result}")
                break

            except requests.exceptions.HTTPError as e:
                if e.response is not None and e.response.status_code == 429:
                    print(f"  Rate limit (429) — waiting {SLEEP_RETRY}s before retry {attempt}/{MAX_RETRIES}...")
                    time.sleep(SLEEP_RETRY)
                elif attempt == MAX_RETRIES:
                    raise
                else:
                    print(f"  HTTP error attempt {attempt}/{MAX_RETRIES}: {e}")
                    time.sleep(10)

        if ray_id:
            status[registry_id] = {
                "ray_id":       ray_id,
                "status":       "queued",
                "video_url":    "",
                "downloaded":   False,
                "cloudflare_id": "",
            }
            submitted += 1
            print(f"  ✓ ray_id: {ray_id}")
        else:
            status[registry_id] = {
                "ray_id": "", "status": "error", "error": "max retries exceeded",
                "video_url": "", "downloaded": False, "cloudflare_id": "",
            }
            failed += 1
            print(f"  ✗ FAILED after {MAX_RETRIES} retries")

        # Save after every call — never lose progress
        save_json(STATUS_PATH, status)

        # Sleep between submissions (skip last)
        remaining = total - already - submitted - failed - skipped - (i - (already + submitted + failed + skipped))
        if submitted > 0 and remaining > 0:
            time.sleep(SLEEP_OK)

    print("-" * 65)
    print(f"Submitted this run : {submitted}")
    print(f"Skipped (done)     : {skipped}")
    print(f"Failed             : {failed}")
    print(f"Status file        : {STATUS_PATH}")
    if submitted > 0:
        print()
        print("Next step (run every 30-60 min until all downloaded):")
        print("  python3 pipeline/download_videos.py")

if __name__ == "__main__":
    main()
