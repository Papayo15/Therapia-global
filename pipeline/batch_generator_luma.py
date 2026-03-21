#!/usr/bin/env python3
"""
pipeline/batch_generator_luma.py
Sends 620 video generation orders to Luma AI Dream Machine API.
Saves progress to pipeline/generation_status.json after every submission.
IDEMPOTENT — safe to restart if interrupted.

Usage:
  python3 pipeline/batch_generator_luma.py

Setup:
  Create pipeline/.env with:
    LUMA_API_KEY=your_key_here
"""

import json
import os
import time
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).parent.parent
ORDERS_PATH    = Path(__file__).parent / "video_orders.json"
STATUS_PATH    = Path(__file__).parent / "generation_status.json"
ENV_PATH       = Path(__file__).parent / ".env"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
LUMA_API_KEY = os.getenv("LUMA_API_KEY", "")
LUMA_API_URL = "https://api.lumalabs.ai/dream-machine/v1/generations"
SLEEP_BETWEEN = 20  # seconds between submissions (respect rate limit)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def submit_to_luma(prompt: str, registry_id: str) -> dict:
    """Submit a generation request to Luma AI. Returns the API response."""
    headers = {
        "Authorization": f"luma-api-key {LUMA_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "prompt": prompt,
        "aspect_ratio": "16:9",
        "loop": True,
    }
    response = requests.post(LUMA_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not LUMA_API_KEY:
        print("ERROR: LUMA_API_KEY not set in pipeline/.env")
        sys.exit(1)

    orders = load_json(ORDERS_PATH, [])
    if not orders:
        print("ERROR: pipeline/video_orders.json is empty or missing. Run generate_video_orders.py first.")
        sys.exit(1)

    status = load_json(STATUS_PATH, {})

    total    = len(orders)
    skipped  = 0
    submitted = 0
    failed   = 0

    print(f"Therapia Global — Luma AI Batch Generator")
    print(f"Orders: {total} | Already submitted: {sum(1 for v in status.values() if v.get('luma_id'))}")
    print(f"Sleep between submissions: {SLEEP_BETWEEN}s")
    print("-" * 60)

    for i, order in enumerate(orders, 1):
        registry_id = order["id"]
        prompt      = order["prompt"]

        # ── Skip if already submitted ──────────────────────────────────────
        if registry_id in status and status[registry_id].get("luma_id"):
            skipped += 1
            continue

        print(f"[{i}/{total}] Submitting {registry_id}...")

        try:
            result = submit_to_luma(prompt, registry_id)
            luma_id = result.get("id", "")

            if not luma_id:
                raise ValueError(f"No ID in response: {result}")

            status[registry_id] = {
                "luma_id":     luma_id,
                "status":      result.get("state", "queued"),
                "video_url":   "",
                "downloaded":  False,
                "cloudflare_id": "",
            }
            submitted += 1
            print(f"  ✓ {registry_id} → luma_id: {luma_id}")

        except requests.exceptions.HTTPError as e:
            failed += 1
            status[registry_id] = {"luma_id": "", "status": "error", "error": str(e),
                                    "video_url": "", "downloaded": False, "cloudflare_id": ""}
            print(f"  ✗ HTTP error for {registry_id}: {e}")

        except Exception as e:
            failed += 1
            status[registry_id] = {"luma_id": "", "status": "error", "error": str(e),
                                    "video_url": "", "downloaded": False, "cloudflare_id": ""}
            print(f"  ✗ Error for {registry_id}: {e}")

        # Save after every submission — safe to interrupt
        save_json(STATUS_PATH, status)

        if i < total and submitted > 0:
            print(f"  Waiting {SLEEP_BETWEEN}s before next submission...")
            time.sleep(SLEEP_BETWEEN)

    print("-" * 60)
    print(f"Done.")
    print(f"  Submitted this run: {submitted}")
    print(f"  Skipped (already done): {skipped}")
    print(f"  Failed: {failed}")
    print(f"  Status saved to: {STATUS_PATH}")
    print()
    print("Next step:")
    print("  python3 pipeline/download_videos.py")

if __name__ == "__main__":
    main()
