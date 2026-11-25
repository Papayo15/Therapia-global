# Respaldo de la fábrica de videos (Therapia Global)

Rama SOLO de respaldo (no se despliega). El código vive en `fabrica-video-ola1`.

- `videos/fabrica/<id>/` — lo que publica la app: `{gym|casa|ambos}.mp4` + póster `.jpg`, `anatomico.mp4`, `etiquetas.json`.
  Restaurar: copiar `videos/fabrica` a `public/videos/fabrica` del proyecto.
- `data/video-library.json` — catálogo (439 fichas) con el que se generaron.
- `assets/rigs/` — avatares generados (sin atlas → con atlas → anatómico lite) necesarios para volver a renderizar.

Los renders crudos (`renders/`, ~12 GB: escenas .blend, capas .mov) no están aquí: se regeneran con
`scripts/factory/run_batch.py` + `run_anat.py` a partir de `data/motion_specs/`.
