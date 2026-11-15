#!/usr/bin/env python3
"""Genera las fichas de movimiento de la región CADERA (F-CAD-001..030).

  python3 scripts/factory/specs/gen_cadera.py

Convención: el lado que trabaja es el derecho (R). Los ángulos de 'peak' son deltas
sobre la posición base. Ejercicios marcados PENDIENTE requieren locomoción o
posiciones de suelo complejas y se documentan en vez de generarse.
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import sedente_suelo, FOOT, hand, plancha_lateral, keys_custom, bipedo, cuadrupedia, iso, lateral, musculos, prono, rep, sedente, supino, write  # noqa: E402

PENDIENTES = {
    "F-CAD-025": "Transiciones 90/90 sin manos: las poses 90/90 izquierda/derecha están resueltas (F-CAD-024), pero la transición por rodillas arriba hace que la pierna de atrás atraviese el suelo; requiere trayectoria de pie por IK en el suelo.",
}


def spec(id_, plantilla, keys_dur, props=None, lado="R", lado_elongan=None, resaltar=("upperleg01.R",),
         variantes=None, contactos_extra=None, camara=None, **extra):
    dur, keys = keys_dur
    s = {"id": id_, "duracion_s": dur, **plantilla, "keys": keys,
         "musculos": musculos(id_, lado, lado_elongan),
         "articulacion_resaltada": [{"hueso": b} for b in resaltar]}
    if props:
        s["props"] = props
    s["variantes"] = variantes or (["gym", "casa"] if props else ["gym"])
    if not props:
        s["nota_variantes"] = "Sin material: un solo video sirve para gym y casa."
    if contactos_extra:
        s["contactos"] = s["contactos"] + contactos_extra
    if camara:
        s["camara"] = {**s["camara"], "dir": camara}
    s.update(extra)
    return write(s)


def pie_libre(sp, lado="R"):
    """Quita el contacto permanente del pie que se mueve."""
    sp["contactos"] = [c for c in sp["contactos"] if c["grupo"] != f"foot.{lado}"]
    return sp


hecho = []

# 001 Heel slide: el talón desliza por la colchoneta (IK con objetivo móvil).
b = supino()
b["ik"] = [{"cadena": "pierna.R", "polo": [0, 0, 0.6]}]
hecho.append(spec("F-CAD-001", b, rep({}, up=1.6, hold=0.6, down=1.6, campos={"ik": {"pierna.R": [0, 0.32, 0.03]}})))

# 002 Marcha sentada.
b = pie_libre(sedente())
hecho.append(spec("F-CAD-002", b, rep({"cadera_flex.R": 28}, up=0.9, hold=0.5, down=1.0, pre=0.8, post=0.8),
                  contactos_extra=[{"grupo": "foot.R", "desde": 0, "hasta": 0.8}], camara=[-1, -0.25, 0.2]))

# 003 SLR: pierna izquierda en gancho, derecha recta sube a 45°.
b = pie_libre(supino(gancho=("L",)))
hecho.append(spec("F-CAD-003", b, rep({"cadera_flex.R": 45}, up=1.6, hold=1.0, down=1.8),
                  contactos_extra=[{"grupo": "foot.R", "desde": 0, "hasta": 0.4}]))

# 004 Flexión de cadera de pie con banda anclada detrás.
b = bipedo(camara=(-1, -0.2, 0.2))
hecho.append(spec("F-CAD-004", b, rep({"cadera_flex.R": 55, "rodilla_flex.R": 10}, up=1.3, hold=0.8, down=1.6),
                  props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "lowerleg02.R",
                          "anclaje_rel": [0, 0.7, 0.02]}],
                  contactos_extra=[{"grupo": "foot.R", "desde": 0, "hasta": 0.4}]))

# 005 Marcha alta (rodilla al pecho, brazos alternos).
b = bipedo(camara=(-1, -0.2, 0.2))
hecho.append(spec("F-CAD-005", b, rep({"cadera_flex.R": 85, "rodilla_flex.R": 95, "tobillo_dorsi.R": 10,
                                       "hombro_flex.L": 35, "codo_flex.L": 80, "hombro_flex.R": -20, "codo_flex.R": 60},
                                      up=0.9, hold=0.8, down=1.0, pre=1.0, post=1.3),
                  contactos_extra=[{"grupo": "foot.R", "desde": 0, "hasta": 1.0}]))

# 006 Isométrico de glúteos en supino.
hecho.append(spec("F-CAD-006", supino(), iso(3.0), lado=None, resaltar=("upperleg01.L", "upperleg01.R")))

# 008 Extensión de cadera en cuadrupedia (pierna atrás a la horizontal).
b = cuadrupedia()
b["contactos"] = b["contactos"] + [{"grupo": "lowerleg01.R", "desde": 0, "hasta": 0.4, "tol_cm": 2.5}]
hecho.append(spec("F-CAD-008", b, rep({"cadera_flex.R": -88, "rodilla_flex.R": -80}, up=1.5, hold=1.0, down=1.7)))

# 009 Hip thrust: espalda alta sobre banco (gym) / sofá (casa), carga en la cadera.
b = supino(rectas=False, gancho=("L", "R"))
b["base"]["colchoneta"] = False
b["base"]["suelo"] = ["spine01", "shoulder01.L", "shoulder01.R"]
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if a["art"] != "cervical_flex"]
for i in b["ik"]:
    i["z_suelo"] = 0.0
b["pivote"] = {"hueso": "spine01", "contrarrotar": "spine01"}
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
b["base"]["superficie_banco"] = 0.42
b["base"]["angulos"].update({"mano_cerrar.L": 70, "mano_cerrar.R": 70, "cervical_flex": 32, "lumbar_flex": 10})   # mentón recogido + retroversión (costillas abajo)
b["base"]["asentar"] = []
sp = spec("F-CAD-009", b, rep({}, up=1.3, hold=1.0, down=1.7), lado=None,
          resaltar=("upperleg01.L", "upperleg01.R"),
          props=[{"tipo": "barra", "uso": "carga_cadera", "casa": "mochila", "agarre": True}])
import json  # noqa: E402
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = 32 * (1 - k["p"])          # cadera abajo (32°) → tronco horizontal (0°)
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
hecho.append(sp)

# 010 Peso muerto rumano unipodal (apoyo izquierdo, pierna derecha atrás).
b = bipedo(extra={"rodilla_flex.L": 12, "mano_cerrar.L": 70, "mano_cerrar.R": 70}, camara=(1, -0.3, 0.25))
b["pivote"] = {"hueso": "upperleg01.L", "contrarrotar": "upperleg01.L"}
sp = spec("F-CAD-010", b, rep({"hombro_flex.L": 60, "hombro_flex.R": 60, "cadera_flex.R": -8},
                              up=1.8, hold=0.8, down=1.8),
          lado="L", props=[{"tipo": "mancuerna", "uso": "en_mano", "manos": ["L", "R"]}],
          resaltar=("upperleg01.L",),
          contactos_extra=[{"grupo": "foot.R", "desde": 0, "hasta": 0.4, "tol_cm": 2.5}])
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = 62 * k["p"]
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
hecho.append(sp)

# 011 Isométrico de abducción con cinturón en supino (rodillas flexionadas).
hecho.append(spec("F-CAD-011", supino(gancho=("L", "R")), iso(3.0), lado=None,
                  props=[{"tipo": "correa", "uso": "lazo_rodillas"}], resaltar=("upperleg01.L", "upperleg01.R")))

# 012 Abducción en decúbito lateral (pierna de arriba recta).
hecho.append(spec("F-CAD-012", lateral(), rep({"cadera_abd.R": 35}, up=1.4, hold=1.0, down=1.8)))

# 013 Abducción de pie con banda alrededor de los tobillos.
b = bipedo(camara=(0, -1, 0.2))
hecho.append(spec("F-CAD-013", b, rep({"cadera_abd.R": 25}, up=1.2, hold=0.8, down=1.6),
                  props=[{"tipo": "banda_elastica", "uso": "lazo_rodillas", "hueso": "lowerleg02", "t": 0.75}],
                  contactos_extra=[{"grupo": "foot.R", "desde": 0, "hasta": 0.4}]))

# 015 Step-down lateral: apoyo derecho en escalón, la pierna izquierda baja.
b = bipedo(camara=(0, -1, 0.15))
b["ik"] = [{"cadena": "pierna.R", "pie_plano": True, "z_suelo": 0.18, "polo": [0, -0.6, 0]}]
b["contactos"] = []
b["base"]["elevar"] = 0.18
hecho.append(spec("F-CAD-015", b, rep({"cadera_flex.R": 25, "cadera_flex.L": 10, "lumbar_flex": 12,
                                        "hombro_flex.L": 40, "hombro_flex.R": 40},
                                       up=1.6, hold=0.6, down=1.6, campos={"raiz": [0, 0.04, -0.10]}),
                  props=[{"tipo": "escalon", "uso": "caja", "tam": [0.40, 0.35, 0.18], "pos": [-0.10, -0.05, 0.09]}]))

# 016 Isométrico apretando pelota entre las rodillas.
hecho.append(spec("F-CAD-016", supino(gancho=("L", "R")), iso(3.0), lado=None,
                  props=[{"tipo": "pelota_pequena", "uso": "pelota_rodillas"}], resaltar=("upperleg01.L", "upperleg01.R")))

# 017 Aducción en decúbito lateral: trabaja la pierna de ABAJO (izquierda).
b = lateral(top_recta=False)
b["base"]["angulos"].update({"cadera_flex.L": 0, "rodilla_flex.L": 0})
b["contactos"] = [{"grupo": FOOT("R"), "tol_cm": 2}, {"grupo": ["lowerleg01.L", "foot.L"], "desde": 0, "hasta": 0.4, "tol_cm": 2}, {"grupo": ["pelvis.L", "upperleg01.L"], "tol_cm": 2.5}]
hecho.append(spec("F-CAD-017", b, rep({"cadera_abd.L": -22}, up=1.3, hold=1.0, down=1.7), lado="L",
                  resaltar=("upperleg01.L",)))

# 018 Aducción de pie con banda anclada al lado derecho.
b = bipedo(extra={"cadera_abd.R": 18}, camara=(0, -1, 0.2))
hecho.append(spec("F-CAD-018", b, rep({"cadera_abd.R": -18}, up=1.2, hold=0.8, down=1.6),
                  props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "lowerleg02.R",
                          "anclaje_rel": [-0.75, 0, 0.02]}]))

# 021/026 Rotación interna/externa activa sentada.
hecho.append(spec("F-CAD-021", pie_libre(sedente()), rep({"cadera_re.R": -30}, up=1.2, hold=1.0, down=1.5),
                  camara=[0, -1, 0.3]))
hecho.append(spec("F-CAD-026", pie_libre(sedente()), rep({"cadera_re.R": 30}, up=1.2, hold=1.0, down=1.5),
                  camara=[0, -1, 0.3]))

# 022 Rotación interna en prono (rodilla a 90°).
b = prono(extra={"rodilla_flex.R": 90})
for a in b["base"]["asentar"]:
    if a["art"] == "cadera_flex.R":
        a["grupo"] = ["upperleg02.R", "lowerleg01.R"]
hecho.append(spec("F-CAD-022", b, rep({"cadera_re.R": -35, "cadera_flex.R": -4}, up=1.3, hold=1.0, down=1.6), camara=[0, -1, 0.6]))

# 023 Rotación interna sentada con banda (anclada al lado izquierdo, por delante).
hecho.append(spec("F-CAD-023", pie_libre(sedente()), rep({"cadera_re.R": -30}, up=1.2, hold=1.0, down=1.5),
                  props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "lowerleg02.R",
                          "anclaje_rel": [0.65, -0.35, 0.0]}], camara=[0, -1, 0.3]))

# 027/028 Almeja (talones juntos: el polo de la rodilla rota sobre el eje cadera-talón).
hecho.append(spec("F-CAD-027", lateral(almeja=True), rep({}, up=1.3, hold=1.0, down=1.7,
                                                         campos={"polo": {"pierna.R": [0, 0.3, 0.8]}})))
hecho.append(spec("F-CAD-028", lateral(almeja=True), rep({}, up=1.3, hold=1.0, down=1.7,
                                                         campos={"polo": {"pierna.R": [0, 0.3, 0.8]}}),
                  props=[{"tipo": "banda_elastica", "uso": "lazo_rodillas"}]))

# 029 Fire hydrant en cuadrupedia.
b = cuadrupedia()
b["contactos"] = b["contactos"] + [{"grupo": "lowerleg01.R", "desde": 0, "hasta": 0.4, "tol_cm": 2.5}]
hecho.append(spec("F-CAD-029", b, rep({"cadera_abd.R": 40}, up=1.3, hold=1.0, down=1.6), camara=[0.6, -1, 0.6]))

print(f"Generadas {len(hecho)} fichas de cadera (+ F-CAD-007 ya existente).")
# 030 Avión de cadera: apoyo unipodal izquierdo (IK), tronco inclinado y pierna derecha atrás; la pelvis rota abriéndose
# (rotación externa de la cadera de apoyo) y vuelve. Brazos en cruz.
b = bipedo(extra={"@pitch": 55, "cadera_flex.L": 58, "cadera_flex.R": -2, "rodilla_flex.L": 12, "hombro_abd.L": 80, "hombro_abd.R": 80,
                  "cervical_flex": -25}, camara=(-1, -0.6, 0.35))
b["ik"] = [{"cadena": "pierna.L", "pie_plano": True}]
b["reapoyar"] = {"grupos": ["foot.L"]}
b["contactos"] = [{"grupo": "foot.L"}]
spec("F-CAD-030", b, rep({"@yaw": 28}, up=1.5, hold=0.8, down=1.6), lado="L", resaltar=("upperleg01.L",))

# 014 Monster walk: semisentadilla con banda sobre las rodillas, pasos laterales a la derecha (sale el pie derecho,
# sigue el izquierdo sin juntar los pies). 2 pares de pasos por ciclo; la cámara acompaña (loop exacto).
W, T, H_ = 0.22, 1.25, 0.05
b = bipedo(extra={"cadera_abd.L": 6, "cadera_abd.R": 6, "@pitch": 12, "hombro_flex.L": 25, "hombro_flex.R": 25,
                  "codo_flex.L": 70, "codo_flex.R": 70}, camara=(0, -1, 0.25))
b["ik"] = [{"cadena": "pierna.L", "pie_plano": True}, {"cadena": "pierna.R", "pie_plano": True}]
b["contactos"] = [{"grupo": FOOT("L") + FOOT("R")}]
pos = {"L": 0.0, "R": 0.0}
ks, t = [], 0.0
def kk(t, sw=None, fr=0.0):
    ik = {}
    for sd in ("L", "R"):
        x = pos[sd] - (W * fr if sd == sw else 0)
        z = H_ * math.sin(math.pi * fr) if sd == sw else 0.0
        ik[f"pierna.{sd}"] = [round(x, 4), 0, round(z, 4)]
    mid = (ik["pierna.L"][0] + ik["pierna.R"][0]) / 2
    rx = [round(mid, 4), 0, -0.07]
    ks.append({"t": round(t, 3), "raiz": rx, "ik": ik, "art": {}, "p": 0.8, "fase": "concentrico",
               "polo": {"pierna.L": [rx[0], 0, 0], "pierna.R": [rx[0], 0, 0]}})
kk(0.0)
for sd in ("R", "L", "R", "L"):
    kk(t + 0.5 * T * 0.8, sd, 0.5)
    kk(t + T * 0.8, sd, 1.0)
    pos[sd] -= W
    t += T
first = ks[0]
adv = [-2 * W, 0, 0]
last = {"t": round(4 * T, 3), "art": {}, "p": 0.8, "fase": "concentrico",
        "raiz": [round(first["raiz"][0] + adv[0], 4), 0, first["raiz"][2]],
        "ik": {c: [round(o[0] + adv[0], 4), 0, o[2]] for c, o in first["ik"].items()},
        "polo": {c: [round(o[0] + adv[0], 4), 0, 0] for c, o in first["polo"].items()}}
ks = [k for k in ks if k["t"] < last["t"] - 1e-6] + [last]
s_ = {"id": "F-CAD-014", "duracion_s": last["t"], **b, "keys": ks, "avance": adv, "musculos": musculos("F-CAD-014", "R"),
      "articulacion_resaltada": [{"hueso": "upperleg01.R"}],
      "props": [{"tipo": "banda_elastica", "uso": "lazo_rodillas", "hueso": "upperleg02", "t": 0.85}], "variantes": ["gym", "casa"]}
write(s_)


# 90/90 en el suelo: pierna IZQUIERDA delante en rotación externa (muslo al frente, tibia cruzada delante),
# pierna DERECHA detrás en rotación interna (muslo al lado, tibia hacia atrás); manos apoyadas detrás.
def noventa():
    # ángulos medidos con sonda (eje: +re = rotación externa; adelante = −y)
    b = sedente_suelo(manos="libres", extra={"hombro_flex.L": 35, "hombro_flex.R": 35, "codo_flex.L": 80, "codo_flex.R": 80,
                                             "hombro_abd.L": 15, "hombro_abd.R": 15,
                                             "cadera_flex.L": 90, "cadera_abd.L": 40, "cadera_re.L": 90, "rodilla_flex.L": 90,
                                             "cadera_flex.R": 0, "cadera_abd.R": 82, "cadera_re.R": 0, "rodilla_flex.R": 90,
                                             "tobillo_dorsi.L": -10, "tobillo_dorsi.R": -45, "lumbar_flex": 0})
    # sentada SOBRE LOS GLÚTEOS: muslos horizontales (el de atrás en flexión 90 + abducción 75 = al costado)
    b["base"]["asentar"] = [{"art": "cadera_abd.R", "grupo": ["lowerleg01.R", "lowerleg02.R"], "rango": [-15, 15]},
                            {"art": "cadera_flex.L", "grupo": ["lowerleg01.L", "lowerleg02.L", "foot.L"], "rango": [-15, 15]}]
    b["contactos"] = [{"grupo": ["Delete.female_sportsuit01", "pelvis.L", "pelvis.R"]}, {"grupo": ["lowerleg01.L", "lowerleg02.L", "foot.L"], "tol_cm": 2.5},
                      {"grupo": ["lowerleg01.R", "lowerleg02.R", "foot.R"], "tol_cm": 2.5}]
    b["rom_pasivo"] = {"cadera_re+": 90, "cadera_re-": 40, "cadera_abd+": 97}
    b["base"]["suelo"] = ["pelvis.L", "pelvis.R", "Delete.female_sportsuit01"]                # se apoya en los glúteos, no en los muslos
    b["camara"] = {"dir": [-0.15, -0.7, 1.2], "lente": 50, "margen": 1.1}
    return b


# Copenhagen: plancha lateral sobre el antebrazo izquierdo; la pierna de ARRIBA (R) apoyada en un banco
# (rodilla = corta, tobillo = larga). El @roll lleva el apoyo de la pierna a la altura del banco (0,40 m).
def copenhagen(larga):
    b = plancha_lateral()
    g = ["lowerleg02.R", "foot.R"] if larga else ["lowerleg01.R", "upperleg02.R"]
    b["base"]["angulos"].update({"cadera_flex.L": 20, "rodilla_flex.L": 70, "cadera_abd.R": 6})
    b["base"]["asentar"] = [{"art": "@roll", "grupo": g, "z": 0.40, "rango": [-60, 60], "reapoyar": True}]
    b["contactos"] = [b["contactos"][0], {"grupo": g, "banco": "R", "tol_cm": 2}]
    b["props"] = [{"tipo": "banco", "uso": "banco_bajo_pie", "lado": "R", "grupo": g, "largo": 0.40, "dy": 0.0}]
    # por key: el cuerpo gira (@roll) para que la pierna siga sobre el banco y el antebrazo en el suelo
    b["resolver"] = {"art": "@roll", "a": g, "za": 0.40, "b": b["contactos"][0]["grupo"], "rango": [-30, 30]}
    return b


_b = noventa()
hecho.append(spec("F-CAD-024", _b, rep({"cadera_re.R": -15}, up=1.3, hold=1.0, down=1.6), lado="R",
                  resaltar=("upperleg01.R",)))
# 025 Transiciones 90/90 sin manos: 90/90 izquierda → rodillas arriba (pies apoyados) → 90/90 derecha → vuelta.
_A = {"cadera_flex.L": 90, "cadera_abd.L": 40, "cadera_re.L": 90, "rodilla_flex.L": 90, "tobillo_dorsi.L": -10,
      "cadera_flex.R": 0, "cadera_abd.R": 70, "cadera_re.R": 0, "rodilla_flex.R": 90, "tobillo_dorsi.R": -45}
_B = {k[:-1] + ("R" if k.endswith("L") else "L"): v for k, v in _A.items()}
_M = {f"{j}.{sd}": v for sd in "LR" for j, v in (("cadera_flex", 110), ("cadera_abd", 20), ("cadera_re", 0),
                                                 ("rodilla_flex", 125), ("tobillo_dorsi", 15))}
# intermedios: primero sube la rodilla (flexión) manteniendo la rotación a medias, luego gira la pierna
_IA = {**_A, **{k: (_A[k] + _M[k]) / 2 for k in _A}, "cadera_flex.L": 105}
_IB = {**_B, **{k: (_B[k] + _M[k]) / 2 for k in _B}, "cadera_flex.R": 105}
_d = lambda T: {k: round(T[k] - _A[k], 1) for k in _A}
_b = noventa()
_b["base"]["asentar"] = []
# la raíz no se mueve (queda sentada como en la 90/90 base); el grupo "pelvis" de la malla queda ~12 cm sobre el
# suelo por la forma de la malla, así que el contacto se vigila con tolerancia amplia y la penetración con el check de suelo
_b["contactos"] = [{"grupo": ["pelvis.L", "pelvis.R"], "tol_cm": 14}]
_b["rom_pasivo"] = {"cadera_re+": 90, "cadera_re-": 40, "cadera_abd+": 97, "rodilla_flex+": 135}
_seq = [(0, _d(_A), 0), (0.4, _d(_A), 0), (1.2, _d(_IA), 0.4), (2.0, _d(_M), 0.6), (2.8, _d(_IB), 0.8), (3.6, _d(_B), 1),
        (4.1, _d(_B), 1), (4.9, _d(_IB), 0.8), (5.7, _d(_M), 0.6), (6.5, _d(_IA), 0.4), (7.3, _d(_A), 0), (7.6, _d(_A), 0)]
# keys densas (cada ~0,2 s) para que el asentado por key evite que pies/muslos crucen el suelo entre keys
_fases = ["concentrico"] * 5 + ["isometrico"] + ["concentrico"] * 6
_dense = []
for (t0, a0, p0), (t1, a1, p1), f_ in zip(_seq, _seq[1:], _fases):
    n_ = max(1, round((t1 - t0) / 0.2))
    for i_ in range(n_):
        u = i_ / n_
        _dense.append((round(t0 + (t1 - t0) * u, 3), {k: round(a0[k] + (a1[k] - a0[k]) * u, 2) for k in a0}, round(p0 + (p1 - p0) * u, 3), f_))
_dense.append((*_seq[-1], _fases[-1]))
_s025 = None and (spec("F-CAD-025", _b, keys_custom([d[:3] for d in _dense], [d[3] for d in _dense]),
                  lado=None, resaltar=("upperleg01.L", "upperleg01.R"),
                  asentar_keys=[{"art": f"cadera_abd.{sd}", "grupo": FOOT(sd) + [f"lowerleg01.{sd}", f"lowerleg02.{sd}", f"upperleg02.{sd}"],
                                 "rango": [-30, 30], "solo_bajo": True, "z": 0.0} for sd in "LR"]))

for _id, _l in (("F-CAD-019", False), ("F-CAD-020", True)):
    _b = copenhagen(_l)
    _p = _b.pop("props")
    hecho.append(spec(_id, _b, rep({"cadera_abd.R": -14}, up=1.2, hold=1.2, down=1.6), props=_p,
                      resaltar=("upperleg01.R",), variantes=["gym", "casa"]))

print("Pendientes documentadas:", ", ".join(PENDIENTES))
(Path(__file__).resolve().parents[3] / "data/motion_specs/_pendientes_cadera.json").write_text(
    json.dumps(PENDIENTES, ensure_ascii=False, indent=2))
