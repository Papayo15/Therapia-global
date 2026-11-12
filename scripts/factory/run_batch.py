#!/usr/bin/env python3
"""
Fábrica de video — lote.

  python3 scripts/factory/run_batch.py data/motion_specs/F-CAD-007.json data/motion_specs/E-067.json ...
  python3 scripts/factory/run_batch.py --all

Por cada ficha y variante: motor (validación) → si pasa, render → composición.
Si la validación falla, NO se renderiza (no se gasta tiempo ni créditos de IA).
Resumen en renders/lote_resumen.json.
"""
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BLENDER = "blender"

ap = argparse.ArgumentParser()
ap.add_argument("specs", nargs="*")
ap.add_argument("--all", action="store_true")
ap.add_argument("--out", default="renders/pilot")
ap.add_argument("-j", type=int, default=1, help="renders en paralelo")
args = ap.parse_args()
specs = sorted((ROOT / "data/motion_specs").glob("*.json")) if args.all else [Path(s) for s in args.specs]

from concurrent.futures import ThreadPoolExecutor

jobs = []
for spec_path in specs:
    if spec_path.name.startswith("_"):
        continue
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    variants = spec.get("variantes", ["gym"])
    for v in variants:
        jobs.append((spec_path, spec, v, "ambos" if variants == ["gym"] and spec.get("nota_variantes") else v))


def job(t):
    spec_path, spec, v, tag = t
    if True:
        out = ROOT / args.out / f"{spec['id']}--{tag}"
        if (out / "preview.mp4").exists():                     # ya terminado: se salta
            return {"id": spec["id"], "variante": tag, "carpeta": str(out.relative_to(ROOT)), "estado": "LISTO_PARA_IA"}
        t0 = time.time()
        cmd = [BLENDER, "-b", "--python-exit-code", "1", "-P", str(ROOT / "scripts/factory/engine.py"), "--",
               "--spec", str(spec_path), "--variant", v, "--out", str(out), "--no-render"]
        r = subprocess.run(cmd, capture_output=True, text=True)
        rep = json.loads((out / "reporte.json").read_text()) if (out / "reporte.json").exists() else None
        row = {"id": spec["id"], "variante": tag, "carpeta": str(out.relative_to(ROOT))}
        if r.returncode != 0 or not rep or not rep["ok"]:
            row.update(estado="RECHAZADO_VALIDACION", reporte=rep, error=r.stderr[-800:] if r.returncode else None)
            print(f"✗ {spec['id']} [{tag}] validación fallida", flush=True)
        else:
            cmd.remove("--no-render")
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode != 0:
                row.update(estado="ERROR_RENDER", error=r.stderr[-800:])
            else:
                subprocess.run([sys.executable, "-I", str(ROOT / "scripts/factory/composite.py"), str(out)], check=True)
                row.update(estado="LISTO_PARA_IA", segundos=round(time.time() - t0))
            print(f"✓ {spec['id']} [{tag}] {row['estado']} ({round(time.time() - t0)} s)", flush=True)
        return row


with ThreadPoolExecutor(args.j) as ex:
    summary = list(ex.map(job, jobs))

(ROOT / args.out).mkdir(parents=True, exist_ok=True)
(ROOT / args.out / "lote_resumen.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
print("FIN", sum(r["estado"] == "LISTO_PARA_IA" for r in summary), "/", len(summary))
