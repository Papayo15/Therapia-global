#!/usr/bin/env python3
"""Lleva las traducciones de la biblioteca clínica a messages/{lang}.json.

Fuente: scripts/factory/i18n/*.psv  (clave | en | pt | fr | de | ru | ar | ja | zh | hi)
  - claves de ficha (F-CAD-007, E-057, O-001) → messages[lang].libraryItems[id]
  - claves OBJ:/REG:/NIV:/TIPO:<texto en español> → messages[lang].libraryTerms[slug(texto)]
El español es el texto original de data/biblioteca.json (la app lo usa si falta una traducción).
slug() debe coincidir con termKey() en src/lib/videoLibrary.ts.
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LANGS = ["en", "pt", "fr", "de", "ru", "ar", "ja", "zh", "hi"]


def slug(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")


def main():
    items: dict[str, list[str]] = {}
    terms: dict[str, list[str]] = {}
    for f in sorted((ROOT / "scripts/factory/i18n").glob("library_*.psv")):
        for n, line in enumerate(open(f, encoding="utf-8"), 1):
            if not line.strip() or line.startswith("#"):
                continue
            cols = [c.strip() for c in line.rstrip("\n").split(" | ")]
            if len(cols) != 1 + len(LANGS):
                sys.exit(f"{f.name}:{n}: {len(cols)} columnas (esperaba {1 + len(LANGS)})")
            key, vals = cols[0], cols[1:]
            if ":" in key and key.split(":", 1)[0] in ("OBJ", "REG", "NIV", "TIPO"):
                terms[slug(key.split(":", 1)[1])] = vals
            else:
                items[key] = vals

    lib = json.load(open(ROOT / "data/video-library.json", encoding="utf-8"))["items"]
    faltan = [i["id"] for i in lib if i["id"] not in items]
    usados = {slug(x) for i in lib for x in (i["region"], i.get("nivel_nombre") or "", i.get("tipo") or "", i.get("objetivo") or "") if x}
    faltan_t = sorted(usados - set(terms))
    if faltan or faltan_t:
        print("sin traducción:", faltan, faltan_t)

    for li, lang in enumerate(LANGS):
        p = ROOT / f"messages/{lang}.json"
        d = json.load(open(p, encoding="utf-8"))
        d["libraryItems"] = {k: v[li] for k, v in sorted(items.items())}
        d["libraryTerms"] = {k: v[li] for k, v in sorted(terms.items())}
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(items)} nombres y {len(terms)} términos en {len(LANGS)} idiomas")


if __name__ == "__main__":
    main()
