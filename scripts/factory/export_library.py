#!/usr/bin/env python3
"""Publica los videos de la fábrica para la app.

Lee data/biblioteca.json y renders/ola*/<id>--<variante>/ y escribe:
  - data/video-library.json  → catálogo que usa la app (ids, nombres, músculos, rutas de video)
  - public/videos/fabrica/<id>/{<variante>.mp4, anatomico.mp4, etiquetas.json}  (enlaces duros, no ocupan disco)

Las rutas del catálogo son relativas a la base de videos; la app les antepone
NEXT_PUBLIC_VIDEO_BASE (por defecto /videos/fabrica), así el día que se elija
dónde alojarlos basta con subir la carpeta y cambiar esa variable.

Una ficha se publica sólo si tiene preview.mp4 y su reporte pasa los checks.
Las que estén en cuarentena (renders/_previo_fix) no aparecen porque no están en ola*/.
"""
import json, os, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RENDERS = ROOT / "renders"
OUT_DIR = ROOT / "public" / "videos" / "fabrica"
OUT_JSON = ROOT / "data" / "video-library.json"
VAR_ORDEN = ["gym", "casa", "ambos"]


def enlazar(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if dst.stat().st_ino == src.stat().st_ino:
            return
        dst.unlink()
    try:
        os.link(src, dst)
    except OSError:
        shutil.copy2(src, dst)


def hacer_poster(video: Path, dst: Path):
    """Miniatura para la galería: cuadro de máxima amplitud (mitad del clip, que es ida-pico-vuelta)."""
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                               capture_output=True, text=True).stdout.strip() or 4)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{dur * 0.5:.2f}", "-i", str(video), "-frames:v", "1",
                    "-vf", "scale=480:-2", "-q:v", "4", str(dst)], check=True)


def main():
    bib = json.load(open(ROOT / "data" / "biblioteca.json"))["items"]
    carpetas: dict[str, dict[str, Path]] = {}
    for ola in sorted(RENDERS.glob("ola*")):
        for d in ola.iterdir():
            if d.is_dir() and "--" in d.name and (d / "preview.mp4").exists():
                i, v = d.name.split("--", 1)
                carpetas.setdefault(i, {})[v] = d

    items, sin_video, malos = [], [], []
    vivos = set()
    for it in bib:
        vs = carpetas.get(it["id"])
        if not vs:
            sin_video.append(it["id"])
            continue
        variantes, anat = [], None
        for v in sorted(vs, key=lambda x: VAR_ORDEN.index(x) if x in VAR_ORDEN else 9):
            d = vs[v]
            rep = d / "reporte.json"
            if rep.exists() and not json.load(open(rep)).get("ok", True):
                malos.append(d.name)
                continue
            enlazar(d / "preview.mp4", OUT_DIR / it["id"] / f"{v}.mp4")
            vivos.add(f"{it['id']}/{v}.mp4")
            poster = OUT_DIR / it["id"] / f"{v}.jpg"
            if not poster.exists() or poster.stat().st_mtime < (d / "preview.mp4").stat().st_mtime:
                hacer_poster(d / "preview.mp4", poster)
            vivos.add(f"{it['id']}/{v}.jpg")
            variantes.append({"variante": v, "video": f"{it['id']}/{v}.mp4", "poster": f"{it['id']}/{v}.jpg"})
            if anat is None and (d / "anatomico.mp4").exists() and (d / "etiquetas.json").exists():
                enlazar(d / "anatomico.mp4", OUT_DIR / it["id"] / "anatomico.mp4")
                enlazar(d / "etiquetas.json", OUT_DIR / it["id"] / "etiquetas.json")
                vivos.update({f"{it['id']}/anatomico.mp4", f"{it['id']}/etiquetas.json"})
                anat = {"video": f"{it['id']}/anatomico.mp4", "etiquetas": f"{it['id']}/etiquetas.json"}
        if not variantes:
            continue
        m = it.get("musculos") or {}
        activos = {x for g in m.get("activos", []) for x in g["ids"]}
        elongan = {x for k in ("elongan", "estirados") for g in m.get(k, []) for x in g["ids"]}
        if not activos and not elongan and anat:
            # osteopatía: la biblioteca no lista músculos; se usan los que la fábrica resaltó en la vista anatómica
            for mu in json.load(open(OUT_DIR / anat["etiquetas"]))["musculos"]:
                (elongan if mu["rol"] in ("elongan", "estirados") else activos).add(mu["id"])
        items.append({
            "id": it["id"],
            "slug": it["slug"],
            "categoria": it["categoria"],
            "region": it["region"],
            "nombre": it["nombre"],
            "nivel": it.get("nivel"),
            "nivel_nombre": it.get("nivel_nombre"),
            "movimiento": it.get("movimiento"),
            "tipo": it.get("tipo"),
            "estructuras": it.get("estructuras"),
            "props": it.get("props_detectados", []),
            "musculos": {
                "activos": sorted(activos),
                "elongan": sorted(elongan),
            },
            "variantes": variantes,
            "anatomico": anat,
        })

    # retirar del directorio público lo que ya no se publica (p. ej. fichas en cuarentena)
    if OUT_DIR.exists():
        for f in OUT_DIR.glob("*/*"):
            if f"{f.parent.name}/{f.name}" not in vivos:
                f.unlink()
        for d in OUT_DIR.iterdir():
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()

    json.dump({"version": 1, "total": len(items), "items": items}, open(OUT_JSON, "w"), ensure_ascii=False, indent=1)
    print(f"publicadas {len(items)} fichas · sin video {len(sin_video)}: {','.join(sin_video)}")
    if malos:
        print("reporte con fallas (no publicadas):", ",".join(malos))
    sin_anat = [x["id"] for x in items if not x["anatomico"]]
    if sin_anat:
        print("sin vista anatómica:", ",".join(sin_anat))


if __name__ == "__main__":
    sys.exit(main())
