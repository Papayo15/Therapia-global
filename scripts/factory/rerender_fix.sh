#!/bin/zsh
# Re-render tras la revisión del 2026-11-13: (1) render completo de fichas cambiadas, (2) capa muscular del resto,
# (3) prompts + galería + auditoría. Log: renders_fix.log
cd "$(dirname $0)/../.."
T0=$(python3 -c "import json;print(json.load(open('renders/rerender_plan.json'))['t0'])")
SPECS=$(python3 -c "import json;print(' '.join('data/motion_specs/'+s+'.json' for s in json.load(open('renders/rerender_plan.json'))['full']))")
echo "=== FULL $(date)"
python3 scripts/factory/run_batch.py ${=SPECS} --out renders/ola1 -j 3
cp renders/ola1/lote_resumen.json renders/ola1/lote_resumen_fix.json
echo "=== REMASK $(date)"
python3 scripts/factory/remask.py renders/ola1 --antes-de $T0 -j 3
echo "=== PROMPTS/GALERIA/AUDITORIA $(date)"
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -60
echo "FIX_LISTO $(date)"
