#!/bin/zsh
# Fase 5: tras la fase 4, re-capa de lo renderizado antes de los arreglos de color (tono por fase, color puro,
# sin disco de articulación), luego prompts, galería y auditoría.  Log: renders_fase5.log
cd "$(dirname $0)/../.."
until grep -q FASE4_LISTA renders_fase4.log 2>/dev/null; do sleep 120; done
echo "=== FASE5 $(date)"
IDS=$(python3 -c "import json;print(','.join(json.load(open('renders/fase4_plan.json'))['completo']+['F-TOR-009','F-LUM-016']))")
python3 scripts/factory/remask.py renders/ola1 --ids $IDS -j 3
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -80
echo "FASE5_LISTA $(date)"
