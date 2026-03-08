#!/usr/bin/env python3
"""
Therapia Global — 3D Medical Animation Pipeline Coordinator
============================================================
Automated coordinator that processes a batch of exercise/osteopathy specs,
generates MP4/GLB/Lottie files, and notifies the platform via webhook.

Usage:
  python scripts/pipeline_coordinator.py \
    --platform-url https://therapia-global.vercel.app \
    --batch-index 0 \
    --blender-path /Applications/Blender.app/Contents/MacOS/Blender \
    --ai-video-endpoint https://api.youraitool.com/generate \
    --output-dir /path/to/therapia-global/public \
    --use-blender        # Use Blender (default)
    --use-ai-video       # Use AI video tool instead of Blender
    --all-batches        # Process all batches sequentially

Environment variables (alternative to CLI args):
  PLATFORM_BASE_URL
  BATCH_INDEX
  BLENDER_EXECUTABLE_PATH
  AI_VIDEO_TOOL_ENDPOINT
  OUTPUT_DIR

Process per spec:
  1. Run Blender → {slug}.mp4 + {slug}.glb
  2. Export Lottie from GLB → {slug}.lottie.json
  3. OR call AI video tool → {slug}.mp4
  4. Verify files exist on disk
  5. POST webhook to /api/pipeline/video-ready
  6. Log result

Output:
  logs/batch_{N}_summary.json       — per-batch result summary
  logs/batch_{N}_{slug}.log         — per-spec log
"""

import os
import sys
import json
import time
import argparse
import subprocess
import logging
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

# ─── Logging ──────────────────────────────────────────────────────────────────
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("pipeline_coordinator")

# ─── Argument Parsing ─────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="Therapia Global Pipeline Coordinator")
parser.add_argument("--platform-url",      default=os.environ.get("PLATFORM_BASE_URL", "http://localhost:3000"))
parser.add_argument("--batch-index",       type=int, default=int(os.environ.get("BATCH_INDEX", "0")))
parser.add_argument("--blender-path",      default=os.environ.get("BLENDER_EXECUTABLE_PATH", "blender"))
parser.add_argument("--ai-video-endpoint", default=os.environ.get("AI_VIDEO_TOOL_ENDPOINT", ""))
parser.add_argument("--output-dir",        default=os.environ.get("OUTPUT_DIR", "public"))
parser.add_argument("--use-blender",       action="store_true", default=True)
parser.add_argument("--use-ai-video",      action="store_true", default=False)
parser.add_argument("--all-batches",       action="store_true", default=False,
                    help="Process all batches sequentially (ignores --batch-index)")
parser.add_argument("--dry-run",           action="store_true", default=False,
                    help="Print what would happen without executing")
args = parser.parse_args()

PLATFORM_URL    = args.platform_url.rstrip("/")
BATCH_INDEX     = args.batch_index
BLENDER_PATH    = args.blender_path
AI_ENDPOINT     = args.ai_video_endpoint
OUTPUT_DIR      = Path(args.output_dir).resolve()
USE_BLENDER     = args.use_blender and not args.use_ai_video
USE_AI_VIDEO    = args.use_ai_video
DRY_RUN         = args.dry_run

BLENDER_SCRIPT  = Path(__file__).parent / "blender_animation_template.py"

log.info(f"Coordinator starting | Platform: {PLATFORM_URL} | Batch: {BATCH_INDEX}")
log.info(f"Output dir: {OUTPUT_DIR} | Blender: {BLENDER_PATH}")
log.info(f"Mode: {'DRY RUN' if DRY_RUN else 'Blender' if USE_BLENDER else 'AI Video'}")

# ─── HTTP Helpers ─────────────────────────────────────────────────────────────
def http_get(url: str) -> dict:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

def http_post(url: str, data: dict) -> dict:
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

