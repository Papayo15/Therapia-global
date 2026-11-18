#!/bin/zsh
# Cierre: (1) espera la ola 2, (2) re-render de las técnicas que no pasaron validación, (3) vista anatómica de
# todas las fichas (ola 1 + ola 2), (4) galería y auditoría.  Log: renders_final.log
cd "$(dirname $0)/../.."
until grep -q OLA2_LISTA renders_ola2.log 2>/dev/null; do sleep 120; done
echo "=== FINAL $(date)"
FALLAS=$(grep "✗" renders_ola2.log | awk '{print "data/motion_specs/"$2".json"}' | sort -u | tr '\n' ' ')
echo "re-render ola2: $FALLAS"
[ -n "$FALLAS" ] && python3 scripts/factory/run_batch.py ${=FALLAS} --out renders/ola2 -j 3
python3 scripts/factory/run_anat.py renders/ola2 renders/ola1 -j 3
rm -f renders/ola1/*/escena.blend1(N) renders/ola2/*/escena.blend1(N)
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/gallery.py renders/ola2
df -h . | tail -1
echo "FINAL_LISTA $(date)"
