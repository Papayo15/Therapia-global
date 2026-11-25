#!/bin/zsh
# Fase 8: (1) en re-capa la cámara vuelve a girarse igual que el gris (si el gris es posterior a la fase 3);
# (2) músculo superficial tapado por la piel y único de su color → rayos X.  Log: renders_fase8.log
cd "$(dirname $0)/../.."
echo "=== FASE8 $(date)"
IDS=$(python3 - <<'PY'
import json,os,glob
T=1794664857; c=set()
for d in sorted(glob.glob('renders/ola1/*--*')):
    sid=os.path.basename(d).split('--')[0]
    s=json.load(open(f'data/motion_specs/{sid}.json'))
    if [p for p in s.get('props',[]) if p.get('tipo') not in ('colchoneta','suelo')] and os.path.getmtime(d+'/gris.mp4')>T: c.add(sid)
a=json.load(open('renders/ola1/auditoria.json'))
c|={k.split('--')[0] for k,v in a['videos'].items() if v!='ok'}
print(','.join(sorted(c)))
PY
)
echo "ids: $IDS"
python3 scripts/factory/remask.py renders/ola1 --ids $IDS -j 3
rm -f renders/ola1/*/escena.blend1(N)
python3 scripts/factory/build_prompts.py renders/ola1 2>&1 | tail -2
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/audit.py --videos | head -60
df -h . | tail -1
echo "FASE8_LISTA $(date)"
