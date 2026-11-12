#!/usr/bin/env python3
"""
Fase 0 — Normaliza biblioteca.json para el pipeline de video.

  python3 scripts/normalize_biblioteca.py <entrada.json> [salida.json]

Salida por defecto: data/biblioteca.json

Qué hace:
  - Une músculos partidos por comas mal ubicadas ("Cuádriceps (recto femoral", ...).
  - Resuelve "Mismos músculos del lado opuesto".
  - Convierte cada músculo en {nombre, ids[], lado, fibras}, donde ids[] son
    identificadores anatómicos canónicos (inglés, snake_case) que usará la
    máscara muscular del rig.
  - Añade slug, categoría, ola de producción, posición inicial y props
    detectados en el nombre del ejercicio.
  - Clasifica la osteopatía en tiers A/B/C de dificultad de producción.
Falla (exit 1) si algún músculo no tiene mapeo canónico.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ─── Músculos partidos en la fuente ───────────────────────────────────────────
MERGES = [
    (["cuádriceps (recto femoral", "vastos medial", "lateral e intermedio)"],
     "Cuádriceps (recto femoral, vastos medial, lateral e intermedio)"),
    (["aductor largo", "corto y mayor"], "Aductor largo, corto y mayor"),
]

# ─── Calificadores de lado / fibras ───────────────────────────────────────────
SIDE_PATTERNS = [
    (r"\s*\(lado de la inclinación\)$", "homolateral"),
    (r"\s*\(lado opuesto\)$", "contralateral"),
    (r"\s+del lado opuesto$", "contralateral"),
    (r"\s*\(homolaterales\)$", "homolateral"),
    (r"\s+contralateral(es)?$", "contralateral"),
    (r"\s+homolateral(es)?$", "homolateral"),
]
FIBER_PATTERNS = [
    (r"\s*\(fibras anteriores\)$", "anteriores"),
    (r"\s*\(anteriores\)$", "anteriores"),
    (r"\s*\(fibras inferiores\)$", "inferiores"),
    (r"\s*\(fibras posteriores\)$", "posteriores"),
]

# ─── Atlas canónico (nombre base en minúsculas → ids) ─────────────────────────
# Entradas con valor dict dependen de la extremidad (mano / pie).
ATLAS = {
    "abductor corto": ["abductor_pollicis_brevis"],
    "abductor del meñique": ["abductor_digiti_minimi_hand"],
    "abductor largo del pulgar": ["abductor_pollicis_longus"],
    "aductor del pulgar": ["adductor_pollicis"],
    "aductor largo": ["adductor_longus"],
    "aductor largo, corto y mayor": ["adductor_longus", "adductor_brevis", "adductor_magnus"],
    "aductor mayor": ["adductor_magnus"],
    "aductores": ["adductor_longus", "adductor_brevis", "adductor_magnus"],
    "ancóneo": ["anconeus"],
    "braquial": ["brachialis"],
    "braquiorradial": ["brachioradialis"],
    "bíceps": ["biceps_brachii"],
    "coracobraquial": ["coracobrachialis"],
    "cuadrado femoral": ["quadratus_femoris"],
    "cuadrado lumbar": ["quadratus_lumborum"],
    "cuadrado lumbar y oblicuos": ["quadratus_lumborum", "external_oblique", "internal_oblique"],
    "cuádriceps": ["rectus_femoris", "vastus_medialis", "vastus_lateralis", "vastus_intermedius"],
    "cuádriceps (recto femoral, vastos medial, lateral e intermedio)":
        ["rectus_femoris", "vastus_medialis", "vastus_lateralis", "vastus_intermedius"],
    "cápsula anterior": ["glenohumeral_capsule_anterior"],
    "cápsula posterior": ["glenohumeral_capsule_posterior"],
    "cápsula posterior / rotadores externos":
        ["glenohumeral_capsule_posterior", "infraspinatus", "teres_minor"],
    "deltoides anterior": ["deltoid_anterior"],
    "deltoides medio": ["deltoid_middle"],
    "deltoides posterior": ["deltoid_posterior"],
    "digástrico": ["digastric"],
    "digástrico posterior": ["digastric_posterior_belly"],
    "dorsal ancho": ["latissimus_dorsi"],
    "ecm": ["sternocleidomastoid"],
    "esternocleidomastoideo (ecm)": ["sternocleidomastoid"],
    "elevador de la escápula": ["levator_scapulae"],
    "erectores cervicales": ["erector_spinae_cervical"],
    "erectores espinales": ["erector_spinae"],
    "erectores lumbares": ["erector_spinae_lumbar"],
    "erectores torácicos": ["erector_spinae_thoracic"],
    "escalenos": ["scalene_anterior", "scalene_middle", "scalene_posterior"],
    "escalenos anteriores": ["scalene_anterior"],
    "esplenio": ["splenius_capitis", "splenius_cervicis"],
    "esplenios": ["splenius_capitis", "splenius_cervicis"],
    "extensor común de los dedos": ["extensor_digitorum"],
    "extensor cubital del carpo": ["extensor_carpi_ulnaris"],
    "extensor de los dedos": ["extensor_digitorum"],
    "extensor del índice y del meñique": ["extensor_indicis", "extensor_digiti_minimi"],
    "extensor largo del hallux": ["extensor_hallucis_longus"],
    "extensor largo del pulgar": ["extensor_pollicis_longus"],
    "extensores de los dedos": {
        "mano": ["extensor_digitorum"],
        "pie": ["extensor_digitorum_longus", "extensor_digitorum_brevis"],
    },
    "extensores de muñeca":
        ["extensor_carpi_radialis_longus", "extensor_carpi_radialis_brevis", "extensor_carpi_ulnaris"],
    "extensores largo y corto de los dedos": ["extensor_digitorum_longus", "extensor_digitorum_brevis"],
    "extensores radiales": ["extensor_carpi_radialis_longus", "extensor_carpi_radialis_brevis"],
    "extensores radiales largo y corto": ["extensor_carpi_radialis_longus", "extensor_carpi_radialis_brevis"],
    "fascia plantar": ["plantar_fascia"],
    "flexor corto de los dedos": ["flexor_digitorum_brevis"],
    "flexor corto del pulgar": ["flexor_pollicis_brevis"],
    "flexor largo del pulgar": ["flexor_pollicis_longus"],
    "flexor radial del carpo": ["flexor_carpi_radialis"],
    "flexor radial y cubital del carpo": ["flexor_carpi_radialis", "flexor_carpi_ulnaris"],
    "flexor superficial y profundo de los dedos":
        ["flexor_digitorum_superficialis", "flexor_digitorum_profundus"],
    "flexor y extensor cubital del carpo": ["flexor_carpi_ulnaris", "extensor_carpi_ulnaris"],
    "flexores de los dedos": {
        "mano": ["flexor_digitorum_superficialis", "flexor_digitorum_profundus"],
        "pie": ["flexor_digitorum_longus", "flexor_digitorum_brevis"],
    },
    "flexores de muñeca": ["flexor_carpi_radialis", "flexor_carpi_ulnaris", "palmaris_longus"],
    "flexores del carpo y de los dedos":
        ["flexor_carpi_radialis", "flexor_carpi_ulnaris",
         "flexor_digitorum_superficialis", "flexor_digitorum_profundus"],
    "flexores largos": ["flexor_digitorum_longus", "flexor_hallucis_longus"],
    "flexores largos del hallux y dedos": ["flexor_hallucis_longus", "flexor_digitorum_longus"],
    "gastrocnemio": ["gastrocnemius"],
    "gemelos": ["gemellus_superior", "gemellus_inferior"],
    "glúteo mayor": ["gluteus_maximus"],
    "glúteo medio": ["gluteus_medius"],
    "glúteo medio y menor": ["gluteus_medius", "gluteus_minimus"],
    "glúteo menor": ["gluteus_minimus"],
    "grácil": ["gracilis"],
    "iliopsoas": ["iliopsoas"],
    "infraespinoso": ["infraspinatus"],
    "interóseos dorsales": ["dorsal_interossei_hand"],
    "interóseos palmares": ["palmar_interossei"],
    "isquiotibiales": ["biceps_femoris", "semitendinosus", "semimembranosus"],
    "largo de la cabeza": ["longus_capitis"],
    "largo del cuello": ["longus_colli"],
    "lumbricales": {"mano": ["lumbricals_hand"], "pie": ["lumbricals_foot"]},
    "masetero": ["masseter"],
    "multífidos": ["multifidus"],
    "oblicuo externo": ["external_oblique"],
    "oblicuo interno": ["internal_oblique"],
    "oblicuo inferior de la cabeza": ["obliquus_capitis_inferior"],
    "oblicuos": ["external_oblique", "internal_oblique"],
    "obturadores": ["obturator_internus", "obturator_externus"],
    "oponente del pulgar": ["opponens_pollicis"],
    "palmar largo": ["palmaris_longus"],
    "pectoral mayor": ["pectoralis_major"],
    "pectoral mayor (clavicular)": ["pectoralis_major_clavicular"],
    "pectoral mayor y menor": ["pectoralis_major", "pectoralis_minor"],
    "pectoral menor": ["pectoralis_minor"],
    "pectorales": ["pectoralis_major", "pectoralis_minor"],
    "pectíneo": ["pectineus"],
    "peroneo largo y corto": ["fibularis_longus", "fibularis_brevis"],
    "peroneo tercero": ["fibularis_tertius"],
    "peroneos": ["fibularis_longus", "fibularis_brevis"],
    "piriforme": ["piriformis"],
    "poplíteo": ["popliteus"],
    "primer interóseo dorsal": ["dorsal_interossei_hand"],
    "pronador cuadrado": ["pronator_quadratus"],
    "pronador redondo": ["pronator_teres"],
    "pterigoideo lateral": ["lateral_pterygoid"],
    "pterigoideo medial": ["medial_pterygoid"],
    "pterigoideos": ["lateral_pterygoid", "medial_pterygoid"],
    "pterigoideos laterales": ["lateral_pterygoid"],
    "pterigoideos mediales": ["medial_pterygoid"],
    "recto abdominal": ["rectus_abdominis"],
    "recto abdominal / flexores del tronco": ["rectus_abdominis", "external_oblique", "internal_oblique"],
    "recto femoral": ["rectus_femoris"],
    "redondo mayor": ["teres_major"],
    "redondo menor": ["teres_minor"],
    "romboides": ["rhomboid_major", "rhomboid_minor"],
    "rotadores": ["rotatores"],
    "rotadores externos profundos":
        ["piriformis", "gemellus_superior", "gemellus_inferior",
         "obturator_internus", "obturator_externus", "quadratus_femoris"],
    "sartorio": ["sartorius"],
    "semiespinoso": ["semispinalis_capitis", "semispinalis_cervicis"],
    "semiespinoso de la cabeza": ["semispinalis_capitis"],
    "serrato": ["serratus_anterior"],
    "serrato anterior": ["serratus_anterior"],
    "subescapular": ["subscapularis"],
    "suboccipitales":
        ["rectus_capitis_posterior_major", "rectus_capitis_posterior_minor",
         "obliquus_capitis_superior", "obliquus_capitis_inferior"],
    "supinador": ["supinator"],
    "supraespinoso": ["supraspinatus"],
    "suprahioideos": ["suprahyoids"],
    "sóleo": ["soleus"],
    "temporal": ["temporalis"],
    "tensor de la fascia lata": ["tensor_fasciae_latae"],
    "tensor de la fascia lata / banda iliotibial": ["tensor_fasciae_latae", "iliotibial_band"],
    "tibial anterior": ["tibialis_anterior"],
    "tibial posterior": ["tibialis_posterior"],
    "transverso del abdomen": ["transversus_abdominis"],
    "trapecio inferior": ["trapezius_lower"],
    "trapecio medio": ["trapezius_middle"],
    "trapecio medio e inferior": ["trapezius_middle", "trapezius_lower"],
    "trapecio superior": ["trapezius_upper"],
    "trapecio superior e inferior": ["trapezius_upper", "trapezius_lower"],
    "tríceps": ["triceps_brachii"],
    "tríceps (porción larga)": ["triceps_brachii_long_head"],
}

NON_MUSCLE_PREFIXES = ("glenohumeral_capsule", "plantar_fascia", "iliotibial_band")

# ─── Detección por texto del ejercicio ────────────────────────────────────────
POSITIONS = [
    ("cuadrupedia", "cuadrupedia"), ("decúbito lateral", "decubito_lateral"),
    ("supino", "supino"), ("prono", "prono"), ("sedente", "sedente"),
    ("sentado", "sedente"), ("de pie", "bipedo"), ("de rodillas", "rodillas"),
    ("media rodilla", "media_rodilla"), ("half-kneeling", "media_rodilla"),
    ("unipodal", "bipedo"), ("plancha", "plancha"), ("colgado", "suspendido"),
]
PROPS = [
    ("banda", "banda_elastica"), ("liga", "banda_elastica"), ("mancuerna", "mancuerna"),
    ("kettlebell", "kettlebell"), ("barra flexible", "barra_flexible"), ("barra", "barra"),
    ("foam roller", "foam_roller"), ("rodillo bajo", "rodillo"), ("fitball", "fitball"),
    ("balón medicinal", "balon_medicinal"), ("balón", "balon_medicinal"),
    ("pelota", "pelota_pequena"), ("camilla", "camilla"), ("silla", "silla"),
    ("banco romano", "banco_romano"), ("banco", "banco"), ("pared", "pared"),
    ("marco de puerta", "marco_puerta"), ("puerta", "marco_puerta"), ("escalón", "escalon"),
    ("step", "escalon"), ("bastón", "baston"), ("toalla", "toalla"), ("correa", "correa"),
    ("cinturón", "correa"), ("polea", "polea"), ("trx", "trx"), ("masilla", "masilla"),
    ("putty", "masilla"), ("esponja", "esponja"), ("martillo", "martillo"),
    ("hand grip", "hand_grip"), ("tobillera", "tobillera"), ("deslizadores", "deslizadores"),
    ("canicas", "canicas"), ("arroz", "recipiente_arroz"), ("papel", "papel"),
    ("pinza de ropa", "pinza_ropa"), ("monedas", "monedas"), ("depresor lingual", "depresor_lingual"),
    ("espejo", "espejo"), ("respaldo", "silla"), ("mesa", "mesa"), ("rollo", "rollo"),
    ("superficie inestable", "cojin_inestable"),
]

FOOT_REGIONS = {"Tobillo", "Pie", "Pierna y pie"}

OSTEO_TIER = {
    "Movilización articular": "A", "Articulatoria": "A", "Energía muscular": "A",
    "Contratensión": "B", "Tejidos blandos": "B", "Miofascial": "B",
    "Liberación posicional": "B", "Funcional / balance ligamentoso": "B",
    "Craneal": "C", "Visceral": "C",
}


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"\([^)]*\)", "", text.lower())
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:60].rstrip("-")


def sentence_case(s):
    s = s.strip()
    return s[:1].upper() + s[1:] if s else s


def merge_fragments(names):
    lowered = [n.strip().lower() for n in names]
    out, i = [], 0
    while i < len(names):
        for parts, joined in MERGES:
            if lowered[i:i + len(parts)] == parts:
                out.append(joined)
                i += len(parts)
                break
        else:
            out.append(names[i].strip())
            i += 1
    return out


def detect(text, table):
    t = text.lower()
    found = []
    for kw, val in table:
        if kw in t and val not in found:
            found.append(val)
    return found


class Normalizer:
    def __init__(self):
        self.unmapped = []

    def muscle(self, raw, limb, where):
        name = raw.strip()
        base = name.lower()
        lado, fibras = None, None
        for pat, val in SIDE_PATTERNS:
            if re.search(pat, base):
                base, lado = re.sub(pat, "", base), val
                break
        for pat, val in FIBER_PATTERNS:
            if re.search(pat, base):
                base, fibras = re.sub(pat, "", base), val
                break
        ids = ATLAS.get(base)
        if isinstance(ids, dict):
            ids = ids[limb]
        if ids is None:
            self.unmapped.append(f"{where}: {raw!r} (base {base!r})")
            ids = []
        out = {"nombre": sentence_case(name), "ids": ids}
        if lado:
            out["lado"] = lado
        if fibras:
            out["fibras"] = fibras
        if ids and all(i.startswith(NON_MUSCLE_PREFIXES) for i in ids):
            out["tejido"] = "no_muscular"
        return out

    def muscles(self, names, limb, where):
        return [self.muscle(n, limb, where) for n in merge_fragments(names)]


def limb_for(region):
    return "pie" if region in FOOT_REGIONS else "mano"


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "data" / "biblioteca.json"
    data = json.loads(src.read_text(encoding="utf-8"))
    n = Normalizer()
    items = []

    for e in data["fortalecimiento"]:
        limb = limb_for(e["region"])
        activos = n.muscles(e["musculos_activos"], limb, e["id"])
        elongan_raw = merge_fragments(e["musculos_elongan"])
        if [m.lower() for m in elongan_raw] == ["mismos músculos del lado opuesto"]:
            flip = {"contralateral": "homolateral", "homolateral": "contralateral"}
            elongan = []
            for m in activos:
                lado = flip.get(m.get("lado"), "contralateral")
                base = re.sub(r"\s+(contra|homo)lateral$", "", m["nombre"])
                elongan.append(dict(m, nombre=f"{base} {lado}", lado=lado))
        else:
            elongan = n.muscles(elongan_raw, limb, e["id"])
        items.append({
            "id": e["id"], "slug": f"{e['id'].lower()}-{slugify(e['ejercicio'])}",
            "categoria": "fortalecimiento", "ola": 1,
            "region": e["region"], "movimiento": e["movimiento"],
            "nivel": e["nivel"], "nivel_nombre": e["nivel_nombre"],
            "nombre": e["ejercicio"],
            "posicion_detectada": detect(e["ejercicio"], POSITIONS),
            "props_detectados": detect(e["ejercicio"], PROPS),
            "musculos": {"activos": activos, "elongan": elongan},
            "estado": e.get("estado", "Pendiente"),
        })

    for e in data["estiramientos"]:
        limb = limb_for(e["region"])
        items.append({
            "id": e["id"], "slug": f"{e['id'].lower()}-{slugify(e['estiramiento'])}",
            "categoria": "estiramiento", "ola": 1,
            "region": e["region"], "musculo_objetivo": e["musculo"],
            "nivel": e["nivel"], "nivel_nombre": e["nivel_nombre"],
            "nombre": e["estiramiento"],
            "posicion_detectada": detect(e["estiramiento"], POSITIONS),
            "props_detectados": detect(e["estiramiento"], PROPS),
            "musculos": {"estirados": n.muscles(e["musculos_estirados"], limb, e["id"])},
            "estado": e.get("estado", "Pendiente"),
        })

    for e in data["osteopatia"]:
        tier = OSTEO_TIER.get(e["tipo"], "B")
        if "intraoral" in e["tecnica"].lower():
            tier = "C"
        items.append({
            "id": e["id"], "slug": f"{e['id'].lower()}-{slugify(e['tecnica'])}",
            "categoria": "osteopatia", "ola": 2, "tier_produccion": tier,
            "region": e["region"], "tipo": e["tipo"], "nombre": e["tecnica"],
            "estructuras": [sentence_case(s) for s in e["estructuras"]],
            "props_detectados": detect(e["tecnica"], PROPS),
            "estado": e.get("estado", "Pendiente"),
        })

    if n.unmapped:
        print("Músculos sin mapeo canónico:", *n.unmapped, sep="\n  ")
        sys.exit(1)

    slugs = [i["slug"] for i in items]
    dupes = {s for s in slugs if slugs.count(s) > 1}
    if dupes:
        sys.exit(f"Slugs duplicados: {dupes}")

    out = {
        "version": "2.0",
        "fuente": src.name,
        "colores": data.get("colores", {}),
        "resumen": {
            "total": len(items),
            "ola_1": sum(i["ola"] == 1 for i in items),
            "ola_2": sum(i["ola"] == 2 for i in items),
            "osteopatia_por_tier": {t: sum(i.get("tier_produccion") == t for i in items) for t in "ABC"},
        },
        "items": items,
    }
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(out["resumen"], ensure_ascii=False))
    print(f"→ {dst}")


if __name__ == "__main__":
    main()
