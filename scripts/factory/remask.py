#!/usr/bin/env python3
"""
Regenera SOLO la capa muscular (y la preview) de videos ya renderizados, sin repetir el pase gris.
Se usa cuando cambia el atlas o la lógica de la capa.

  python3 scripts/factory/remask.py renders/ola1 [--antes-de EPOCH] [-j 3]
"""
import argparse
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("carpeta")
ap.add_argument("--antes-de", type=float, default=1e12, help="sólo carpetas cuya capa sea anterior a este instante")
ap.add_argument("-j", type=int, default=3)
ap.add_argument("--ids", help="sólo estas fichas (lista separada por comas)")
ap.add_argument("--capa", choices=["atlas", "propia", "capsulas"], help="capa muscular a usar")
args = ap.parse_args()
dirs = [d for d in sorted(Path(args.carpeta).iterdir())
        if (d / "gris.mp4").exists() and (d / "capa_muscular.mov").exists()
        and (d / "capa_muscular.mov").stat().st_mtime < args.antes_de
        and (not args.ids or d.name.split("--")[0] in args.ids.split(","))]


def run(d):
    sid, var = d.name.split("--")
    v = "casa" if var == "casa" else "gym"
    r = subprocess.run(["blender", "-b", "--python-exit-code", "1", "-P", str(ROOT / "scripts/factory/engine.py"), "--",
                        "--spec", str(ROOT / "data/motion_specs" / f"{sid}.json"), "--variant", v, "--out", str(d), "--solo-mascara"] + (["--capa", args.capa] if args.capa else []),
                       capture_output=True, text=True)
    if r.returncode == 0:
        subprocess.run([sys.executable, "-I", str(ROOT / "scripts/factory/composite.py"), str(d)], capture_output=True)
    print(("✓ " if r.returncode == 0 else "✗ ") + d.name, flush=True)


with ThreadPoolExecutor(args.j) as ex:
    list(ex.map(run, dirs))
print("REMASK FIN", len(dirs))
