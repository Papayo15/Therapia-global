#!/usr/bin/env python3
"""
pipeline/generar_v2_elite.py
PoC V2 Élite — Active Muscle Glow + X-ray Overlay + Void blanco puro.

Prompt técnico maestro con 3 modificadores de élite:
  1. Bioluminescent muscle recruitment (SSS amber glow en agonistas)
  2. X-ray anatomical overlay (40% opacity en tejido inactivo)
  3. Overexposed white void (sin sombras, modelo flotando)

Flujo: Enviado → Generando → Descargando → video_maestro_V2.mp4
Reanudable: poc_v2_state.json guarda ray_id para reanudar si se interrumpe.
"""

import json
import os
import sys
import time
from pathlib import Path

try:
    from dotenv import load_dotenv
    import requests
    from tqdm import tqdm
except ImportError:
    print("ERROR: pip3 install requests python-dotenv tqdm")
    sys.exit(1)

# ─── Rutas ────────────────────────────────────────────────────────────────────
PIPELINE_DIR = Path(__file__).parent
ENV_PATH     = PIPELINE_DIR / ".env"
STATE_PATH   = PIPELINE_DIR / "poc_v5_state.json"
OUTPUT_PATH  = Path.home() / "Desktop" / "PRUEBA_MAESTRA_THERAPIA" / "video_maestro_V5.mp4"

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv(ENV_PATH)
RAY_API_KEY  = os.getenv("RAY_API_KEY", "")
API_URL      = "https://api.lumalabs.ai/dream-machine/v1/generations"
POLL_SECONDS = 60

MODEL        = "ray-flash-2"
RESOLUTION   = "1080p"
DURATION     = "9s"
ASPECT_RATIO = "16:9"

# ─── Prompt Maestro V5-Lite — El Molde (condensado para Ray Flash 2) ─────────
PROMPT = (
    "Scientific holographic medical visualization, abstract anatomical human model (NO FACES, neutro). "
    "Full-body burpee with dumbbells on a Bosu ball. "
    "Complete skeleton opaque and primary (spine, ribs, all limb bones). "
    "Muscles at 90% transparency, only contracting muscles glow amber. "
    "Bosu ball deforms on contact, dumbbells solid with proper grip. "
    "Pure white void (#FFFFFF), no shadows. "
    "Seamless 9s loop, 1080p."
)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_state():
    if STATE_PATH.exists():
        with open(STATE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_state(data):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def submit_video():
    headers = {
        "Authorization": f"luma-api-key {RAY_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "model":        MODEL,
        "prompt":       PROMPT,
        "aspect_ratio": ASPECT_RATIO,
        "resolution":   RESOLUTION,
        "duration":     DURATION,
        "loop":         True,
    }
    resp = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    data   = resp.json()
    ray_id = data.get("id", "")
    if not ray_id:
        raise ValueError(f"Sin ID en respuesta: {data}")
    return ray_id

def check_status(ray_id):
    headers = {
        "Authorization": f"luma-api-key {RAY_API_KEY}",
        "Accept": "application/json",
    }
    resp = requests.get(f"{API_URL}/{ray_id}", headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()

def download_mp4(url, dest):
    resp  = requests.get(url, stream=True, timeout=300)
    resp.raise_for_status()
    total = int(resp.headers.get("content-length", 0))
    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(dest, "wb") as f, tqdm(
        total=total, unit="B", unit_scale=True,
        desc=dest.name
    ) as bar:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
            bar.update(len(chunk))

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not RAY_API_KEY:
        print("ERROR: RAY_API_KEY no encontrado en pipeline/.env")
        sys.exit(1)

    print("=" * 68)
    print("  Therapia Global — PoC V2 Élite")
    print("  SSS · Bioluminescent Glow · X-Ray Overlay · White Void")
    print(f"  Modelo: {MODEL} | {RESOLUTION} | {DURATION} | A_DIF_999")
    print("=" * 68)
    print()

    state  = load_state()
    ray_id = state.get("ray_id", "")

    # ── PASO 1: Enviar ────────────────────────────────────────────
    if not ray_id:
        print("[1/3] Enviando V2 a Ray Flash 2...")
        print(f"      Prompt: {PROMPT[:90]}...")
        try:
            ray_id = submit_video()
            state  = {"ray_id": ray_id, "status": "enviado"}
            save_state(state)
            print(f"      ✅ Enviado — ray_id: {ray_id}")
        except requests.exceptions.HTTPError as e:
            print(f"      ✗ Error HTTP {e.response.status_code}: {e.response.text}")
            sys.exit(1)
        except Exception as e:
            print(f"      ✗ Error: {e}")
            sys.exit(1)
    else:
        print(f"[1/3] ✅ Ya enviado (reanudando) — ray_id: {ray_id}")

    # ── PASO 2: Polling ───────────────────────────────────────────
    print()
    print(f"[2/3] Generando... (verifico cada {POLL_SECONDS}s, ~5-10 min)")
    intento   = 0
    video_url = None

    while True:
        intento += 1
        try:
            result    = check_status(ray_id)
            state_api = result.get("state", "desconocido")
            pct       = result.get("progress", "")
            pct_str   = f" ({int(pct * 100)}%)" if isinstance(pct, (int, float)) else ""
            print(f"      [{intento}] {state_api}{pct_str}")

            if state_api == "completed":
                video_url = result.get("assets", {}).get("video", "")
                if not video_url:
                    print("      ✗ Completado pero sin URL de video.")
                    sys.exit(1)
                state["status"]    = "completado"
                state["video_url"] = video_url
                save_state(state)
                print("      ✅ ¡Completado!")
                break

            elif state_api == "failed":
                motivo = result.get("failure_reason", "desconocido")
                print(f"      ✗ FALLIDO: {motivo}")
                sys.exit(1)

        except Exception as e:
            print(f"      ⚠ Error: {e}")

        time.sleep(POLL_SECONDS)

    # ── PASO 3: Descargar ─────────────────────────────────────────
    print()
    print(f"[3/3] Descargando → {OUTPUT_PATH.name}")
    try:
        download_mp4(video_url, OUTPUT_PATH)
        size_mb = OUTPUT_PATH.stat().st_size / (1024 * 1024)
        print(f"      ✅ Descargado ({size_mb:.1f} MB)")
    except Exception as e:
        print(f"      ✗ Error: {e}")
        sys.exit(1)

    print()
    print("=" * 68)
    print("  ✅ VIDEO MAESTRO V2 LISTO:")
    print(f"  {OUTPUT_PATH}")
    print()
    print("  Valida los 5 efectos técnicos de élite:")
    print("  → [SSS]    Piel semitransparente con scattering subsuperficial")
    print("  → [GLOW]   Brillo ámbar en músculos activos (agonistas)")
    print("  → [X-RAY]  Columna, costillas y articulaciones visibles al 40%")
    print("  → [VOID]   Fondo #FFFFFF, sin sombras, modelo flotante")
    print("  → [LOOP]   9s idéntico al inicio y al final")
    print()
    print("  Si el estilo es OK → lanzar batch completo:")
    print("  python3 pipeline/batch_generator_ray.py")
    print("=" * 68)

if __name__ == "__main__":
    main()
