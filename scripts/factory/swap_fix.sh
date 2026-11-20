#!/bin/zsh
# Espera el re-render de las fichas corregidas (renders/_fix), reemplaza las versiones viejas (guardadas en
# renders/_previo_fix) y genera su vista anatómica.
cd "$(dirname $0)/../.."
while pgrep -f "run_batch.py.*renders/_fix" >/dev/null; do sleep 60; done
mkdir -p renders/_previo_fix
IDS=""
for d in renders/_fix/*--*(/N); do
  n=$(basename $d); [ -f $d/preview.mp4 ] || { echo "SIN VIDEO $n"; continue; }
  for ola in ola1 ola2; do [ -d renders/$ola/$n ] && mv renders/$ola/$n renders/_previo_fix/; done
  mv $d renders/ola1/; IDS="$IDS,${n%%--*}"
done
echo "REEMPLAZADAS ${IDS#,}"
while pgrep -f final_anat2.sh >/dev/null; do sleep 60; done
python3 scripts/factory/run_anat.py renders/ola1 -j 3 --rehacer --ids ${IDS#,}
python3 scripts/factory/gallery.py renders/ola1
echo "SWAP_FIX_LISTO $(date)"
