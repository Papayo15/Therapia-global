#!/usr/bin/env python3
"""
Valida fichas en paralelo (sin render).

  python3 scripts/factory/validate_all.py "F-CAD-*" [--out DIR] [-j 4] [--variant gym]
"""
import argparse
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("pattern", default="*")
ap.add_argument("--out", default=str(ROOT / "renders/_validacion"))
ap.add_argument("-j", type=int, default=4)
ap.add_argument("--variant", default="gym")
args = ap.parse_args()
specs = sorted(p for p in (ROOT / "data/motion_specs").glob(f"{args.pattern}.json") if not p.name.startswith("_"))


def run(spec):
    out = Path(args.out) / spec.stem
    out.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(["blender", "-b", "--python-exit-code", "1", "-P", str(ROOT / "scripts/factory/engine.py"), "--",
                        "--spec", str(spec), "--variant", args.variant, "--out", str(out), "--no-render"],
                       capture_output=True, text=True)
    (out / "log.txt").write_text(r.stdout[-20000:] + "\n" + r.stderr[-20000:])
    rep = out / "reporte.json"
    if r.returncode != 0 or not rep.exists():
        tb = [l for l in (r.stdout + r.stderr).splitlines() if "Error" in l or "SystemExit" in l or "assert" in l.lower()]
        return spec.stem, False, "CRASH " + " | ".join(tb[-3:])
    d = json.loads(rep.read_text())
    c = d["checks"]
    bad = {k: v for k, v in c["contactos"].items() if not v["ok"]}
    bad.update({k: v for k, v in c.items() if k != "contactos" and not v["ok"]})
    return spec.stem, d["ok"], json.dumps(bad, ensure_ascii=False)[:300]


with ThreadPoolExecutor(args.j) as ex:
    results = list(ex.map(run, specs))
for sid, ok, msg in results:
    print(("OK   " if ok else "MAL  ") + sid + ("" if ok else "  " + msg))
print(f"{sum(ok for _, ok, _ in results)}/{len(results)} válidas")
