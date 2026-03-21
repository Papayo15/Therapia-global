#!/usr/bin/env python3
"""
pipeline/cloud_sync.py
Uploads downloaded MP4s to Cloudflare Stream, then patches data/master-registry.json.
Combines upload_to_cloudflare.py + update_registry.py into one idempotent script.
DOES NOT push to GitHub — prints git commands at the end for manual review.

Usage:
  python3 pipeline/cloud_sync.py

Requires in pipeline/.env:
  CF_ACCOUNT_ID=your_cloudflare_account_id
  CF_STREAM_TOKEN=your_cloudflare_stream_api_token

After completion:
  git add data/master-registry.json
  git commit -m "feat: 620 Videos Rendered — Ray Flash 2 1080p"
  git push
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).parent.parent
STATUS_PATH     = Path(__file__).parent / "generation_status.json"
REGISTRY_PATH   = BASE_DIR / "data" / "master-registry.json"
VIDEOS_DIR      = BASE_DIR / "public" / "videos"
ENV_PATH        = Path(__file__).parent / ".env"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
CF_ACCOUNT_ID   = os.getenv("CF_ACCOUNT_ID", "")
CF_STREAM_TOKEN = os.getenv("CF_STREAM_TOKEN", "")
SLEEP_BETWEEN   = 2  # seconds between uploads

CF_UPLOAD_URL   = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/stream"
CF_COPY_URL     = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/stream/copy"
CF_HEADERS      = lambda: {"Authorization": f"Bearer {CF_STREAM_TOKEN}"}

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path, default=None):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else {}

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def upload_local_file(registry_id: str, file_path: Path) -> str:
    """Upload local MP4 to Cloudflare Stream. Returns cloudflare uid."""
    meta = json.dumps({"name": registry_id, "registry_id": registry_id})
    with open(file_path, "rb") as f:
        resp = requests.post(
            CF_UPLOAD_URL,
            headers=CF_HEADERS(),
            files={"file": (file_path.name, f, "video/mp4")},
            data={"meta": meta},
            timeout=300,
        )
    resp.raise_for_status()
    result = resp.json()
    if not result.get("success"):
        raise ValueError(f"CF error: {result.get('errors')}")
    return result["result"]["uid"]

def upload_from_url(registry_id: str, video_url: str) -> str:
    """Upload to Cloudflare Stream via URL copy. Returns cloudflare uid."""
    resp = requests.post(
        CF_COPY_URL,
        headers={**CF_HEADERS(), "Content-Type": "application/json"},
        json={
            "url": video_url,
            "meta": {"name": registry_id, "registry_id": registry_id},
        },
        timeout=60,
    )
    resp.raise_for_status()
    result = resp.json()
    if not result.get("success"):
        raise ValueError(f"CF error: {result.get('errors')}")
    return result["result"]["uid"]

def patch_registry(registry: dict, registry_id: str, cf_uid: str) -> dict:
    """Update a single entry in master-registry with cloudflare data."""
    if registry_id in registry:
        registry[registry_id]["cloudflare_id"] = cf_uid
        registry[registry_id]["video_url"] = f"https://watch.videodelivery.net/{cf_uid}"
    return registry

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not CF_ACCOUNT_ID or not CF_STREAM_TOKEN:
        print("ERROR: CF_ACCOUNT_ID and CF_STREAM_TOKEN must be set in pipeline/.env")
        sys.exit(1)

    status   = load_json(STATUS_PATH)
    registry = load_json(REGISTRY_PATH)

    if not status:
        print("ERROR: pipeline/generation_status.json not found. Run batch_generator_ray.py first.")
        sys.exit(1)
    if not registry:
        print(f"ERROR: data/master-registry.json not found at {REGISTRY_PATH}")
        sys.exit(1)

    # Build work list: downloaded but not yet in Cloudflare
    to_upload = [
        rid for rid, entry in status.items()
        if entry.get("downloaded") and not entry.get("cloudflare_id")
    ]
    already_done = sum(1 for v in status.values() if v.get("cloudflare_id"))

    print(f"Therapia Global — Cloud Sync (Cloudflare Stream)")
    print(f"To upload : {len(to_upload)} | Already done: {already_done}")
    print("-" * 65)

    uploaded    = 0
    errors      = 0
    reg_updated = 0

    for i, registry_id in enumerate(to_upload, 1):
        entry     = status[registry_id]
        local_mp4 = VIDEOS_DIR / f"{registry_id}.mp4"
        video_url = entry.get("video_url", "")

        # Validate local file before attempting upload
        if local_mp4.exists() and local_mp4.stat().st_size == 0:
            print(f"  ✗ {registry_id}: file is 0 bytes — skipping")
            errors += 1
            continue

        print(f"[{i}/{len(to_upload)}] Uploading {registry_id}...", end=" ", flush=True)

        try:
            # Primary: local file upload
            if local_mp4.exists() and local_mp4.stat().st_size > 0:
                cf_uid = upload_local_file(registry_id, local_mp4)
                method = "local"
            # Fallback: URL copy from Luma/Ray CDN
            elif video_url:
                cf_uid = upload_from_url(registry_id, video_url)
                method = "url"
            else:
                print(f"✗ no file and no URL")
                errors += 1
                continue

            # Update status
            status[registry_id]["cloudflare_id"] = cf_uid
            status[registry_id]["status"]         = "done"
            save_json(STATUS_PATH, status)

            # Patch registry in-memory
            registry = patch_registry(registry, registry_id, cf_uid)
            reg_updated += 1
            uploaded += 1
            print(f"✓  uid={cf_uid[:12]}... ({method})")

        except Exception as e:
            errors += 1
            print(f"✗  {e}")

        # Save registry after every upload (safe to interrupt)
        save_json(REGISTRY_PATH, registry)

        if i < len(to_upload):
            time.sleep(SLEEP_BETWEEN)

    # Final registry save
    save_json(REGISTRY_PATH, registry)
    total_in_cf = sum(1 for v in registry.values() if v.get("cloudflare_id"))

    print("-" * 65)
    print(f"Uploaded this run    : {uploaded}")
    print(f"Registry entries     : {total_in_cf} / {len(registry)} have cloudflare_id")
    print(f"Errors               : {errors}")
    print()

    if uploaded > 0:
        print("data/master-registry.json updated. When ready to deploy:")
        print()
        print("  git add data/master-registry.json")
        print(f"  git commit -m 'feat: {total_in_cf} videos live — Ray Flash 2 1080p'")
        print("  git push")
        print()
        print("Netlify rebuilds automatically → videos are live in ~2 minutes.")
    else:
        print("No new uploads. Run download_videos.py first to get MP4s.")

if __name__ == "__main__":
    main()
