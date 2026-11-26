#!/bin/bash
# Acabado "estudio" para toda la biblioteca (ola1 + ola2). Reanudable: salta lo que ya tiene preview_estudio.mp4
# más nuevo que estudio.py. Uso: nohup scripts/factory/estudio_todo.sh > renders_estudio.log 2>&1 &
cd "$(dirname "$0")/../.."
J=${J:-2}
pend() {
  for d in renders/ola1/*--* renders/ola2/*--*; do
    [ -f "$d/escena.blend" ] && [ -f "$d/capa_muscular.mov" ] || continue
    [ "$d/preview_estudio.mp4" -nt scripts/factory/estudio.py ] && continue
    echo "$d"
  done
}
N=$(pend | wc -l | tr -d ' ')
echo "Pendientes: $N  (paralelo: $J)  $(date)"
pend | xargs -P "$J" -I{} sh -c 'scripts/factory/estudio.sh "{}" || echo "FALLO {}"'
echo "ESTUDIO_TODO_LISTO $(date)"
