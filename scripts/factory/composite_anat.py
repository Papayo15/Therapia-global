#!/usr/bin/env python3
"""
Vista anatómica: anat/f_####.png → anatomico.mp4 (video limpio; la app dibuja las etiquetas en el idioma del paciente)
y anatomico_etiquetas.mp4 (revisión: nombres en español quemados, con línea al músculo y color de su fase).

  python3 scripts/factory/composite_anat.py renders/ola1/F-CAD-007--ambos
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

d = Path(sys.argv[1])
lab = json.loads((d / "etiquetas.json").read_text())
if lab.get("paso", 1) > 1:                                  # posiciones cada N cuadros → se repiten para cada cuadro
    st = lab["paso"]
    lab["pos"] = [lab["pos"][min(i // st, len(lab["pos"]) - 1)] for i in range(lab["frames"])]
fps = lab["fps"]
frames = sorted((d / "anat").glob("f_*.png"))


def ff(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)


ff("-framerate", str(fps), "-i", str(d / "anat/f_%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
   "-movflags", "+faststart", str(d / "anatomico.mp4"))

# músculos bilaterales: UNA etiqueta (por cuadro, el lado que más se ve)
_ids = {}
for j, m in enumerate(lab["musculos"]):
    _ids.setdefault(m["id"], []).append(j)
mus2, pos2 = [], [[] for _ in lab["pos"]]
for mid, js in _ids.items():
    m = dict(lab["musculos"][js[0]])
    if len(js) > 1:
        m["lado"] = None
    mus2.append(m)
    for i, r in enumerate(lab["pos"]):
        cands = [r[j] for j in js if r[j]]
        pos2[i].append(max(cands, key=lambda c: (c[2], c[3])) if cands else None)
lab["musculos"], lab["pos"] = mus2, pos2

# posiciones suavizadas (media móvil circular: el clip es un loop)
P = []
n = len(lab["pos"])
for j in range(len(lab["musculos"])):
    arr = np.array([r[j][:2] if r[j] else [np.nan, np.nan] for r in lab["pos"]], float)
    vis = np.array([r[j][2] * r[j][3] if r[j] else 0 for r in lab["pos"]], float)
    k = 7
    sm = np.array([np.nanmean(arr[[(i + o) % n for o in range(-k, k + 1)]], axis=0) for i in range(n)])
    vs = np.array([np.mean(vis[[(i + o) % n for o in range(-k, k + 1)]]) for i in range(n)])
    P.append((sm, vs))

try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
except OSError:
    font = ImageFont.load_default()
tmp = d / "anat_lab"
tmp.mkdir(exist_ok=True)
W, H = lab["resolucion"]
for i, f in enumerate(frames):
    im = Image.open(f).convert("RGB")
    px = np.asarray(im)
    dr = ImageDraw.Draw(im)
    items = []
    for j, m in enumerate(lab["musculos"]):
        (sm, vs) = P[j]
        if i >= len(sm) or np.isnan(sm[i]).any() or vs[i] < 0.12:
            continue
        x, y = sm[i][0] * W, sm[i][1] * H
        if not (0 <= x < W and 0 <= y < H):
            continue
        items.append((y, x, m, vs[i]))
    # columnas a izquierda/derecha del cuerpo, sin encimarse
    for side in (0, 1):
        col = sorted([it for it in items if (it[1] >= W / 2) == bool(side)])
        ys_used = []
        for (y, x, m, a) in col:
            ty = y
            for u in ys_used:
                if abs(ty - u) < 36:
                    ty = u + 36
            ys_used.append(ty)
            tx = W - 330 if side else 30
            c = tuple(int(v) for v in px[int(min(H - 1, y)), int(min(W - 1, x))])
            name = m["nombre_es"] + (f" {'der.' if m['lado'] == 'R' else 'izq.'}" if m["lado"] else "")
            alpha = min(1.0, a * 1.4)
            txt_c = tuple(int(255 * alpha + 30 * (1 - alpha)) for _ in range(3))
            line_c = tuple(int(cc * alpha + 30 * (1 - alpha)) for cc in c)
            ax = tx + (0 if side else dr.textlength(name, font=font))
            dr.line([(x, y), (ax + (-8 if side else 8), ty + 14)], fill=line_c, width=3)
            dr.ellipse([x - 5, y - 5, x + 5, y + 5], fill=line_c)
            dr.text((tx, ty), name, font=font, fill=txt_c)
    im.save(tmp / f.name)
ff("-framerate", str(fps), "-i", str(tmp / "f_%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
   "-movflags", "+faststart", str(d / "anatomico_etiquetas.mp4"))
shutil.rmtree(tmp)
if "--conservar-cuadros" not in sys.argv:
    shutil.rmtree(d / "anat", ignore_errors=True)
print("OK", d)
