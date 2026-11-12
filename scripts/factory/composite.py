#!/usr/bin/env python3
"""
Fábrica de video — composición (ffmpeg).

  python3 scripts/factory/composite.py renders/pilot/F-CAD-007 [--base video_ia.mp4]

Genera en la carpeta:
  gris.mp4            referencia de movimiento (entrada del video-to-video)
  capa_muscular.mov   máscara RGBA ya recortada a la silueta y con glow (ProRes 4444)
  preview.mp4         base (gris o el video de IA) + capa muscular
  hoja.jpg            hoja de contactos de preview.mp4 (control de calidad)
"""
import argparse
import json
import subprocess
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("folder")
ap.add_argument("--base", help="Video de IA ya generado; por defecto usa el pase gris")
ap.add_argument("--conservar-cuadros", action="store_true")
ap.add_argument("--opacidad", type=float, default=0.55)
args = ap.parse_args()
d = Path(args.folder)
fps = json.loads((d / "reporte.json").read_text())["frames"] and 24


def ff(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)


if (d / "gris/f_0001.png").exists():          # tras la limpieza sólo queda gris.mp4 (remask)
    ff("-framerate", str(fps), "-i", str(d / "gris/f_%04d.png"),
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-movflags", "+faststart", str(d / "gris.mp4"))

# superficial (proyectado en la piel, nítido) + profundo (rayos X, 45 %) → una sola capa
deep = d / "mascara_prof"
if deep.exists() and any(deep.iterdir()):
    ff("-framerate", str(fps), "-i", str(d / "mascara/f_%04d.png"), "-framerate", str(fps), "-i", str(deep / "f_%04d.png"),
       "-filter_complex", "[0:v]format=rgb24[a];[1:v]format=rgb24,colorchannelmixer=rr=0.45:gg=0.45:bb=0.45[b];[a][b]blend=all_mode=lighten,format=rgba",
       str(d / "mascara_mix_%04d.png"))
    src_mask = str(d / "mascara_mix_%04d.png")
else:
    src_mask = str(d / "mascara/f_%04d.png")
ff("-framerate", str(fps), "-i", src_mask,
   "-framerate", str(fps), "-i", str(d / "silueta/f_%04d.png"),
   "-filter_complex",
   "[0:v]format=rgba,colorchannelmixer=aa=0:ar=1.2:ag=1.2:ab=1.2,split[m1][m2];"
   "[m2]gblur=sigma=6[glow];"
   "[m1][glow]blend=all_mode=screen[mg];"
   "[1:v]format=rgba,alphaextract[sa];"
   "[mg]format=rgba,alphaextract[ma];"
   "[ma][sa]blend=all_mode=multiply,gblur=sigma=1.2[a];"
   "[mg]format=rgb24[rgb];"
   "[rgb][a]alphamerge[out]",
   "-map", "[out]", "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le",
   str(d / "capa_muscular.mov"))

base = args.base or str(d / "gris.mp4")
ff("-i", base, "-i", str(d / "capa_muscular.mov"),
   "-filter_complex",
   f"[1:v]format=rgba,colorchannelmixer=aa={args.opacidad}[m];"
   "[0:v][m]overlay=shortest=1:format=auto[v]",
   "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
   "-movflags", "+faststart", str(d / "preview.mp4"))

ff("-i", str(d / "preview.mp4"), "-vf", "fps=1.6,scale=320:-2,tile=3x3", "-frames:v", "1", str(d / "hoja.jpg"))
for f in d.glob("mascara_mix_*.png"):
    f.unlink()
print("OK", d)

# limpieza: los cuadros PNG se regeneran con remask.py; quedan sólo los videos
import shutil
if not args.conservar_cuadros:
    for sub in ("gris", "mascara", "mascara_prof", "silueta"):
        shutil.rmtree(d / sub, ignore_errors=True)
    for f in list(d.glob("mascara_mix_*.png")) + [d / "escena.blend1"]:
        f.unlink(missing_ok=True)
