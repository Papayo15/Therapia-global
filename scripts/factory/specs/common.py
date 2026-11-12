"""Plantillas compartidas para generar fichas de movimiento (data/motion_specs/*.json)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BIB = {i["id"]: i for i in json.loads((ROOT / "data/biblioteca.json").read_text(encoding="utf-8"))["items"]}


def hand(s):
    return [f"{b}.{s}" for b in ["lowerarm02", "wrist"] + [f"finger{n}-{k}" for n in range(1, 6) for k in (1, 2, 3)]
            + [f"metacarpal{n}" for n in range(1, 5)]]


def FOOT(s):
    return [f"foot.{s}", "toenails"] + [f"toe{n}-{k}.{s}" for n in range(1, 6) for k in (1, 2, 3)]


# ─── Posiciones base ──────────────────────────────────────────────────────────
def supino(rectas=True, gancho=(), extra=None):
    """Supino en colchoneta. gancho = lados con rodilla flexionada y pie plano (IK)."""
    ang = {"cadera_abd.L": 3, "cadera_abd.R": 3, "antebrazo_prono.L": 80, "antebrazo_prono.R": 80}
    asentar = [{"art": "lumbar_flex", "grupo": "spine01", "rango": [-15, 25]}] if not gancho else []
    ik, contactos = [], [{"grupo": "head"}, {"grupo": "spine01", "tol_cm": 2.5}]
    for s in ("L", "R"):
        if s in gancho:
            ang.update({f"cadera_flex.{s}": 50, f"rodilla_flex.{s}": 95})
            ik.append({"cadena": f"pierna.{s}", "pie_plano": True, "polo": [0, -0.3, 0.6]})
        elif rectas:
            asentar.append({"art": f"cadera_flex.{s}", "grupo": f"foot.{s}", "rango": [-20, 15]})
        contactos.append({"grupo": f"foot.{s}"})
    asentar += [{"art": "cervical_flex", "grupo": "head", "rango": [-25, 25]},
                {"art": "hombro_flex.L", "grupo": hand("L"), "rango": [-35, 15]},
                {"art": "hombro_flex.R", "grupo": hand("R"), "rango": [-35, 15]}]
    contactos += [{"grupo": hand("L")}, {"grupo": hand("R")}]
    ang.update(extra or {})
    return {"base": {"orientacion": "supino", "colchoneta": True, "angulos": ang, "asentar": asentar},
            "ik": ik, "contactos": contactos, "camara": {"dir": [-1, 0.15, 0.3], "lente": 50, "margen": 1.1}}


def prono(extra=None):
    ang = {"cervical_rot": 70, "antebrazo_prono.L": -80, "antebrazo_prono.R": -80,
           "tobillo_dorsi.L": -30, "tobillo_dorsi.R": -30}
    ang.update(extra or {})
    return {"base": {"orientacion": "prono", "colchoneta": True, "angulos": ang,
                     "asentar": [{"art": "cervical_flex", "grupo": "head", "rango": [-30, 30]},
                                 {"art": "cadera_flex.L", "grupo": FOOT("L"), "rango": [-20, 20]},
                                 {"art": "cadera_flex.R", "grupo": FOOT("R"), "rango": [-20, 20]},
                                 {"art": "hombro_flex.L", "grupo": hand("L"), "rango": [-20, 30]},
                                 {"art": "hombro_flex.R", "grupo": hand("R"), "rango": [-20, 30]}]},
            "ik": [], "contactos": [{"grupo": "head"}, {"grupo": "spine02", "tol_cm": 2.5}, {"grupo": hand("L")}],
            "camara": {"dir": [1, 0.15, 0.35], "lente": 50, "margen": 1.1}}


def lateral(top_recta=True, almeja=False):
    """Decúbito lateral sobre el lado izquierdo; trabaja la pierna derecha (arriba)."""
    ang = {"cadera_flex.L": 40, "rodilla_flex.L": 70, "hombro_flex.L": 90, "codo_flex.L": 70,
           "hombro_abd.R": -6, "mano_cerrar.R": 15}           # brazo de arriba apoyado sobre el costado
    ik = []
    if almeja:
        ang.update({"cadera_flex.L": 45, "rodilla_flex.L": 90, "cadera_flex.R": 45, "rodilla_flex.R": 90})
        ik.append({"cadena": "pierna.R", "fijar_a": "L", "offset": [0, 0, 0.09], "polo": [0, -0.6, 0]})
    elif not top_recta:
        ang.update({"cadera_flex.R": 70, "rodilla_flex.R": 90})
    asentar = [{"art": "@roll", "grupo": ["shoulder01.L", "upperarm01.L", "clavicle.L"], "rango": [-15, 15], "reapoyar": True},
               {"art": "cadera_abd.L", "grupo": ["lowerleg01.L", "foot.L"], "rango": [-20, 20]}]
    if not top_recta and not almeja:
        asentar.append({"art": "cadera_abd.R", "grupo": FOOT("R"), "rango": [-50, 10]})
    return {"base": {"orientacion": "decubito_lateral_L", "colchoneta": True, "almohada": True,
                     "angulos": ang, "asentar": asentar,
                     "suelo": ["pelvis.L", "upperleg01.L", "upperleg02.L", "spine03", "spine02", "shoulder01.L"]},
            "ik": ik, "contactos": [{"grupo": ["pelvis.L", "upperleg01.L", "upperleg02.L"]}, {"grupo": ["lowerleg01.L", "foot.L"]}],
            "camara": {"dir": [0.15, -1, 0.55], "lente": 50, "margen": 1.1}}


def cuadrupedia(extra=None):
    ang = {"cadera_flex.L": 90, "cadera_flex.R": 90, "rodilla_flex.L": 90, "rodilla_flex.R": 90,
           "tobillo_dorsi.L": -45, "tobillo_dorsi.R": -45, "hombro_flex.L": 90, "hombro_flex.R": 90,
           "muneca_ext.L": 75, "muneca_ext.R": 75, "antebrazo_prono.L": 80, "antebrazo_prono.R": 80}
    ang.update(extra or {})
    return {"base": {"orientacion": "cuadrupedia", "colchoneta": True, "angulos": ang,
                     "asentar": [{"art": "@pitch", "grupo": hand("L") + hand("R"), "rango": [-25, 25]}]},
            "ik": [], "contactos": [{"grupo": "lowerleg01.L", "tol_cm": 2.5}, {"grupo": hand("L") + hand("R")}],
            "camara": {"dir": [1, 0.1, 0.35], "lente": 50, "margen": 1.1}}


def sedente(extra=None):
    ang = {"cadera_flex.L": 90, "cadera_flex.R": 90, "rodilla_flex.L": 90, "rodilla_flex.R": 90,
           "hombro_flex.L": 25, "hombro_flex.R": 25, "codo_flex.L": 50, "codo_flex.R": 50}
    ang.update(extra or {})
    return {"base": {"orientacion": "sedente", "silla": True, "angulos": ang},
            "ik": [], "contactos": [{"grupo": "foot.L"}],
            "camara": {"dir": [-0.7, -1, 0.3], "lente": 50, "margen": 1.1}}


def bipedo(extra=None, camara=(-0.7, -1, 0.25)):
    ang = {"hombro_abd.L": 2, "hombro_abd.R": 2}
    ang.update(extra or {})
    return {"base": {"orientacion": "bipedo", "angulos": ang}, "ik": [],
            "contactos": [{"grupo": "foot.L"}], "camara": {"dir": list(camara), "lente": 50, "margen": 1.05}}


# ─── Repeticiones (5–10 s, loop) ──────────────────────────────────────────────
def rep(peak, *, up=1.4, hold=1.0, down=1.6, pre=0.4, post=0.4, estiramiento=False, campos=None):
    """Una repetición: reposo → concéntrico → isométrico → excéntrico → reposo.
    peak = {articulación: delta en el pico}; campos = {'ik': {...}, 'polo': {...}, 'raiz': [..]} en el pico."""
    post = max(post, 5.0 - (pre + up + hold + down))       # mínimo 5 s: se alarga el reposo final
    t = [0, pre, pre + up, pre + up + hold, pre + up + hold + down, pre + up + hold + down + post]
    dur = round(t[-1], 2)
    assert 5 <= dur <= 10, f"duración {dur}s fuera de 5–10"
    zero = {j: 0 for j in peak}
    fases = ["concentrico", "concentrico", "isometrico", "isometrico", "excentrico", "concentrico"]
    if estiramiento:
        fases = ["elongacion"] * 6
    keys = []
    for i, (ti, q) in enumerate(zip(t, [0, 0, 1, 1, 0, 0])):
        k = {"t": round(ti, 2), "art": {j: v * q for j, v in peak.items()} if q else dict(zero), "p": q,
             "fase": fases[min(i + (1 if i in (2,) else 0), 5)] if not estiramiento else "concentrico"}
        if i == 3:
            k["fase"] = "excentrico" if not estiramiento else "concentrico"
        for name, val in (campos or {}).items():
            if isinstance(val, dict):
                k[name] = {c: [x * q for x in v] for c, v in val.items()}
            else:
                k[name] = [x * q for x in val]
        keys.append(k)
    # fase vigente DESDE cada key: subir=conc, sostener=iso, bajar=exc
    for k, f in zip(keys, ["concentrico", "concentrico", "isometrico", "excentrico", "concentrico", "concentrico"]):
        k["fase"] = f
    return dur, keys


def iso(hold=3.0):
    """Isométrico sin movimiento visible: la capa muscular pulsa."""
    t = [0, 0.6, 1.2, 1.2 + hold, 1.8 + hold, 2.6 + hold]
    t = [round(x, 2) for x in t]
    dur = max(5.0, t[-1])
    t[-1] = dur
    ps = [0, 0, 1, 1, 0, 0]
    return dur, [{"t": ti, "p": q, "fase": "isometrico"} for ti, q in zip(t, ps)]


def musculos(item_id, lado=None, lado_elongan=None):
    it = BIB[item_id]
    out = {}
    for rol, lista in it["musculos"].items():
        sd = lado if rol != "elongan" else (lado_elongan or lado)
        seen, arr = set(), []
        for m in lista:
            for mid in m["ids"]:
                if mid not in seen and not mid.startswith(("glenohumeral_capsule", "plantar_fascia", "iliotibial_band")):
                    seen.add(mid)
                    arr.append({"id": mid, "lado": sd} if sd else {"id": mid})
        out[rol] = arr
    return out


UPPER_CAM = ["head", "neck01", "neck02", "neck03", "jaw", "spine01", "spine02", "clavicle.L", "clavicle.R",
             "shoulder01.L", "shoulder01.R"]


def _is_cervical(sid):
    return sid.startswith(("F-CER", "F-ATM")) or (sid.startswith("E-0") and int(sid[2:]) <= 15)


def write(spec):
    p = ROOT / "data/motion_specs" / f"{spec['id']}.json"
    if _is_cervical(spec["id"]) and spec["base"]["orientacion"] in ("sedente", "bipedo") and "grupos" not in spec.get("camara", {}):
        spec["camara"] = {**spec.get("camara", {}), "grupos": UPPER_CAM, "margen": 1.35}
    spec.setdefault("fps", 24)
    spec.setdefault("resolucion", [1280, 720])
    spec.setdefault("nombre", BIB[spec["id"]]["nombre"])
    p.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return p


def rollo_pantorrillas(pl, lados=("L", "R"), r=0.05):
    """Toalla enrollada bajo las pantorrillas: el talón queda libre para mover el tobillo."""
    top = 0.006 + 2 * r
    pl.setdefault("props", [])
    pl["props"].append({"tipo": "rodillo", "uso": "rollo_bajo_hueso", "hueso": f"lowerleg02.{lados[0]}", "t": 0.55, "r": r})
    for s in lados:
        pl["base"]["asentar"] = [a for a in pl["base"]["asentar"] if a["art"] != f"cadera_flex.{s}"]
        pl["base"]["asentar"].insert(0, {"art": f"cadera_flex.{s}", "grupo": f"lowerleg02.{s}", "z": top, "rango": [-20, 40]})
        pl["contactos"] = [c for c in pl["contactos"] if c["grupo"] not in (f"foot.{s}",)]
        pl["contactos"].append({"grupo": f"lowerleg02.{s}", "z": top, "tol_cm": 2})
    return pl


def sedente_suelo(manos="apoyo", extra=None):
    """Sentada en el suelo con piernas extendidas. manos='apoyo' (detrás) o 'libres' (para IK/correa)."""
    ang = {"cadera_flex.L": 85, "cadera_flex.R": 85, "lumbar_flex": 8, "tobillo_dorsi.L": -10, "tobillo_dorsi.R": -10}
    asentar = [{"art": "cadera_flex.L", "grupo": "foot.L", "rango": [60, 110], "abs": True},
               {"art": "cadera_flex.R", "grupo": "foot.R", "rango": [60, 110], "abs": True}]
    contactos = [{"grupo": ["pelvis.L", "pelvis.R", "upperleg01.L", "upperleg01.R", "upperleg02.L", "upperleg02.R"]}]
    if manos == "apoyo":
        ang.update({"hombro_flex.L": -30, "hombro_flex.R": -30, "hombro_abd.L": 10, "hombro_abd.R": 10,
                    "antebrazo_prono.L": 60, "antebrazo_prono.R": 60})
        asentar += [{"art": "hombro_flex.L", "grupo": hand("L"), "rango": [-40, 35]},
                    {"art": "hombro_flex.R", "grupo": hand("R"), "rango": [-40, 35]}]
        contactos += [{"grupo": hand("L")}, {"grupo": hand("R")}]
    ang.update(extra or {})
    return {"base": {"orientacion": "sedente_suelo", "colchoneta": True, "angulos": ang, "asentar": asentar},
            "ik": [], "contactos": contactos, "camara": {"dir": [-1, -0.25, 0.35], "lente": 50, "margen": 1.1}}


def keys_custom(seq, fase_por_tramo=None):
    """seq = [(t, {art}, p), ...] → keys; la fase vigente desde cada key se toma de fase_por_tramo."""
    out = []
    for i, (t, art, p) in enumerate(seq):
        k = {"t": t, "art": art, "p": p, "fase": (fase_por_tramo or [])[i] if fase_por_tramo else "concentrico"}
        out.append(k)
    return out[-1]["t"], out


def plancha(rodillas=False):
    """Plancha frontal sobre antebrazos (y dedos de los pies, o rodillas)."""
    ang = {"hombro_flex.L": 90, "hombro_flex.R": 90, "codo_flex.L": 90, "codo_flex.R": 90,
           "antebrazo_prono.L": 80, "antebrazo_prono.R": 80, "tobillo_dorsi.L": 25, "tobillo_dorsi.R": 25, "cervical_rot": 0}
    apoyo = FOOT("L") + FOOT("R")
    if rodillas:
        ang.update({"rodilla_flex.L": 90, "rodilla_flex.R": 90})
        apoyo = ["lowerleg01.L", "lowerleg01.R"]
    antebrazos = ["lowerarm01.L", "lowerarm01.R", "lowerarm02.L", "lowerarm02.R"]
    return {"base": {"orientacion": "prono", "colchoneta": True, "angulos": ang, "suelo": antebrazos + hand("L") + hand("R"),
                     "asentar": [{"art": "@pitch", "grupo": apoyo, "rango": [-25, 25], "reapoyar": True}]},
            "ik": [], "contactos": [{"grupo": antebrazos + hand("L") + hand("R")}, {"grupo": apoyo, "tol_cm": 2}],
            "camara": {"dir": [1, 0.1, 0.3], "lente": 50, "margen": 1.1}}


def plancha_lateral(rodillas=False):
    """Plancha lateral sobre el antebrazo izquierdo."""
    ang = {"hombro_abd.L": 90, "codo_flex.L": 90, "antebrazo_prono.L": 60, "hombro_abd.R": 0}
    apoyo = ["foot.L", "lowerleg02.L"] + [f"toe{n}-1.L" for n in range(1, 6)]
    if rodillas:
        ang.update({"rodilla_flex.L": 90, "rodilla_flex.R": 90})
        apoyo = ["lowerleg01.L", "foot.L"] + [f"toe{n}-{k}.L" for n in range(1, 6) for k in (1, 2, 3)]
    antebrazo = ["lowerarm01.L", "lowerarm02.L"] + hand("L")
    return {"base": {"orientacion": "decubito_lateral_L", "colchoneta": True, "angulos": ang, "suelo": antebrazo,
                     "asentar": [{"art": "@roll", "grupo": apoyo, "rango": [-35, 35], "reapoyar": True}]},
            "ik": [], "contactos": [{"grupo": antebrazo}, {"grupo": apoyo, "tol_cm": 2}],
            "camara": {"dir": [0.1, -1, 0.3], "lente": 50, "margen": 1.1}}
