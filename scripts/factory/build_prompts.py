#!/usr/bin/env python3
"""
Fábrica de video — prompts para el pase de IA (video-to-video sobre gris.mp4).

  python3 scripts/factory/build_prompts.py renders/pilot

Escribe prompt.json en cada carpeta de render LISTO_PARA_IA:
  { "video_referencia": ".../gris.mp4", "prompt": "...", "negativo": "...", "duracion_s": 5.5 }
La descripción del movimiento sale de la ficha (no la inventa la IA): posición,
apoyos y objetos se describen literalmente; el movimiento lo fija el video gris.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
P = json.loads((ROOT / "data/prompt_presets.json").read_text(encoding="utf-8"))
EQ = json.loads((ROOT / "data/prop_equivalencias.json").read_text(encoding="utf-8"))["equivalencias"]
PRE = P["preset_estudio_mujer40"]
OBJ = P["objetos_en_ingles"]

POSICION = {
    "supino": "lying on her back on {mat}",
    "prono": "lying face down on {mat}",
    "bipedo": "standing upright, feet hip-width apart, flat on the floor",
}


def objects_for(spec, variant):
    names = []
    if spec["base"].get("colchoneta"):
        names.append(OBJ["colchoneta"])
    for pr in spec.get("props", []):
        kind = pr["tipo"] if variant in ("gym", "ambos") else EQ.get(pr["tipo"], {}).get("casa", pr["tipo"])
        names.append(OBJ.get(kind, kind.replace("_", " ")))
        if pr["uso"] == "banda_anclada":
            names.append(OBJ["poste"] if variant == "gym" else OBJ["puerta"])
    return names


def build(folder):
    rep = json.loads((folder / "reporte.json").read_text())
    spec = json.loads((ROOT / "data/motion_specs" / f"{rep['id']}.json").read_text(encoding="utf-8"))
    variant = folder.name.split("--")[-1]
    env = PRE["entorno"]["casa" if variant == "casa" else "gym"]
    objs = objects_for(spec, variant)
    pos = POSICION.get(spec["base"]["orientacion"], spec["base"]["orientacion"]).format(mat=OBJ["colchoneta"])
    prompt = (
        f"{PRE['sujeto']}, wearing {PRE['vestuario']}, {pos}, performing a slow controlled "
        f"physiotherapy exercise ({spec['nombre']}). "
        + (f"Objects in scene: {', '.join(objs)}. " if objs else "")
        + f"Setting: {env}. Lighting: {PRE['luz']}. Camera: {PRE['camara']}. {P['reglas_fijas']}"
    )
    out = {"id": rep["id"], "variante": variant, "video_referencia": str((folder / "gris.mp4").relative_to(ROOT)),
           "duracion_s": rep["duracion_s"], "prompt": prompt, "negativo": P["negativo"]}
    (folder / "prompt.json").write_text(json.dumps(out, ensure_ascii=False, indent=2))
    return out


if __name__ == "__main__":
    base = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "renders/pilot"
    for f in sorted(p for p in base.iterdir() if (p / "gris.mp4").exists()):
        o = build(f)
        print(f"{o['id']} [{o['variante']}] {len(o['prompt'])} chars")
