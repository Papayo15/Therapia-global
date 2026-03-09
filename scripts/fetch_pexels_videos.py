#!/usr/bin/env python3
"""
fetch_pexels_videos.py
Downloads MP4 videos from the Pexels free API for every exercise and
osteopathy technique listed in data/video_search_terms.json.

Prerequisites:
  1. Get a free Pexels API key at https://www.pexels.com/api/
  2. Install requests: pip install requests
  3. Run export first: node scripts/export_registry.mjs

Usage:
  PEXELS_API_KEY=your_key python scripts/fetch_pexels_videos.py

  # Optional: notify a running app instance via webhook
  PEXELS_API_KEY=your_key APP_URL=http://localhost:3000 python scripts/fetch_pexels_videos.py

Downloaded files:
  public/videos/exercises/{slug}.mp4
  public/videos/osteopathy/{slug}.mp4

Pipeline is idempotent — already-downloaded files are skipped.
Partial failures are logged but do not stop the overall run.
"""

from __future__ import annotations

import os
import json
import time
import requests
from pathlib import Path

PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")
APP_URL = os.environ.get("APP_URL", "http://localhost:3000")
ROOT = Path(__file__).parent.parent
PUBLIC_DIR = ROOT / "public"
DATA_DIR = ROOT / "data"

# ── Video quality / relevance config ─────────────────────────────────────────
AVOID_KEYWORDS = [
    "gym", "bodybuilding", "fitness influencer", "booty workout",
    "crossfit", "powerlifting", "weight loss",
]
PREFER_KEYWORDS = [
    "therapy", "physio", "rehab", "rehabilitation", "treatment",
    "physical therapy", "exercise", "stretch", "mobility", "clinic",
    "therapeutic", "manual therapy",
]

MIN_WIDTH = 854   # 720p minimum
MAX_WIDTH = 1920  # cap at 1080p to keep file sizes manageable


def build_queries(term: str) -> list[str]:
    """Generate up to 10 progressive search queries for a given term."""
    return [
        term,
        term + " physical therapy",
        term + " physiotherapy",
        term + " rehab exercise",
        term + " rehabilitation exercise",
        term + " therapeutic exercise",
        term + " clinical exercise",
        term + " treatment exercise",
        term + " mobility exercise",
        term + " stretching exercise",
    ]


def score_video(video: dict) -> int:
    """Score a Pexels video by clinical relevance."""
    text = video.get("url", "").lower()
    for tag in video.get("tags", []):
        text += " " + tag.get("title", "").lower()

    score = sum(1 for k in PREFER_KEYWORDS if k in text)
    score -= sum(2 for k in AVOID_KEYWORDS if k in text)
    return score


def pick_file(video: dict) -> dict | None:
    """Select the best MP4 file from a Pexels video entry."""
    mp4s = [
        f for f in video.get("video_files", [])
        if f.get("file_type") == "video/mp4"
    ]
    if not mp4s:
        return None

    preferred = [f for f in mp4s if MIN_WIDTH <= f.get("width", 0) <= MAX_WIDTH]
    candidates = preferred if preferred else mp4s
    return max(candidates, key=lambda f: f.get("width", 0), default=None)


def download_pexels_video(slug: str, search_term: str, subdir: str) -> bool:
    """
    Download one MP4 from Pexels for the given slug.
    Returns True on success or if file already exists.
    """
    out_path = PUBLIC_DIR / "videos" / subdir / f"{slug}.mp4"

    # Skip if already downloaded and non-empty
    if out_path.exists() and out_path.stat().st_size > 0:
        print(f"  [SKIP] {slug} already downloaded")
        return True

    headers = {"Authorization": PEXELS_API_KEY}
    video_file = None

    for query in build_queries(search_term):
        try:
            r = requests.get(
                "https://api.pexels.com/videos/search",
                headers=headers,
                params={"query": query, "per_page": 5, "size": "medium"},
                timeout=15,
            )
            r.raise_for_status()
            time.sleep(0.35)  # stay well under 200 req/min rate limit
        except Exception as e:
            print(f"  [WARN] Search failed for '{query}': {e}")
            continue

        videos = r.json().get("videos", [])
        if not videos:
            continue

        ranked = sorted(videos, key=score_video, reverse=True)
        for v in ranked:
            f = pick_file(v)
            if f:
                video_file = f
                break
        if video_file:
            break

    if not video_file:
        print(f"  [SKIP] No suitable MP4 found for: {slug}")
        return False

    out_path.parent.mkdir(parents=True, exist_ok=True)
    w = video_file.get("width", "?")
    h = video_file.get("height", "?")
    print(f"  [DOWNLOAD] {slug}  ({w}x{h})")

    try:
        with requests.get(video_file["link"], stream=True, timeout=90) as resp:
            resp.raise_for_status()
            with open(out_path, "wb") as fh:
                for chunk in resp.iter_content(chunk_size=8192):
                    fh.write(chunk)
    except Exception as e:
        print(f"  [ERROR] Download failed for {slug}: {e}")
        out_path.unlink(missing_ok=True)
        return False

    if out_path.stat().st_size == 0:
        print(f"  [ERROR] 0-byte file, removing: {slug}")
        out_path.unlink(missing_ok=True)
        return False

    # Notify a running app instance (best-effort, non-blocking)
    public_path = f"/videos/{subdir}/{slug}.mp4"
    try:
        requests.post(
            f"{APP_URL}/api/pipeline/video-ready",
            json={
                "slug": slug,
                "outputs": ["mp4"],
                "renderEngine": "pexels",
                "video": public_path,
            },
            timeout=5,
        )
    except Exception:
        pass  # App may not be running — that's fine

    print(f"  [DONE]  {slug} → {public_path}")
    return True


def process_batch(entries: list[dict], subdir: str, label: str) -> tuple[int, int]:
    ok = fail = 0
    print(f"\n=== {label} ({len(entries)}) ===")
    for entry in entries:
        result = download_pexels_video(entry["id"], entry["youtubeSearch"], subdir)
        if result:
            ok += 1
        else:
            fail += 1
    print(f"  Result: {ok} downloaded/already done, {fail} failed/skipped")
    return ok, fail


def main() -> None:
    if not PEXELS_API_KEY:
        print("ERROR: PEXELS_API_KEY environment variable is not set.")
        print("Get a free key at https://www.pexels.com/api/")
        exit(1)

    terms_file = DATA_DIR / "video_search_terms.json"
    if not terms_file.exists():
        print("ERROR: data/video_search_terms.json not found.")
        print("Run first: node scripts/export_registry.mjs")
        exit(1)

    data = json.loads(terms_file.read_text())
    exercises = data.get("exercises", [])
    osteopathy = data.get("osteopathy", [])

    total_ok = total_fail = 0

    ok, fail = process_batch(exercises, "exercises", "EXERCISES")
    total_ok += ok
    total_fail += fail

    ok, fail = process_batch(osteopathy, "osteopathy", "OSTEOPATHY")
    total_ok += ok
    total_fail += fail

    print("\n" + "=" * 60)
    print(f"TOTAL: {total_ok} videos ready, {total_fail} failed/skipped")
    print("=" * 60)
    print("\nNext step: python scripts/update_pipeline_status.py")


if __name__ == "__main__":
    main()
