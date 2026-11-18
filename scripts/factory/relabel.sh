#!/bin/zsh
# Recalcula etiquetas.json (sin render) de los videos anatómicos hechos antes del arreglo de visibilidad de rayos.
cd "$(dirname $0)/../.."
setopt nullglob
for v in renders/ola2/*/anatomico.mp4 renders/ola1/*/anatomico.mp4; do
  d=${v:h}; [ $d/etiquetas.json -nt .marca_fix_etiquetas ] && continue
  sid=${${d:t}%%--*}; var=gym; [[ ${d:t} == *--casa ]] && var=casa
  ANAT_SOLO_ETIQUETAS=1 blender -b --python-exit-code 1 -P scripts/factory/engine.py -- --spec data/motion_specs/$sid.json --variant $var --out $d --anatomico >/dev/null 2>&1 \
    && echo "✓ etiquetas ${d:t}" || echo "✗ etiquetas ${d:t}"
done
echo "RELABEL_LISTO $(date)"
