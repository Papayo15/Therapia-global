#!/bin/zsh
# Fase 3 (correcciones de la auditoría del 14-nov):
#  1) re-render completo de las fichas donde un objeto tapa >10 % del cuerpo (la cámara ahora se gira sola)
#  2) capa muscular de TODAS las demás (la ropa/pelo ya no tapan la capa)
#  3) prompts, galería, auditoría.  Log: renders_fase3.log
cd "$(dirname $0)/../.."
T0=$(date +%s)
echo "=== FASE3 $(date)"
SPECS=$(python3 - <<'PY'
import json, os, shutil
ids = json.load(open("renders/fase3_plan.json"))["completo"]
os.makedirs("renders/_ola1_previo", exist_ok=True)
for sid in ids:
    for d in [f"renders/ola1/{x}" for x in os.listdir("renders/ola1") if x.startswith(sid + "--")]:
        dst = "renders/_ola1_previo/" + os.path.basename(d) + "_v2"
        if os.path.exists(dst): shutil.rmtree(dst)
        shutil.move(d, dst)
print(" ".join(f"data/motion_specs/{s}.json" for s in ids))
PY
)
echo "fichas completas: $SPECS"
python3 scripts/factory/run_batch.py ${=SPECS} --out renders/ola1 -j 3
cp renders/ola1/lote_resumen.json renders/ola1/lote_resumen_fase3.json
python3 scripts/factory/remask.py renders/ola1 --antes-de $T0 -j 3
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -80
echo "FASE3_LISTA $(date)"
