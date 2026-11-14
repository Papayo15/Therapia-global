#!/usr/bin/env python3
"""
Auditoría de TODA la fábrica (fichas + videos), para que los errores vistos en revisión no se repitan.

  python3 scripts/factory/audit.py                 → reporte de fichas (rápido)
  python3 scripts/factory/audit.py --videos        → además analiza la capa muscular de cada video (fotograma del pico)

Fichas:
  - mismo músculo como activo y elongado del mismo lado (colores encimados)
  - ficha sin ningún músculo en rojo (sólo azul)
  - carpetas de render obsoletas (variante que la ficha ya no tiene)
Videos (capa_muscular.mov, en el pico):
  - sin capa muscular visible
  - mezcla rojo+azul en los mismos píxeles (magenta)
  - falta un color que la ficha pide (p.ej. hay elongados pero no se ve azul)
Salida: renders/ola1/auditoria.json
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("--renders", default="renders/ola1")
ap.add_argument("--videos", action="store_true")
args = ap.parse_args()
RD = ROOT / args.renders

specs = {}
for p in sorted((ROOT / "data/motion_specs").glob("*.json")):
    if p.name.startswith("_"):
        continue
    specs[p.stem] = json.loads(p.read_text(encoding="utf-8"))


def tags(s):
    v = s.get("variantes", ["gym"])
    return ["ambos"] if v == ["gym"] and s.get("nota_variantes") else v


out = {"fichas": {}, "videos": {}, "obsoletas": []}
RED_ROLES = ("activos", "estabilizan", "sostienen")
BLUE_ROLES = ("elongan", "estirados")
for sid, s in specs.items():
    m = s.get("musculos", {})
    issues = []
    act = {(x["id"], x.get("lado")) for r in RED_ROLES for x in m.get(r, [])}
    blu = {(x["id"], x.get("lado")) for r in BLUE_ROLES for x in m.get(r, [])}
    for (i, sd) in act:
        if any(j == i and (sd is None or s2 is None or s2 == sd) for j, s2 in blu):
            issues.append(f"encimado:{i}")
    if not act:
        issues.append("solo_azul")
    if issues:
        out["fichas"][sid] = issues

if RD.exists():
    for d in sorted(RD.iterdir()):
        if not d.is_dir() or "--" not in d.name or d.name.startswith("_"):
            continue
        sid, tag = d.name.split("--")
        if sid not in specs or tag not in tags(specs[sid]):
            out["obsoletas"].append(d.name)


def peak_time(s):
    ks = s["keys"]
    best = max(ks, key=lambda k: k.get("p", 0))
    nxt = [k for k in ks if k["t"] > best["t"]]
    return (best["t"] + nxt[0]["t"]) / 2 if nxt and nxt[0].get("p", 0) == best.get("p", 0) else best["t"]


if args.videos and RD.exists():
    for d in sorted(RD.iterdir()):
        mov = d / "capa_muscular.mov"
        if not mov.exists() or d.name in out["obsoletas"]:
            continue
        sid = d.name.split("--")[0]
        s = specs[sid]
        t = peak_time(s)
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(mov), "-frames:v", "1",
                              "-vf", "scale=320:180", "-f", "rawvideo", "-pix_fmt", "rgba", "-"], capture_output=True).stdout
        if len(raw) != 320 * 180 * 4:
            out["videos"][d.name] = ["no_se_pudo_leer"]
            continue
        a = np.frombuffer(raw, np.uint8).reshape(180, 320, 4).astype(float) / 255
        vis = a[..., 3] > 0.25
        n = int(vis.sum())
        px = a[..., :3][vis]
        mx, mn = px.max(1), px.min(1)
        sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
        rr, gg, bb = px[:, 0], px[:, 1], px[:, 2]
        hue = np.degrees(np.arctan2(np.sqrt(3) * (gg - bb), 2 * rr - gg - bb)) % 360
        col = sat > 0.25
        red = int((col & ((hue < 20) | (hue >= 340))).sum())
        ora = int((col & (hue >= 20) & (hue < 60)).sum())
        blue = int((col & (hue >= 180) & (hue < 260)).sum())
        mag = int((col & (hue >= 260) & (hue < 340)).sum())
        m = s.get("musculos", {})
        iss = []
        if n < 15:
            iss.append("sin_capa_visible")
        else:
            if mag > 0.15 * n:
                iss.append(f"rojo_azul_encimados:{mag}/{n}")
            if any(m.get(r_) for r_ in BLUE_ROLES) and blue == 0 and mag == 0:
                iss.append("falta_azul")
            if any(m.get(r_) for r_ in RED_ROLES) and red + ora == 0 and mag == 0:
                iss.append("falta_rojo")
        out["videos"][d.name] = iss or "ok"

RD.mkdir(parents=True, exist_ok=True)
(RD / "auditoria.json").write_text(json.dumps(out, ensure_ascii=False, indent=2))
bad_v = {k: v for k, v in out["videos"].items() if v != "ok"}
print(f"Fichas con problemas: {len(out['fichas'])}  |  carpetas obsoletas: {len(out['obsoletas'])}  |  "
      f"videos revisados: {len(out['videos'])}, con problemas: {len(bad_v)}")
for k, v in list(out["fichas"].items())[:80]:
    print("  ficha", k, v)
for k in out["obsoletas"]:
    print("  obsoleta", k)
for k, v in list(bad_v.items())[:120]:
    print("  video", k, v)
