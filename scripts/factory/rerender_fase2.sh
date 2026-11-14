#!/bin/zsh
# Fase 2: espera a que termine rerender_fix.sh y renderiza toda ficha modificada después de su arranque
# (fichas nuevas + correcciones hechas mientras corría). Luego prompts, galería, auditoría. Log: renders_fase2.log
cd "$(dirname $0)/../.."
until grep -q FIX_LISTO renders_fix.log 2>/dev/null; do sleep 120; done
echo "=== FASE2 $(date)"
SPECS=$(python3 - <<'PY'
import json, os, shutil, glob
plan = json.load(open("renders/fase2_plan.json"))
os.makedirs("renders/_ola1_previo", exist_ok=True)
for sid in plan["casa"]:                       # casa con anclaje alto: rehacer con el marco de puerta
    d = f"renders/ola1/{sid}--casa"
    if os.path.exists(d):
        dst = "renders/_ola1_previo/" + os.path.basename(d) + "_v1"
        if os.path.exists(dst): shutil.rmtree(dst)
        shutil.move(d, dst)
print(" ".join(f"data/motion_specs/{s}.json" for s in plan["nuevas"] + plan["casa"]))
PY
)
echo "fichas: $SPECS"
python3 scripts/factory/run_batch.py ${=SPECS} --out renders/ola1 -j 3
cp renders/ola1/lote_resumen.json renders/ola1/lote_resumen_fase2.json
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -60
echo "FASE2_LISTA $(date)"
