"""Genera las fichas de OSTEOPATÍA (O-001..O-094): paciente en camilla + terapeuta con las manos sobre ella.

Código de color de la capa:
  - movilización / articulatoria / tracción (pasivo): estructuras periarticulares en AZUL (se elongan)
  - energía muscular (TEM): la paciente empuja contra la mano → ROJO (isométrico), luego relaja y se gana rango → AZUL
  - tejidos blandos / inhibición / miofascial / contratensión / BLT: el tejido tratado en AZUL (se relaja/libera)
  - craneal / visceral: estructura en AZUL, manos quietas (el movimiento real es milimétrico)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import ROOT, BIB, write, supino, prono, lateral, sedente, keys_custom  # noqa: E402

NOTA = "Consultorio: un solo video (camilla + terapeuta)."


def camilla(pl):
    pl["base"]["colchoneta"] = False
    pl["base"]["camilla"] = True
    return pl


def osc(art, n=3, dur=6.0, rel=0.25):
    """Oscilaciones pasivas rítmicas (grados I–III): n ciclos dentro de dur s, en loop."""
    seq = [(0.0, {k: 0 for k in art}, 0)]
    T = dur / n
    for i in range(n):
        t0 = i * T
        seq.append((round(t0 + T * 0.5, 2), dict(art), 1))
        seq.append((round(t0 + T, 2), {k: v * (rel if i < n - 1 else 0) for k, v in art.items()}, rel if i < n - 1 else 0))
    seq[-1] = (dur, {k: 0 for k in art}, 0)
    return keys_custom(seq, ["concentrico"] * len(seq))


def tem(art_rango, dur=7.0):
    """Energía muscular: al rango (pasivo) → contracción isométrica 3 s contra la mano → relajación → nuevo rango."""
    seq = [(0.0, {k: 0 for k in art_rango}, 0),
           (1.2, dict(art_rango), 0.3),                     # el terapeuta lleva a la barrera
           (1.6, dict(art_rango), 1),                       # la paciente empuja (isométrico)
           (4.4, dict(art_rango), 1),
           (5.0, {k: v * 1.15 for k, v in art_rango.items()}, 0.6),   # relaja → nueva barrera (elongación)
           (dur, {k: 0 for k in art_rango}, 0)]
    return keys_custom(seq, ["concentrico", "isometrico", "isometrico", "elongacion", "elongacion", "concentrico"])


def quieto(dur=6.0):
    """Manos quietas (inhibición, craneal, visceral): la estructura tratada se ilumina y se apaga."""
    seq = [(0.0, {}, 0), (1.5, {}, 1), (4.5, {}, 1), (dur, {}, 0)]
    return keys_custom(seq, ["concentrico"] * 4)


def mus(azul=(), rojo=(), lado=None):
    def m(i):
        return {"id": i, "lado": lado} if lado else {"id": i}
    out = {}
    if rojo:
        out["activos"] = [m(i) for i in rojo]
    if azul:
        out["elongan"] = [m(i) for i in azul]
    return out


def _tolerante(pl, keys):
    """En osteopatía el terapeuta SOSTIENE el segmento: los apoyos toleran 3,5 cm y la cabeza que él mueve no cuenta."""
    mueve = {a.split(".")[0] for k in keys for a in k.get("art", {})}
    cabeza = bool(mueve & {"cervical_flex", "cervical_rot", "cervical_incl", "atm_apertura"})
    arts = {a for k in keys for a in k.get("art", {})}
    def _mueve(c):
        g = c["grupo"] if isinstance(c["grupo"], list) else [c["grupo"]]
        for s_ in ("L", "R"):
            brazo = any(a.endswith("." + s_) and a.split(".")[0] in ("hombro_flex", "hombro_abd", "hombro_re", "codo_flex",
                        "escapula_prot", "escapula_elev", "antebrazo_prono", "muneca_flex", "muneca_ext") for a in arts)
            pierna = any(a.endswith("." + s_) and a.split(".")[0] in ("cadera_flex", "cadera_abd", "cadera_re", "rodilla_flex",
                         "tobillo_dorsi", "tobillo_inv") for a in arts)
            if brazo and any(x.endswith("." + s_) and x.startswith(("lowerarm", "wrist", "finger", "metacarpal")) for x in g):
                return True
            if pierna and any(x.endswith("." + s_) and x.startswith(("foot", "toe", "lowerleg")) for x in g):
                return True
        return cabeza and "head" in g
    pl["contactos"] = [{**c, "tol_cm": max(c.get("tol_cm", 0), 3.5)} for c in pl["contactos"] if not _mueve(c)]
    return pl


def ost(id_, pl, kd, ter, musculos, camara=None, **kw):
    dur, keys = kd
    camilla(pl)
    _tolerante(pl, keys)
    s = {"id": id_, "duracion_s": round(dur, 2), **pl, "keys": keys, "musculos": musculos,
         "articulacion_resaltada": [], "props": pl.get("props", []), "variantes": ["gym"], "nota_variantes": NOTA,
         "terapeuta": ter}
    if camara:
        s["camara"] = {**s["camara"], **camara}
    s.update(kw)
    return write(s)


def mano(hueso, a=0.5, desde=(0, 0, 1), dedos=None):
    h = {"hueso": hueso, "a": a, "desde": list(desde)}
    if dedos:
        h["dedos"] = list(dedos)
    return h


SOLO = sys.argv[1:]
H = []


def add(id_, fn):
    if not SOLO or id_ in SOLO:
        H.append(fn())


SUBOC = ["rectus_capitis_posterior_major", "rectus_capitis_posterior_minor", "obliquus_capitis_superior", "obliquus_capitis_inferior"]
UP = (0, 0, 1)


def T(lado, manos, **kw):
    return {"lado": lado, "manos": manos, **kw}


def sup(**ang):
    return supino(extra=ang)


def sup_g(lados=("L", "R"), **ang):
    return supino(gancho=lados, extra=ang)


def pro(**ang):
    return prono(extra=ang)


def lat(**ang):
    pl = lateral(top_recta=False)            # pierna de arriba flexionada y apoyada (posición clínica)
    pl["base"]["angulos"].update(ang)
    return pl


def sed(**ang):
    return sedente(extra=ang)


CAB = {"dir": [-0.9, -1, 1.0]}          # cámara para cabeza/cuello con terapeuta a la cabecera
DER = {"dir": [1, -0.35, 0.8]}           # terapeuta del lado x-: cámara desde x+
PIES = {"dir": [1, 0.25, 0.8]}
PRO = {"dir": [1, -0.3, 0.9]}
LAT = {"dir": [0.25, -1, 0.9]}
SED = {"dir": [-0.8, -1, 0.4]}

NUCA = lambda: {"R": mano("head", 0.2, (-0.35, 1, -0.45)), "L": mano("head", 0.2, (0.35, 1, -0.45))}
SIENES = lambda a=0.45: {"R": mano("head", a, (-1, 0, 0.25)), "L": mano("head", a, (1, 0, 0.25))}
CUELLO = lambda: {"R": mano("neck02", 0.5, (-1, 0.2, 0.15)), "L": mano("neck02", 0.5, (1, 0.2, 0.15))}

O = {
    # ─── Cervical alta / media ───
    "O-001": (sup(), quieto(), T("y+", NUCA()), mus(azul=SUBOC), CAB),
    "O-002": (sup(), tem({"cervical_flex": 10}), T("y+", {"R": mano("head", 0.2, (0, 1, -0.4)), "L": mano("head", 0.75, UP)}),
              mus(rojo=["rectus_capitis_posterior_major", "rectus_capitis_posterior_minor"]), CAB),
    "O-003": (sup(), tem({"cervical_rot": 25}), T("y+", SIENES()), mus(rojo=["obliquus_capitis_inferior", "obliquus_capitis_superior"]), CAB),
    "O-004": (sup(cervical_flex=-8), quieto(), T("y+", NUCA()), mus(azul=SUBOC), CAB),
    "O-005": (sup(), tem({"cervical_rot": 20, "cervical_incl": 8}), T("y+", CUELLO()),
              mus(rojo=["splenius_cervicis", "semispinalis_cervicis", "rotatores"]), CAB),
    "O-006": (sup(), osc({"cervical_rot": 15}), T("y+", CUELLO()), mus(azul=["semispinalis_cervicis", "splenius_cervicis", "rotatores"]), CAB),
    "O-007": (sup(cervical_flex=15, cervical_rot=10), quieto(), T("y+", CUELLO()),
              mus(azul=["scalene_anterior", "longus_colli", "semispinalis_capitis"]), CAB),
    "O-008": (sup(), quieto(), T("y+", {"R": mano("shoulder01.R", 0.3, (-0.2, 0.8, 0.6)), "L": mano("head", 0.2, (0, 1, -0.4))}),
              mus(azul=["trapezius_upper", "levator_scapulae"], lado="R"), CAB),
    "O-009": (sup(), osc({"cervical_flex": -4}, rel=0.4), T("y+", NUCA()), mus(azul=["semispinalis_capitis", "splenius_capitis"]), CAB),
    # ─── ATM ───
    "O-010": (sup(), osc({"atm_apertura": 6}), T("y+", {"R": mano("jaw", 0.7, (-1, 0, 0.6)), "L": mano("jaw", 0.7, (1, 0, 0.6))}),
              mus(azul=["lateral_pterygoid", "masseter"]), CAB),
    "O-011": (sup(), tem({"atm_apertura": 14}), T("y+", {"R": mano("jaw", 0.9, (0, -0.3, 1)), "L": mano("head", 0.45, (1, 0, 0.25))}),
              mus(rojo=["lateral_pterygoid", "suprahyoids", "digastric"]), CAB),
    "O-012": (sup(), quieto(), T("y+", {"R": mano("jaw", 0.35, (-1, 0, 0.3)), "L": mano("jaw", 0.35, (1, 0, 0.3))}),
              mus(azul=["masseter", "temporalis"]), CAB),
    "O-013": (sup(atm_apertura=12), quieto(), T("y+", {"R": mano("jaw", 0.85, (-0.5, -0.2, 1)), "L": mano("head", 0.45, (1, 0, 0.25))}),
              mus(azul=["lateral_pterygoid"], lado="R"), CAB),
    # ─── Esternoclavicular / acromioclavicular ───
    "O-014": (sup(), osc({"escapula_prot.R": 8}), T("x-", {"R": mano("clavicle.R", 0.15, UP), "L": mano("clavicle.R", 0.65, UP)}),
              mus(azul=["sternocleidomastoid", "pectoralis_major_clavicular"], lado="R"), DER),
    "O-015": (sup(), osc({"escapula_prot.R": 6, "hombro_flex.R": 10}), T("x-", {"R": mano("clavicle.R", 0.9, UP), "L": mano("upperarm01.R", 0.15, UP)}),
              mus(azul=["trapezius_upper", "deltoid_anterior"], lado="R"), DER),
    "O-016": (sup(), tem({"escapula_elev.R": 10}), T("x-", {"R": mano("clavicle.R", 0.5, UP), "L": mano("upperarm02.R", 0.85, UP)}),
              mus(rojo=["trapezius_upper", "sternocleidomastoid"], lado="R"), DER),
    # ─── Escapulotorácica ───
    "O-017": (lat(), osc({"escapula_elev.R": 10, "escapula_prot.R": 10}),
              T("y+", {"R": mano("shoulder01.R", 0.5, (0, 0.6, 1)), "L": mano("spine02", 0.5, (0.2, 1, 0.6))}),
              mus(azul=["rhomboid_major", "trapezius_middle", "serratus_anterior"], lado="R"), LAT),
    "O-018": (pro(), quieto(), T("x-", {"R": mano("shoulder01.R", 0.1, UP), "L": mano("spine01", 0.6, UP)}),
              mus(azul=["rhomboid_major", "rhomboid_minor", "trapezius_middle"], lado="R"), PRO),
    "O-019": (sup(), quieto(), T("x-", {"R": mano("clavicle.R", 0.75, UP), "L": mano("upperarm01.R", 0.1, UP)}),
              mus(azul=["pectoralis_minor"], lado="R"), DER),
    "O-020": (sup(cervical_incl=12), quieto(), T("y+", {"R": mano("shoulder01.R", 0.1, (-0.2, 0.8, 0.6)), "L": mano("head", 0.3, (1, 0.3, 0.2))}),
              mus(azul=["levator_scapulae"], lado="R"), CAB),
    # ─── Hombro ───
    "O-021": (sup(), osc({"hombro_flex.R": 60}, n=2, rel=0.3), T("x-", {"R": mano("shoulder01.R", 0.5, UP), "L": mano("upperarm02.R", 0.85, UP)}),
              mus(azul=["supraspinatus", "infraspinatus", "subscapularis"], lado="R"), DER),
    "O-022": (sup(hombro_abd_R=40), osc({"hombro_abd.R": 8}), T("x-", {"R": mano("upperarm01.R", 0.2, UP), "L": mano("upperarm02.R", 0.8, UP)}),
              mus(azul=["subscapularis", "infraspinatus", "supraspinatus"], lado="R"), DER),
    "O-023": (sup(hombro_abd_R=80, codo_flex_R=90), tem({"hombro_re.R": 30}),
              T("x-", {"R": mano("upperarm02.R", 0.85, UP), "L": mano("lowerarm02.R", 0.8, (-1, 0, 0.3))}),
              mus(rojo=["infraspinatus", "teres_minor"], lado="R"), DER),
    "O-024": (sup(hombro_abd_R=30), quieto(), T("x-", {"R": mano("shoulder01.R", 0.6, UP), "L": mano("upperarm02.R", 0.85, UP)}),
              mus(azul=["subscapularis", "supraspinatus"], lado="R"), DER),
    "O-025": (sup(hombro_abd_R=30), osc({"hombro_abd.R": 5}, rel=0.4), T("x-", {"R": mano("upperarm01.R", 0.25, UP), "L": mano("upperarm02.R", 0.8, UP)}),
              mus(azul=["supraspinatus", "subscapularis", "infraspinatus"], lado="R"), DER),
    # ─── Codo / antebrazo ───
    "O-026": (sup(hombro_abd_R=20, codo_flex_R=45), osc({"codo_flex.R": 20}),
              T("x-", {"R": mano("upperarm02.R", 0.85, UP), "L": mano("lowerarm01.R", 0.35, UP)}), mus(azul=["brachialis", "triceps_brachii"], lado="R"), DER),
    "O-027": (sup(hombro_abd_R=20, codo_flex_R=30), osc({"antebrazo_prono.R": 20}),
              T("x-", {"R": mano("lowerarm01.R", 0.12, UP), "L": mano("lowerarm02.R", 0.8, UP)}), mus(azul=["supinator", "brachioradialis"], lado="R"), DER),
    "O-028": (sup(hombro_abd_R=20, codo_flex_R=60), tem({"codo_flex.R": 30}),
              T("x-", {"R": mano("upperarm02.R", 0.8, UP), "L": mano("lowerarm02.R", 0.8, UP)}), mus(rojo=["biceps_brachii", "brachialis"], lado="R"), DER),
    "O-029": (sup(hombro_abd_R=20, codo_flex_R=70), quieto(),
              T("x-", {"R": mano("lowerarm01.R", 0.15, UP), "L": mano("lowerarm02.R", 0.8, UP)}),
              mus(azul=["extensor_carpi_radialis_brevis", "extensor_digitorum", "flexor_carpi_radialis"], lado="R"), DER),
    "O-030": (sup(hombro_abd_R=20, codo_flex_R=90), tem({"antebrazo_prono.R": 40}),
              T("x-", {"R": mano("upperarm02.R", 0.9, UP), "L": mano("lowerarm02.R", 0.85, (-1, 0, 0.3))}),
              mus(rojo=["pronator_teres", "pronator_quadratus"], lado="R"), DER),
    "O-031": (sup(hombro_abd_R=20, codo_flex_R=90), osc({"antebrazo_prono.R": 15}),
              T("x-", {"R": mano("lowerarm02.R", 0.75, (-1, 0, 0.3)), "L": mano("lowerarm02.R", 0.9, (1, 0, 0.3))}),
              mus(azul=["pronator_quadratus"], lado="R"), DER),
    "O-032": (sup(hombro_abd_R=20, codo_flex_R=30), quieto(),
              T("x-", {"R": mano("lowerarm01.R", 0.6, UP), "L": mano("lowerarm02.R", 0.4, UP)}),
              mus(azul=["flexor_digitorum_profundus", "extensor_indicis"], lado="R"), DER),
    # ─── Muñeca / mano (antebrazo vertical, el terapeuta sostiene la muñeca) ───
    "O-033": (sup(hombro_abd_R=20, codo_flex_R=90), osc({"muneca_flex.R": 15}),
              T("x-", {"R": mano("lowerarm02.R", 0.9, (-1, 0, 0.2)), "L": mano("wrist.R", 0.7, (1, 0, 0.2))}),
              mus(azul=["flexor_carpi_radialis", "extensor_carpi_radialis_longus"], lado="R"), DER),
    "O-034": (sup(hombro_abd_R=20, codo_flex_R=90), osc({"muneca_ext.R": 10}),
              T("x-", {"R": mano("lowerarm02.R", 0.9, (-1, 0, 0.2)), "L": mano("wrist.R", 0.8, (1, 0, 0.2))}),
              mus(azul=["flexor_carpi_ulnaris", "extensor_carpi_ulnaris"], lado="R"), DER),
    "O-035": (sup(hombro_abd_R=20, codo_flex_R=90), tem({"muneca_flex.R": 30}),
              T("x-", {"R": mano("lowerarm02.R", 0.85, (-1, 0, 0.2)), "L": mano("wrist.R", 0.8, (1, 0, 0.2))}),
              mus(rojo=["flexor_carpi_radialis", "flexor_carpi_ulnaris"], lado="R"), DER),
    "O-036": (sup(hombro_abd_R=20, codo_flex_R=90), quieto(),
              T("x-", {"R": mano("wrist.R", 0.4, (-1, 0, 0.2)), "L": mano("wrist.R", 0.4, (1, 0, 0.2))}),
              mus(azul=["flexor_digitorum_superficialis", "palmaris_longus"], lado="R"), DER),
    "O-037": (sup(hombro_abd_R=20, codo_flex_R=90), osc({"pulgar_abd.R": 15}),
              T("x-", {"R": mano("wrist.R", 0.5, (1, 0, 0.2)), "L": mano("finger1-1.R", 0.6, (-1, 0, 0.3))}),
              mus(azul=["abductor_pollicis_brevis", "opponens_pollicis"], lado="R"), DER),
    "O-038": (sup(hombro_abd_R=20, codo_flex_R=90), osc({"dedos_ext.R": 15}),
              T("x-", {"R": mano("wrist.R", 0.5, (1, 0, 0.2)), "L": mano("finger2-1.R", 0.6, (-1, 0, 0.3))}),
              mus(azul=["lumbricals_hand", "flexor_digitorum_superficialis"], lado="R"), DER),
    "O-039": (sup(hombro_abd_R=20, codo_flex_R=90), osc({"dedos_separar.R": 12}),
              T("x-", {"R": mano("wrist.R", 0.8, (1, 0, 0.2)), "L": mano("wrist.R", 0.8, (-1, 0, 0.2))}),
              mus(azul=["dorsal_interossei_hand", "palmar_interossei"], lado="R"), DER),
    "O-040": (sup(hombro_abd_R=20, codo_flex_R=90), quieto(),
              T("x-", {"R": mano("wrist.R", 0.7, (1, 0, 0.2)), "L": mano("wrist.R", 0.7, (-1, 0, 0.2))}),
              mus(azul=["palmaris_longus", "flexor_digitorum_superficialis"], lado="R"), DER),
    # ─── Torácica ───
    "O-041": (sed(), osc({"toracica_rot": 15}), T("y+", {"R": mano("spine01", 0.5, (0, 1, 0.1)), "L": mano("shoulder01.L", 0.4, UP)}),
              mus(azul=["erector_spinae_thoracic", "multifidus"]), SED),
    "O-042": (sed(), tem({"toracica_rot": 15, "toracica_incl": 8}), T("y+", {"R": mano("spine01", 0.5, (0, 1, 0.1)), "L": mano("shoulder01.L", 0.4, UP)}),
              mus(rojo=["erector_spinae_thoracic", "multifidus"]), SED),
    "O-043": (pro(), quieto(), T("x-", {"R": mano("spine01", 0.5, UP), "L": mano("spine02", 0.5, UP)}), mus(azul=["erector_spinae_thoracic"]), PRO),
    "O-044": (pro(), quieto(), T("x-", {"R": mano("spine02", 0.3, (0.4, 0, 1)), "L": mano("spine01", 0.6, (0.4, 0, 1))}),
              mus(azul=["erector_spinae_thoracic"]), PRO),
    "O-045": (pro(), quieto(), T("x-", {"R": mano("spine01", 0.4, UP), "L": mano("spine02", 0.6, UP)}), mus(azul=["erector_spinae_thoracic", "multifidus"]), PRO),
    # ─── Costillas ───
    "O-046": (sup(), tem({}), T("x-", {"R": mano("clavicle.R", 0.5, UP), "L": mano("spine01", 0.5, (-0.3, 0, 1))}),
              mus(rojo=["scalene_anterior", "scalene_middle", "pectoralis_minor", "serratus_anterior"], lado="R"), DER),
    "O-047": (sup(), tem({}), T("x-", {"R": mano("spine02", 0.6, (-0.5, 0, 1)), "L": mano("spine03", 0.5, (-0.5, 0, 1))}),
              mus(rojo=["external_oblique", "internal_oblique", "quadratus_lumborum"], lado="R"), DER),
    "O-048": (pro(), osc({"toracica_rot": 4}), T("x-", {"R": mano("spine02", 0.4, (-0.5, 0, 1)), "L": mano("spine01", 0.6, (-0.5, 0, 1))}),
              mus(azul=["erector_spinae_thoracic", "rotatores"]), PRO),
    "O-049": (sup(), osc({"cervical_incl": 8}), T("y+", {"R": mano("clavicle.R", 0.35, (0, 0.5, 1)), "L": mano("head", 0.35, (1, 0.2, 0.2))}),
              mus(azul=["scalene_anterior", "scalene_middle"], lado="R"), CAB),
    # ─── Lumbar ───
    "O-050": (lat(), osc({"lumbar_rot": -10}), T("y-", {"R": mano("pelvis.R", 0.5, (0, -0.3, 1)), "L": mano("spine03", 0.5, (0, 1, 0.5))}),
              mus(azul=["multifidus", "erector_spinae_lumbar"]), {"dir": [0.3, 1, 0.9]}),
    "O-051": (lat(), tem({"lumbar_rot": -12}), T("y-", {"R": mano("pelvis.R", 0.5, (0, -0.3, 1)), "L": mano("spine03", 0.5, (0, 1, 0.5))}),
              mus(rojo=["multifidus", "erector_spinae_lumbar"]), {"dir": [0.3, 1, 0.9]}),
    "O-052": (sup_g(), quieto(), T("x-", {"R": mano("spine05", 0.5, (-0.6, 0, 1)), "L": mano("pelvis.R", 0.5, UP)}),
              mus(azul=["iliopsoas", "quadratus_lumborum"], lado="R"), DER),
    "O-053": (pro(), quieto(), T("x-", {"R": mano("spine03", 0.5, UP), "L": mano("spine02", 0.3, (0.4, 0, 1))}),
              mus(azul=["latissimus_dorsi", "gluteus_maximus", "erector_spinae_lumbar"]), PRO),
    "O-054": (pro(), quieto(), T("x-", {"R": mano("spine04", 0.5, UP), "L": mano("spine03", 0.5, UP)}), mus(azul=["erector_spinae_lumbar"]), PRO),
    # ─── Sacroilíaca y pelvis ───
    "O-055": (sup(cadera_flex_R=70, rodilla_flex_R=90), tem({"cadera_flex.R": 20}),
              T("x-", {"R": mano("upperleg02.R", 0.9, UP), "L": mano("pelvis.R", 0.5, UP)}),
              mus(rojo=["gluteus_maximus", "biceps_femoris"], lado="R"), DER),
    "O-056": (pro(rodilla_flex_R=90), tem({"cadera_re.R": 20}), T("x-", {"R": mano("spine05", 0.8, UP), "L": mano("lowerleg02.R", 0.85, (-1, 0, 0.2))}),
              mus(rojo=["piriformis"], lado="R"), PRO),
    "O-057": (pro(), osc({"lumbar_flex": 3}), T("x-", {"R": mano("spine05", 0.9, UP), "L": mano("spine04", 0.5, UP)}),
              mus(azul=["multifidus", "gluteus_maximus"]), PRO),
    "O-058": (sup_g(), tem({}), T("x-", {"R": mano("upperleg02.R", 0.95, (1, 0, 0.6)), "L": mano("upperleg02.L", 0.95, (-1, 0, 0.6))}),
              mus(rojo=["adductor_longus", "adductor_magnus", "rectus_abdominis"]), DER),
    "O-059": (pro(), quieto(), T("x-", {"R": mano("spine05", 0.9, UP), "L": mano("pelvis.R", 0.5, UP)}), mus(azul=["gluteus_maximus", "piriformis"], lado="R"), PRO),
    # ─── Cadera ───
    "O-060": (sup(cadera_flex_R=70, rodilla_flex_R=90), osc({"cadera_re.R": 25}),
              T("x-", {"R": mano("upperleg02.R", 0.9, UP), "L": mano("lowerleg02.R", 0.8, (-1, 0, 0.3))}),
              mus(azul=["piriformis", "gluteus_medius", "obturator_internus"], lado="R"), DER),
    "O-061": (sup(), osc({"cadera_abd.R": 3}, rel=0.4), T("y-", {"R": mano("lowerleg02.R", 0.8, UP), "L": mano("lowerleg02.R", 0.9, (1, 0, 0.3))}),
              mus(azul=["iliopsoas", "gluteus_minimus"], lado="R"), PIES),
    "O-062": (sup(cadera_flex_R=90, rodilla_flex_R=90), tem({"cadera_re.R": -25}),
              T("x-", {"R": mano("upperleg02.R", 0.9, UP), "L": mano("lowerleg02.R", 0.8, (-1, 0, 0.3))}),
              mus(rojo=["piriformis", "gemellus_superior", "obturator_internus"], lado="R"), DER),
    "O-063": (sup(cadera_flex_R=80, rodilla_flex_R=90, cadera_re_R=15), quieto(),
              T("x-", {"R": mano("upperleg02.R", 0.9, UP), "L": mano("pelvis.R", 0.6, UP)}), mus(azul=["iliopsoas", "piriformis"], lado="R"), DER),
    # ─── Rodilla / tibioperonea ───
    "O-064": (sup(cadera_flex_R=45, rodilla_flex_R=90), osc({"rodilla_flex.R": 6}, rel=0.4),
              T("x-", {"R": mano("lowerleg01.R", 0.12, UP), "L": mano("upperleg02.R", 0.85, UP)}), mus(azul=["popliteus", "semimembranosus"], lado="R"), DER),
    "O-065": (sup(), quieto(), T("x-", {"R": mano("lowerleg01.R", 0.02, UP), "L": mano("upperleg02.R", 0.9, UP)}),
              mus(azul=["rectus_femoris", "vastus_medialis", "vastus_lateralis"], lado="R"), DER),
    "O-066": (sup(cadera_flex_R=45, rodilla_flex_R=90), tem({"cadera_re.R": 12}),
              T("x-", {"R": mano("foot.R", 0.5, UP), "L": mano("lowerleg01.R", 0.2, UP)}), mus(rojo=["popliteus", "semitendinosus"], lado="R"), DER),
    "O-067": (sup(cadera_flex_R=60, rodilla_flex_R=70), quieto(),
              T("x-", {"R": mano("lowerleg01.R", 0.1, (-1, 0, 0.4)), "L": mano("lowerleg02.R", 0.8, UP)}), mus(azul=["popliteus"], lado="R"), DER),
    "O-068": (sup(cadera_flex_R=45, rodilla_flex_R=90), osc({"cadera_re.R": 5}, rel=0.4),
              T("x-", {"R": mano("lowerleg01.R", 0.1, (-1, 0, 0.4)), "L": mano("upperleg02.R", 0.85, UP)}),
              mus(azul=["biceps_femoris", "fibularis_longus"], lado="R"), DER),
    "O-069": (sup(cadera_flex_R=45, rodilla_flex_R=90), tem({"cadera_re.R": 10}),
              T("x-", {"R": mano("lowerleg01.R", 0.1, (-1, 0, 0.4)), "L": mano("foot.R", 0.5, UP)}), mus(rojo=["biceps_femoris"], lado="R"), DER),
    "O-070": (sup(), osc({"tobillo_dorsi.R": 8}), T("y-", {"R": mano("lowerleg02.R", 0.9, (-1, 0, 0.3)), "L": mano("lowerleg02.R", 0.9, (1, 0, 0.3))}),
              mus(azul=["tibialis_posterior", "fibularis_brevis"], lado="R"), PIES),
    # ─── Tobillo / pie (terapeuta a los pies) ───
    "O-071": (sup(), osc({"tobillo_dorsi.R": 4}, rel=0.4), T("y-", {"R": mano("foot.R", 0.3, UP), "L": mano("foot.R", 0.1, (0, -1, 0.2))}),
              mus(azul=["tibialis_anterior", "soleus"], lado="R"), PIES),
    "O-072": (sup(), osc({"tobillo_dorsi.R": 12}), T("y-", {"R": mano("lowerleg02.R", 0.9, UP), "L": mano("foot.R", 0.3, UP)}),
              mus(azul=["soleus", "gastrocnemius"], lado="R"), PIES),
    "O-073": (sup(), tem({"tobillo_dorsi.R": 15}), T("y-", {"R": mano("foot.R", 0.6, (0, -1, 0.1)), "L": mano("lowerleg02.R", 0.6, UP)}),
              mus(rojo=["gastrocnemius", "soleus"], lado="R"), PIES),
    "O-074": (sup(), osc({"tobillo_inv.R": 12}), T("y-", {"R": mano("foot.R", 0.1, (0, -1, 0.2)), "L": mano("lowerleg02.R", 0.9, UP)}),
              mus(azul=["tibialis_posterior", "fibularis_longus"], lado="R"), PIES),
    "O-075": (sup(), osc({"tobillo_inv.R": 8}), T("y-", {"R": mano("foot.R", 0.5, (-1, 0, 0.3)), "L": mano("foot.R", 0.5, (1, 0, 0.3))}),
              mus(azul=["fibularis_longus", "tibialis_posterior"], lado="R"), PIES),
    "O-076": (sup(), osc({"dedos_flex.R": 10}), T("y-", {"R": mano("foot.R", 0.5, UP), "L": mano("foot.R", 0.85, UP)}),
              mus(azul=["extensor_digitorum_brevis", "lumbricals_foot"], lado="R"), PIES),
    "O-077": (sup(), quieto(), T("y-", {"R": mano("foot.R", 0.6, (0, -1, 0.1)), "L": mano("foot.R", 0.3, UP)}),
              mus(azul=["flexor_digitorum_brevis"], lado="R"), PIES),
    "O-078": (sup(dedos_flex_R=15), quieto(), T("y-", {"R": mano("foot.R", 0.5, (0, -1, 0.1)), "L": mano("foot.R", 0.4, UP)}),
              mus(azul=["flexor_digitorum_brevis", "lumbricals_foot"], lado="R"), PIES),
    # ─── Visceral (rodillas flexionadas: abdomen relajado; manos quietas) ───
    "O-079": (sup_g(), quieto(), T("x-", {"R": mano("spine02", 0.2, (-0.5, 0, 1)), "L": mano("spine02", 0.2, (0.5, 0, 1))}), mus(azul=["transversus_abdominis"]), DER),
    "O-080": (sup_g(), quieto(), T("x-", {"R": mano("spine02", 0.1, (-0.7, 0, 1)), "L": mano("spine03", 0.6, (-0.4, 0, 1))}), {}, DER),
    "O-081": (sup_g(), quieto(), T("x-", {"R": mano("spine02", 0.2, (0.4, 0, 1)), "L": mano("spine03", 0.6, (0.3, 0, 1))}), {}, DER),
    "O-082": (sup_g(), quieto(), T("x-", {"R": mano("spine03", 0.4, (-0.3, 0, 1)), "L": mano("spine03", 0.8, (0, 0, 1))}), {}, DER),
    "O-083": (sup_g(), quieto(), T("x-", {"R": mano("spine04", 0.5, (0.2, 0, 1)), "L": mano("spine04", 0.5, (-0.4, 0, 1))}), {}, DER),
    "O-084": (sup_g(), quieto(), T("x-", {"R": mano("spine04", 0.3, (-0.7, 0, 1)), "L": mano("spine04", 0.3, (0.7, 0, 1))}), {}, DER),
    "O-085": (sup_g(), quieto(), T("x-", {"R": mano("spine03", 0.6, (-0.6, 0, 1)), "L": mano("spine04", 0.4, (-0.5, 0, 1))}), mus(azul=["iliopsoas"], lado="R"), DER),
    "O-086": (sup_g(), quieto(), T("x-", {"R": mano("spine05", 0.6, (0, 0, 1)), "L": mano("spine05", 0.2, (0.3, 0, 1))}), {}, DER),
    # ─── Craneal (terapeuta a la cabecera; manos quietas) ───
    "O-087": (sup(), quieto(), T("y+", NUCA()), mus(azul=["rectus_capitis_posterior_minor", "semispinalis_capitis"]), CAB),
    "O-088": (sup(), quieto(), T("y+", NUCA()), mus(azul=SUBOC), CAB),
    "O-089": (sup(), quieto(), T("y+", SIENES(0.55)), mus(azul=["temporalis"]), CAB),
    "O-090": (sup(), quieto(), T("y+", {"R": mano("head", 0.8, (-0.4, 0, 1)), "L": mano("head", 0.8, (0.4, 0, 1))}), {}, CAB),
    "O-091": (sup(), quieto(), T("y+", {"R": mano("head", 0.75, (-1, 0.4, 0.4)), "L": mano("head", 0.75, (1, 0.4, 0.4))}), mus(azul=["temporalis"]), CAB),
    "O-092": (sup(), quieto(), T("y+", SIENES(0.4)), mus(azul=["temporalis"]), CAB),
    "O-093": (sup(), quieto(), T("y+", SIENES(0.35)), mus(azul=["temporalis", "semispinalis_capitis"]), CAB),
    "O-094": (sup(), quieto(), T("y+", {"R": mano("head", 0.85, (-0.3, 0.6, 0.7)), "L": mano("head", 0.85, (0.3, 0.6, 0.7))}), {}, CAB),
}


def _fix_angles(pl):
    """sup(hombro_abd_R=40) → {'hombro_abd.R': 40} (kwargs no admiten el punto)."""
    a = pl["base"]["angulos"]
    for k in list(a):
        if k.endswith(("_R", "_L")):
            a[k[:-2] + "." + k[-1]] = a.pop(k)
    # si la ficha coloca un brazo/pierna, ese miembro ya no se "asienta" en la camilla (lo sostiene el terapeuta)
    for side in ("L", "R"):
        brazo = any(k.endswith("." + side) and k.split(".")[0] in ("hombro_abd", "hombro_flex", "codo_flex") for k in a)
        pierna = any(k.endswith("." + side) and k.split(".")[0] in ("cadera_flex", "rodilla_flex") for k in a)
        quitar = ({f"hombro_flex.{side}"} if brazo else set()) | ({f"cadera_flex.{side}"} if pierna else set())
        pl["base"]["asentar"] = [x for x in pl["base"].get("asentar", []) if x["art"] not in quitar]
        def _toca(c):
            g = c["grupo"] if isinstance(c["grupo"], list) else [c["grupo"]]
            return (brazo and any(x.startswith(("wrist." + side, "finger")) and x.endswith(side) for x in g)) or \
                   (pierna and any(x in (f"foot.{side}",) for x in g))
        pl["contactos"] = [c for c in pl["contactos"] if not _toca(c)]
    return pl


for id_, (pl, kd, ter, m, cam) in O.items():
    if SOLO and id_ not in SOLO:
        continue
    pl = _fix_angles(pl)
    if pl["base"]["orientacion"] == "sedente":
        _tolerante(pl, kd[1])
        H.append(write({"id": id_, "duracion_s": round(kd[0], 2), **pl, "keys": kd[1], "musculos": m, "articulacion_resaltada": [],
                        "props": [], "variantes": ["gym"], "nota_variantes": NOTA, "terapeuta": ter,
                        "camara": {**pl["camara"], **cam}}))
    else:
        H.append(ost(id_, pl, kd, ter, m, camara=cam))

print(f"Generadas {len(H)} fichas de osteopatía.")
