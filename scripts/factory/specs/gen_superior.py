#!/usr/bin/env python3
"""Genera fichas de CERVICAL, ATM, ESCÁPULA, HOMBRO, CODO, ANTEBRAZO, MUÑECA y MANO. Lado que trabaja: derecho."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import bipedo, cuadrupedia, hand, iso, keys_custom, lateral, musculos, prono, rep, sedente, supino, write  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
PENDIENTES = {
    "F-ESC-005": "Caminata de granjero: locomoción.",
    "F-ESC-009": "Fondos escapulares en silla: apoyo de manos detrás con pelvis suspendida.",
    "F-COD-010": "Fondos en banco: apoyo de manos detrás con pelvis suspendida.",
    "F-HOM-025": "Rotación interna pliométrica con balón: lanzamiento.",
    "F-HOM-030": "Atrapes pliométricos 90/90: lanzamiento/recepción.",
    "F-MAN-010": "Abrir dedos dentro de arroz: el contenido del recipiente oculta la mano.",
}
HEAD_CAM = {"grupos": ["head", "neck01", "neck02", "neck03", "jaw"], "margen": 1.6}
HAND_CAM = lambda s="R": {"grupos": [g for g in hand(s)] + [f"lowerarm01.{s}"], "margen": 1.5}  # noqa: E731
SCAP_CAM = [-0.6, 1, 0.35]          # posterior-derecha: ver escápulas


def spec(id_, plantilla, kd, props=None, lado="R", resaltar=("upperarm01.R",), camara=None, cam_extra=None,
         variantes=None, **kw):
    dur, keys = kd
    s = {"id": id_, "duracion_s": round(dur, 2), **plantilla, "keys": keys, "musculos": musculos(id_, lado),
         "articulacion_resaltada": [{"hueso": b} for b in resaltar]}
    s["props"] = plantilla.get("props", []) + (props or [])
    s["variantes"] = variantes or (["gym", "casa"] if s["props"] else ["gym"])
    if s["variantes"] == ["gym"]:
        s["nota_variantes"] = kw.pop("nota", "Sin material: un solo video sirve para gym y casa.")
    if camara:
        s["camara"] = {**s["camara"], "dir": camara}
    if cam_extra:
        s["camara"] = {**s["camara"], **cam_extra}
    s.update(kw)
    return write(s)


def ik_hand(pl, side, hueso, d, t=0.5, sep=0.03):
    pl["ik"] = pl.get("ik", []) + [{"cadena": f"brazo.{side}", "a_hueso": {"hueso": hueso, "dir": d, "t": t, "sep": sep, "lado": side}}]
    pl["base"]["angulos"].update({f"hombro_flex.{side}": 60, f"codo_flex.{side}": 110})
    return pl


def pinned_hands(pl, sides=("L", "R")):
    suelo = pl["base"]["orientacion"] in ("prono", "cuadrupedia")
    pl["ik"] = pl.get("ik", []) + [dict({"cadena": f"brazo.{s}"}, **({"al_suelo": 0.03} if suelo else {})) for s in sides]
    return pl


def bands_from_wrists(rel, kind="banda_elastica", sides=("L", "R")):
    return [{"tipo": kind, "uso": "banda_anclada_hueso", "hueso": f"wrist.{s}", "anclaje_rel": rel} for s in sides]


def dumbbells(sides=("R",)):
    return [{"tipo": "mancuerna", "uso": "en_mano", "manos": list(sides)}]


def grip(pl, sides=("R",)):
    pl["base"]["angulos"].update({f"mano_cerrar.{s}": 75 for s in sides})
    return pl


H = []
NECK = ("neck02",)

# ─── CERVICAL ─────────────────────────────────────────────────────────────────
H.append(spec("F-CER-001", ik_hand(sedente(), "R", "head", "anterior", t=0.45), iso(3.0), lado=None, resaltar=NECK, camara=[-1, -0.6, 0.2]))
b = supino()
b["contactos"] = [c if c["grupo"] != "head" else {"grupo": "head", "tol_cm": 3} for c in b["contactos"]]
H.append(spec("F-CER-002", b, rep({"cervical_flex": 15}, up=1.2, hold=1.5, down=1.3), lado=None, resaltar=NECK))
b = supino()
b["contactos"] = [c for c in b["contactos"] if c["grupo"] != "head"] + [{"grupo": "head", "desde": 0, "hasta": 0.4}]
H.append(spec("F-CER-003", b, rep({"cervical_flex": 38}, up=1.4, hold=1.2, down=1.6), lado=None, resaltar=NECK))
H.append(spec("F-CER-004", sedente(), rep({"cervical_flex": 30}, up=1.3, hold=1.0, down=1.6), lado=None, resaltar=NECK,
              camara=[-1, -0.3, 0.2], props=[{"tipo": "banda_elastica", "uso": "banda_cabeza", "anclaje_rel": [0, 0.6, 0], "puntos": ["lateral+anterior", "medial+anterior"]}]))
H.append(spec("F-CER-005", cuadrupedia(), rep({"cervical_flex": 20}, up=1.2, hold=1.5, down=1.3), lado=None, resaltar=NECK))
b = ik_hand(ik_hand(sedente(), "R", "head", "posterior", t=0.4), "L", "head", "posterior", t=0.4)
H.append(spec("F-CER-006", b, iso(3.0), lado=None, resaltar=NECK, camara=[-1, 0.3, 0.2]))
H.append(spec("F-CER-007", sedente(), rep({"cervical_flex": -30}, up=1.3, hold=1.0, down=1.6), lado=None, resaltar=NECK, camara=[-1, -0.3, 0.2]))
b = prono(extra={"cervical_rot": 0, "hombro_flex.L": 150, "hombro_flex.R": 150, "codo_flex.L": 110, "codo_flex.R": 110})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith(("hombro", "cervical"))]
b["contactos"] = [{"grupo": "spine02", "tol_cm": 2.5}]
H.append(spec("F-CER-008", b, rep({"cervical_flex": -28}, up=1.3, hold=1.0, down=1.6), lado=None, resaltar=NECK, camara=[1, 0.2, 0.3]))
H.append(spec("F-CER-009", sedente(), rep({"cervical_flex": -30}, up=1.3, hold=1.0, down=1.6), lado=None, resaltar=NECK,
              camara=[-1, -0.3, 0.2], props=[{"tipo": "banda_elastica", "uso": "banda_cabeza", "anclaje_rel": [0, -0.6, 0], "puntos": ["lateral+posterior", "medial+posterior"]}]))
H.append(spec("F-CER-010", cuadrupedia(), rep({"cervical_flex": -25}, up=1.2, hold=1.5, down=1.3), lado=None, resaltar=NECK))
H.append(spec("F-CER-011", ik_hand(sedente(), "R", "head", "lateral", t=0.5), iso(3.0), resaltar=NECK, camara=[-0.2, -1, 0.2]))
H.append(spec("F-CER-012", sedente(), rep({"cervical_incl": -30}, up=1.3, hold=1.0, down=1.6), resaltar=NECK, camara=[0, -1, 0.2]))
b = lateral()
H.append(spec("F-CER-013", b, rep({"cervical_incl": -25}, up=1.3, hold=1.0, down=1.6), resaltar=NECK, camara=[0.1, -1, 0.3]))
H.append(spec("F-CER-014", sedente(), rep({"cervical_incl": -25}, up=1.3, hold=1.0, down=1.6), resaltar=NECK, camara=[0, -1, 0.2],
              props=[{"tipo": "banda_elastica", "uso": "banda_cabeza", "anclaje_rel": [0.6, 0, 0], "puntos": ["medial+anterior", "medial+posterior"]}]))
H.append(spec("F-CER-016", ik_hand(sedente(), "R", "head", "lateral+anterior", t=0.5), iso(3.0), resaltar=NECK, camara=[-0.2, -1, 0.2]))
H.append(spec("F-CER-017", sedente(), rep({"cervical_rot": -60}, up=1.4, hold=0.8, down=1.6), resaltar=NECK, camara=[0, -1, 0.3]))
b = supino()
b["contactos"] = [c if c["grupo"] != "head" else {"grupo": "head", "tol_cm": 3} for c in b["contactos"]]
H.append(spec("F-CER-018", b, rep({"cervical_flex": 8, "cervical_rot": -50}, up=1.4, hold=0.8, down=1.6), resaltar=NECK,
              camara=[0, 1, 1.2]))
H.append(spec("F-CER-019", sedente(), rep({"cervical_rot": -45}, up=1.3, hold=1.0, down=1.6), resaltar=NECK, camara=[0, -1, 0.3],
              props=[{"tipo": "banda_elastica", "uso": "banda_cabeza", "anclaje_rel": [0.5, -0.4, 0], "puntos": ["medial+posterior", "medial+anterior"]}]))
H.append(spec("F-CER-020", sedente(), rep({"toracica_rot": -35, "cervical_rot": 35}, up=1.5, hold=0.8, down=1.6), resaltar=NECK,
              camara=[0, -1, 0.3]))

# ─── ATM ──────────────────────────────────────────────────────────────────────
JAW = ("jaw",)
for id_, peak, kw in (("F-ATM-001", {"atm_apertura": 14}, {}), ("F-ATM-002", {"atm_apertura": 24}, {})):
    H.append(spec(id_, sedente(), rep(peak, up=1.2, hold=0.8, down=1.4), lado=None, resaltar=JAW, camara=[-0.4, -1, 0.1], cam_extra=HEAD_CAM))
H.append(spec("F-ATM-003", ik_hand(sedente(), "R", "jaw", "anterior+inferior", t=0.9, sep=0.02), rep({"atm_apertura": 18}, up=1.2, hold=0.8, down=1.4),
              lado=None, resaltar=JAW, camara=[-0.4, -1, 0.1], cam_extra=HEAD_CAM))
for id_, extra in (("F-ATM-004", "guia"), ("F-ATM-005", "depresor"), ("F-ATM-006", "resistencia")):
    pl = ik_hand(sedente(), "R", "jaw", "lateral", t=0.6, sep=0.02) if extra != "depresor" else sedente()
    H.append(spec(id_, pl, rep({"atm_lateral": -8, "atm_apertura": 4}, up=1.1, hold=0.8, down=1.3), lado=None, resaltar=JAW,
                  camara=[-0.2, -1, 0.1], cam_extra=HEAD_CAM))
for id_ in ("F-ATM-007", "F-ATM-008", "F-ATM-009"):
    pl = ik_hand(sedente(), "R", "jaw", "anterior", t=0.95, sep=0.02) if id_ == "F-ATM-009" else sedente()
    H.append(spec(id_, pl, rep({"atm_protrusion": 6, "atm_apertura": 3}, up=1.1, hold=0.8, down=1.3), lado=None, resaltar=JAW,
                  camara=[-1, -0.5, 0.1], cam_extra=HEAD_CAM))

# ─── ESCÁPULA ─────────────────────────────────────────────────────────────────
SC = ("clavicle.L", "clavicle.R")
H.append(spec("F-ESC-001", bipedo(), iso(3.0), lado=None, resaltar=SC, camara=SCAP_CAM))
H.append(spec("F-ESC-002", bipedo(), rep({"escapula_elev.L": 25, "escapula_elev.R": 25}, up=1.0, hold=1.0, down=1.5), lado=None, resaltar=SC, camara=SCAP_CAM))
for id_ in ("F-ESC-003", "F-ESC-004"):
    H.append(spec(id_, grip(bipedo(), ("L", "R")), rep({"escapula_elev.L": 22, "escapula_elev.R": 22}, up=1.0, hold=1.0, down=1.6),
                  lado=None, resaltar=SC, camara=SCAP_CAM, props=dumbbells(("L", "R"))))
H.append(spec("F-ESC-006", sedente(extra={"hombro_abd.L": 12, "hombro_abd.R": 12, "hombro_flex.L": -5, "hombro_flex.R": -5,
                                          "codo_flex.L": 0, "codo_flex.R": 0}), iso(3.0), lado=None, resaltar=SC, camara=SCAP_CAM))
H.append(spec("F-ESC-007", sedente(), rep({"escapula_elev.L": -12, "escapula_elev.R": -12}, up=1.0, hold=1.2, down=1.4), lado=None, resaltar=SC, camara=SCAP_CAM))
b = grip(bipedo(extra={"hombro_flex.L": 80, "hombro_flex.R": 80}, camara=(-1, -0.3, 0.2)), ("L", "R"))
H.append(spec("F-ESC-008", b, rep({"hombro_flex.L": -70, "hombro_flex.R": -70, "escapula_elev.L": -8, "escapula_elev.R": -8}, up=1.3, hold=0.8, down=1.6),
              lado=None, resaltar=SC, props=bands_from_wrists([0, -0.9, 0.7])))
b = grip(bipedo(extra={"hombro_flex.L": 172, "hombro_flex.R": 172, "hombro_abd.L": 12, "hombro_abd.R": 12}, camara=(-0.6, 1, 0.2)), ("L", "R"))
b["base"]["elevar"] = 0.25
b["contactos"] = []
H.append(spec("F-ESC-010", b, rep({"escapula_elev.L": -15, "escapula_elev.R": -15}, up=1.0, hold=1.0, down=1.5, campos={"raiz": [0, 0, 0.05]}),
              lado=None, resaltar=SC, props=[{"tipo": "barra", "uso": "barra_manos", "soportes": True}], variantes=["gym"],
              nota="En casa: solo con barra de puerta segura (mismo video)."))
b = supino(extra={"hombro_flex.R": 90, "antebrazo_prono.R": 0})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if a["art"] != "hombro_flex.R"]
b["contactos"] = [c for c in b["contactos"] if c["grupo"] != hand("R")]
H.append(spec("F-ESC-011", b, rep({"escapula_prot.R": 14}, up=1.0, hold=1.0, down=1.4), resaltar=("clavicle.R",)))
H.append(spec("F-ESC-012", grip(json.loads(json.dumps(b))), rep({"escapula_prot.R": 14}, up=1.0, hold=1.0, down=1.6), resaltar=("clavicle.R",),
              props=dumbbells()))
b = pinned_hands(bipedo(extra={"hombro_flex.L": 88, "hombro_flex.R": 88, "@pitch": 8}, camara=(-1, -0.3, 0.25)))
H.append(spec("F-ESC-013", b, rep({"escapula_prot.L": 12, "escapula_prot.R": 12}, up=1.0, hold=1.0, down=1.4, campos={"raiz": [0, 0.035, 0]}),
              lado=None, resaltar=SC, props=[{"tipo": "pared", "uso": "pared_manos"}]))
H.append(spec("F-ESC-014", pinned_hands(cuadrupedia()), rep({"escapula_prot.L": 12, "escapula_prot.R": 12}, up=1.0, hold=1.0, down=1.4),
              lado=None, resaltar=SC, camara=SCAP_CAM))
H.append(spec("F-ESC-016", sedente(), iso(3.0), lado=None, resaltar=SC, camara=SCAP_CAM))
H.append(spec("F-ESC-017", sedente(), rep({"escapula_prot.L": -12, "escapula_prot.R": -12}, up=1.0, hold=1.2, down=1.4), lado=None, resaltar=SC, camara=SCAP_CAM))
b = grip(bipedo(extra={"hombro_flex.L": 75, "hombro_flex.R": 75}, camara=(-1, 0.2, 0.25)), ("L", "R"))
H.append(spec("F-ESC-018", b, rep({"hombro_flex.L": -85, "hombro_flex.R": -85, "codo_flex.L": 95, "codo_flex.R": 95,
                                   "escapula_prot.L": -12, "escapula_prot.R": -12}, up=1.3, hold=0.8, down=1.6),
              lado=None, resaltar=SC, props=bands_from_wrists([0, -0.8, 0])))
b = grip(prono(extra={"cervical_rot": 0, "hombro_flex.R": 90, "hombro_flex.L": 90}))
b["base"].update({"superficie_banco": 0.72, "banco_largo": True, "colchoneta": False, "asentar": [],
                  "suelo": ["spine02", "spine03", "pelvis.L", "pelvis.R"]})
b["contactos"] = []
H.append(spec("F-ESC-019", b, rep({"hombro_flex.R": -75, "codo_flex.R": 90, "escapula_prot.R": -12}, up=1.3, hold=0.8, down=1.6),
              resaltar=("clavicle.R",), camara=[1, -0.2, 0.3], props=dumbbells()))
# 020 Remo invertido: cuerpo rígido que pivota sobre los talones; manos fijas en la barra.
b = supino(rectas=True, extra={"hombro_flex.L": 90, "hombro_flex.R": 90, "@pitch": 28})
b["base"].update({"colchoneta": False, "asentar": [], "suelo": ["foot.L", "foot.R"]})
b = grip(pinned_hands(b), ("L", "R"))
b["pivote"] = {"hueso": "foot.L"}
b["contactos"] = [{"grupo": "foot.L", "tol_cm": 2.5}]
sp = spec("F-ESC-020", b, rep({}, up=1.3, hold=0.8, down=1.7), lado=None, resaltar=SC, camara=[-1, 0.1, 0.25],
          props=[{"tipo": "barra", "uso": "barra_manos", "soportes": True}], variantes=["gym"], nota="En casa: borde de una mesa firme (mismo video).")
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = -16 * k["p"]
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
H.append(sp)
b = pinned_hands(bipedo(extra={"hombro_flex.L": 90, "hombro_flex.R": 90, "codo_flex.L": 90, "codo_flex.R": 90, "hombro_abd.L": 30, "hombro_abd.R": 30},
                        camara=(-1, -0.3, 0.25)))
for id_, pr in (("F-ESC-021", None), ("F-ESC-022", [{"tipo": "foam_roller", "uso": "baston_manos"}]),
                ("F-ESC-023", [{"tipo": "banda_elastica", "uso": "baston_manos"}])):
    H.append(spec(id_, json.loads(json.dumps(b)), rep({}, up=1.6, hold=0.6, down=1.6, campos={"ik": {"brazo.L": [0, 0, 0.32], "brazo.R": [0, 0, 0.32]}}),
                  lado=None, resaltar=SC, props=[{"tipo": "pared", "uso": "pared_manos"}] + (pr or [])))
b = prono(extra={"cervical_rot": 0, "hombro_flex.L": 155, "hombro_flex.R": 155, "hombro_abd.L": 25, "hombro_abd.R": 25})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith("cervical")] + \
    [{"art": "cervical_flex", "grupo": "head", "rango": [-10, 30]}]
b["contactos"] = [{"grupo": "spine02", "tol_cm": 2.5}]
H.append(spec("F-ESC-024", b, rep({"hombro_flex.L": 18, "hombro_flex.R": 18}, up=1.1, hold=1.2, down=1.5), lado=None, resaltar=SC, camara=SCAP_CAM))
b = grip(bipedo(extra={"hombro_flex.R": 30, "codo_flex.R": 110}, camara=(-0.7, -1, 0.2)))
H.append(spec("F-ESC-025", b, rep({"hombro_flex.R": 145, "codo_flex.R": -105}, up=1.6, hold=0.8, down=1.8), resaltar=("clavicle.R",),
              props=[{"tipo": "kettlebell", "uso": "en_mano", "manos": ["R"]}]))

# ─── HOMBRO ───────────────────────────────────────────────────────────────────
SH = ("upperarm01.R",)
b = supino()
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith("hombro")]
b["base"]["angulos"].update({"antebrazo_prono.L": 0, "antebrazo_prono.R": 0, "hombro_flex.L": 8, "hombro_flex.R": 8})
b["contactos"] = [c for c in b["contactos"] if c["grupo"] not in (hand("L"), hand("R"))]
H.append(spec("F-HOM-001", grip(json.loads(json.dumps(b)), ("L", "R")), rep({"hombro_flex.L": 145, "hombro_flex.R": 145}, up=1.8, hold=0.8, down=1.8),
              lado=None, resaltar=("upperarm01.L", "upperarm01.R"), props=[{"tipo": "baston", "uso": "baston_manos"}]))
H.append(spec("F-HOM-002", json.loads(json.dumps(b)), rep({"hombro_flex.R": 145}, up=1.8, hold=0.8, down=1.8), resaltar=SH))
H.append(spec("F-HOM-003", grip(bipedo(camara=(-1, -0.2, 0.2))), rep({"hombro_flex.R": 100}, up=1.3, hold=0.8, down=1.7), resaltar=SH,
              props=bands_from_wrists([0, 0.45, -0.75], sides=("R",))))
H.append(spec("F-HOM-004", grip(bipedo(camara=(-1, -0.2, 0.2))), rep({"hombro_flex.R": 90}, up=1.3, hold=0.8, down=1.7), resaltar=SH, props=dumbbells()))
b = grip(bipedo(extra={"hombro_flex.L": 25, "hombro_flex.R": 25, "hombro_abd.L": 40, "hombro_abd.R": 40, "codo_flex.L": 110, "codo_flex.R": 110},
                camara=(-0.6, -1, 0.2)), ("L", "R"))
H.append(spec("F-HOM-005", b, rep({"hombro_flex.L": 140, "hombro_flex.R": 140, "codo_flex.L": -105, "codo_flex.R": -105}, up=1.4, hold=0.8, down=1.8),
              lado=None, resaltar=("upperarm01.L", "upperarm01.R"), props=dumbbells(("L", "R"))))
b = bipedo(extra={"codo_flex.R": 90}, camara=(-1, 0.3, 0.25))
H.append(spec("F-HOM-006", b, iso(3.0), resaltar=SH, props=[{"tipo": "pared", "uso": "pared_manos", "detras": True}]))
b = grip(prono(extra={"cervical_rot": 0, "hombro_flex.R": 90}))
b["base"].update({"superficie_banco": 0.72, "banco_largo": True, "colchoneta": False, "asentar": [], "suelo": ["spine02", "spine03", "pelvis.L", "pelvis.R"]})
b["contactos"] = []
H.append(spec("F-HOM-007", b, rep({"hombro_flex.R": -105}, up=1.3, hold=0.8, down=1.6), resaltar=SH, camara=[1, -0.2, 0.3]))
b = grip(bipedo(extra={"hombro_flex.L": 80, "hombro_flex.R": 80}, camara=(-1, -0.3, 0.2)), ("L", "R"))
H.append(spec("F-HOM-008", b, rep({"hombro_flex.L": -95, "hombro_flex.R": -95}, up=1.3, hold=0.8, down=1.6), lado=None,
              resaltar=("upperarm01.L", "upperarm01.R"), props=bands_from_wrists([0, -0.9, 0.5])))
H.append(spec("F-HOM-009", json.loads(json.dumps(b)), rep({"hombro_flex.L": -85, "hombro_flex.R": -85}, up=1.3, hold=0.8, down=1.6), lado=None,
              resaltar=("upperarm01.L", "upperarm01.R"), props=bands_from_wrists([0, -0.9, 0.8], kind="polea")))
b = grip(bipedo(extra={"rodilla_flex.L": 15, "rodilla_flex.R": 15, "hombro_flex.R": 45, "hombro_flex.L": 45}, camara=(-1, -0.1, 0.25)))
b["pivote"] = {"hueso": "upperleg01.L", "contrarrotar": ["upperleg01.L", "upperleg01.R"]}
sp = spec("F-HOM-010", b, rep({"hombro_flex.R": -75, "codo_flex.R": 95}, up=1.3, hold=0.8, down=1.6), resaltar=SH, props=dumbbells())
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = 45
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
H.append(sp)
H.append(spec("F-HOM-011", bipedo(camara=(-0.3, -1, 0.2)), iso(3.0), resaltar=SH, props=[{"tipo": "pared", "uso": "pared_manos", "lateral": "R"}]))
b = bipedo(extra={"antebrazo_prono.R": -60}, camara=(-0.7, -1, 0.2))
H.append(spec("F-HOM-012", b, rep({"hombro_abd.R": 85, "hombro_flex.R": 30}, up=1.3, hold=0.8, down=1.7), resaltar=SH))
H.append(spec("F-HOM-013", grip(bipedo(extra={"hombro_abd.R": 15}, camara=(0, -1, 0.2))), rep({"hombro_abd.R": 65}, up=1.3, hold=0.8, down=1.7), resaltar=SH,
              props=bands_from_wrists([0.35, 0, -0.85], sides=("R",))))
H.append(spec("F-HOM-014", grip(bipedo(camara=(0, -1, 0.2))), rep({"hombro_abd.R": 85}, up=1.3, hold=0.8, down=1.7), resaltar=SH, props=dumbbells()))
b = grip(bipedo(extra={"hombro_flex.R": 30, "codo_flex.R": 100}, camara=(-1, -0.4, 0.2)))
H.append(spec("F-HOM-015", b, rep({"hombro_flex.R": 85, "codo_flex.R": -95}, up=1.3, hold=0.8, down=1.6), resaltar=SH,
              props=[{"tipo": "barra", "uso": "banda_anclada_hueso", "hueso": "wrist.R", "anclaje_rel": [0.1, -1.1, -0.95]}]))
H.append(spec("F-HOM-016", bipedo(camara=(-0.6, -1, 0.2)), iso(3.0), resaltar=SH, props=[{"tipo": "toalla", "uso": "rollo_codo", "lado": "R"}]))
b = supino(extra={"hombro_abd.R": 80})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if a["art"] != "hombro_flex.R"] + [{"art": "hombro_flex.R", "grupo": hand("R"), "rango": [-15, 10]}]
b["contactos"] = [c if c["grupo"] != hand("R") else {"grupo": hand("R"), "tol_cm": 4} for c in b["contactos"]]
H.append(spec("F-HOM-017", b, rep({"hombro_abd.R": -72, "hombro_flex.R": 9}, up=1.4, hold=0.6, down=1.6), resaltar=SH, camara=[0, 0.2, 1]))
b = grip(bipedo(extra={"hombro_abd.R": 60}, camara=(0, -1, 0.2)))
H.append(spec("F-HOM-018", b, rep({"hombro_abd.R": -55}, up=1.3, hold=0.8, down=1.6), resaltar=SH,
              props=bands_from_wrists([-0.7, 0, 0.5], sides=("R",))))
b = grip(sedente(extra={"hombro_abd.L": 160, "hombro_abd.R": 160, "codo_flex.L": 10, "codo_flex.R": 10}), ("L", "R"))
H.append(spec("F-HOM-019", b, rep({"hombro_abd.L": -110, "hombro_abd.R": -110, "codo_flex.L": 95, "codo_flex.R": 95}, up=1.3, hold=0.8, down=1.7),
              lado=None, resaltar=("upperarm01.L", "upperarm01.R"), camara=[-0.4, 1, 0.25],
              props=[{"tipo": "polea", "uso": "banda_anclada_hueso", "hueso": "wrist.L", "anclaje_rel": [-0.2, 0.05, 0.9]},
                     {"tipo": "polea", "uso": "banda_anclada_hueso", "hueso": "wrist.R", "anclaje_rel": [0.2, 0.05, 0.9]}]))   # cable central de la polea
b = grip(pinned_hands(bipedo(extra={"hombro_flex.L": 172, "hombro_flex.R": 172, "hombro_abd.L": 15, "hombro_abd.R": 15}, camara=(-0.6, 1, 0.2))), ("L", "R"))
b["base"]["elevar"] = 0.2
b["contactos"] = []
H.append(spec("F-HOM-020", b, rep({"rodilla_flex.L": 60, "rodilla_flex.R": 60}, up=1.6, hold=0.6, down=1.8, campos={"raiz": [0, 0, 0.32]}),
              lado=None, resaltar=("upperarm01.L", "upperarm01.R"), props=[{"tipo": "barra", "uso": "barra_manos", "soportes": True}],
              variantes=["gym"], nota="En casa: barra de puerta (mismo video)."))
b = bipedo(extra={"codo_flex.R": 90}, camara=(-0.6, -1, 0.2))
H.append(spec("F-HOM-021", b, iso(3.0), resaltar=SH, props=[{"tipo": "marco_puerta", "uso": "pared_manos", "lateral": "L", "sep": 0.2}]))
H.append(spec("F-HOM-026", json.loads(json.dumps(b)), iso(3.0), resaltar=SH, props=[{"tipo": "marco_puerta", "uso": "pared_manos", "lateral": "R", "sep": 0.25}]))
# rotaciones en decúbito lateral (sobre el lado izquierdo): RI con el brazo de abajo, RE con el de arriba
b = lateral()
b["base"]["angulos"].update({"hombro_flex.L": 80, "codo_flex.L": 90})
H.append(spec("F-HOM-022", b, rep({"hombro_re.L": -60}, up=1.3, hold=0.8, down=1.6), lado="L", resaltar=("upperarm01.L",), camara=[0.2, -1, 0.6]))
b = lateral()
b["base"]["angulos"].update({"hombro_abd.R": 0, "codo_flex.R": 90, "hombro_re.R": -40})
H.append(spec("F-HOM-027", b, rep({"hombro_re.R": 85}, up=1.3, hold=0.8, down=1.6), resaltar=SH, camara=[0.2, -1, 0.6],
              props=[{"tipo": "toalla", "uso": "rollo_codo", "lado": "R"}]))
b = grip(bipedo(extra={"codo_flex.R": 90}, camara=(-0.6, -1, 0.3)))
H.append(spec("F-HOM-023", b, rep({"hombro_re.R": -60}, up=1.2, hold=0.8, down=1.6), resaltar=SH,
              props=[{"tipo": "banda_elastica", "uso": "banda_anclada", "mano": "R", "anclaje": [-0.75, 0, 0]},
                     {"tipo": "toalla", "uso": "rollo_codo", "lado": "R"}]))
b = grip(bipedo(extra={"hombro_abd.R": 88, "codo_flex.R": 90, "hombro_re.R": 45}, camara=(-1, -0.6, 0.2)))
H.append(spec("F-HOM-024", b, rep({"hombro_re.R": -60}, up=1.2, hold=0.8, down=1.6), resaltar=SH,
              props=bands_from_wrists([0, 0.7, 0.3], sides=("R",))))
H.append(spec("F-HOM-029", json.loads(json.dumps(b)), rep({"hombro_re.R": 40}, up=1.2, hold=0.8, down=1.6), resaltar=SH,
              props=bands_from_wrists([0, -0.8, -0.1], sides=("R",))))
b = sedente(extra={"hombro_flex.R": 90, "hombro_re.R": 0, "antebrazo_prono.R": -60})
H.append(spec("F-HOM-031", b, rep({"hombro_re.R": 75}, up=1.3, hold=0.8, down=1.6), resaltar=SH, camara=[0, 0.2, 1.4]))
b = grip(bipedo(extra={"hombro_flex.L": 90, "hombro_flex.R": 90}, camara=(0, -1, 0.35)), ("L", "R"))
H.append(spec("F-HOM-032", b, rep({"hombro_re.L": 70, "hombro_re.R": 70}, up=1.2, hold=0.8, down=1.6), lado=None,
              resaltar=("upperarm01.L", "upperarm01.R"), props=[{"tipo": "banda_elastica", "uso": "baston_manos"}]))
for id_, pr in (("F-HOM-033", None), ("F-HOM-034", dumbbells(("L", "R")))):
    b = prono(extra={"cervical_rot": 0, "hombro_flex.L": 90, "hombro_flex.R": 90})
    b["base"].update({"superficie_banco": 0.72, "banco_largo": True, "colchoneta": False, "asentar": [], "suelo": ["spine02", "spine03", "pelvis.L", "pelvis.R"]})
    b["contactos"] = []
    if pr:
        b = grip(b, ("L", "R"))
    H.append(spec(id_, b, rep({"hombro_re.L": 85, "hombro_re.R": 85}, up=1.3, hold=0.8, down=1.6), lado=None,
                  resaltar=("upperarm01.L", "upperarm01.R"), camara=[0.3, -1, 0.9], props=pr))
b = grip(bipedo(extra={"hombro_flex.L": 85, "hombro_flex.R": 85}, camara=(-1, -0.4, 0.3)), ("L", "R"))
H.append(spec("F-HOM-035", b, rep({"hombro_re.L": 70, "hombro_re.R": 70, "codo_flex.L": 95, "codo_flex.R": 95}, up=1.3, hold=0.8, down=1.6),
              lado=None, resaltar=("upperarm01.L", "upperarm01.R"), props=bands_from_wrists([0, -0.9, 0.2], kind="polea")))
b = bipedo(extra={"hombro_flex.L": 70, "hombro_flex.R": 70, "hombro_re.L": 70, "hombro_re.R": 70, "codo_flex.L": 80, "codo_flex.R": 80},
           camara=(-0.6, -1, 0.2))
H.append(spec("F-HOM-036", b, iso(3.0), lado=None, resaltar=("upperarm01.L", "upperarm01.R")))
b = sedente(extra={"hombro_flex.R": 90, "hombro_re.R": 75, "antebrazo_prono.R": -60})
H.append(spec("F-HOM-037", b, rep({"hombro_re.R": -80}, up=1.3, hold=0.8, down=1.6), resaltar=SH, camara=[0, 0.2, 1.4]))
b = pinned_hands(bipedo(extra={"hombro_flex.L": 85, "hombro_flex.R": 85, "hombro_abd.L": 20, "hombro_abd.R": 20, "@pitch": 12}, camara=(-1, -0.3, 0.25)))
H.append(spec("F-HOM-038", b, rep({}, up=1.4, hold=0.6, down=1.4, campos={"raiz": [0, -0.16, 0]}), lado=None,
              resaltar=("upperarm01.L", "upperarm01.R"), props=[{"tipo": "pared", "uso": "pared_manos"}]))
b = grip(supino(rectas=False, gancho=("L", "R"), extra={"hombro_flex.L": 90, "hombro_flex.R": 90}), ("L", "R"))
b["base"].update({"superficie_banco": 0.42, "banco_largo": True, "colchoneta": False,
                  "asentar": [{"art": "cervical_flex", "grupo": "head", "z": 0.42, "rango": [-25, 25]}]})
for i in b["ik"]:
    i["z_suelo"] = 0.0
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
H.append(spec("F-HOM-039", b, keys_custom([(0, {"hombro_re.L": 0, "hombro_re.R": 0, "codo_flex.L": 0, "codo_flex.R": 0}, 1),
                                          (0.4, {"hombro_re.L": 0, "hombro_re.R": 0, "codo_flex.L": 0, "codo_flex.R": 0}, 1),
                                          (2.2, {"hombro_re.L": 0, "hombro_re.R": 0, "codo_flex.L": 95, "codo_flex.R": 95}, 0.2),
                                          (2.6, {"hombro_re.L": 0, "hombro_re.R": 0, "codo_flex.L": 95, "codo_flex.R": 95}, 0.2),
                                          (4.2, {"hombro_re.L": 0, "hombro_re.R": 0, "codo_flex.L": 0, "codo_flex.R": 0}, 1),
                                          (5.0, {"hombro_re.L": 0, "hombro_re.R": 0, "codo_flex.L": 0, "codo_flex.R": 0}, 1)],
                                         ["isometrico", "excentrico", "isometrico", "concentrico", "isometrico", "isometrico"]),
              lado=None, resaltar=("upperarm01.L", "upperarm01.R"), camara=[-1, 0.1, 0.3], props=dumbbells(("L", "R"))))
from common import plancha, FOOT  # noqa: E402
b = plancha()
b["base"]["angulos"].update({"codo_flex.L": 0, "codo_flex.R": 0, "hombro_abd.L": 15, "hombro_abd.R": 15, "muneca_ext.L": 75, "muneca_ext.R": 75})
b["base"]["suelo"] = hand("L") + hand("R")
b = pinned_hands(b)
b["contactos"] = [{"grupo": hand("L") + hand("R"), "tol_cm": 2.5}, {"grupo": FOOT("L") + FOOT("R"), "tol_cm": 3}]
# el cuerpo rígido pivota sobre las puntas de los pies (no baja en bloque: los pies no se hunden)
b["pivote"] = {"hueso": "toe1-1.L"}
sp = spec("F-HOM-040", b, rep({}, up=1.5, hold=0.5, down=1.3), lado=None,
          resaltar=("upperarm01.L", "upperarm01.R"), camara=[-1, 0.1, 0.25])
d = json.loads(sp.read_text())
for k in d["keys"]:
    k["pivote_x"] = -6 * k["p"]
sp.write_text(json.dumps(d, ensure_ascii=False, indent=2))
H.append(sp)

# ─── CODO ─────────────────────────────────────────────────────────────────────
EL = ("lowerarm01.R",)
H.append(spec("F-COD-001", sedente(extra={"codo_flex.R": 90, "hombro_flex.R": 0}), iso(3.0), resaltar=EL, camara=[-1, -0.3, 0.2]))
H.append(spec("F-COD-002", grip(bipedo(extra={"antebrazo_prono.R": -70}, camara=(-1, -0.3, 0.2))), rep({"codo_flex.R": 130}, up=1.3, hold=0.6, down=1.6), resaltar=EL))
H.append(spec("F-COD-003", grip(bipedo(extra={"antebrazo_prono.R": -70}, camara=(-1, -0.3, 0.2))), rep({"codo_flex.R": 125}, up=1.3, hold=0.6, down=1.6),
              resaltar=EL, props=bands_from_wrists([0, -0.05, -0.85], sides=("R",))))
H.append(spec("F-COD-004", grip(bipedo(extra={"antebrazo_prono.R": -70}, camara=(-1, -0.3, 0.2))), rep({"codo_flex.R": 125}, up=1.3, hold=0.6, down=1.6),
              resaltar=EL, props=dumbbells()))
b = grip(bipedo(extra={"antebrazo_prono.R": -70, "codo_flex.R": 125}, camara=(-1, -0.3, 0.2)))
H.append(spec("F-COD-005", b, keys_custom([(0, {"codo_flex.R": 0}, 1), (0.4, {"codo_flex.R": 0}, 1), (4.4, {"codo_flex.R": -120}, 0.3),
                                          (4.8, {"codo_flex.R": -120}, 0.3), (6.0, {"codo_flex.R": 0}, 1)],
                                         ["excentrico", "excentrico", "isometrico", "concentrico", "excentrico"]), resaltar=EL, props=dumbbells()))
H.append(spec("F-COD-006", sedente(extra={"codo_flex.R": 90, "hombro_flex.R": 0}), iso(3.0), resaltar=EL, camara=[-1, -0.3, 0.2]))
b = supino(extra={"hombro_flex.R": 90, "codo_flex.R": 110})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if a["art"] != "hombro_flex.R"]
b["contactos"] = [c for c in b["contactos"] if c["grupo"] != hand("R")]
H.append(spec("F-COD-007", b, rep({"codo_flex.R": -105}, up=1.2, hold=0.6, down=1.6), resaltar=EL))
b = grip(bipedo(extra={"hombro_flex.R": -30, "codo_flex.R": 95, "lumbar_flex": 25, "toracica_flex": 10, "rodilla_flex.L": 10, "rodilla_flex.R": 10},
                camara=(-1, -0.2, 0.2)))
H.append(spec("F-COD-008", b, rep({"codo_flex.R": -90}, up=1.1, hold=0.8, down=1.5), resaltar=EL,
              props=bands_from_wrists([0, -0.5, -0.4], sides=("R",))))
b = grip(bipedo(extra={"hombro_flex.R": 170, "codo_flex.R": 120}, camara=(-1, 0.3, 0.2)))
H.append(spec("F-COD-009", b, rep({"codo_flex.R": -115}, up=1.2, hold=0.6, down=1.6), resaltar=EL, props=dumbbells()))

# ─── ANTEBRAZO / MUÑECA / MANO (sentada, antebrazo sobre la mesa) ─────────────
def mesa(extra=None):
    b = sedente(extra={"hombro_flex.R": 20, "codo_flex.R": 75, "antebrazo_prono.R": 0, **(extra or {})})
    b["props"] = [{"tipo": "mesa", "uso": "mesa_antebrazo", "lado": "R"}]
    b["camara"] = {"dir": [-0.7, -1, 0.6], "lente": 50, "margen": 1.1}
    return b


WR = ("wrist.R",)
FA = ("lowerarm02.R",)
H.append(spec("F-ANT-001", mesa(), iso(3.0), resaltar=FA, cam_extra=HAND_CAM()))
H.append(spec("F-ANT-002", sedente(extra={"codo_flex.R": 90}), rep({"antebrazo_prono.R": 75}, up=1.2, hold=0.8, down=1.5), resaltar=FA,
              camara=[-0.4, -1, 0.3], cam_extra=HAND_CAM()))
for id_, val, pr in (("F-ANT-003", 75, [{"tipo": "martillo", "uso": "en_mano", "manos": ["R"]}]),
                     ("F-ANT-004", 75, [{"tipo": "martillo", "uso": "en_mano", "manos": ["R"]}]),
                     ("F-ANT-005", 75, [{"tipo": "barra_flexible", "uso": "en_mano", "manos": ["R"]}])):
    H.append(spec(id_, grip(mesa()), rep({"antebrazo_prono.R": val}, up=1.2, hold=0.8, down=1.6), resaltar=FA, props=pr,
                  cam_extra=HAND_CAM(), variantes=["gym", "casa"]))
H.append(spec("F-ANT-006", mesa(), iso(3.0), resaltar=FA, cam_extra=HAND_CAM()))
H.append(spec("F-ANT-007", sedente(extra={"codo_flex.R": 90}), rep({"antebrazo_prono.R": -75}, up=1.2, hold=0.8, down=1.5), resaltar=FA,
              camara=[-0.4, -1, 0.3], cam_extra=HAND_CAM()))
for id_, pr in (("F-ANT-008", "martillo"), ("F-ANT-009", "martillo"), ("F-ANT-010", "barra_flexible")):
    H.append(spec(id_, grip(mesa()), rep({"antebrazo_prono.R": -75}, up=1.2, hold=0.8, down=1.6), resaltar=FA,
                  props=[{"tipo": pr, "uso": "en_mano", "manos": ["R"]}], cam_extra=HAND_CAM(), variantes=["gym", "casa"]))
for base_id, joint, val, sup in (("F-MUN-00", "muneca_flex.R", 55, -75), ("F-MUN-00", "muneca_flex.R", -50, 75)):
    pass
FLEX = [("F-MUN-001", "iso", None, -75), ("F-MUN-002", "muneca_flex.R", 55, -75), ("F-MUN-003", "muneca_flex.R", 55, -75),
        ("F-MUN-004", "muneca_flex.R", 55, -75), ("F-MUN-006", "iso", None, 75), ("F-MUN-007", "muneca_flex.R", -50, 75),
        ("F-MUN-008", "muneca_flex.R", -50, 75), ("F-MUN-009", "muneca_flex.R", -50, 75),
        ("F-MUN-011", "iso", None, 0), ("F-MUN-012", "muneca_rad.R", 18, 0), ("F-MUN-013", "muneca_rad.R", 18, 0),
        ("F-MUN-014", "muneca_rad.R", 18, 0), ("F-MUN-015", "muneca_rad.R", 18, 0),
        ("F-MUN-016", "iso", None, 0), ("F-MUN-017", "muneca_rad.R", -25, 0), ("F-MUN-018", "muneca_rad.R", -25, 0),
        ("F-MUN-019", "muneca_rad.R", -25, 0), ("F-MUN-020", "muneca_rad.R", -25, 0)]
LOADED = {"F-MUN-003": "mancuerna", "F-MUN-004": "mancuerna", "F-MUN-008": "mancuerna", "F-MUN-009": "mancuerna",
          "F-MUN-013": "martillo", "F-MUN-015": "martillo", "F-MUN-018": "martillo", "F-MUN-020": "martillo"}
BANDED = {"F-MUN-014": [0, 0.05, -0.6], "F-MUN-019": [0, 0.05, -0.6]}
for id_, joint, val, sup in FLEX:
    b = mesa(extra={"antebrazo_prono.R": sup})
    pr = []
    if id_ in LOADED:
        b = grip(b)
        pr = [{"tipo": LOADED[id_], "uso": "en_mano", "manos": ["R"]}]
    if id_ in BANDED:
        b = grip(b)
        pr = bands_from_wrists(BANDED[id_], sides=("R",))
    kd = iso(3.0) if joint == "iso" else rep({joint: val}, up=1.1, hold=0.8, down=1.6)
    if id_ == "F-MUN-004" or id_ == "F-MUN-009":       # excéntrico lento
        kd = keys_custom([(0, {joint: val}, 1), (0.4, {joint: val}, 1), (4.0, {joint: 0}, 0.3), (4.4, {joint: 0}, 0.3), (5.4, {joint: val}, 1)],
                         ["excentrico", "excentrico", "isometrico", "concentrico", "excentrico"])
    H.append(spec(id_, b, kd, resaltar=WR, props=pr, cam_extra=HAND_CAM(), variantes=["gym", "casa"] if pr else None))
b = grip(sedente(extra={"hombro_flex.L": 90, "hombro_flex.R": 90, "codo_flex.L": 5, "codo_flex.R": 5, "antebrazo_prono.L": 80, "antebrazo_prono.R": 80}), ("L", "R"))
H.append(spec("F-MUN-005", b, rep({"muneca_flex.L": -45, "muneca_flex.R": 45}, up=0.8, hold=0.3, down=0.8, post=3.1), lado=None,
              resaltar=("wrist.L", "wrist.R"), camara=[-0.6, -1, 0.3], props=[{"tipo": "baston", "uso": "baston_manos"}], variantes=["gym", "casa"]))
H.append(spec("F-MUN-010", grip(mesa(extra={"antebrazo_prono.R": 80})), rep({"antebrazo_prono.R": -150}, up=1.4, hold=0.6, down=1.6), resaltar=WR,
              props=[{"tipo": "barra_flexible", "uso": "en_mano", "manos": ["R"]}], cam_extra=HAND_CAM(), variantes=["gym", "casa"]))

MAN = [("F-MAN-001", {"mano_cerrar.R": 85}, None), ("F-MAN-002", {"mano_cerrar.R": 60}, "esponja"), ("F-MAN-003", {"mano_cerrar.R": 55}, "masilla"),
       ("F-MAN-004", {"mano_cerrar.R": 55}, "hand_grip"), ("F-MAN-005", {"mano_cerrar.R": 70, "muneca_flex.R": 25}, "toalla"),
       ("F-MAN-006", {"dedos_ext.R": 25}, None), ("F-MAN-007", {"dedos_ext.R": 20}, None), ("F-MAN-008", {"dedos_ext.R": 30}, None),
       ("F-MAN-009", {"dedos_ext.R": 30}, None), ("F-MAN-011", {"dedos_separar.R": 18}, None), ("F-MAN-012", {"dedos_separar.R": 18}, None),
       ("F-MAN-013", {"dedos_separar.R": 15}, None), ("F-MAN-014", {"dedos_separar.R": 15}, None), ("F-MAN-015", {"dedos_separar.R": 15}, "masilla"),
       ("F-MAN-016", {"dedos_separar.R": -10}, None), ("F-MAN-017", {"dedos_separar.R": -10}, "papel"),
       ("F-MAN-018", {"dedos_separar.R": -10}, None), ("F-MAN-019", {"dedos_separar.R": -10}, "masilla"), ("F-MAN-020", {"dedos_separar.R": -10}, None),
       ("F-MAN-021", {"pulgar_oposicion.R": 55}, None), ("F-MAN-022", {"pulgar_oposicion.R": 45, "mano_cerrar.R": 25}, None),
       ("F-MAN-023", {"pulgar_oposicion.R": 45, "mano_cerrar.R": 25}, "masilla"), ("F-MAN-024", {"pulgar_oposicion.R": 45, "mano_cerrar.R": 25}, "pinza_ropa"),
       ("F-MAN-025", {"pulgar_oposicion.R": 45, "mano_cerrar.R": 30}, "monedas")]
for id_, peak, obj in MAN:
    b = mesa(extra={"antebrazo_prono.R": 80, "muneca_flex.R": -10})
    pr = [{"tipo": obj, "uso": "en_mano", "manos": ["R"]}] if obj in ("esponja", "masilla", "hand_grip", "pinza_ropa") else []
    H.append(spec(id_, b, rep(peak, up=1.0, hold=1.0, down=1.3, post=1.7), resaltar=("metacarpal3.R",), props=pr,
                  cam_extra=HAND_CAM(), variantes=["gym", "casa"] if pr else None))

print(f"Generadas {len(H)} fichas de tren superior.")
(ROOT / "data/motion_specs/_pendientes_superior.json").write_text(json.dumps(PENDIENTES, ensure_ascii=False, indent=2))
