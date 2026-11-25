#!/bin/zsh
# Fase 7: el color puro inflaba el ProRes 5x y llenó el disco.  1) re-capa de las capas infladas (>60 MB),
# 2) las que aún tienen la capa anterior a la fase 4, 3) prompts, galería, auditoría.  Log: renders_fase7.log
cd "$(dirname $0)/../.."
echo "=== FASE7 $(date)"
setopt nullglob
GRANDES=$(python3 -c "
import os,glob
print(','.join(sorted({os.path.basename(os.path.dirname(f)).split('--')[0] for f in glob.glob('renders/ola1/*/capa_muscular.mov') if os.path.getsize(f)>60e6})))")
echo "infladas: $GRANDES"
[ -n "$GRANDES" ] && python3 scripts/factory/remask.py renders/ola1 --ids $GRANDES -j 3
df -h . | tail -1
python3 scripts/factory/remask.py renders/ola1 --antes-de 1794751852 -j 3
rm -f renders/ola1/*/escena.blend1
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -80
du -sh renders/ola1; df -h . | tail -1
echo "FASE7_LISTA $(date)"
