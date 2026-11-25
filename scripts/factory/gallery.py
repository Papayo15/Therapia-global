#!/usr/bin/env python3
"""
Galería local de revisión: todos los preview.mp4 de una carpeta de renders en una sola página.

  python3 scripts/factory/gallery.py renders/ola1      →  renders/ola1/galeria.html  (abrir en el navegador)

Los videos se cargan sólo al hacer scroll (preload="none") para que la página sea ligera.
"""
import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
base = Path(sys.argv[1] if len(sys.argv) > 1 else "renders/ola1")
if not base.is_absolute():
    base = ROOT / base

bib = {}
try:
    for it in json.loads((ROOT / "data/biblioteca.json").read_text(encoding="utf-8"))["items"]:
        bib[it["id"]] = it
except Exception:
    pass

cards, groups = [], {}
for d in sorted(p for p in base.iterdir() if (p / "preview.mp4").exists()):
    sid, var = d.name.split("--")
    nombre = bib.get(sid, {}).get("nombre", "")
    grp = sid.rsplit("-", 1)[0]
    groups[grp] = groups.get(grp, 0) + 1
    cards.append(f'''<figure data-g="{grp}" data-t="{html.escape((sid + ' ' + nombre).lower())}">
<video src="{d.name}/preview.mp4" preload="none" muted loop playsinline controls poster="{d.name}/hoja.jpg"></video>
<figcaption><b>{sid}</b> <span class="v">{var}</span><br>{html.escape(nombre)}</figcaption></figure>''')

rej = []
res = base / "lote_resumen_ola1.json"
if res.exists():
    rej = sorted({r["id"] for r in json.loads(res.read_text()) if r["estado"] != "LISTO_PARA_IA"}
                 - {d.name.split("--")[0] for d in base.iterdir() if (d / "preview.mp4").exists()})

chips = "".join(f'<button data-g="{g}">{g} <small>{n}</small></button>' for g, n in sorted(groups.items()))
page = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisión ola 1</title><style>
:root{{--bg:#f6f6f4;--fg:#1d1d1f;--mut:#6b6b70;--card:#fff;--line:#e2e2df;--acc:#c0392b}}
@media (prefers-color-scheme:dark){{:root{{--bg:#151517;--fg:#ececee;--mut:#9a9aa2;--card:#1f1f23;--line:#2e2e33;--acc:#e8665a}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 -apple-system,system-ui,sans-serif}}
header{{position:sticky;top:0;background:var(--bg);padding:14px 16px;border-bottom:1px solid var(--line);z-index:2}}
h1{{font-size:18px;margin:0 0 8px}} input{{width:100%;max-width:360px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg)}}
.chips{{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}} button{{border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:14px;padding:3px 10px;cursor:pointer}}
button.on{{background:var(--fg);color:var(--bg)}} small{{color:var(--mut)}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;padding:16px}}
figure{{margin:0;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}}
video{{width:100%;display:block;background:#000;aspect-ratio:16/9}} figcaption{{padding:8px 10px}} .v{{color:var(--mut);font-size:12px}}
.rej{{padding:0 16px 24px;color:var(--mut)}}
</style></head><body><header><h1>Revisión ola 1 — {len(cards)} videos listos</h1>
<input id="q" placeholder="Buscar por ID o nombre…"><div class="chips"><button data-g="" class="on">Todos</button>{chips}</div></header>
<main id="m">{"".join(cards)}</main>
<p class="rej">Pendientes / rechazados por validación física: {", ".join(rej) or "—"}. Detalle en data/motion_specs/_pendientes_*.json</p>
<script>
let g="";const q=document.getElementById("q"),fs=[...document.querySelectorAll("figure")];
function f(){{const t=q.value.toLowerCase();fs.forEach(x=>x.style.display=(!g||x.dataset.g===g)&&x.dataset.t.includes(t)?"":"none")}}
q.oninput=f;document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{{g=b.dataset.g;document.querySelectorAll(".chips button").forEach(c=>c.classList.toggle("on",c===b));f()}});
const io=new IntersectionObserver(es=>es.forEach(e=>{{const v=e.target;if(e.isIntersecting)v.play().catch(()=>{{}});else v.pause()}}),{{threshold:.4}});
document.querySelectorAll("video").forEach(v=>io.observe(v));
</script></body></html>'''
(base / "galeria.html").write_text(page, encoding="utf-8")
print("Galería:", base / "galeria.html", len(cards), "videos")
