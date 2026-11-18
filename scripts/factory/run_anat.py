#!/usr/bin/env python3
"""Vista anatómica de todos los videos ya renderizados (ola1 + ola2).
  python3 scripts/factory/run_anat.py renders/ola1 renders/ola2 [-j 3] [--ids A,B] [--rehacer]
"""
import argparse
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("carpetas", nargs="+")
ap.add_argument("-j", type=int, default=3)
ap.add_argument("--ids")
ap.add_argument("--rehacer", action="store_true")
a = ap.parse_args()
# una vista anatómica por FICHA (la de gym o "ambos"): la app la muestra una vez por ejercicio
dirs = [d for c in a.carpetas for d in sorted(Path(c).iterdir()) if d.is_dir() and d.name.endswith(("--gym", "--ambos"))
        and (a.rehacer or not (d / "anatomico.mp4").exists())
        and (not a.ids or d.name.split("--")[0] in a.ids.split(","))]


def run(d):
    sid, var = d.name.split("--")
    v = "casa" if var == "casa" else "gym"
    r = subprocess.run(["blender", "-b", "--python-exit-code", "1", "-P", str(ROOT / "scripts/factory/engine.py"), "--",
                        "--spec", str(ROOT / "data/motion_specs" / f"{sid}.json"), "--variant", v, "--out", str(d), "--anatomico"],
                       capture_output=True, text=True)
    ok = r.returncode == 0
    if ok:
        ok = subprocess.run([sys.executable, str(ROOT / "scripts/factory/composite_anat.py"), str(d)], capture_output=True).returncode == 0
    else:
        (d / "anat_error.log").write_text(r.stdout[-4000:] + r.stderr[-4000:])
    print(("✓ " if ok else "✗ ") + d.name, flush=True)


with ThreadPoolExecutor(a.j) as ex:
    list(ex.map(run, dirs))
print("ANAT FIN", len(dirs))
