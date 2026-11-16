#!/bin/zsh
# Fase 6: reanuda la fase 4 (se detuvo por disco lleno) y hace la fase 5.  Log: renders_fase6.log
cd "$(dirname $0)/../.."
echo "=== FASE6 $(date)"
python3 scripts/factory/remask.py renders/ola1 --antes-de 1794751852 -j 3
IDS=$(python3 -c "import json;print(','.join(json.load(open('renders/fase4_plan.json'))['completo']+['F-TOR-009','F-LUM-016']))")
python3 scripts/factory/remask.py renders/ola1 --ids $IDS -j 3
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -80
df -h . | tail -1
echo "FASE6_LISTA $(date)"
