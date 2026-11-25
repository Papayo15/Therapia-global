#!/bin/zsh
# Ola 2 — osteopatía (94 técnicas): paciente en camilla + terapeuta.  Log: renders_ola2.log
cd "$(dirname $0)/../.."
echo "=== OLA2 $(date)"
python3 scripts/factory/specs/gen_osteopatia.py
python3 scripts/factory/run_batch.py data/motion_specs/O-*.json --out renders/ola2 -j 3
rm -f renders/ola2/*/escena.blend1(N)
df -h . | tail -1
echo "OLA2_LISTA $(date)"
