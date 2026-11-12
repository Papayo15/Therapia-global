#!/usr/bin/env python3
"""
pipeline/test_single_video.py
Proof-of-Concept: Renders ONE video (A_CER_001) with the exact Visible Body style.
Submits to Ray Flash 2 → polls until complete → downloads MP4.

Purpose: Validate semi-transparent anatomy on white background BEFORE batch submission.

Usage:
  python3 pipeline/test_single_video.py

Output:
  public/videos/A_CER_001.mp4
  pipeline/poc_status.json
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests
from tqdm import tqdm

# ─── Config ───────────────────────────────────────────────────────────────────
ENV_PATH        = Path(__file__).parent / ".env"
ORDERS_PATH     = Path(__file__).parent / "video_orders.json"
POC_STATUS_PATH = Path(__file__).parent / "poc_status.json"
VIDEOS_DIR      = Path(__file__).parent.parent / "public" / "videos"

load_dotenv(ENV_PATH)
RAY_API_KEY = os.getenv("RAY_API_KEY", "")
API_URL     = "https://api.lumalabs.ai/dream-machine/v1/generations"

REGISTRY_ID     = "A_CER_001"
GRUPO_ARTICULAR = "cervical"
MODEL           = "ray-flash-2"
RESOLUTION      = "1080p"
DURATION        = "9s"
ASPECT_RATIO    = "16:9"
POLL_INTERVAL   = 60   # seconds between status polls

VISIBLE_BODY_STYLE = (
    f"Scientific medical visualization, Visible Body style, "
    f"semi-transparent skin revealing {GRUPO_ARTICULAR} anatomy, "
    "hyper-realistic muscle fibers and bone textures, "
    "cinematic surgical studio lighting, 8K render, "
    "isolated on solid white background, "
    "seamless 9s loop, no human faces, "
    "focus only on the musculoskeletal action."
)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path, default=None):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else {}

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_base_prompt():
    """Load base prompt for A_CER_001 from video_orders.json."""
    orders = load_json(ORDERS_PATH, [])
    for order in orders:
        if order.get("id") == REGISTRY_ID:
            return order.get("prompt", "")
    return f"Cervical spine therapeutic exercise, neutral neck position, controlled movement"

def submit_video(prompt: str) -> str:
    """Submit to Ray Flash 2. Returns ray_id."""
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
    result = resp.json()
    ray_id = result.get("id", "")
    if not ray_id:
        raise ValueError(f"No ID in response: {result}")
    return ray_id

def poll_status(ray_id: str) -> dict:
    """Check generation status. Returns full API response."""
    headers = {
        "Authorization": f"luma-api-key {RAY_API_KEY}",
        "Accept": "application/json",
    }
    resp = requests.get(f"{API_URL}/{ray_id}", headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()

def download_file(url: str, dest: Path):
    """Stream-download with progress bar."""
    response = requests.get(url, stream=True, timeout=120)
    response.raise_for_status()
    total_size = int(response.headers.get("content-length", 0))
    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(dest, "wb") as f, tqdm(
        total=total_size, unit="B", unit_scale=True,
        desc=dest.name, leave=False
    ) as bar:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            bar.update(len(chunk))

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not RAY_API_KEY:
        print("ERROR: RAY_API_KEY not set in pipeline/.env")
        sys.exit(1)

    print("=" * 65)
    print("Therapia Global — PoC: Visible Body Style Test")
    print(f"Exercise : {REGISTRY_ID}  |  Model: {MODEL} {RESOLUTION} {DURATION}")
    print("=" * 65)

    poc = load_json(POC_STATUS_PATH)

    # Resume: already submitted?
    ray_id = poc.get("ray_id", "")
    if ray_id:
        print(f"Resuming: ray_id = {ray_id}")
    else:
        base_prompt = get_base_prompt()
        full_prompt = f"{base_prompt}. {VISIBLE_BODY_STYLE}"
        print(f"\nPrompt:\n  {full_prompt[:120]}...")
        print("\nSubmitting to Ray Flash 2...")
        ray_id = submit_video(full_prompt)
        poc = {"ray_id": ray_id, "status": "queued", "prompt": full_prompt}
        save_json(POC_STATUS_PATH, poc)
        print(f"✓ Submitted — ray_id: {ray_id}")

    # Poll until complete
    dest = VIDEOS_DIR / f"{REGISTRY_ID}.mp4"
    if dest.exists() and dest.stat().st_size > 0:
        print(f"\n✓ Already downloaded: {dest} ({dest.stat().st_size // 1024}KB)")
        print("\nPoC complete! Review the video and approve visual style before batch.")
        return

    print(f"\nPolling every {POLL_INTERVAL}s (Ray Flash 2: ~5-8 min per clip)...")
    attempt = 0
    while True:
        attempt += 1
        result = poll_status(ray_id)
        state  = result.get("state", "unknown")
        print(f"  [{attempt}] State: {state}")

        if state == "completed":
            video_url = result.get("assets", {}).get("video", "")
            if not video_url:
                print("ERROR: Completed but no video URL in response!")
                sys.exit(1)
            print(f"  ↓ Downloading...")
            download_file(video_url, dest)
            poc.update({"status": "completed", "video_url": video_url})
            save_json(POC_STATUS_PATH, poc)
            size_kb = dest.stat().st_size // 1024
            print(f"  ✓ Saved: {dest} ({size_kb}KB)")
            break

        elif state == "failed":
            print(f"  ✗ Generation FAILED: {result.get('failure_reason', 'unknown')}")
            poc["status"] = "failed"
            save_json(POC_STATUS_PATH, poc)
            sys.exit(1)

        else:
            time.sleep(POLL_INTERVAL)

    print()
    print("=" * 65)
    print("PoC COMPLETE")
    print(f"Video saved to: public/videos/{REGISTRY_ID}.mp4")
    print()
    print("Review the video:")
    print("  → Semi-transparent skin over cervical anatomy?")
    print("  → White background (isolated)?")
    print("  → Seamless 9s loop?")
    print("  → No human faces?")
    print()
    print("If style looks good → run batch:")
    print("  python3 pipeline/batch_generator_ray.py")
    print("=" * 65)

if __name__ == "__main__":
    main()
