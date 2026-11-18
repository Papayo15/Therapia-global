#!/bin/zsh
# Vista anatómica (avatar ligero) de todas las fichas + galerías. Log: renders_final.log
cd "$(dirname $0)/../.."
echo "=== ANAT LITE $(date)"
python3 scripts/factory/run_anat.py renders/ola2 renders/ola1 -j 3
rm -f renders/ola1/*/escena.blend1(N) renders/ola2/*/escena.blend1(N)
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/gallery.py renders/ola2
df -h . | tail -1
echo "FINAL_LISTA $(date)"
