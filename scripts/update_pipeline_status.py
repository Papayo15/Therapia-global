#!/usr/bin/env python3
"""
update_pipeline_status.py
Scans public/videos/exercises/ and public/videos/osteopathy/ for MP4 files,
then writes data/pipeline-status.json so the app can serve all videos
immediately — without needing to run the webhook endpoint.

Run this after fetch_pexels_videos.py completes:
  python scripts/update_pipeline_status.py

The app's GET /api/pipeline/video-ready reads data/pipeline-status.json
and returns the video paths, which the exercises and osteopathy pages
consume on mount to populate their video player.
"""

import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent.parent
PUBLIC_DIR = ROOT / "public"
DATA_DIR = ROOT / "data"
STATUS_FILE = DATA_DIR / "pipeline-status.json"


def main() -> None:
    status: dict = {}
    counts = {"exercises": 0, "osteopathy": 0}

    for subdir in ["exercises", "osteopathy"]:
        vid_dir = PUBLIC_DIR / "videos" / subdir
        if not vid_dir.exists():
            print(f"  [SKIP] {vid_dir} does not exist")
            continue

        for mp4 in sorted(vid_dir.glob("*.mp4")):
            # Skip 0-byte or corrupted files
            try:
                size = mp4.stat().st_size
            except OSError:
                continue
            if size == 0:
                print(f"  [SKIP] 0-byte file: {mp4.name}")
                continue

            slug = mp4.stem.strip().lower()
            status[slug] = {
                "status": "ready",
                "video": f"/videos/{subdir}/{mp4.name}",
                "renderEngine": "pexels",
                "updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            }
            counts[subdir] += 1

    DATA_DIR.mkdir(exist_ok=True)
    STATUS_FILE.write_text(json.dumps(status, indent=2))

    total = sum(counts.values())
    print(f"Updated {STATUS_FILE}")
    print(f"  Exercises:  {counts['exercises']} videos")
    print(f"  Osteopathy: {counts['osteopathy']} videos")
    print(f"  Total:      {total} entries")

    if total == 0:
        print("\nNo MP4 files found. Run fetch_pexels_videos.py first.")
    else:
        print("\nDone. Restart/redeploy the app to serve the new videos.")


if __name__ == "__main__":
    main()
