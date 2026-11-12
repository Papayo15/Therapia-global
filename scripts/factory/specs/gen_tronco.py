#!/usr/bin/env python3
"""Genera fichas de COLUMNA TORÁCICA (F-TOR), LUMBAR/CORE (F-LUM) y las planchas pendientes (F-CER-015, F-ESC-015)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import (bipedo, cuadrupedia, hand, iso, keys_custom, lateral, musculos, plancha, plancha_lateral,  # noqa: E402
                    prono, rep, sedente, supino, write)

ROOT = Path(__file__).resolve().parents[3]
PENDIENTES = {
    "F-TOR-010": "Extensión en banco romano: equipo específico de gimnasio (cadera fija, tronco en voladizo).",
    "F-LUM-014": "Caminata con carga unilateral: locomoción.",
    "F-LUM-015": "Inclinación lateral en banco romano a 45°: equipo específico.",
    "F-LUM-020": "Lanzamiento rotacional con balón medicinal: lanzamiento.",
}
SP = ("spine03",)


def spec(id_, plantilla, kd, props=None, lado=None, resaltar=SP, camara=None, variantes=None, **kw):
    dur, keys = kd
    s = {"id": id_, "duracion_s": round(dur, 2), **plantilla, "keys": keys, "musculos": musculos(id_, lado),
         "articulacion_resaltada": [{"hueso": b} for b in resaltar]}
    s["props"] = plantilla.get("props", []) + (props or [])
    s["variantes"] = variantes or (["gym", "casa"] if s["props"] else ["gym"])
    if s["variantes"] == ["gym"]:
        s["nota_variantes"] = kw.pop("nota", "Sin material: un solo video sirve para gym y casa.")
    if camara:
        s["camara"] = {**s["camara"], "dir": camara}
    s.update(kw)
    return write(s)


def pinned(pl, sides=("L", "R")):
    suelo = pl["base"]["orientacion"] in ("prono", "cuadrupedia")
    pl["ik"] = pl.get("ik", []) + [dict({"cadena": f"brazo.{s}"}, **({"al_suelo": 0.03} if suelo else {})) for s in sides]
    return pl


def head_hands(pl):
    for s in ("L", "R"):
        pl["ik"] = pl.get("ik", []) + [{"cadena": f"brazo.{s}", "a_hueso": {"hueso": "head", "dir": "posterior", "t": 0.4, "sep": 0.03, "lado": s}}]
        pl["base"]["angulos"].update({f"hombro_flex.{s}": 120, f"codo_flex.{s}": 120, f"hombro_abd.{s}": 30})
    return pl


def no_hand_contacts(pl):
    pl["contactos"] = [c for c in pl["contactos"] if c["grupo"] not in (hand("L"), hand("R"))]
    pl["base"]["asentar"] = [a for a in pl["base"]["asentar"] if not a["art"].startswith("hombro")]
    return pl


H = []

# ─── TORÁCICA ─────────────────────────────────────────────────────────────────
H.append(spec("F-TOR-001", pinned(cuadrupedia()), rep({"lumbar_flex": 18, "toracica_flex": 20, "cervical_flex": 20}, up=1.6, hold=0.8, down=1.6),
              camara=[1, 0.1, 0.3]))
b = sedente(extra={"hombro_flex.L": 85, "hombro_flex.R": 85, "codo_flex.L": 125, "codo_flex.R": 125, "hombro_abd_h.L": -40, "hombro_abd_h.R": -40})
H.append(spec("F-TOR-002", b, rep({"toracica_flex": 30, "cervical_flex": 15}, up=1.5, hold=0.8, down=1.6), camara=[-1, -0.2, 0.2]))
b = no_hand_contacts(supino(rectas=False, gancho=("L", "R"), extra={"hombro_flex.L": 25, "hombro_flex.R": 25}))
b["contactos"] = [c for c in b["contactos"] if c["grupo"] not in ("spine01", "head")] + [{"grupo": "head", "desde": 0, "hasta": 0.4}]
H.append(spec("F-TOR-003", b, rep({"toracica_flex": 22, "cervical_flex": 18, "hombro_flex.L": 20, "hombro_flex.R": 20}, up=1.2, hold=1.0, down=1.5)))
b2 = json.loads(json.dumps(b))
b2["base"]["angulos"].update({"hombro_flex.L": 60, "hombro_flex.R": 60, "codo_flex.L": 110, "codo_flex.R": 110, "mano_cerrar.L": 70, "mano_cerrar.R": 70})
H.append(spec("F-TOR-004", b2, rep({"toracica_flex": 22, "cervical_flex": 18}, up=1.2, hold=1.0, down=1.5),
              props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": f"wrist.{s}", "anclaje_rel": [0, 0.7, 0.05]} for s in ("L", "R")]))
# 005 Roll-down / roll-back: sentada con rodillas flexionadas, el tronco rueda hacia atrás ~40° y vuelve.
b = {"base": {"orientacion": "sedente_suelo", "colchoneta": True,
              "angulos": {"cadera_flex.L": 95, "cadera_flex.R": 95, "rodilla_flex.L": 90, "rodilla_flex.R": 90,
                          "hombro_flex.L": 80, "hombro_flex.R": 80, "lumbar_flex": 10}},
     "ik": [{"cadena": "pierna.L", "pie_plano": True}, {"cadena": "pierna.R", "pie_plano": True}],
     "reapoyar": {"grupos": ["pelvis.L", "pelvis.R", "spine05", "spine04"], "z": 0.006},
     "contactos": [{"grupo": "foot.L"}, {"grupo": "foot.R"}], "camara": {"dir": [-1, 0.1, 0.3], "lente": 50, "margen": 1.1}}
H.append(spec("F-TOR-005", b, rep({"@pitch": -38, "lumbar_flex": 25, "toracica_flex": 10}, up=2.0, hold=0.6, down=2.0)))
# 006 Extensión sobre rodillo (pelvis en el suelo, espalda alta sobre el rodillo, manos en la nuca).
b = head_hands(supino(rectas=False, gancho=("L", "R")))
b["base"].update({"colchoneta": False, "superficie_banco": 0.15, "rodillo_bajo": {"grupo": "spine02"}, "suelo": ["spine02"],
                  "asentar": [{"art": "@pitch", "grupo": ["pelvis.L", "pelvis.R", "spine05"], "z": 0.0, "rango": [-30, 30], "reapoyar": True}]})
for i in b["ik"]:
    i["z_suelo"] = 0.0
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
H.append(spec("F-TOR-006", b, rep({"toracica_flex": -18, "cervical_flex": -5}, up=1.5, hold=1.0, down=1.6),
              nota="En casa: toalla grande enrollada en lugar del foam roller (mismo video)."))
H.append(spec("F-TOR-007", head_hands(sedente()), rep({"toracica_flex": -20, "cervical_flex": -8}, up=1.5, hold=1.0, down=1.6), camara=[-1, -0.2, 0.2]))
b = pinned(prono(extra={"cervical_rot": 0, "hombro_flex.L": 20, "hombro_flex.R": 20, "hombro_abd.L": 60, "hombro_abd.R": 60,
                        "codo_flex.L": 120, "codo_flex.R": 120}))
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith(("hombro", "cervical"))] + \
    [{"art": "cervical_flex", "grupo": "head", "rango": [-10, 35]}]
b["contactos"] = [{"grupo": ["pelvis.L", "pelvis.R", "spine05"], "tol_cm": 2.5}]
H.append(spec("F-TOR-008", b, rep({"toracica_flex": -16, "lumbar_flex": -10, "cervical_flex": -10}, up=1.5, hold=1.0, down=1.6), camara=[1, 0.1, 0.3]))
b = prono(extra={"cervical_rot": 0, "hombro_abd.L": 80, "hombro_abd.R": 80, "codo_flex.L": 90, "codo_flex.R": 90})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith(("hombro", "cervical"))] + \
    [{"art": "cervical_flex", "grupo": "head", "rango": [-10, 35]},
     {"art": "hombro_re.L", "grupo": hand("L"), "rango": [-80, 80]}, {"art": "hombro_re.R", "grupo": hand("R"), "rango": [-80, 80]}]   # el antebrazo gira hasta apoyar la mano (W)
b["contactos"] = [{"grupo": ["pelvis.L", "pelvis.R", "spine05"], "tol_cm": 2.5}]
H.append(spec("F-TOR-009", b, rep({"toracica_flex": -14, "hombro_flex.L": -12, "hombro_flex.R": -12, "escapula_prot.L": -10, "escapula_prot.R": -10},
                                  up=1.3, hold=1.2, down=1.5), camara=[0.6, -1, 0.7]))
b = lateral(almeja=False)
b["base"]["angulos"].update({"cadera_flex.R": 70, "rodilla_flex.R": 90, "hombro_flex.L": 90, "hombro_flex.R": 90, "codo_flex.L": 0, "codo_flex.R": 0})
H.append(spec("F-TOR-011", b, rep({"toracica_rot": -40, "hombro_abd_h.R": 95, "cervical_rot": -40}, up=1.8, hold=1.0, down=1.8),
              camara=[0.1, -0.6, 1]))
b = cuadrupedia()
b["ik"] = [{"cadena": "brazo.L", "al_suelo": 0.03}]
H.append(spec("F-TOR-012", b, rep({"toracica_rot": 25, "hombro_abd_h.R": -75, "codo_flex.R": 10, "cervical_rot": 25}, up=1.6, hold=1.0, down=1.6),
              camara=[0.2, -1, 0.6]))
b = sedente(extra={"hombro_abd.L": 85, "hombro_abd.R": 85, "codo_flex.L": 100, "codo_flex.R": 100, "hombro_re.L": 60, "hombro_re.R": 60,
                   "mano_cerrar.L": 70, "mano_cerrar.R": 70})
H.append(spec("F-TOR-013", b, rep({"toracica_rot": -40, "lumbar_rot": -10}, up=1.5, hold=0.8, down=1.6), camara=[0, -1, 0.5],
              props=[{"tipo": "baston", "uso": "baston_manos"}]))
b = bipedo(extra={"hombro_flex.L": 85, "hombro_flex.R": 85, "hombro_abd_h.L": -40, "hombro_abd_h.R": 40, "mano_cerrar.L": 70, "mano_cerrar.R": 70},
           camara=(0, -1, 0.5))
for id_, kind in (("F-TOR-014", "banda_elastica"), ("F-TOR-015", "polea")):
    H.append(spec(id_, json.loads(json.dumps(b)), rep({"toracica_rot": -40, "lumbar_rot": -10}, up=1.4, hold=0.8, down=1.6),
                  props=[{"tipo": kind, "uso": "banda_anclada_hueso", "hueso": "wrist.R", "anclaje_rel": [0.9, -0.2, 0]}]))

# ─── LUMBAR / CORE ────────────────────────────────────────────────────────────
H.append(spec("F-LUM-001", supino(rectas=False, gancho=("L", "R")), iso(3.0)))
b = supino(rectas=False, gancho=("L", "R"))
b["pivote"] = {"hueso": "spine03", "contrarrotar": "spine03"}
sp = spec("F-LUM-002", b, rep({}, up=1.2, hold=1.2, down=1.4))
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = -7 * k["p"]
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
H.append(sp)
b = no_hand_contacts(supino(gancho=("L",)))
b["contactos"] = [c for c in b["contactos"] if c["grupo"] not in ("spine01", "head")] + [{"grupo": "head", "desde": 0, "hasta": 0.4}]
H.append(spec("F-LUM-003", b, rep({"toracica_flex": 12, "cervical_flex": 6}, up=1.0, hold=1.5, down=1.3)))
b = no_hand_contacts(supino(rectas=False, extra={"cadera_flex.L": 90, "cadera_flex.R": 90, "rodilla_flex.L": 90, "rodilla_flex.R": 90,
                                                 "hombro_flex.L": 90, "hombro_flex.R": 90, "antebrazo_prono.L": 0, "antebrazo_prono.R": 0}))
b["contactos"] = [c for c in b["contactos"] if not str(c["grupo"]).startswith("foot")]
H.append(spec("F-LUM-004", b, rep({"hombro_flex.R": 80, "cadera_flex.L": -72, "rodilla_flex.L": -82}, up=1.6, hold=0.6, down=1.6)))
H.append(spec("F-LUM-005", plancha(), iso(3.5)))
H.append(spec("F-LUM-006", prono(), iso(3.0)))
b = cuadrupedia()
b["ik"] = [{"cadena": "brazo.L", "al_suelo": 0.03}]
b["contactos"] = [c for c in b["contactos"] if c["grupo"] != "lowerleg01.L"] + [{"grupo": "lowerleg01.R", "tol_cm": 2.5}]
H.append(spec("F-LUM-007", b, rep({"hombro_flex.R": 85, "cadera_flex.L": -88, "rodilla_flex.L": -80}, up=1.6, hold=1.0, down=1.6), camara=[-1, 0.1, 0.3]))
d = json.loads((ROOT / "data/motion_specs/F-CAD-007.json").read_text())
d.update({"id": "F-LUM-008", "nombre": "Puente glúteo", "musculos": musculos("F-LUM-008", None)})
write(d)
H.append("F-LUM-008")
b = prono(extra={"cervical_rot": 0, "hombro_flex.L": 165, "hombro_flex.R": 165})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith(("hombro", "cervical"))] + \
    [{"art": "cervical_flex", "grupo": "head", "rango": [-10, 35]}]
b["contactos"] = [{"grupo": ["pelvis.L", "pelvis.R", "spine05", "spine04"], "tol_cm": 2.5}]
H.append(spec("F-LUM-009", b, rep({"lumbar_flex": -12, "toracica_flex": -8, "hombro_flex.L": 15, "hombro_flex.R": 15,
                                   "cadera_flex.L": -14, "cadera_flex.R": -14, "cervical_flex": -6}, up=1.3, hold=1.2, down=1.5), camara=[1, 0.1, 0.3]))
b = bipedo(extra={"rodilla_flex.L": 15, "rodilla_flex.R": 15, "mano_cerrar.L": 70, "mano_cerrar.R": 70}, camara=(-1, -0.1, 0.25))
b["pivote"] = {"hueso": "upperleg01.L", "contrarrotar": ["upperleg01.L", "upperleg01.R"]}
sp = spec("F-LUM-010", b, rep({"hombro_flex.L": 60, "hombro_flex.R": 60}, up=1.8, hold=0.6, down=1.8),
          props=[{"tipo": "mancuerna", "uso": "en_mano", "manos": ["L", "R"]}])
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = 60 * k["p"]
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
H.append(sp)
H.append(spec("F-LUM-011", bipedo(camara=(0, -1, 0.2)), rep({"lumbar_incl": -20, "toracica_incl": -15}, up=1.4, hold=0.8, down=1.6), lado="R"))
H.append(spec("F-LUM-012", plancha_lateral(rodillas=True), iso(3.5), lado="L"))
H.append(spec("F-LUM-013", plancha_lateral(), iso(3.5), lado="L"))
b = supino(rectas=False, gancho=("L", "R"))
b["pivote"] = {"hueso": "spine03", "contrarrotar": "spine03"}
b["contactos"] = [c if c["grupo"] != "spine01" else {"grupo": "spine01", "tol_cm": 3.5} for c in b["contactos"]]   # la hemipelvis contraria se despega (real)
sp = spec("F-LUM-016", b, rep({}, up=1.6, hold=0.6, down=1.6), camara=[0, -1, 0.8])
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_y"] = 28 * k["p"]
    k["raiz"] = [0, 0, 0.012 * k["p"]]
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
H.append(sp)
b = {"base": {"orientacion": "rodillas", "colchoneta": True,
              "angulos": {"rodilla_flex.L": 90, "rodilla_flex.R": 90, "tobillo_dorsi.L": -40, "tobillo_dorsi.R": -40,
                          "hombro_flex.L": 90, "hombro_flex.R": 90, "hombro_abd_h.L": -20, "hombro_abd_h.R": 20,
                          "mano_cerrar.L": 70, "mano_cerrar.R": 70}},
     "ik": [], "contactos": [{"grupo": ["lowerleg01.L", "lowerleg02.L"]}, {"grupo": ["lowerleg01.R", "lowerleg02.R"]}],
     "camara": {"dir": [0, -1, 0.3], "lente": 50, "margen": 1.1}}
H.append(spec("F-LUM-017", b, iso(3.5), props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "wrist.R", "anclaje_rel": [0.9, 0.3, 0]}]))
b = bipedo(extra={"hombro_flex.L": 75, "hombro_flex.R": 75, "codo_flex.L": 85, "codo_flex.R": 85, "hombro_abd_h.L": -20, "hombro_abd_h.R": 20,
                  "mano_cerrar.L": 70, "mano_cerrar.R": 70}, camara=(0, -1, 0.3))
H.append(spec("F-LUM-018", b, rep({"codo_flex.L": -80, "codo_flex.R": -80, "hombro_flex.L": 15, "hombro_flex.R": 15}, up=1.2, hold=1.0, down=1.4),
              props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "wrist.R", "anclaje_rel": [0.9, 0.3, 0]}]))
b = bipedo(extra={"hombro_flex.L": 150, "hombro_flex.R": 150, "hombro_abd_h.L": 30, "hombro_abd_h.R": 50, "toracica_rot": 30,
                  "mano_cerrar.L": 70, "mano_cerrar.R": 70, "cadera_abd.L": 8, "cadera_abd.R": 8}, camara=(0, -1, 0.3))
H.append(spec("F-LUM-019", b, rep({"toracica_rot": -60, "lumbar_rot": -15, "hombro_flex.L": -120, "hombro_flex.R": -120,
                                   "hombro_abd_h.L": -60, "hombro_abd_h.R": -60}, up=1.4, hold=0.4, down=1.8),
              props=[{"tipo": "banda_elastica", "uso": "banda_anclada_hueso", "hueso": "wrist.R", "anclaje_rel": [0.7, 0, 0.8]}]))

# ─── Planchas pendientes de otras regiones ────────────────────────────────────
H.append(spec("F-CER-015", plancha_lateral(), iso(3.5), lado="L", resaltar=("neck02",)))
b = pinned(plancha())
H.append(spec("F-ESC-015", b, rep({"escapula_prot.L": 12, "escapula_prot.R": 12}, up=1.0, hold=1.0, down=1.4),
              resaltar=("clavicle.L", "clavicle.R")))

print(f"Generadas {len(H)} fichas de tronco/planchas.")
(ROOT / "data/motion_specs/_pendientes_tronco.json").write_text(json.dumps(PENDIENTES, ensure_ascii=False, indent=2))