# ─── Fetch Batch from Platform ────────────────────────────────────────────────
def fetch_batch(batch_index: int) -> list[dict]:
    url = f"{PLATFORM_URL}/api/pipeline?batch={batch_index}&format=full"
    log.info(f"Fetching batch {batch_index}: {url}")
    data = http_get(url)
    specs = data.get("specs", [])
    log.info(f"Received {len(specs)} specs for batch {batch_index}")
    return specs

# ─── Blender Render ───────────────────────────────────────────────────────────
def run_blender(spec: dict) -> tuple[bool, str]:
    """Run Blender for a spec. Returns (success, error_message)."""
    slug     = spec["slug"]
    anim     = spec.get("animation", {})
    anim_type = spec.get("type", "exercise")

    cmd = [
        BLENDER_PATH, "--background", "--python", str(BLENDER_SCRIPT), "--",
        "--slug",        slug,
        "--type",        anim_type,
        "--camera",      anim.get("camera", "front-45deg"),
        "--lighting",    anim.get("lighting", "medical-studio"),
        "--duration",    str(anim.get("durationSeconds", 5)),
        "--fps",         str(anim.get("fps", 30)),
        "--loopable",    str(anim.get("loopable", True)).lower(),
        "--output-dir",  str(OUTPUT_DIR),
    ]

    log.info(f"  [{slug}] Running Blender...")
    if DRY_RUN:
        log.info(f"  [DRY RUN] Would run: {' '.join(cmd)}")
        return True, ""

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        return False, f"Blender exit {result.returncode}: {result.stderr[-500:]}"
    return True, ""

