#!/usr/bin/env python3
"""Genera las fichas de ESTIRAMIENTOS (E-001..E-081). Lado estirado: derecho (salvo indicación).
Formato: entrada lenta → mantener 3 s → salida. Capa muscular en azul (elongación)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import (FOOT, bipedo, cuadrupedia, hand, keys_custom, lateral, musculos, prono, rep, sedente,  # noqa: E402
                    sedente_suelo, supino, write)

ROOT = Path(__file__).resolve().parents[3]
PENDIENTES = {
    "E-039": "Apoyo dorsal de la mano en cuadrupedia: carga sobre el dorso (geometría de contacto pendiente).",
    "E-045": "Colgarse lateralmente del marco de la puerta: suspensión lateral.",
    "E-054": "Couch stretch: rodilla contra la pared con tibia vertical.",
    "E-057": "Postura de la paloma: posición de suelo compleja.",
    "E-060": "Paloma con rotación: posición de suelo compleja.",
    "E-058": "Figura 4 en supino: el pie de apoyo pierde contacto al cargar la otra pierna (pendiente de IK doble).",
}
NO_SOBREESCRIBIR = {"E-067"}          # ficha piloto escrita a mano


def est(peak, hold=3.0, campos=None):
    return rep(peak, up=1.5, hold=hold, down=1.5, estiramiento=True, campos=campos)


def spec(id_, plantilla, kd, props=None, lado="R", resaltar=None, camara=None, variantes=None, **kw):
    if id_ in NO_SOBREESCRIBIR:
        return None
    dur, keys = kd
    s = {"id": id_, "duracion_s": round(dur, 2), **plantilla, "keys": keys, "musculos": musculos(id_, lado),
         "articulacion_resaltada": [{"hueso": b} for b in (resaltar or [])]}
    s["props"] = plantilla.get("props", []) + (props or [])
    s["variantes"] = variantes or (["gym", "casa"] if s["props"] else ["gym"])
    if s["variantes"] == ["gym"]:
        s["nota_variantes"] = kw.pop("nota", "Sin material: un solo video sirve para gym y casa.")
    if camara:
        s["camara"] = {**s["camara"], "dir": camara}
    s.update(kw)
    return write(s)


def ikh(pl, side, hueso, d, t=0.5, sep=0.03, lado_dir=None):
    pl["ik"] = pl.get("ik", []) + [{"cadena": f"brazo.{side}", "a_hueso": {"hueso": hueso, "dir": d, "t": t, "sep": sep,
                                                                             "lado": lado_dir or side}}]
    pl["base"]["angulos"].update({f"hombro_flex.{side}": 70, f"codo_flex.{side}": 110})
    return pl


def no_hands(pl, sides=("L", "R")):
    pl["contactos"] = [c for c in pl["contactos"] if c["grupo"] not in [hand(s) for s in sides]]
    pl["base"]["asentar"] = [a for a in pl["base"]["asentar"] if a["art"] not in [f"hombro_flex.{s}" for s in sides]]
    return pl


def pinned(pl, sides=("L", "R")):
    suelo = pl["base"]["orientacion"] in ("prono", "cuadrupedia")
    pl["ik"] = pl.get("ik", []) + [dict({"cadena": f"brazo.{s}"}, **({"al_suelo": 0.03} if suelo else {})) for s in sides]
    return pl


H = []
N = ["neck02"]
FRONT = [0, -1, 0.25]

# ─── CERVICAL ─────────────────────────────────────────────────────────────────
H.append(spec("E-001", ikh(sedente(), "L", "head", "lateral", t=0.6, lado_dir="R"), est({"cervical_incl": 35}), resaltar=N, camara=FRONT))
H.append(spec("E-002", sedente(extra={"hombro_flex.R": -10, "codo_flex.R": 0, "hombro_abd.R": 10, "mano_cerrar.R": 60}),
              est({"cervical_incl": 35, "escapula_elev.R": -10}), resaltar=N, camara=FRONT))
H.append(spec("E-003", ikh(sedente(), "L", "head", "lateral", t=0.6, lado_dir="R"), est({"cervical_incl": 42}), resaltar=N, camara=FRONT))
for id_, extra in (("E-004", {}), ("E-005", {"hombro_flex.R": 160, "codo_flex.R": 120}), ("E-006", {})):
    H.append(spec(id_, ikh(sedente(extra=extra), "L", "head", "posterior+lateral", t=0.6, lado_dir="R"),
                  est({"cervical_flex": 30, "cervical_rot": 40, "cervical_incl": 15}), resaltar=N, camara=FRONT))
b = supino()
b["contactos"] = [c if c["grupo"] != "head" else {"grupo": "head", "tol_cm": 3} for c in b["contactos"]]
H.append(spec("E-007", b, est({"cervical_flex": -8, "cervical_rot": 32}), resaltar=N, camara=[0, 1, 1.2]))
for id_ in ("E-008", "E-009"):
    H.append(spec(id_, ikh(sedente(), "L", "clavicle.R", "anterior", t=0.4, sep=0.02),
                  est({"cervical_flex": -20, "cervical_rot": 40, "cervical_incl": 15}), resaltar=N, camara=FRONT))
for id_, peak in (("E-010", {"cervical_incl": 35}), ("E-011", {"cervical_incl": 35, "cervical_flex": -10}), ("E-012", {"cervical_incl": 35})):
    H.append(spec(id_, ikh(sedente(), "R", "clavicle.R", "anterior+superior", t=0.5, sep=0.02), est(peak), resaltar=N, camara=FRONT))
b = supino()
b["contactos"] = [c if c["grupo"] != "head" else {"grupo": "head", "tol_cm": 3} for c in b["contactos"]]
H.append(spec("E-013", b, est({"cervical_flex": 15}), resaltar=N))
H.append(spec("E-014", ikh(sedente(), "R", "jaw", "anterior", t=0.9, sep=0.02), est({"cervical_flex": 20}), resaltar=N, camara=[-1, -0.3, 0.2]))
b = ikh(ikh(sedente(), "R", "head", "posterior", t=0.4), "L", "head", "posterior", t=0.4)
H.append(spec("E-015", b, est({"cervical_flex": 25}), resaltar=N, camara=[-1, 0.2, 0.2]))

# ─── HOMBRO / TÓRAX ───────────────────────────────────────────────────────────
b = no_hands(supino(rectas=False, gancho=("L", "R"), extra={"hombro_abd.L": 75, "hombro_abd.R": 75, "codo_flex.L": 90, "codo_flex.R": 90,
                                                           "hombro_re.L": 80, "hombro_re.R": 80}))
b["contactos"] = [c if c["grupo"] != "spine01" else {"grupo": "spine01", "tol_cm": 3} for c in b["contactos"]]
H.append(spec("E-016", b, est({"hombro_abd_h.L": 8, "hombro_abd_h.R": 8}), lado=None, camara=[0, 0.3, 1]))
door = bipedo(extra={"hombro_abd.R": 90, "codo_flex.R": 90, "hombro_re.R": 85}, camara=(-0.3, -1, 0.4))
H.append(spec("E-017", json.loads(json.dumps(door)), est({"hombro_abd_h.R": 25, "toracica_rot": 12}, campos={"raiz": [0, -0.06, 0]}),
              props=[{"tipo": "marco_puerta", "uso": "pared_manos", "lateral": "R", "sep": 0.25}]))
b = bipedo(extra={"hombro_abd.L": 90, "hombro_abd.R": 90, "codo_flex.L": 90, "codo_flex.R": 90, "hombro_re.L": 85, "hombro_re.R": 85}, camara=(-0.3, -1, 0.4))
H.append(spec("E-018", b, est({"hombro_abd_h.L": 20, "hombro_abd_h.R": 20}, campos={"raiz": [0, -0.08, 0]}), lado=None))
H.append(spec("E-019", supino(), est({"escapula_prot.L": -8, "escapula_prot.R": -8}), lado=None))
door2 = bipedo(extra={"hombro_abd.R": 135, "codo_flex.R": 60, "hombro_re.R": 60}, camara=(-0.3, -1, 0.4))
H.append(spec("E-020", door2, est({"hombro_abd_h.R": 20, "toracica_rot": 10}, campos={"raiz": [0, -0.06, 0]}),
              props=[{"tipo": "marco_puerta", "uso": "pared_manos", "lateral": "R", "sep": 0.25}]))
H.append(spec("E-021", json.loads(json.dumps(door)), est({"hombro_abd_h.R": 20, "escapula_prot.R": -12}, campos={"raiz": [0, -0.05, 0]}),
              props=[{"tipo": "marco_puerta", "uso": "pared_manos", "lateral": "R", "sep": 0.25}]))
child = pinned(cuadrupedia(extra={"hombro_flex.L": 120, "hombro_flex.R": 120}))
child["ik"] += [{"cadena": f"pierna.{s}"} for s in ("L", "R")]
child["contactos"] = [{"grupo": ["lowerleg01.L", "lowerleg02.L"], "tol_cm": 3}, {"grupo": hand("L") + hand("R"), "tol_cm": 2.5}]
H.append(spec("E-022", json.loads(json.dumps(child)), est({"lumbar_flex": 15}, campos={"raiz": [0, 0.22, -0.18]}), lado=None))
H.append(spec("E-023", json.loads(json.dumps(child)), est({"lumbar_flex": 12, "lumbar_incl": 12, "toracica_incl": 10}, campos={"raiz": [0, 0.22, -0.18]})))
b = bipedo(extra={"hombro_flex.L": 172, "hombro_flex.R": 172, "hombro_abd.L": 12, "hombro_abd.R": 12, "mano_cerrar.L": 75, "mano_cerrar.R": 75},
           camara=(-0.6, 1, 0.2))
b["base"]["elevar"] = 0.25
b["contactos"] = []
H.append(spec("E-024", b, est({"escapula_elev.L": 8, "escapula_elev.R": 8}), lado=None, props=[{"tipo": "barra", "uso": "barra_manos", "soportes": True}],
              variantes=["gym"], nota="En casa: barra de puerta segura (mismo video)."))
cross = ikh(bipedo(extra={"hombro_flex.R": 90}, camara=(-0.3, -1, 0.4)), "L", "upperarm02.R", "posterior", t=0.8, sep=0.02)
H.append(spec("E-025", cross, est({"hombro_abd_h.R": -45})))
for id_ in ("E-026", "E-027"):
    b = lateral()
    b["base"]["angulos"].update({"hombro_flex.L": 90, "codo_flex.L": 90})
    H.append(spec(id_, b, est({"hombro_re.L": -50}), lado="L", camara=[0.2, -1, 0.6]))
tri = ikh(bipedo(extra={"hombro_flex.R": 165, "codo_flex.R": 140}, camara=(-0.6, -1, 0.25)), "L", "upperarm02.R", "posterior", t=0.95, sep=0.02)
H.append(spec("E-028", tri, est({"hombro_flex.R": 10})))
b = bipedo(extra={"hombro_flex.R": 165, "codo_flex.R": 140, "hombro_flex.L": -45, "codo_flex.L": 110, "hombro_re.L": -80,
                  "mano_cerrar.L": 70, "mano_cerrar.R": 70}, camara=(-0.6, 1, 0.25))
b["base"]["angulos"]["codo_flex.R"] = 135
H.append(spec("E-029", b, est({"hombro_flex.L": -10, "codo_flex.R": 10}), props=[{"tipo": "toalla", "uso": "baston_manos"}]))
H.append(spec("E-030", json.loads(json.dumps(tri)), est({"hombro_flex.R": 12})))
b = pinned(bipedo(extra={"hombro_flex.L": -45, "hombro_flex.R": -45, "antebrazo_prono.L": 80, "antebrazo_prono.R": 80}, camara=(-1, -0.2, 0.2)))
b["ik"] += [{"cadena": f"pierna.{s}", "pie_plano": True} for s in ("L", "R")]
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
H.append(spec("E-031", b, est({}, campos={"raiz": [0, -0.04, -0.12]}), lado=None, props=[{"tipo": "mesa", "uso": "superficie_manos"}]))
for id_ in ("E-032", "E-033"):
    b = pinned(bipedo(extra={"hombro_abd.R": 85, "hombro_abd_h.R": 25, "antebrazo_prono.R": 80}, camara=(-0.2, -1, 0.4)), ("R",))
    H.append(spec(id_, b, est({"toracica_rot": 30, "cervical_rot": 20}), props=[{"tipo": "pared", "uso": "pared_manos", "lateral": "R", "sep": 0.05}]))

# ─── ANTEBRAZO ────────────────────────────────────────────────────────────────
HC = {"grupos": hand("R") + hand("L") + ["lowerarm01.R"], "margen": 1.4}
for id_, extra, peak in (("E-034", {"hombro_flex.R": 50, "codo_flex.R": 60, "antebrazo_prono.R": -80}, {"muneca_flex.R": -60}),
                         ("E-035", {"hombro_flex.R": 90, "codo_flex.R": 0, "antebrazo_prono.R": -80}, {"muneca_flex.R": -70}),
                         ("E-037", {"hombro_flex.R": 50, "codo_flex.R": 60, "antebrazo_prono.R": 80}, {"muneca_flex.R": 60}),
                         ("E-038", {"hombro_flex.R": 90, "codo_flex.R": 0, "antebrazo_prono.R": 80}, {"muneca_flex.R": 60, "muneca_rad.R": -20})):
    b = ikh(sedente(extra=extra), "L", "metacarpal3.R", "anterior" if id_ in ("E-034", "E-035") else "posterior", t=0.9, sep=0.02)
    b["base"]["angulos"].update(extra)
    H.append(spec(id_, b, est(peak), camara=[-0.6, -1, 0.4], resaltar=["wrist.R"], camara_extra=None))
H.append(spec("E-036", pinned(cuadrupedia()), est({}, campos={"raiz": [0, 0.07, 0]}), lado=None, camara=[1, 0.1, 0.3]))

# ─── TRONCO ───────────────────────────────────────────────────────────────────
b = supino(rectas=False)
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith(("hombro", "lumbar"))]
for s in ("L", "R"):
    b["ik"].append({"cadena": f"brazo.{s}", "a_hueso": {"hueso": f"lowerleg01.{s}", "dir": "anterior", "t": 0.1, "sep": 0.03, "lado": s}})
b["base"]["angulos"].update({"cadera_flex.L": 70, "cadera_flex.R": 70, "rodilla_flex.L": 100, "rodilla_flex.R": 100})
b["contactos"] = [{"grupo": "head"}, {"grupo": "spine01", "tol_cm": 3}]
H.append(spec("E-040", b, est({"cadera_flex.L": 45, "cadera_flex.R": 45, "rodilla_flex.L": 25, "rodilla_flex.R": 25}), lado=None))
H.append(spec("E-041", json.loads(json.dumps(child)), est({"lumbar_flex": 18}, campos={"raiz": [0, 0.22, -0.18]}), lado=None))
H.append(spec("E-042", pinned(cuadrupedia()), keys_custom(
    [(0, {"lumbar_flex": 0, "toracica_flex": 0, "cervical_flex": 0}, 0), (1.5, {"lumbar_flex": 18, "toracica_flex": 18, "cervical_flex": 20}, 1),
     (2.3, {"lumbar_flex": 18, "toracica_flex": 18, "cervical_flex": 20}, 1), (3.9, {"lumbar_flex": -14, "toracica_flex": -8, "cervical_flex": -15}, 0.5),
     (4.7, {"lumbar_flex": -14, "toracica_flex": -8, "cervical_flex": -15}, 0.5), (6.0, {"lumbar_flex": 0, "toracica_flex": 0, "cervical_flex": 0}, 0)],
    ["concentrico"] * 6), lado=None, camara=[1, 0.1, 0.3]))
b = lateral()
b["base"]["angulos"].update({"hombro_abd.R": 135, "cadera_flex.R": 30, "rodilla_flex.R": 60})
H.append(spec("E-043", b, est({"lumbar_incl": 12, "toracica_incl": 8}), lado="R", camara=[0.1, -1, 0.4]))
H.append(spec("E-044", bipedo(extra={"hombro_abd.R": 165}, camara=(0, -1, 0.2)), est({"lumbar_incl": 15, "toracica_incl": 15})))
sph = prono(extra={"cervical_rot": 0, "hombro_flex.L": 80, "hombro_flex.R": 80, "codo_flex.L": 90, "codo_flex.R": 90})
sph["base"]["asentar"] = [{"art": "toracica_flex", "grupo": ["lowerarm01.L", "lowerarm02.L"] + hand("L"), "rango": [-55, 10]},
                          {"art": "cervical_flex", "grupo": "head", "z": 0.25, "rango": [-30, 30]}]
sph["contactos"] = [{"grupo": ["pelvis.L", "pelvis.R", "spine05"], "tol_cm": 2.5}, {"grupo": ["lowerarm01.L", "lowerarm02.L"], "tol_cm": 2.5}]
H.append(spec("E-046", sph, est({"lumbar_flex": -6}), lado=None, camara=[1, 0.1, 0.3]))
b = pinned(prono(extra={"cervical_rot": 0, "hombro_flex.L": 20, "hombro_flex.R": 20, "hombro_abd.L": 55, "hombro_abd.R": 55,
                        "codo_flex.L": 120, "codo_flex.R": 120}))
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if not a["art"].startswith(("hombro", "cervical"))] + \
    [{"art": "cervical_flex", "grupo": "head", "rango": [-10, 35]}]
b["contactos"] = [{"grupo": ["pelvis.L", "pelvis.R", "spine05"], "tol_cm": 2.5}]
H.append(spec("E-047", b, est({"lumbar_flex": -22, "toracica_flex": -14, "cervical_flex": -8}), lado=None, camara=[1, 0.1, 0.3]))
b = bipedo(camara=(-1, 0.1, 0.2))
for s in ("L", "R"):
    b["ik"].append({"cadena": f"brazo.{s}", "a_hueso": {"hueso": "spine04", "dir": "posterior+lateral", "t": 0.5, "sep": 0.03, "lado": s}})
H.append(spec("E-048", b, est({"lumbar_flex": -15, "toracica_flex": -8, "cervical_flex": -5}), lado=None))

# ─── CADERA ───────────────────────────────────────────────────────────────────
b = supino(rectas=False)
b["base"].update({"colchoneta": False, "superficie_banco": 0.62, "banco_largo": True, "suelo": ["spine02", "spine03", "pelvis.L", "pelvis.R"],
                  "asentar": [{"art": "cervical_flex", "grupo": "head", "z": 0.62, "rango": [-25, 25]}]})
b["base"]["angulos"].update({"cadera_flex.L": 110, "rodilla_flex.L": 120, "cadera_flex.R": -10, "rodilla_flex.R": 80})
b["ik"] = [{"cadena": f"brazo.{s}", "a_hueso": {"hueso": "lowerleg01.L", "dir": "anterior", "t": 0.1, "sep": 0.03, "lado": s}} for s in ("L", "R")]
b["contactos"] = []
H.append(spec("E-049", b, est({"cadera_flex.R": -10}), camara=[-1, 0.1, 0.25]))
hk = {"base": {"orientacion": "rodillas", "colchoneta": True,
               "angulos": {"rodilla_flex.R": 90, "tobillo_dorsi.R": -50, "cadera_flex.L": 90, "rodilla_flex.L": 90},
               "suelo": ["lowerleg01.R", "lowerleg02.R"],
               "asentar": [{"art": "cadera_flex.L", "grupo": "foot.L", "rango": [-25, 25]}]},
      "ik": [{"cadena": "pierna.L", "pie_plano": True}],
      "contactos": [{"grupo": ["lowerleg01.R", "lowerleg02.R"], "tol_cm": 2.5}, {"grupo": "foot.L"}],
      "camara": {"dir": [-1, -0.1, 0.25], "lente": 50, "margen": 1.1}}
H.append(spec("E-050", json.loads(json.dumps(hk)), est({"lumbar_flex": 6}, campos={"raiz": [0, -0.08, -0.02]})))
hk2 = json.loads(json.dumps(hk))
hk2["base"]["angulos"].update({"hombro_abd.R": 165})
H.append(spec("E-051", hk2, est({"toracica_incl": 15, "lumbar_incl": 8}, campos={"raiz": [0, -0.08, -0.02]})))
H.append(spec("E-052", prono(), est({"rodilla_flex.R": 120}), camara=[1, 0.2, 0.3]))
b = bipedo(camara=(-1, -0.1, 0.2))
b["ik"].append({"cadena": "brazo.R", "a_hueso": {"hueso": "lowerleg02.R", "dir": "anterior", "t": 0.9, "sep": 0.02, "lado": "R"}})
b["base"]["angulos"].update({"rodilla_flex.R": 135, "cadera_flex.R": -8, "hombro_abd.L": 30})
H.append(spec("E-053", b, est({"cadera_flex.R": -8})))
b = no_hands(supino())
b["ik"] = [{"cadena": f"brazo.{s}", "a_hueso": {"hueso": "lowerleg01.R", "dir": "anterior", "t": 0.1, "sep": 0.03, "lado": s}} for s in ("L", "R")]
b["base"]["angulos"].update({"cadera_flex.R": 95, "rodilla_flex.R": 110})
b["contactos"] = [c for c in b["contactos"] if c["grupo"] != "foot.R"]
H.append(spec("E-055", b, est({"cadera_flex.R": 20, "cadera_abd.R": -20})))
b = sedente()
b["ik"] = [{"cadena": f"brazo.{s}", "a_hueso": {"hueso": "lowerleg01.R", "dir": "anterior", "t": 0.1, "sep": 0.03, "lado": s}} for s in ("L", "R")]
b["base"]["angulos"].update({"cadera_flex.R": 110, "rodilla_flex.R": 100})
b["contactos"] = [{"grupo": "foot.L"}]
H.append(spec("E-056", b, est({"cadera_abd.R": -20, "toracica_rot": 20}), camara=[0, -1, 0.3]))
b = sedente(extra={"cadera_flex.R": 100, "cadera_abd.R": 35, "cadera_re.R": 55, "rodilla_flex.R": 100})
b["ik"] = [{"cadena": "pierna.R", "a_hueso": {"hueso": "upperleg02.L", "dir": "superior", "t": 0.92, "sep": 0.03, "lado": "L"},
            "polo_manual": True, "polo": [-0.6, 0, 0.2]}]
b["contactos"] = [{"grupo": "foot.L"}]
H.append(spec("E-059", b, est({"lumbar_flex": 18, "toracica_flex": 8}), camara=[-0.6, -1, 0.3]))
b = no_hands(supino(rectas=False, extra={"cadera_flex.L": 60, "cadera_flex.R": 60, "rodilla_flex.L": 110, "rodilla_flex.R": 110,
                                         "cadera_abd.L": 30, "cadera_abd.R": 30, "cadera_re.L": 40, "cadera_re.R": 40}))
b["contactos"] = [{"grupo": "head"}, {"grupo": "spine01", "tol_cm": 3}]
H.append(spec("E-061", b, est({"cadera_abd.L": 15, "cadera_abd.R": 15}), lado=None, camara=[0, -1, 0.9]))
b = sedente_suelo(manos="libres", extra={"cadera_abd.L": 35, "cadera_abd.R": 35, "cadera_re.L": 45, "cadera_re.R": 45,
                                         "rodilla_flex.L": 115, "rodilla_flex.R": 115, "hombro_flex.L": 30, "hombro_flex.R": 30})
b["base"]["asentar"] = []
b["base"]["suelo"] = ["pelvis.L", "pelvis.R", "foot.L", "foot.R"] + FOOT("L") + FOOT("R")
b["contactos"] = []
H.append(spec("E-062", b, est({"lumbar_flex": 15, "toracica_flex": 8}), lado=None, camara=[-0.4, -1, 0.4]))
b = bipedo(extra={"cadera_abd.L": 22, "cadera_abd.R": 22, "hombro_flex.L": 40, "hombro_flex.R": 40}, camara=(0, -1, 0.2))
b["ik"] = [{"cadena": "pierna.L", "pie_plano": True}, {"cadena": "pierna.R", "pie_plano": True}]
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
H.append(spec("E-063", b, est({"lumbar_flex": 10}, campos={"raiz": [-0.22, 0, -0.14]}), lado="L"))
b = no_hands(supino(rectas=True))
b["base"]["angulos"].update({"cadera_abd.R": -22, "cadera_flex.R": 8})
b["base"]["asentar"] = [a for a in b["base"]["asentar"] if a["art"] != "cadera_flex.R"]
b["contactos"] = [c for c in b["contactos"] if c["grupo"] != "foot.R"]
H.append(spec("E-064", b, est({"cadera_abd.R": -8}), camara=[0, -1, 0.9]))
H.append(spec("E-065", bipedo(extra={"cadera_abd.R": -14, "cadera_flex.R": -4, "hombro_abd.R": 160}, camara=(0, -1, 0.2)),
              est({"lumbar_incl": 15, "toracica_incl": 10})))
b = lateral()
b["base"]["angulos"].update({"cadera_flex.R": -8})
H.append(spec("E-066", b, est({"cadera_abd.R": -14}), camara=[0.1, -1, 0.4]))
# isquiotibiales
b = bipedo(camara=(-1, -0.1, 0.2))
b["base"]["angulos"].update({"cadera_flex.R": 70})
b["base"]["asentar"] = [{"art": "cadera_flex.R", "grupo": "foot.R", "z": 0.42, "rango": [-40, 40]}]
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R", "z": 0.42}]
H.append(spec("E-068", b, est({"lumbar_flex": 20, "toracica_flex": 10}), props=[{"tipo": "escalon", "uso": "apoyo_pie", "lado": "R", "alto": 0.42}]))
d = json.loads((ROOT / "data/motion_specs/E-067.json").read_text())
d.update({"id": "E-069", "nombre": "Contracción-relajación (FNP) — isquiotibiales", "musculos": musculos("E-069", "R")})
write(d)
H.append("E-069")

# ─── PIERNA Y PIE ─────────────────────────────────────────────────────────────
def towel_long(dorsi, knee=0):
    b = sedente_suelo(manos="libres", extra={"lumbar_flex": 14, "rodilla_flex.R": knee})
    b["ik"] = [{"cadena": "brazo.L", "polo_manual": True, "polo": [0.5, 0.2, -0.5]},
               {"cadena": "brazo.R", "polo_manual": True, "polo": [-0.5, 0.2, -0.5]}]
    b["base"]["angulos"].update({"mano_cerrar.L": 70, "mano_cerrar.R": 70})
    if knee:
        b["base"]["asentar"] = [a if a["art"] != "cadera_flex.R" else {**a, "rango": [30, 120]} for a in b["base"]["asentar"]]
    return b, est({"tobillo_dorsi.R": dorsi}), [{"tipo": "toalla", "uso": "correa_pie_manos", "pie": "R", "fraccion": 0.5}]


for id_, knee in (("E-070", 0), ("E-073", 30)):
    b, kd, pr = towel_long(15, knee)
    H.append(spec(id_, b, kd, props=pr, resaltar=["foot.R"]))


def wall_calf(knee_back, atras=0.35):
    b = bipedo(extra={"hombro_flex.L": 85, "hombro_flex.R": 85, "@pitch": 10, "rodilla_flex.L": 25, "rodilla_flex.R": knee_back},
               camara=(-1, -0.1, 0.2))
    b["ik"] = [{"cadena": "pierna.L", "pie_plano": True, "objetivo_rel": [0, -0.25, 0]},
               {"cadena": "pierna.R", "pie_plano": True, "objetivo_rel": [0, atras, 0]},
               {"cadena": "brazo.L"}, {"cadena": "brazo.R"}]
    b["contactos"] = [{"grupo": "foot.L"}, {"grupo": "foot.R"}]
    b["props"] = [{"tipo": "pared", "uso": "pared_manos"}]
    return b


H.append(spec("E-071", wall_calf(0, 0.24), est({}, campos={"raiz": [0, -0.04, 0]}), resaltar=["foot.R"]))
H.append(spec("E-074", wall_calf(25, 0.24), est({}, campos={"raiz": [0, -0.04, -0.03]}), resaltar=["foot.R"]))
for id_, knee in (("E-072", 0), ("E-075", 22)):
    b = bipedo(extra={"rodilla_flex.L": knee, "rodilla_flex.R": knee}, camara=(-1, -0.2, 0.2))
    b["base"]["elevar"] = 0.18
    toes = FOOT("L") + FOOT("R")
    b["reapoyar"] = {"grupos": toes, "z": 0.18}
    b["contactos"] = [{"grupo": toes, "z": 0.18}]
    H.append(spec(id_, b, est({"tobillo_dorsi.L": 15, "tobillo_dorsi.R": 15}), lado=None, resaltar=["foot.L", "foot.R"],
                  props=[{"tipo": "escalon", "uso": "caja", "tam": [0.5, 0.18, 0.18], "pos": [0, -0.06, 0.09]}]))
H.append(spec("E-076", sedente(extra={"rodilla_flex.R": 60}), est({"tobillo_dorsi.R": -40}), resaltar=["foot.R"], camara=[-1, -0.3, 0.2]))
kn = {"base": {"orientacion": "rodillas", "colchoneta": True,
               "angulos": {"rodilla_flex.L": 90, "rodilla_flex.R": 90, "tobillo_dorsi.L": -45, "tobillo_dorsi.R": -45}},
      "ik": [], "contactos": [{"grupo": ["lowerleg01.L", "lowerleg02.L"], "tol_cm": 3}],
      "camara": {"dir": [-1, -0.1, 0.25], "lente": 50, "margen": 1.1}}
kn["ik"] = [{"cadena": f"pierna.{s}"} for s in ("L", "R")]
H.append(spec("E-077", kn, est({"lumbar_flex": 5}, campos={"raiz": [0, 0.12, -0.24]}), lado=None))
b = bipedo(extra={"cadera_flex.R": -14, "rodilla_flex.R": 40, "tobillo_dorsi.R": -55}, camara=(-1, -0.1, 0.2))
b["base"]["asentar"] = [{"art": "cadera_flex.R", "grupo": FOOT("R"), "rango": [-25, 15]}]
b["contactos"] = [{"grupo": "foot.L"}, {"grupo": FOOT("R"), "tol_cm": 2}]
H.append(spec("E-078", b, est({"rodilla_flex.R": 10}), resaltar=["foot.R"]))
H.append(spec("E-079", sedente(extra={"rodilla_flex.R": 60}), est({"dedos_flex.R": -45, "tobillo_dorsi.R": 10}), resaltar=["foot.R"],
              camara=[-0.8, -1, 0.5]))
b = sedente()
b["ik"] = [{"cadena": "pierna.R", "pie_plano": True, "z_suelo": 0.065}]
b["contactos"] = [{"grupo": "foot.L"}]
H.append(spec("E-080", b, keys_custom([(0, {}, 0), (1.5, {}, 1), (3.0, {}, 1), (4.5, {}, 1), (6.0, {}, 0)], ["concentrico"] * 5),
              resaltar=["foot.R"], props=[{"tipo": "pelota_pequena", "uso": "apoyo_pie", "lado": "R", "alto": 0.065}], camara=[-0.8, -1, 0.5]))
d = json.loads((ROOT / "data/motion_specs/E-080.json").read_text())
for k, dy in zip(d["keys"], (0, -0.06, 0.06, -0.06, 0)):
    k["ik"] = {"pierna.R": [0, dy, 0]}
(ROOT / "data/motion_specs/E-080.json").write_text(json.dumps(d, ensure_ascii=False, indent=2))
b = bipedo(extra={"tobillo_dorsi.R": 10, "dedos_flex.R": -40}, camara=(-1, -0.2, 0.2))
b["ik"] = [{"cadena": "pierna.R", "pie_plano": False, "objetivo_rel": [0, -0.15, 0.02]}]
b["contactos"] = [{"grupo": "foot.L"}]
H.append(spec("E-081", b, est({"tobillo_dorsi.R": 8}, campos={"raiz": [0, -0.04, 0]}), resaltar=["foot.R"]))

H = [h for h in H if h]
print(f"Generadas {len(H)} fichas de estiramientos.")
(ROOT / "data/motion_specs/_pendientes_estiramientos.json").write_text(json.dumps(PENDIENTES, ensure_ascii=False, indent=2))
