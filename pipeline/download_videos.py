#!/usr/bin/env python3
"""
pipeline/download_videos.py
Checks Luma AI generation status and downloads completed MP4s.
IDEMPOTENT — run multiple times; skips already-downloaded files.
Run every 30-60 minutes until all videos are downloaded.

Usage:
  python3 pipeline/download_videos.py

Output:
  public/videos/{registry_id}.mp4  for each completed video
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests
from tqdm import tqdm

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).parent.parent
STATUS_PATH    = Path(__file__).parent / "generation_status.json"
VIDEOS_DIR     = BASE_DIR / "public" / "videos"
ENV_PATH       = Path(__file__).parent / ".env"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
LUMA_API_KEY  = os.getenv("LUMA_API_KEY", "")
LUMA_BASE_URL = "https://api.lumalabs.ai/dream-machine/v1/generations"
SLEEP_BETWEEN = 2  # seconds between status checks

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_luma_status(luma_id: str) -> dict:
    headers = {
        "Authorization": f"luma-api-key {LUMA_API_KEY}",
        "Accept": "application/json",
    }
    response = requests.get(f"{LUMA_BASE_URL}/{luma_id}", headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()

def download_file(url: str, dest: Path):
    """Stream-download a file with progress bar."""
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
    if not LUMA_API_KEY:
        print("ERROR: LUMA_API_KEY not set in pipeline/.env")
        sys.exit(1)

    status = load_json(STATUS_PATH, {})
    if not status:
        print("ERROR: pipeline/generation_status.json is empty. Run batch_generator_luma.py first.")
        sys.exit(1)

    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    total      = len(status)
    downloaded = sum(1 for v in status.values() if v.get("downloaded"))
    failed_ids = [k for k, v in status.items() if v.get("status") == "failed"]
    pending    = [k for k, v in status.items() if not v.get("downloaded") and v.get("luma_id") and v.get("status") != "failed"]

    print(f"Therapia Global — Video Downloader")
    print(f"Total: {total} | Already downloaded: {downloaded} | Pending: {len(pending)} | Failed: {len(failed_ids)}")
    print("-" * 60)

    newly_downloaded = 0
    still_processing = 0
    errors = 0

    for registry_id in pending:
        entry  = status[registry_id]
        luma_id = entry.get("luma_id", "")
        dest   = VIDEOS_DIR / f"{registry_id}.mp4"

        # Double-check file exists on disk (in case status got out of sync)
        if dest.exists() and dest.stat().st_size > 0:
            status[registry_id]["downloaded"] = True
            save_json(STATUS_PATH, status)
            downloaded += 1
            continue

        try:
            result = get_luma_status(luma_id)
            state  = result.get("state", "unknown")

            if state == "completed":
                video_url = result.get("assets", {}).get("video", "")
                if not video_url:
                    print(f"  ✗ {registry_id}: completed but no video URL in response")
                    errors += 1
                    continue

                print(f"  ↓ Downloading {registry_id}...")
                download_file(video_url, dest)

                status[registry_id]["downloaded"]  = True
                status[registry_id]["video_url"]   = video_url
                status[registry_id]["status"]      = "completed"
                save_json(STATUS_PATH, status)
                newly_downloaded += 1
                print(f"  ✓ {registry_id} saved ({dest.stat().st_size // 1024}KB)")

            elif state == "failed":
                status[registry_id]["status"] = "failed"
                save_json(STATUS_PATH, status)
                print(f"  ✗ {registry_id}: generation FAILED in Luma")
                errors += 1

            else:
                still_processing += 1
                print(f"  ⏳ {registry_id}: {state}")

        except Exception as e:
            errors += 1
            print(f"  ✗ {registry_id}: error — {e}")

        time.sleep(SLEEP_BETWEEN)

    print("-" * 60)
    print(f"This run:")
    print(f"  Newly downloaded: {newly_downloaded}")
    print(f"  Still processing: {still_processing}")
    print(f"  Errors: {errors}")
    print(f"  Total downloaded: {downloaded + newly_downloaded} / {total}")

    if still_processing > 0:
        print()
        print(f"  {still_processing} videos still processing. Run again in 30-60 minutes:")
        print(f"  python3 pipeline/download_videos.py")

    if downloaded + newly_downloaded == total - len(failed_ids):
        print()
        print("All available videos downloaded!")
        print("Next step:")
        print("  python3 pipeline/upload_to_cloudflare.py")

if __name__ == "__main__":
    main()
