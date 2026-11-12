#!/usr/bin/env python3
"""Genera fichas de RODILLA (F-ROD), TOBILLO (F-TOB) y PIE (F-PIE). Lado que trabaja: derecho."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import (FOOT, bipedo, rollo_pantorrillas, iso, keys_custom, musculos, prono, rep, sedente, sedente_suelo,  # noqa: E402
                    supino, write)

ROOT = Path(__file__).resolve().parents[3]
PENDIENTES = {
    "F-ROD-010": "Sentadilla búlgara: pie trasero sobre banco con descenso en tijera (pendiente de rig de doble apoyo).",
    "F-TOB-004": "Caminata en talones: locomoción.",
    "F-TOB-010": "Saltos pliométricos: fase aérea.",
    "F-TOB-019": "Eversión con banda en carga: requiere apoyo parcial del antepié.",
    "F-TOB-020": "Saltos laterales unipodales: fase aérea.",
    "F-PIE-009": "Extensión de dedos con banda: lazo alrededor de los dedos (geometría fina pendiente).",
}
TOES = lambda s: FOOT(s)          # noqa: E731


def spec(id_, plantilla, kd, props=None, lado="R", resaltar=("lowerleg01.R",), camara=None, extra=None, **kw):
    dur, keys = kd
    s = {"id": id_, "duracion_s": round(dur, 2), **plantilla, "keys": keys, "musculos": musculos(id_, lado),
         "articulacion_resaltada": [{"hueso": b} for b in resaltar]}
    s["props"] = plantilla.get("props", []) + (props or [])
    if s["props"]:
        s["variantes"] = ["gym", "casa"]
    else:
        s["variantes"] = ["gym"]
        s["nota_variantes"] = "Sin material: un solo video sirve para gym y casa."
    if camara:
        s["camara"] = {**s["camara"], "dir": camara}
    s.update(extra or {})
    s.update(kw)
    return write(s)


def sin_contacto(pl, grupo):
    pl["contactos"] = [c for c in pl["contactos"] if c["grupo"] != grupo]
    return pl


def asentar_rodilla_prono(pl):
    for a in pl["base"]["asentar"]:
        if a["art"] == "cadera_flex.R":
            a["grupo"] = ["upperleg02.R", "lowerleg01.R"] + FOOT("R")
    return pl


hecho = []
TOB, KNEE = ("lowerleg02.R",), ("lowerleg01.R",)

# ─── RODILLA ──────────────────────────────────────────────────────────────────
b = supino()
b["ik"] = [{"cadena": "pierna.R"}]
hecho.append(spec("F-ROD-001", b, rep({}, up=1.6, hold=0.6, down=1.6, campos={"ik": {"pierna.R": [0, 0.32, 0.03]}})))

b = asentar_rodilla_prono(prono())
hecho.append(spec("F-ROD-002", b, rep({"rodilla_flex.R": 100}, up=1.4, hold=0.8, down=1.8), camara=[1, 0.2, 0.3]))

b = sin_contacto(bipedo(camara=(-1, -0.2, 0.2)), "foot.R")
b["contactos"].append({"grupo": "foot.R", "desde": 0, "hasta": 0.4})
hecho.append(spec("F-ROD-003", b, rep({"rodilla_flex.R": 90, "cadera_flex.R": 8, "tobillo_dorsi.R": 12}, up=1.3, hold=0.8, down=1.7),
                  props=[{"tipo": "tobillera", "uso": "tobillera", "lado": "R"}]))

# 004 Curl con deslizadores: puente sostenido; los pies (planos sobre deslizadores) se alejan y vuelven.
b = supino(rectas=False, gancho=("L", "R"))
b["pivote"] = {"hueso": "spine01", "contrarrotar": "spine01"}
b["contactos"] = [c for c in b["contactos"] if c["grupo"] not in ("spine01",)]
sp = spec("F-ROD-004", b, rep({}, up=1.5, hold=0.6, down=1.8,
                              campos={"ik": {"pierna.L": [0, -0.26, 0], "pierna.R": [0, -0.26, 0]}}),
          lado=None, resaltar=("lowerleg01.L", "lowerleg01.R"))
d = json.loads(sp.read_text())
for k, f in zip(d["keys"], ["excentrico", "excentrico", "isometrico", "concentrico", "concentrico", "excentrico"]):
    k["pivote_x"] = -18
    k["fase"] = f
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
hecho.append(sp)

# 005 Curl nórdico asistido: de rodillas, el tronco cae hacia delante girando sobre las rodillas.
b = {"base": {"orientacion": "rodillas", "colchoneta": True,
              "angulos": {"rodilla_flex.L": 90, "rodilla_flex.R": 90, "tobillo_dorsi.L": -40, "tobillo_dorsi.R": -40,
                          "hombro_flex.L": 20, "hombro_flex.R": 20, "codo_flex.L": 100, "codo_flex.R": 100}},
     "ik": [], "contactos": [{"grupo": ["lowerleg01.L", "lowerleg02.L"]}, {"grupo": ["lowerleg01.R", "lowerleg02.R"]}],
     "camara": {"dir": [-1, -0.1, 0.25], "lente": 50, "margen": 1.1},
     "pivote": {"hueso": "lowerleg01.L", "contrarrotar": ["lowerleg01.L", "lowerleg01.R"]}}
sp = spec("F-ROD-005", b, rep({"hombro_flex.L": 40, "hombro_flex.R": 40}, up=2.2, hold=0.6, down=1.6),
          lado=None, resaltar=("lowerleg01.L", "lowerleg01.R"))
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = 38 * k["p"]
    if k["fase"] == "concentrico" and k["p"] == 0:
        pass
for k, f in zip(d["keys"], ["excentrico", "excentrico", "isometrico", "concentrico", "concentrico", "excentrico"]):
    k["fase"] = f                                   # en el nórdico la bajada es la fase excéntrica
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
hecho.append(sp)

hecho.append(spec("F-ROD-006", supino(), iso(3.0)))

b = supino(extra={"cadera_flex.R": 25, "rodilla_flex.R": 40})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if a["art"] != "cadera_flex.R"]
b = sin_contacto(b, "foot.R")
hecho.append(spec("F-ROD-007", b, rep({"rodilla_flex.R": -38}, up=1.2, hold=1.2, down=1.6),
                  props=[{"tipo": "rodillo", "uso": "rollo_bajo_hueso", "hueso": "upperleg02.R", "t": 0.95, "r": 0.075}]))

b = sin_contacto(sedente(), "foot.R")
hecho.append(spec("F-ROD-008", b, rep({"rodilla_flex.R": -85}, up=1.4, hold=1.0, down=1.8),
                  props=[{"tipo": "tobillera", "uso": "tobillera", "lado": "R"}], camara=[-1, -0.3, 0.2]))

# 009 Sentadilla: pies fijos (IK), pelvis atrás y abajo, tronco inclinado, brazos al frente.
b = bipedo(extra={"hombro_abd.L": 0, "hombro_abd.R": 0}, camara=(-1, -0.3, 0.2))
b["ik"] = [{"cadena": "pierna.L", "pie_plano": True}, {"cadena": "pierna.R", "pie_plano": True}]
b["base"]["angulos"].update({"cadera_abd.L": 6, "cadera_abd.R": 6})
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
hecho.append(spec("F-ROD-009", b, rep({"@pitch": 30, "hombro_flex.L": 85, "hombro_flex.R": 85, "cervical_flex": -15},
                                      up=1.6, hold=0.6, down=1.6, campos={"raiz": [0, 0.52, -0.30]}),
                  lado=None, resaltar=("lowerleg01.L", "lowerleg01.R")))

# ─── TOBILLO ──────────────────────────────────────────────────────────────────
pump = keys_custom([(0, {"tobillo_dorsi.L": 0, "tobillo_dorsi.R": 0}, 0), (0.4, {"tobillo_dorsi.L": 0, "tobillo_dorsi.R": 0}, 0),
                    (1.6, {"tobillo_dorsi.L": 18, "tobillo_dorsi.R": 18}, 1), (2.2, {"tobillo_dorsi.L": 18, "tobillo_dorsi.R": 18}, 1),
                    (3.6, {"tobillo_dorsi.L": -35, "tobillo_dorsi.R": -35}, 0.6), (4.2, {"tobillo_dorsi.L": -35, "tobillo_dorsi.R": -35}, 0.6),
                    (5.4, {"tobillo_dorsi.L": 0, "tobillo_dorsi.R": 0}, 0)],
                   ["concentrico", "concentrico", "isometrico", "concentrico", "isometrico", "concentrico", "concentrico"])
b = rollo_pantorrillas(supino())
hecho.append(spec("F-TOB-001", b, pump, lado=None, resaltar=("foot.L", "foot.R")))

b = sedente(extra={"rodilla_flex.R": 65})
hecho.append(spec("F-TOB-002", b, rep({"tobillo_dorsi.R": 18}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",),
                  camara=[-1, -0.3, 0.2]))

b = rollo_pantorrillas(sedente_suelo(), lados=("R",))
hecho.append(spec("F-TOB-003", b, rep({"tobillo_dorsi.R": 18}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",),
                  props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "foot.R", "anclaje_rel": [0, -0.6, 0.0]}]))

# 005 Elevación de antepié con espalda en la pared (talones apoyados).
b = bipedo(camara=(-1, -0.2, 0.2))
b["base"]["angulos"].update({"@pitch": -6})
b["reapoyar"] = {"grupos": ["foot.L", "foot.R"], "z": 0.0}
b["contactos"] = []
hecho.append(spec("F-TOB-005", b, rep({"tobillo_dorsi.L": 18, "tobillo_dorsi.R": 18}, up=1.0, hold=1.0, down=1.4),
                  lado=None, resaltar=("foot.L", "foot.R"),
                  props=[{"tipo": "pared", "uso": "caja", "tam": [1.6, 0.1, 2.2], "pos": [0, 0.38, 1.1]}]))

hecho.append(spec("F-TOB-006", sedente(), iso(3.0), resaltar=("foot.R",)))

b = rollo_pantorrillas(sedente_suelo(manos="libres", extra={"lumbar_flex": 14}), lados=("R",))
b["ik"] = [{"cadena": "brazo.L", "polo_manual": True, "polo": [0.5, 0.2, -0.5]},
           {"cadena": "brazo.R", "polo_manual": True, "polo": [-0.5, 0.2, -0.5]}]
b["base"]["angulos"].update({"mano_cerrar.L": 70, "mano_cerrar.R": 70})
hecho.append(spec("F-TOB-007", b, rep({"tobillo_dorsi.R": -30}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",),
                  props=[{"tipo": "banda_elastica", "uso": "correa_pie_manos", "pie": "R", "fraccion": 0.5}]))

# 008 Elevación de talones bipodal (el cuerpo sube: reapoyo en dedos).
b = bipedo(camara=(-1, -0.2, 0.2))
b["reapoyar"] = {"grupos": TOES("L") + TOES("R"), "z": 0.0}
b["contactos"] = [{"grupo": TOES("L")}, {"grupo": TOES("R")}]
hecho.append(spec("F-TOB-008", b, rep({"tobillo_dorsi.L": -32, "tobillo_dorsi.R": -32, "dedos_flex.L": -30, "dedos_flex.R": -30},
                                      up=1.1, hold=1.0, down=1.6), lado=None, resaltar=("foot.L", "foot.R")))

# 009 Unipodal en escalón: concéntrico arriba, excéntrico por debajo del escalón.
b = bipedo(extra={"rodilla_flex.L": 70, "cadera_flex.L": 10}, camara=(-1, -0.2, 0.2))
b["base"]["elevar"] = 0.18
b["reapoyar"] = {"grupos": TOES("R"), "z": 0.18}
b["contactos"] = [{"grupo": TOES("R"), "z": 0.18}]
kd = keys_custom([(0, {"tobillo_dorsi.R": 0, "dedos_flex.R": 0}, 0), (0.4, {"tobillo_dorsi.R": 0, "dedos_flex.R": 0}, 0),
                  (1.6, {"tobillo_dorsi.R": -30, "dedos_flex.R": -30}, 1), (2.3, {"tobillo_dorsi.R": -30, "dedos_flex.R": -30}, 1),
                  (4.6, {"tobillo_dorsi.R": 15, "dedos_flex.R": -10}, 0.5), (5.0, {"tobillo_dorsi.R": 15, "dedos_flex.R": -10}, 0.5),
                  (6.0, {"tobillo_dorsi.R": 0, "dedos_flex.R": 0}, 0)],
                 ["concentrico", "concentrico", "isometrico", "excentrico", "isometrico", "concentrico", "concentrico"])
hecho.append(spec("F-TOB-009", b, kd, resaltar=("foot.R",),
                  props=[{"tipo": "escalon", "uso": "caja", "tam": [0.5, 0.18, 0.18], "pos": [0, -0.06, 0.09]}]))

for id_, art, extra_props in (("F-TOB-011", None, None), ("F-TOB-016", None, None)):
    hecho.append(spec(id_, sedente(), iso(3.0), resaltar=("foot.R",)))

b = rollo_pantorrillas(sedente_suelo(), lados=("R",))
hecho.append(spec("F-TOB-012", b, rep({"tobillo_inv.R": 25}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",), camara=[-0.5, -1, 0.6]))
hecho.append(spec("F-TOB-013", rollo_pantorrillas(sedente_suelo(), lados=("R",)), rep({"tobillo_inv.R": 25}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",),
                  camara=[-0.5, -1, 0.6],
                  props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "foot.R", "anclaje_rel": [0.55, -0.15, 0.0]}]))
hecho.append(spec("F-TOB-017", rollo_pantorrillas(sedente_suelo(), lados=("R",)), rep({"tobillo_inv.R": -15}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",),
                  camara=[-0.5, -1, 0.6]))
hecho.append(spec("F-TOB-018", rollo_pantorrillas(sedente_suelo(), lados=("R",)), rep({"tobillo_inv.R": -15}, up=1.2, hold=1.0, down=1.6), resaltar=("foot.R",),
                  camara=[-0.5, -1, 0.6],
                  props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "foot.R", "anclaje_rel": [-0.55, -0.15, 0.0]}]))

# 014 Elevación de talones con pelota entre los talones.
b = bipedo(extra={"cadera_abd.L": -1, "cadera_abd.R": -1}, camara=(-0.4, 1, 0.25))
b["reapoyar"] = {"grupos": TOES("L") + TOES("R"), "z": 0.0}
b["contactos"] = [{"grupo": TOES("L")}, {"grupo": TOES("R")}]
hecho.append(spec("F-TOB-014", b, rep({"tobillo_dorsi.L": -30, "tobillo_dorsi.R": -30, "dedos_flex.L": -28, "dedos_flex.R": -28},
                                      up=1.1, hold=1.0, down=1.6), lado=None, resaltar=("foot.L", "foot.R"),
                  props=[{"tipo": "pelota_pequena", "uso": "pelota_rodillas", "hueso": "lowerleg02", "t": 1.0,
                          "r": 0.033}]))

# 015 Equilibrio unipodal sobre cojín inestable (balanceo suave).
b = bipedo(extra={"rodilla_flex.R": 70, "cadera_flex.R": 15, "hombro_abd.L": 25, "hombro_abd.R": 25}, camara=(-0.6, -1, 0.25))
b["base"]["elevar"] = 0.07
b["contactos"] = [{"grupo": "foot.L", "z": 0.07}]
kd = keys_custom([(0, {"@roll": 0, "tobillo_inv.L": 0}, 0), (1.5, {"@roll": 3, "tobillo_inv.L": 4}, 1),
                  (3.0, {"@roll": 0, "tobillo_inv.L": 0}, 0.4), (4.5, {"@roll": -3, "tobillo_inv.L": -4}, 1),
                  (6.0, {"@roll": 0, "tobillo_inv.L": 0}, 0)], ["isometrico"] * 5)
hecho.append(spec("F-TOB-015", b, kd, lado="L", resaltar=("foot.L",),
                  props=[{"tipo": "cojin_inestable", "uso": "caja", "tam": [0.40, 0.33, 0.07], "pos": [0.10, -0.04, 0.035],
                          "color": [0.30, 0.45, 0.60]}]))

# ─── PIE ──────────────────────────────────────────────────────────────────────
hecho.append(spec("F-PIE-001", sedente(), iso(3.0), resaltar=("foot.R",)))
hecho.append(spec("F-PIE-002", sedente(), rep({"dedos_flex.R": 35, "tobillo_dorsi.R": 6}, up=0.9, hold=0.8, down=1.2, post=2.0),
                  resaltar=("foot.R",), camara=[-0.8, -1, 0.5], props=[{"tipo": "toalla", "uso": "bajo_pie", "lado": "R"}]))
hecho.append(spec("F-PIE-003", sedente(), rep({"dedos_flex.R": 40, "tobillo_dorsi.R": 6}, up=0.9, hold=0.8, down=1.2, post=2.0),
                  resaltar=("foot.R",), camara=[-0.8, -1, 0.5], props=[{"tipo": "canicas", "uso": "bajo_pie", "lado": "R"}]))
b = bipedo(extra={"rodilla_flex.L": 70, "cadera_flex.L": 15}, camara=(-0.6, -1, 0.25))
b["contactos"] = [{"grupo": "foot.R"}]
hecho.append(spec("F-PIE-004", b, iso(3.0), resaltar=("foot.R",)))
b = bipedo(camara=(-1, -0.2, 0.2))
b["reapoyar"] = {"grupos": TOES("L") + TOES("R"), "z": 0.0}
b["contactos"] = [{"grupo": TOES("L")}, {"grupo": TOES("R")}]
hecho.append(spec("F-PIE-005", b, rep({"tobillo_dorsi.L": -28, "tobillo_dorsi.R": -28, "dedos_flex.L": -25, "dedos_flex.R": -25},
                                      up=1.1, hold=1.0, down=1.6), lado=None, resaltar=("foot.L", "foot.R")))
for id_, joint in (("F-PIE-006", "dedos_flex.R"), ("F-PIE-007", "hallux_flex.R"), ("F-PIE-008", "dedos_menores_flex.R")):
    hecho.append(spec(id_, sedente(), rep({joint: -35}, up=0.9, hold=1.0, down=1.2, post=1.9), resaltar=("foot.R",),
                      camara=[-0.8, -1, 0.5]))
b = bipedo(extra={"rodilla_flex.L": 70, "cadera_flex.L": 15}, camara=(-0.6, -1, 0.3))
b["contactos"] = [{"grupo": "foot.R"}]
hecho.append(spec("F-PIE-010", b, rep({"hallux_flex.R": -30}, up=0.9, hold=1.0, down=1.2, post=1.9), resaltar=("foot.R",)))

print(f"Generadas {len(hecho)} fichas de rodilla/tobillo/pie.")
(ROOT / "data/motion_specs/_pendientes_pierna.json").write_text(json.dumps(PENDIENTES, ensure_ascii=False, indent=2))
