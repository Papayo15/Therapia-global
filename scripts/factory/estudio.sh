#!/bin/bash
# Acabado "estudio" de un ejercicio ya renderizado: base a color + la misma capa muscular.
#   scripts/factory/estudio.sh renders/ola1/F-CER-001--ambos
# Salida: estudio.mp4 (sin capa) y preview_estudio.mp4 (con capa muscular)
set -e
D="$1"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
blender -b "$D/escena.blend" --python-exit-code 1 -P "$ROOT/scripts/factory/estudio.py" > "$D/estudio.log" 2>&1
# fondo blanco puro: lo que ya es casi blanco (piso lejano) se vuelve blanco; el resto apenas cambia
LV="colorlevels=rimax=0.86:gimax=0.86:bimax=0.86"
ffmpeg -v error -y -framerate 24 -i "$D/estudio/f_%04d.png" -vf "$LV" \
  -c:v libx264 -pix_fmt yuv420p -crf 17 -movflags +faststart "$D/estudio.mp4"
ffmpeg -v error -y -i "$D/estudio.mp4" -i "$D/capa_muscular.mov" \
  -filter_complex "[1:v]format=rgba,colorchannelmixer=aa=0.75[m];[0:v][m]overlay=shortest=1:format=auto[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p -crf 17 -movflags +faststart "$D/preview_estudio.mp4"
rm -rf "$D/estudio" "$D/escena.blend1"
echo "ESTUDIO_LISTO $D"
