#!/bin/bash
# Espera a que termine estudio_todo.sh, exporta la biblioteca y la publica.
cd "$(dirname "$0")/../.."
until grep -q ESTUDIO_TODO_LISTO renders_estudio.log 2>/dev/null; do sleep 120; done
python3 scripts/factory/export_library.py && scripts/factory/publicar_videos.sh && echo "PUBLICADO $(date)"
