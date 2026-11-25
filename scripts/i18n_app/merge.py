#!/usr/bin/env python3
"""Vuelca los textos de la app (scripts/i18n_app/strings_*.py) en messages/<lang>.json.
Reemplaza por completo los namespaces nuevos (auth, rb, pv, st, clin, nf) y fusiona los existentes (meta, dashboard, landing).
Comprueba que los 10 idiomas tengan exactamente las mismas claves que el español.
  python3 scripts/i18n_app/merge.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from strings_es_en_pt import ES, EN, PT  # noqa: E402
from strings_fr_de_ru import FR, DE, RU  # noqa: E402
from strings_ar_ja import AR, JA  # noqa: E402
from strings_zh_hi import ZH, HI  # noqa: E402

LANGS = {"es": ES, "en": EN, "pt": PT, "fr": FR, "de": DE, "ru": RU, "ar": AR, "ja": JA, "zh": ZH, "hi": HI}
REPLACE = {"auth", "rb", "pv", "st", "clin", "nf"}


def keys(d, p=""):
    out = set()
    for k, v in d.items():
        out |= keys(v, f"{p}{k}.") if isinstance(v, dict) else {p + k}
    return out


def merge(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            merge(a[k], v)
        else:
            a[k] = v


ref = keys(ES)
bad = False
for lang, data in LANGS.items():
    k = keys(data)
    if k != ref:
        bad = True
        print(f"{lang}: faltan {sorted(ref - k)[:10]} · sobran {sorted(k - ref)[:10]}")
if bad:
    sys.exit(1)

for lang, data in LANGS.items():
    p = ROOT / "messages" / f"{lang}.json"
    msgs = json.loads(p.read_text(encoding="utf-8"))
    for ns, val in data.items():
        if ns in REPLACE or ns not in msgs:
            msgs[ns] = val
        else:
            merge(msgs[ns], val)
    p.write_text(json.dumps(msgs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"OK: {len(ref)} claves × {len(LANGS)} idiomas")
