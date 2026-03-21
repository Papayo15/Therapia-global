#!/usr/bin/env python3
"""
pipeline/upload_to_cloudflare.py
Uploads downloaded MP4 files to Cloudflare Stream.
IDEMPOTENT — skips entries that already have a cloudflare_id.

Usage:
  python3 pipeline/upload_to_cloudflare.py

Requires in pipeline/.env:
  CF_ACCOUNT_ID=your_cloudflare_account_id
  CF_STREAM_TOKEN=your_cloudflare_stream_api_token
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent.parent
STATUS_PATH = Path(__file__).parent / "generation_status.json"
VIDEOS_DIR  = BASE_DIR / "public" / "videos"
ENV_PATH    = Path(__file__).parent / ".env"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
CF_ACCOUNT_ID   = os.getenv("CF_ACCOUNT_ID", "")
CF_STREAM_TOKEN = os.getenv("CF_STREAM_TOKEN", "")
SLEEP_BETWEEN   = 3  # seconds between uploads

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def upload_file_to_cloudflare(file_path: Path, registry_id: str) -> str:
    """
    Upload a local MP4 to Cloudflare Stream via direct upload.
    Returns the Cloudflare video UID.
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/stream"
    headers = {
        "Authorization": f"Bearer {CF_STREAM_TOKEN}",
    }
    # Set the registry_id in meta so our webhook can identify the entry
    meta = json.dumps({"name": registry_id, "registry_id": registry_id})

    with open(file_path, "rb") as f:
        response = requests.post(
            url,
            headers=headers,
            files={"file": (file_path.name, f, "video/mp4")},
            data={"meta": meta},
            timeout=300,  # 5 min timeout for large files
        )

    response.raise_for_status()
    result = response.json()

    if not result.get("success"):
        raise ValueError(f"Cloudflare API error: {result.get('errors')}")

    return result["result"]["uid"]

def upload_url_to_cloudflare(video_url: str, registry_id: str) -> str:
    """
    Upload via URL (faster — Cloudflare fetches directly from Luma CDN).
    Returns the Cloudflare video UID.
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/stream/copy"
    headers = {
        "Authorization": f"Bearer {CF_STREAM_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "url": video_url,
        "meta": {"name": registry_id, "registry_id": registry_id},
    }
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    result = response.json()

    if not result.get("success"):
        raise ValueError(f"Cloudflare API error: {result.get('errors')}")

    return result["result"]["uid"]

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not CF_ACCOUNT_ID or not CF_STREAM_TOKEN:
        print("ERROR: CF_ACCOUNT_ID and CF_STREAM_TOKEN must be set in pipeline/.env")
        sys.exit(1)

    status = load_json(STATUS_PATH, {})
    if not status:
        print("ERROR: pipeline/generation_status.json not found. Run batch_generator_luma.py first.")
        sys.exit(1)

    to_upload = [
        registry_id for registry_id, entry in status.items()
        if not entry.get("cloudflare_id") and entry.get("downloaded")
    ]
    already_done = sum(1 for v in status.values() if v.get("cloudflare_id"))

    print(f"Therapia Global — Cloudflare Stream Uploader")
    print(f"To upload: {len(to_upload)} | Already uploaded: {already_done}")
    print("-" * 60)

    uploaded = 0
    errors   = 0

    for i, registry_id in enumerate(to_upload, 1):
        entry     = status[registry_id]
        local_mp4 = VIDEOS_DIR / f"{registry_id}.mp4"
        video_url = entry.get("video_url", "")

        print(f"[{i}/{len(to_upload)}] Uploading {registry_id}...")

        try:
            # Prefer local file upload; fall back to URL if file is missing
            if local_mp4.exists() and local_mp4.stat().st_size > 0:
                cf_uid = upload_file_to_cloudflare(local_mp4, registry_id)
                method = "local file"
            elif video_url:
                cf_uid = upload_url_to_cloudflare(video_url, registry_id)
                method = "URL"
            else:
                print(f"  ✗ {registry_id}: no local file and no video URL — skip")
                errors += 1
                continue

            status[registry_id]["cloudflare_id"] = cf_uid
            status[registry_id]["status"] = "cloudflare_uploaded"
            save_json(STATUS_PATH, status)
            uploaded += 1
            print(f"  ✓ {registry_id} → cloudflare_id: {cf_uid} ({method})")

        except Exception as e:
            errors += 1
            print(f"  ✗ {registry_id}: {e}")

        if i < len(to_upload):
            time.sleep(SLEEP_BETWEEN)

    print("-" * 60)
    print(f"Uploaded this run: {uploaded}")
    print(f"Errors: {errors}")
    print()

    if uploaded > 0:
        print("Next step — update registry and deploy:")
        print("  python3 pipeline/update_registry.py")
        print("  git add data/master-registry.json && git commit -m 'feat: cloudflare video IDs' && git push")

if __name__ == "__main__":
    main()
