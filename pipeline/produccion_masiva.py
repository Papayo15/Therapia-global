#!/usr/bin/env python3
"""
pipeline/produccion_masiva.py
Genera y descarga UN video a la vez (produccion secuencial estable).
Lee templates de PROMPTS_CONFIG.json, valida el prompt, envia a Ray Flash 2.
Idempotente — reanuda desde pipeline/produccion_state.json si se interrumpe.

Usage:
  python3 pipeline/produccion_masiva.py --canal CANAL_A_EJERCICIO --tecnica "Full-body burpee..."
  python3 pipeline/produccion_masiva.py --canal CANAL_C_ESTIRAMIENTO --tecnica "Standing hamstring..."
  python3 pipeline/produccion_masiva.py --canal CANAL_B_OSTEOPATIA --tecnica "Cervical HVLA..."
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
import requests

# Paths
PIPELINE_DIR = Path(__file__).parent
ENV_PATH     = PIPELINE_DIR / ".env"
CONFIG_PATH  = PIPELINE_DIR / "PROMPTS_CONFIG.json"
STATE_PATH   = PIPELINE_DIR / "produccion_state.json"
OUTPUT_DIR   = Path.home() / "Desktop" / "PRODUCCION_MAESTRA_THERAPIA"

# Config
load_dotenv(ENV_PATH)
RAY_API_KEY = os.getenv("RAY_API_KEY", "")
API_URL     = "https://api.lumalabs.ai/dream-machine/v1/generations"
POLL_EVERY  = 30

OUTPUT_FILENAMES = {
    "CANAL_A_EJERCICIO":    "VIDEO_CANAL_A_BURPEE.mp4",
    "CANAL_B_OSTEOPATIA":   "VIDEO_CANAL_B_OSTEOPATIA.mp4",
    "CANAL_C_ESTIRAMIENTO": "VIDEO_CANAL_C_ESTIRAMIENTO.mp4",
}

# Latin bone terms that trigger Luma filter
LATIN_BONE_TERMS = [
    "humerus", "radius", "ulna", "femur", "tibia", "fibula",
    "patella", "scapula", "clavicle", "sternum", "pelvis",
    "vertebra", "vertebrae", "sacrum", "ilium", "ischium"
]

# Phrases Luma cannot process (meta-instructions for LLMs, not video models)
META_INSTRUCTIONS = [
    r"if any (answer|condition|rule) (is )?(no|fails?|fail)",
    r"regenerate (internally|before output)",
    r"fix before (rendering|output)",
    r"internal(ly)? verify",
    r"return only.{0,30}(animation|video)",
    r"no (explanation|variations|alternatives)",
    r"this (system|engine) must",
]

SEP = "  " + "=" * 61


# ─── Pre-Execution Validation Engine ──────────────────────────────────────────

def validate_and_fix_prompt(raw_prompt: str) -> dict:
    """
    Analyzes a Luma prompt for failure risks, applies automatic fixes,
    and returns the optimized prompt plus a full risk report.
    """
    risks     = []
    strategy  = []
    fixed     = raw_prompt

    # ── RISK 1: Word count ─────────────────────────────────────────────────
    words = len(raw_prompt.split())
    if words > 180:
        risks.append(("HIGH",   f"Word count: {words} words — server overload risk (limit ~180)"))
        strategy.append("Trim prompt to essential movement + visual + camera constraints")
    elif words > 130:
        risks.append(("MEDIUM", f"Word count: {words} words — near the safe limit"))
        strategy.append("Monitor length — consider trimming if generation fails")
    else:
        risks.append(("LOW",    f"Word count: {words} words — within safe range"))

    # ── RISK 2: Emoji detection ────────────────────────────────────────────
    emoji_pattern = re.compile(
        "[\U00010000-\U0010ffff"
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )
    emojis_found = emoji_pattern.findall(fixed)
    if emojis_found:
        risks.append(("HIGH", f"Emojis detected {emojis_found[:3]} — content filter risk"))
        strategy.append("Strip all emojis from prompt")
        fixed = emoji_pattern.sub("", fixed)
        fixed = re.sub(r"  +", " ", fixed).strip()
    else:
        risks.append(("LOW", "No emojis — OK"))

    # ── RISK 3: Latin bone terminology ─────────────────────────────────────
    found_latin = [t for t in LATIN_BONE_TERMS if t.lower() in fixed.lower()]
    if found_latin:
        risks.append(("MEDIUM", f"Latin bone terms: {found_latin} — may trigger content filter"))
        strategy.append("Replace Latin bone names with descriptive terms (e.g. 'arm bones', 'leg bones')")
        for term in found_latin:
            replacements = {
                "humerus": "upper arm bone", "radius": "forearm bone", "ulna": "forearm bone",
                "femur": "thigh bone", "tibia": "shin bone", "fibula": "lower leg bone",
                "patella": "kneecap", "scapula": "shoulder blade", "clavicle": "collarbone",
                "sternum": "chest bone", "pelvis": "hip bone", "vertebra": "spinal bone",
                "vertebrae": "spinal bones", "sacrum": "lower spine", "ilium": "hip bone",
                "ischium": "sit bone",
            }
            fixed = re.sub(term, replacements.get(term, "bone"), fixed, flags=re.IGNORECASE)
    else:
        risks.append(("LOW", "No Latin bone terms — OK"))

    # ── RISK 4: Meta-instructions (LLM logic, not video model commands) ────
    found_meta = []
    for pattern in META_INSTRUCTIONS:
        matches = re.findall(pattern, fixed, re.IGNORECASE)
        if matches:
            found_meta.append(pattern[:40])
    if found_meta:
        risks.append(("HIGH", f"Meta-instructions detected — Luma is NOT an LLM, these are ignored and waste tokens"))
        strategy.append("Remove all self-validation/regeneration instructions")
        for pattern in META_INSTRUCTIONS:
            fixed = re.sub(r"[^.]*" + pattern + r"[^.]*\.", "", fixed, flags=re.IGNORECASE)
        fixed = re.sub(r"  +", " ", fixed).strip()
    else:
        risks.append(("LOW", "No meta-instructions — OK"))

    # ── RISK 5: Numbered steps count ───────────────────────────────────────
    numbered_steps = re.findall(r"\b[1-9]\.\s", fixed)
    if len(numbered_steps) > 7:
        risks.append(("HIGH", f"{len(numbered_steps)} numbered steps — too complex, max 6"))
        strategy.append("Reduce movement steps to 6 maximum")
    elif len(numbered_steps) > 0:
        risks.append(("LOW", f"{len(numbered_steps)} numbered steps — OK"))

    # ── RISK 6: Full body / camera constraint ──────────────────────────────
    camera_terms = ["full body", "full-body", "zoomed out", "entire body", "no cropping"]
    has_camera   = any(t in fixed.lower() for t in camera_terms)
    if not has_camera:
        risks.append(("MEDIUM", "No camera/full-body constraint — risk of cropped character"))
        strategy.append("Append full-body camera safety constraint")
        fixed = fixed.rstrip(".").rstrip() + ". Full body always visible in frame, camera zoomed out, no cropping."
    else:
        risks.append(("LOW", "Camera constraint present — OK"))

    # ── Final word count after fixes ───────────────────────────────────────
    words_fixed = len(fixed.split())

    # ── Risk level summary ─────────────────────────────────────────────────
    high_count   = sum(1 for r in risks if r[0] == "HIGH")
    medium_count = sum(1 for r in risks if r[0] == "MEDIUM")

    if high_count >= 2:
        risk_level  = "HIGH"
        risk_reason = f"{high_count} HIGH-severity risks detected — generation may fail"
    elif high_count == 1 or medium_count >= 2:
        risk_level  = "MEDIUM"
        risk_reason = f"{high_count} HIGH + {medium_count} MEDIUM risks — monitor closely"
    else:
        risk_level  = "LOW"
        risk_reason = "No critical issues — good first-attempt success probability"

    return {
        "risks":               risks,
        "risk_level":          risk_level,
        "risk_reason":         risk_reason,
        "strategy":            strategy,
        "fixed_prompt":        fixed,
        "word_count_original": words,
        "word_count_fixed":    words_fixed,
    }


def print_validation_report(report: dict):
    RISK_ICON = {"HIGH": "[HIGH]  ", "MEDIUM": "[MED]   ", "LOW": "[LOW]   "}
    PROB_ICON = {"HIGH": "!! ALTO", "MEDIUM": "~ MEDIO", "LOW": "OK BAJO"}

    print(SEP)
    print(f"  RISK ANALYSIS ({len(report['risks'])} checks)")
    print(SEP)
    for level, msg in report["risks"]:
        print(f"  {RISK_ICON[level]} {msg}")

    print()
    prob = report["risk_level"]
    print(f"  FAILURE PROBABILITY: {PROB_ICON[prob]}")
    print(f"  {report['risk_reason']}")

    if report["strategy"]:
        print()
        print("  OPTIMIZATION APPLIED")
        for s in report["strategy"]:
            print(f"    - {s}")

    print()
    wc_orig  = report["word_count_original"]
    wc_fixed = report["word_count_fixed"]
    delta    = wc_orig - wc_fixed
    print(f"  FIXED PROMPT ({wc_fixed} words{f', -{delta} removed' if delta else ''})")
    preview = report["fixed_prompt"][:200]
    print(f"  \"{preview}{'...' if len(report['fixed_prompt']) > 200 else ''}\"")
    print(SEP)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_json(path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def ray_headers():
    return {
        "Authorization": f"luma-api-key {RAY_API_KEY}",
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    }

def submit(canal_cfg: dict, validated_prompt: str) -> str:
    payload = {
        "model":        canal_cfg.get("model", "ray-flash-2"),
        "prompt":       validated_prompt,
        "aspect_ratio": "16:9",
        "resolution":   canal_cfg.get("resolution", "1080p"),
        "duration":     canal_cfg.get("duration", "9s"),
        "loop":         canal_cfg.get("loop", True),
    }
    resp = requests.post(API_URL, headers=ray_headers(), json=payload, timeout=30)
    if not resp.ok:
        print(f"\n  API Error {resp.status_code}: {resp.text}")
    resp.raise_for_status()
    return resp.json()["id"]

def poll(ray_id: str) -> dict:
    resp = requests.get(f"{API_URL}/{ray_id}", headers=ray_headers(), timeout=30)
    resp.raise_for_status()
    return resp.json()

def download(url: str, dest: Path):
    resp = requests.get(url, stream=True, timeout=180)
    resp.raise_for_status()
    total = int(resp.headers.get("content-length", 0))
    done  = 0
    with open(dest, "wb") as f:
        for chunk in resp.iter_content(chunk_size=1024 * 64):
            f.write(chunk)
            done += len(chunk)
            if total:
                print(f"\r  Descargando: {done/total*100:.1f}%  ({done//1024} KB)", end="", flush=True)
    print(f"\r  {dest.name} — {done // 1024} KB descargados{' ' * 20}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Therapia Global — Produccion Maestra de Videos")
    parser.add_argument("--canal",   required=True,  help="Canal: CANAL_A_EJERCICIO | CANAL_B_OSTEOPATIA | CANAL_C_ESTIRAMIENTO")
    parser.add_argument("--tecnica", required=True,  help="Descripcion de la accion/tecnica")
    parser.add_argument("--force",   action="store_true", help="Forzar nueva submission aunque ya exista ray_id")
    parser.add_argument("--no-validate", action="store_true", help="Saltar validacion pre-vuelo")
    args = parser.parse_args()

    if not RAY_API_KEY:
        print("ERROR: RAY_API_KEY no configurado en pipeline/.env")
        sys.exit(1)

    config    = load_json(CONFIG_PATH, {})
    canal_cfg = config.get(args.canal)
    if not canal_cfg:
        print(f"ERROR: Canal '{args.canal}' no encontrado en PROMPTS_CONFIG.json")
        print(f"  Disponibles: {list(config.keys())}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / OUTPUT_FILENAMES.get(args.canal, f"{args.canal}.mp4")

    state = load_json(STATE_PATH, {})
    entry = state.get(args.canal, {})

    print(f"\n{'='*65}")
    print(f"  PRODUCCION MAESTRA — {args.canal}")
    print(f"  {canal_cfg['description']}")
    print(f"  Output: {out_file}")
    print(f"{'='*65}")

    # ── STEP 0: Pre-flight Validation ──────────────────────────────────────
    raw_prompt = canal_cfg["prompt_template"].replace("{action_technique}", args.tecnica)

    if args.no_validate:
        validated_prompt = raw_prompt
        print(f"\n[0/3] Validacion desactivada (--no-validate)")
    else:
        print(f"\n[0/3] Pre-flight Validation...")
        report = validate_and_fix_prompt(raw_prompt)
        print()
        print_validation_report(report)

        if report["risk_level"] == "HIGH":
            print(f"\n  ADVERTENCIA: Riesgo ALTO detectado.")
            print(f"  El prompt ha sido optimizado automaticamente.")
            print(f"  Considera revisar el FIXED PROMPT antes de continuar.")

        validated_prompt = report["fixed_prompt"]
        print(f"\n  Continuando en 3s...")
        time.sleep(3)

    # ── STEP 1: Submit ─────────────────────────────────────────────────────
    if entry.get("ray_id") and not args.force:
        print(f"\n[1/3] Ya enviado — ray_id: {entry['ray_id'][:12]}... (reanudando desde estado guardado)")
    else:
        print(f"\n[1/3] Enviando a Ray Flash 2...")
        print(f"  Prompt ({len(validated_prompt.split())} palabras / {len(validated_prompt)} chars)")
        try:
            ray_id = submit(canal_cfg, validated_prompt)
            entry  = {"ray_id": ray_id, "state": "queued", "downloaded": False, "tecnica": args.tecnica}
            state[args.canal] = entry
            save_json(STATE_PATH, state)
            print(f"  Enviado — ray_id: {ray_id[:12]}...")
        except Exception as e:
            print(f"  Error al enviar: {e}")
            sys.exit(1)

    # ── STEP 2: Poll until complete ────────────────────────────────────────
    print(f"\n[2/3] Generando... (poll cada {POLL_EVERY}s)")

    poll_n = 1
    while True:
        time.sleep(POLL_EVERY)
        try:
            info          = poll(entry["ray_id"])
            current_state = info.get("state", "unknown")
            entry["state"] = current_state
            state[args.canal] = entry
            save_json(STATE_PATH, state)
            print(f"  [{poll_n:02d}] Estado: {current_state}")
            poll_n += 1

            if current_state == "completed":
                video_url = info.get("assets", {}).get("video")
                if video_url:
                    entry["video_url"] = video_url
                    state[args.canal]  = entry
                    save_json(STATE_PATH, state)
                    break
                else:
                    print("  'completed' pero sin video URL.")
                    sys.exit(1)
            elif current_state == "failed":
                reason = info.get("failure_reason", "desconocido")
                print(f"\n  FAILED — Razon: {reason}")
                sys.exit(1)

        except KeyboardInterrupt:
            print("\n  Interrumpido — ray_id guardado, reanuda sin --force")
            sys.exit(0)
        except Exception as e:
            print(f"  error en poll: {e}")

    # ── STEP 3: Download ───────────────────────────────────────────────────
    print(f"\n[3/3] Completado! Descargando → {out_file.name}")
    try:
        download(entry["video_url"], out_file)
        entry["downloaded"] = True
        state[args.canal]   = entry
        save_json(STATE_PATH, state)
    except Exception as e:
        print(f"  Error al descargar: {e}")
        sys.exit(1)

    print(f"\n{'='*65}")
    print(f"  LISTO: {out_file}")
    size_mb = out_file.stat().st_size / (1024 * 1024)
    print(f"  Tamano: {size_mb:.1f} MB")
    print(f"{'='*65}\n")


if __name__ == "__main__":
    main()
