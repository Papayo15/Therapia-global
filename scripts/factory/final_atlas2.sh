#!/bin/zsh
# Atlas v2 (pelvis/muslos dentro de la piel) + marco de puerta/esquina con antebrazo apoyado:
#   1. re-render completo de E-017/E-018/E-020/E-021 (ficha nueva) y reemplazo (lo viejo → renders/_previo_fix)
#   2. capa muscular de color de TODAS las fichas con el atlas nuevo (remask)
#   3. vista anatómica de TODAS las fichas con el atlas nuevo
#   4. catálogo de la app + galerías
# Reanudable: si se corta (apagado), volver a lanzarlo salta lo ya hecho (marca .corte_atlas2).
cd "$(dirname $0)/../.."
[ -f .corte_atlas2 ] || date +%s > .corte_atlas2
MARCA=$(cat .corte_atlas2)
echo "=== ATLAS2 inicio $(date) marca $MARCA"

echo "=== 1. marco/esquina $(date)"
python3 scripts/factory/run_batch.py data/motion_specs/E-017.json data/motion_specs/E-018.json data/motion_specs/E-020.json \
  data/motion_specs/E-021.json --out renders/_fix2 -j 2
mkdir -p renders/_previo_fix
for d in renders/_fix2/*--*(/N); do
  n=$(basename $d); [ -f $d/preview.mp4 ] || { echo "SIN VIDEO $n"; continue; }
  [ -d renders/ola1/$n ] && { rm -rf renders/_previo_fix/$n.v1; mv renders/ola1/$n renders/_previo_fix/$n.v1; }
  mv $d renders/ola1/
  echo "REEMPLAZADA $n"
done

echo "=== 2. capa muscular $(date)"
python3 scripts/factory/remask.py renders/ola1 --antes-de $MARCA -j 3
python3 scripts/factory/remask.py renders/ola2 --antes-de $MARCA -j 3

echo "=== 3. vista anatómica $(date)"
python3 scripts/factory/run_anat.py renders/ola1 renders/ola2 -j 3 --antes-de $MARCA

echo "=== 4. catálogo y galerías $(date)"
rm -f renders/ola1/*/escena.blend1(N) renders/ola2/*/escena.blend1(N)
python3 scripts/factory/export_library.py
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/gallery.py renders/ola2
df -h . | tail -1
echo "FINAL_ATLAS2 $(date)"
