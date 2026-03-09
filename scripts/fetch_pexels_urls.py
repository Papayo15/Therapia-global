#!/usr/bin/env python3
"""
fetch_pexels_urls.py
Searches Pexels for each exercise/osteopathy technique and stores
the DIRECT CDN URL in data/pipeline-status.json.

No files are downloaded — videos stream from Pexels CDN.
This keeps the git repo tiny (just a JSON file).

Usage:
  PEXELS_API_KEY=your_key python3 scripts/fetch_pexels_urls.py

Prerequisite:
  node scripts/export_registry.mjs   (generates data/video_search_terms.json)
"""

from __future__ import annotations

import os
import json
import time
import requests
from pathlib import Path
from datetime import datetime, timezone

PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")
ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
STATUS_FILE = DATA_DIR / "pipeline-status.json"

MIN_WIDTH = 854
MAX_WIDTH = 1920

AVOID_KEYWORDS = ["gym", "bodybuilding", "fitness influencer", "booty workout", "crossfit"]
PREFER_KEYWORDS = ["therapy", "physio", "rehab", "treatment", "exercise", "stretch", "mobility"]


def build_queries(term: str) -> list[str]:
    return [
        term,
        term + " physical therapy",
        term + " physiotherapy",
        term + " rehab exercise",
        term + " rehabilitation exercise",
        term + " therapeutic exercise",
        term + " mobility exercise",
    ]


def score_video(v: dict) -> int:
    text = v.get("url", "").lower()
    for tag in v.get("tags", []):
        text += " " + tag.get("title", "").lower()
    score = sum(1 for k in PREFER_KEYWORDS if k in text)
    score -= sum(2 for k in AVOID_KEYWORDS if k in text)
    return score


def pick_url(video: dict) -> str | None:
    """Return the best-quality MP4 URL from a Pexels video entry."""
    mp4s = [f for f in video.get("video_files", []) if f.get("file_type") == "video/mp4"]
    preferred = [f for f in mp4s if MIN_WIDTH <= f.get("width", 0) <= MAX_WIDTH]
    candidates = preferred if preferred else mp4s
    best = max(candidates, key=lambda f: f.get("width", 0), default=None)
    return best["link"] if best else None


def find_pexels_url(slug: str, search_term: str) -> str | None:
    """Search Pexels and return a direct CDN video URL (no download)."""
    headers = {"Authorization": PEXELS_API_KEY}

    for query in build_queries(search_term):
        try:
            r = requests.get(
                "https://api.pexels.com/videos/search",
                headers=headers,
                params={"query": query, "per_page": 5, "size": "medium"},
                timeout=15,
            )
            r.raise_for_status()
            time.sleep(0.3)
        except Exception as e:
            print(f"  [WARN] {slug} query failed: {e}")
            continue

        videos = r.json().get("videos", [])
        if not videos:
            continue

        ranked = sorted(videos, key=score_video, reverse=True)
        for v in ranked:
            url = pick_url(v)
            if url:
                return url

    return None


def main() -> None:
    if not PEXELS_API_KEY:
        print("ERROR: Set PEXELS_API_KEY env var (free key at pexels.com/api/)")
        exit(1)

    terms_file = DATA_DIR / "video_search_terms.json"
    if not terms_file.exists():
        print("ERROR: Run 'node scripts/export_registry.mjs' first")
        exit(1)

    data = json.loads(terms_file.read_text())

    # Load existing status to avoid re-searching slugs we already have
    existing: dict = {}
    if STATUS_FILE.exists():
        try:
            existing = json.loads(STATUS_FILE.read_text())
        except Exception:
            pass

    status: dict = dict(existing)
    updated_now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    def process(entries: list[dict], subdir: str, label: str) -> None:
        ok = fail = skip = 0
        print(f"\n=== {label} ({len(entries)}) ===")
        for entry in entries:
            slug = entry["id"]
            # Skip if already resolved and video is a Pexels CDN URL
            if slug in status and "pexels.com" in status[slug].get("video", ""):
                skip += 1
                continue

            url = find_pexels_url(slug, entry["youtubeSearch"])
            if url:
                status[slug] = {
                    "status": "ready",
                    "video": url,
                    "renderEngine": "pexels-cdn",
                    "updated": updated_now,
                }
                print(f"  [OK] {slug}")
                ok += 1
            else:
                print(f"  [SKIP] no result for {slug}")
                fail += 1

        print(f"  {ok} found, {skip} cached, {fail} not found")

    process(data["exercises"], "exercises", "EXERCISES")
    process(data["osteopathy"], "osteopathy", "OSTEOPATHY")

    DATA_DIR.mkdir(exist_ok=True)
    STATUS_FILE.write_text(json.dumps(status, indent=2))
    ready = sum(1 for v in status.values() if v.get("status") == "ready")
    print(f"\n✓ pipeline-status.json updated: {ready} videos ready")
    print("Now commit data/pipeline-status.json and push to GitHub.")


if __name__ == "__main__":
    main()
