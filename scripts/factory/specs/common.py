"""Plantillas compartidas para generar fichas de movimiento (data/motion_specs/*.json)."""
import json
import math
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


# Sinergistas/estabilizadores que la biblioteca no lista y que SÍ trabajan (revisión clínica 2026-11-13).
# "activos+" se suman a los activos (color por fase); "estabilizan" = isométricos (siempre rojo, menor intensidad).
EXTRA_MUSCULOS = {
    "F-ROD-005": {"estabilizan": ["rectus_abdominis", "gluteus_maximus", "erector_spinae_lumbar"]},
    "F-ESC-020": {"activos+": ["latissimus_dorsi", "biceps_brachii", "deltoid_posterior"],
                  "estabilizan": ["gluteus_maximus", "rectus_abdominis"]},
    "F-HOM-040": {"activos+": ["triceps_brachii", "serratus_anterior"], "estabilizan": ["rectus_abdominis", "external_oblique"]},
    "F-HOM-038": {"activos+": ["triceps_brachii"], "estabilizan": ["rectus_abdominis"]},
    "F-ESC-015": {"estabilizan": ["rectus_abdominis", "external_oblique"]},
    "F-HOM-020": {"activos+": ["biceps_brachii"], "estabilizan": ["rectus_abdominis"]},
    "F-CAD-010": {"estabilizan": ["erector_spinae_lumbar", "gluteus_medius"]},
    "F-LUM-010": {"estabilizan": ["rectus_abdominis"]},
    "F-CER-015": {"estabilizan": ["external_oblique", "gluteus_medius"]},
    "F-LUM-012": {"estabilizan": ["gluteus_medius"]},
    "F-LUM-013": {"estabilizan": ["gluteus_medius"]},
    "F-ROD-009": {"activos+": ["gluteus_maximus"], "estabilizan": ["erector_spinae_lumbar"]},
    "F-LUM-007": {"estabilizan": ["rectus_abdominis", "external_oblique"]},
}


def musculos(item_id, lado=None, lado_elongan=None, sostienen=None):
    """Roles musculares de la ficha. Reglas (para que los colores NUNCA se encimen):
    - un músculo que está en activos NO puede estar en elongan del mismo lado: si hay lado, el elongado pasa al
      lado opuesto (p.ej. inclinación lateral: trabaja el derecho, se estira el izquierdo); si es bilateral, se
      quita de elongan (queda sólo en rojo).
    - estabilizan/sostienen: isométricos en rojo suave."""
    it = BIB[item_id]
    out = {}
    opp = {"L": "R", "R": "L"}
    activos = set()
    for rol, lista in it["musculos"].items():
        if rol != "activos":
            continue
        for m in lista:
            activos.update(m["ids"])
    extra = EXTRA_MUSCULOS.get(item_id, {})
    for rol, lista in it["musculos"].items():
        sd = lado if rol != "elongan" else (lado_elongan or lado)
        seen, arr = set(), []
        for m in lista:
            for mid in m["ids"]:
                if mid == "plantar_fascia":       # tejido no muscular: se dibuja el flexor corto de los dedos,
                    mid = "flexor_digitorum_brevis"   # que está justo bajo la aponeurosis plantar
                if mid in seen or mid.startswith("glenohumeral_capsule"):
                    continue
                seen.add(mid)
                if rol == "elongan" and mid in activos:
                    if lado in opp:                       # trabaja un lado → se estira el contrario
                        arr.append({"id": mid, "lado": opp[lado] if sd in (None, lado) else sd})
                    continue                              # bilateral: queda sólo como activo
                arr.append({"id": mid, "lado": sd} if sd else {"id": mid})
        out[rol] = arr
    if extra.get("activos+"):
        have = {m["id"] for m in out.get("activos", [])}
        out.setdefault("activos", []).extend({"id": m, "lado": lado} if lado else {"id": m} for m in extra["activos+"] if m not in have)
    used = {m["id"] for v in out.values() for m in v}
    est = [m for m in extra.get("estabilizan", []) if m not in used]
    if est:
        out["estabilizan"] = [{"id": m} for m in est]
    if sostienen:
        out["sostienen"] = [m if isinstance(m, dict) else {"id": m} for m in sostienen
                            if (m if isinstance(m, str) else m["id"]) not in used]
    return {k: v for k, v in out.items() if v}


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


def caminar(L=0.36, T=1.25, pasos=4, alto=0.07, brazos=15, pie_plano=True, extra_art=None, lateral=False):
    """Ciclo de marcha en loop (avance por ciclo = pasos·L). Pies con IK: el de apoyo queda fijo, el que oscila se
    levanta 'alto' y avanza 2L. Devuelve (plantilla_ik, keys, avance). Dirección: hacia −Y (adelante)."""
    dur = round(pasos * T, 3)
    adv = pasos * L
    ax = 0 if lateral else 1
    def vec(v):
        return [v, 0, 0] if lateral else [0, -v, 0]
    pos = {"R": -L, "L": 0.0}                # posiciones (en metros de avance) de cada pie; R empieza atrás
    keys = []
    order = ["R", "L"] * (pasos // 2)
    def key(t, swing=None, frac=0.0, p_=0.6, fase="concentrico"):
        ik = {}
        for s in ("L", "R"):
            d = pos[s]
            z = 0.0
            if s == swing:
                d = pos[s] + 2 * L * frac
                z = alto * math.sin(math.pi * frac)
            v = vec(d)
            v[2] = z
            ik[f"pierna.{s}"] = [round(x, 4) for x in v]
        root = vec(-L / 2 + adv * (t / dur))
        root[2] = round(0.012 * math.sin(2 * math.pi * t / T * 1.0 - math.pi / 2) if swing else 0.0, 4)
        sw = 1 if swing == "L" else -1
        art = {"hombro_flex.L": -sw * brazos * math.sin(math.pi * frac) if swing else 0,
               "hombro_flex.R": sw * brazos * math.sin(math.pi * frac) if swing else 0}
        art.update(extra_art or {})
        rxy = [round(root[0], 4), round(root[1], 4), 0.0]
        keys.append({"t": round(t, 3), "raiz": [round(x, 4) for x in root], "ik": ik, "art": art, "p": p_, "fase": fase,
                     "polo": {"pierna.L": rxy, "pierna.R": rxy}})
    t = 0.0
    for s in order:
        for frac in (0.0, 0.5, 1.0) if not keys else (0.5, 1.0):
            key(t + T * frac * 0.85, s, frac)
        pos[s] += 2 * L if False else 0
        pos[s] = pos[s] + 2 * L
        t += T
    # última key = primera desplazada en 'adv' (loop exacto)
    first = keys[0]
    last = {"t": dur, "art": dict(first["art"]), "p": first["p"], "fase": first["fase"],
            "raiz": [round(a + b, 4) for a, b in zip(first["raiz"], vec(adv))],
            "ik": {c: [round(a + b, 4) for a, b in zip(o, vec(adv))] for c, o in first["ik"].items()},
            "polo": {c: [round(a + b, 4) for a, b in zip(o, vec(adv))] for c, o in first["polo"].items()}}
    keys = [k for k in keys if k["t"] < dur - 1e-6] + [last]
    ik = [{"cadena": "pierna.L", "pie_plano": pie_plano}, {"cadena": "pierna.R", "pie_plano": pie_plano}]
    return ik, keys, vec(adv)
