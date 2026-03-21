#!/usr/bin/env python3
"""
pipeline/update_registry.py
Patches data/master-registry.json with cloudflare_id and video_url
from pipeline/generation_status.json.

Run after upload_to_cloudflare.py, then git push to trigger Netlify rebuild.

Usage:
  python3 pipeline/update_registry.py
  git add data/master-registry.json
  git commit -m "feat: update registry with Cloudflare Stream video IDs"
  git push
"""

import json
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).parent.parent
STATUS_PATH     = Path(__file__).parent / "generation_status.json"
REGISTRY_PATH   = BASE_DIR / "data" / "master-registry.json"

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_json(path: Path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not STATUS_PATH.exists():
        print("ERROR: pipeline/generation_status.json not found.")
        return

    status   = load_json(STATUS_PATH)
    registry = load_json(REGISTRY_PATH)

    updated  = 0
    skipped  = 0
    missing  = 0

    for registry_id, entry in status.items():
        cf_id = entry.get("cloudflare_id", "")

        if not cf_id:
            skipped += 1
            continue

        if registry_id not in registry:
            missing += 1
            print(f"  Warning: {registry_id} in status but not in master-registry.json")
            continue

        registry[registry_id]["cloudflare_id"] = cf_id
        registry[registry_id]["video_url"] = f"https://watch.videodelivery.net/{cf_id}"
        updated += 1

    save_json(REGISTRY_PATH, registry)

    total_with_video = sum(1 for v in registry.values() if v.get("cloudflare_id"))

    print(f"Therapia Global — Registry Updater")
    print(f"Updated: {updated} entries")
    print(f"Skipped (no cloudflare_id yet): {skipped}")
    print(f"Missing in registry: {missing}")
    print(f"Total with video: {total_with_video} / {len(registry)}")
    print()
    print("data/master-registry.json saved.")
    print()
    print("Deploy:")
    print("  git add data/master-registry.json")
    print(f"  git commit -m 'feat: {updated} Cloudflare Stream video IDs added'")
    print("  git push")
    print()
    print("Netlify will rebuild automatically. Videos will be live in ~2 minutes.")

if __name__ == "__main__":
    main()
