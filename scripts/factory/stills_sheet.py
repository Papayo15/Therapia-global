#!/usr/bin/env python3
"""
Hojas de revisión visual: una foto fija del PICO de cada ficha, 8 por hoja.

  python3 scripts/factory/stills_sheet.py "F-ROD-*" --out renders/_revision/pierna [-j 2]
"""
import argparse
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("pattern")
ap.add_argument("--out", required=True)
ap.add_argument("-j", type=int, default=2)
args = ap.parse_args()
out = Path(args.out)
specs = sorted(p for p in (ROOT / "data/motion_specs").glob(f"{args.pattern}.json") if not p.name.startswith("_"))


def run(p):
    d = json.loads(p.read_text())
    peak = max(d["keys"], key=lambda k: k.get("p", 0))
    fr = 1 + round(peak["t"] * d.get("fps", 24))
    v = "casa" if "casa" in d.get("variantes", []) else "gym"
    o = out / p.stem
    subprocess.run(["blender", "-b", "--python-exit-code", "1", "-P", str(ROOT / "scripts/factory/engine.py"), "--",
                    "--spec", str(p), "--variant", v, "--out", str(o), "--still", str(fr)], capture_output=True)
    return p.stem, v, o / f"still_{fr}.png"


with ThreadPoolExecutor(args.j) as ex:
    res = list(ex.map(run, specs))
ims = []
for sid, v, f in res:
    if f.exists():
        im = Image.open(f).convert("RGB").resize((480, 270))
        ImageDraw.Draw(im).text((8, 6), f"{sid} [{v}]", fill=(0, 0, 0))
        ims.append(im)
    else:
        print("sin imagen:", sid)
for i in range(0, len(ims), 8):
    sh = Image.new("RGB", (960, 1080), "white")
    for j, im in enumerate(ims[i:i + 8]):
        sh.paste(im, ((j % 2) * 480, (j // 2) * 270))
    sh.save(out / f"hoja_{i // 8}.jpg", quality=85)
print(f"{len(ims)} fotos → {out}")
