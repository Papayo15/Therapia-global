#!/bin/zsh
# Fase 9: visibilidad con rayos en coordenadas LOCALES del cuerpo (acostada/prono/lateral fallaba) → re-capa de
# todas las fichas con el cuerpo girado + las marcadas por la auditoría + fascia plantar (E-079..081).  Log: renders_fase9.log
cd "$(dirname $0)/../.."
echo "=== FASE9 $(date)"
python3 scripts/factory/remask.py renders/ola1 --ids $(cat renders/fase9_ids.txt) -j 3
rm -f renders/ola1/*/escena.blend1(N)
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos > renders/auditoria_fase9.txt
grep -v "ficha .*solo_azul" renders/auditoria_fase9.txt | head -40
df -h . | tail -1
echo "FASE9_LISTA $(date)"