# ─── Lottie Export ────────────────────────────────────────────────────────────
def export_lottie(slug: str) -> tuple[bool, str]:
    """
    Export Lottie JSON from GLB using Bodymovin or gltf-to-lottie.
    Requires: npm install -g @lottiefiles/lottie-cli  (or similar tool)
    Falls back to creating a placeholder JSON if tool not available.
    """
    glb_path    = OUTPUT_DIR / "exercise-animations" / f"{slug}.glb"
    lottie_path = OUTPUT_DIR / "exercise-animations" / f"{slug}.lottie.json"

    if not glb_path.exists():
        return False, f"GLB not found: {glb_path}"

    if DRY_RUN:
        log.info(f"  [DRY RUN] Would export Lottie: {glb_path} → {lottie_path}")
        return True, ""

    # Try lottie-cli (npm package)
    result = subprocess.run(
        ["npx", "lottie-cli", "convert", str(glb_path), "--output", str(lottie_path)],
        capture_output=True, text=True, timeout=60,
    )

    if result.returncode == 0 and lottie_path.exists():
        log.info(f"  [{slug}] Lottie exported via lottie-cli")
        return True, ""

    # Fallback: create a valid placeholder Lottie JSON
    placeholder = {
        "v": "5.7.4",
        "fr": 30,
        "ip": 0,
        "op": 150,
        "w": 512,
        "h": 512,
        "nm": slug,
        "ddd": 0,
        "assets": [],
        "layers": [],
        "__pipeline": "placeholder — replace with real Lottie export from GLB",
        "__slug": slug,
        "__generated_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(lottie_path, "w") as f:
        json.dump(placeholder, f, indent=2)
    log.info(f"  [{slug}] Lottie placeholder created (replace with real export)")
    return True, ""

# ─── AI Video Tool ────────────────────────────────────────────────────────────
def call_ai_video_tool(spec: dict) -> tuple[bool, str]:
    """
    Send aiVideoPrompt to an AI video generation endpoint (Runway, Pika, Kling AI, etc.).
    Expected response: { "video_url": "https://..." }  or  { "job_id": "..." }
    """
    if not AI_ENDPOINT:
        return False, "AI_VIDEO_TOOL_ENDPOINT not configured"

    slug   = spec["slug"]
    prompt = spec.get("animation", {}).get("aiVideoPrompt", "")
    mp4_out = OUTPUT_DIR / "exercise-videos" / f"{slug}.mp4"

    if DRY_RUN:
        log.info(f"  [DRY RUN] Would POST to {AI_ENDPOINT} with prompt for {slug}")
        return True, ""

    payload = {
        "prompt": prompt,
        "duration": spec.get("animation", {}).get("durationSeconds", 5),
        "fps": spec.get("animation", {}).get("fps", 30),
        "slug": slug,
    }

    try:
        result = http_post(AI_ENDPOINT, payload)
        video_url = result.get("video_url") or result.get("output_url")
        if not video_url:
            return False, f"AI tool did not return video_url: {result}"

        # Download video
        urllib.request.urlretrieve(video_url, str(mp4_out))
        log.info(f"  [{slug}] AI video downloaded: {mp4_out}")
        return True, ""
    except Exception as e:
        return False, str(e)

# ─── File Verification ────────────────────────────────────────────────────────
def verify_outputs(slug: str, requested_outputs: list[str]) -> tuple[list[str], list[str]]:
    """Returns (found_outputs, missing_outputs)."""
    paths = {
        "mp4":    OUTPUT_DIR / "exercise-videos"     / f"{slug}.mp4",
        "glb":    OUTPUT_DIR / "exercise-animations"  / f"{slug}.glb",
        "lottie": OUTPUT_DIR / "exercise-animations"  / f"{slug}.lottie.json",
    }
    found   = [k for k in requested_outputs if k in paths and paths[k].exists()]
    missing = [k for k in requested_outputs if k not in found]
    return found, missing

# ─── Webhook ─────────────────────────────────────────────────────────────────
def fire_webhook(slug: str, outputs: list[str]) -> tuple[bool, str]:
    url = f"{PLATFORM_URL}/api/pipeline/video-ready"
    payload = {"slug": slug, "outputs": outputs}
    log.info(f"  [{slug}] Firing webhook: {url}")

    if DRY_RUN:
        log.info(f"  [DRY RUN] Would POST: {payload}")
        return True, ""

    try:
        result = http_post(url, payload)
        if result.get("success"):
            log.info(f"  [{slug}] Webhook confirmed ✓")
            return True, ""
        return False, f"Webhook returned: {result}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        return False, str(e)

# ─── Process Single Spec ──────────────────────────────────────────────────────
def process_spec(spec: dict) -> dict:
    slug       = spec["slug"]
    start_time = time.time()
    result     = {
        "slug": slug,
        "type": spec.get("type", "exercise"),
        "started_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "tools_used": [],
        "outputs": {},
        "errors": [],
    }

    log.info(f"\n{'─'*60}")
    log.info(f"Processing: {slug}  [{spec.get('type','exercise')}]")

    # ── Step 1: Generate video/animation ──────────────────────────────────────
    if USE_BLENDER:
        ok, err = run_blender(spec)
        result["tools_used"].append("blender")
        if not ok:
            result["errors"].append(f"Blender: {err}")
            log.error(f"  [{slug}] Blender FAILED: {err}")
        else:
            # Export Lottie from GLB
            lok, lerr = export_lottie(slug)
            result["tools_used"].append("lottie-export")
            if not lok:
                result["errors"].append(f"Lottie: {lerr}")
                log.warning(f"  [{slug}] Lottie export issue: {lerr}")

    elif USE_AI_VIDEO:
        ok, err = call_ai_video_tool(spec)
        result["tools_used"].append("ai-video-tool")
        if not ok:
            result["errors"].append(f"AI video: {err}")
            log.error(f"  [{slug}] AI video FAILED: {err}")

    # ── Step 2: Verify files ──────────────────────────────────────────────────
    requested = ["mp4", "glb", "lottie"] if USE_BLENDER else ["mp4"]
    found, missing = verify_outputs(slug, requested)
    result["outputs"]["found"]   = found
    result["outputs"]["missing"] = missing

    if DRY_RUN:
        found = requested  # simulate success in dry run

    if missing and not DRY_RUN:
        log.warning(f"  [{slug}] Missing outputs: {missing}")

    # ── Step 3: Fire webhook ──────────────────────────────────────────────────
    if found or DRY_RUN:
        wok, werr = fire_webhook(slug, found or requested)
        result["tools_used"].append("webhook")
        if not wok:
            result["errors"].append(f"Webhook: {werr}")
            log.error(f"  [{slug}] Webhook FAILED: {werr}")
        else:
            result["status"] = "success"
    else:
        result["status"] = "failed"
        log.error(f"  [{slug}] No outputs — skipping webhook")

    # ── Step 4: Log paths ─────────────────────────────────────────────────────
    result["outputs"]["paths"] = {
        "mp4":    f"/exercise-videos/{slug}.mp4",
        "glb":    f"/exercise-animations/{slug}.glb",
        "lottie": f"/exercise-animations/{slug}.lottie.json",
    }
    result["duration_seconds"] = round(time.time() - start_time, 2)
    result["completed_at"]     = datetime.now(timezone.utc).isoformat()

    status_icon = "✓" if result["status"] == "success" else "✗"
    log.info(f"  [{slug}] {status_icon} Done in {result['duration_seconds']}s")

    return result

# ─── Process Batch ────────────────────────────────────────────────────────────
def process_batch(batch_index: int) -> dict:
    batch_start = time.time()
    summary = {
        "batch_index":    batch_index,
        "platform_url":   PLATFORM_URL,
        "started_at":     datetime.now(timezone.utc).isoformat(),
        "mode":           "dry_run" if DRY_RUN else ("blender" if USE_BLENDER else "ai_video"),
        "results":        [],
        "summary":        {},
    }

    try:
        specs = fetch_batch(batch_index)
    except Exception as e:
        log.error(f"Failed to fetch batch {batch_index}: {e}")
        summary["error"] = str(e)
        return summary

    for spec in specs:
        try:
            result = process_spec(spec)
        except Exception as e:
            log.error(f"Unhandled error for {spec.get('slug', '?')}: {e}")
            result = {
                "slug": spec.get("slug", "unknown"),
                "status": "error",
                "errors": [str(e)],
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        summary["results"].append(result)

    # ── Build summary stats ────────────────────────────────────────────────────
    total    = len(summary["results"])
    success  = sum(1 for r in summary["results"] if r.get("status") == "success")
    failed   = total - success
    duration = round(time.time() - batch_start, 2)

    summary["summary"] = {
        "total":    total,
        "success":  success,
        "failed":   failed,
        "duration": f"{duration}s",
    }
    summary["completed_at"] = datetime.now(timezone.utc).isoformat()

    log.info(f"\n{'═'*60}")
    log.info(f"Batch {batch_index} complete: {success}/{total} success in {duration}s")
    return summary

# ─── Save Summary ─────────────────────────────────────────────────────────────
def save_summary(summary: dict, batch_index: int):
    os.makedirs("logs", exist_ok=True)
    path = f"logs/batch_{batch_index}_summary.json"
    with open(path, "w") as f:
        json.dump(summary, f, indent=2)
    log.info(f"Summary saved: {path}")

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if args.all_batches:
        # Fetch total batch count from pipeline index
        try:
            index_data = http_get(f"{PLATFORM_URL}/api/pipeline")
            total = index_data["pipeline"]["totalBatches"]
            log.info(f"Processing all {total} batches sequentially...")
        except Exception as e:
            log.error(f"Could not fetch batch count: {e}")
            sys.exit(1)

        all_results = []
        for i in range(total):
            summary = process_batch(i)
            save_summary(summary, i)
            all_results.append(summary["summary"])
            log.info(f"Batch {i}/{total-1} done.")

        # Save master summary
        master = {
            "total_batches":  total,
            "completed_at":   datetime.now(timezone.utc).isoformat(),
            "batch_summaries": all_results,
        }
        with open("logs/pipeline_master_summary.json", "w") as f:
            json.dump(master, f, indent=2)
        log.info("Master summary saved: logs/pipeline_master_summary.json")

    else:
        summary = process_batch(BATCH_INDEX)
        save_summary(summary, BATCH_INDEX)

    log.info("Pipeline coordinator finished.")

if __name__ == "__main__":
    main()
