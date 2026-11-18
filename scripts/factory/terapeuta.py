"""
Fábrica de video — TERAPEUTA para osteopatía (se ejecuta con exec() DENTRO de engine.py, comparte sus variables).

Ficha:  "terapeuta": {
    "lado": "derecha" | "izquierda" | "cabeza" | "pies",     # dónde está de pie respecto a la paciente
    "manos": {"R": {"hueso": "head", "a": 0.5, "desde": [0, 1, -0.3], "dedos": [0, 0, -1]},
              "L": {...}},                                    # "a" = posición a lo largo del hueso (0 cabeza, 1 cola)
    "altura": 0.72,                                           # altura de la camilla (si la paciente está en camilla)
    "presion_mm": 4                                           # empuje rítmico de las manos (técnicas de tejidos blandos)
}
Las manos quedan PEGADAS a la piel de la paciente (vacíos hijos de sus huesos): si la paciente se mueve
(movilización pasiva) las manos la acompañan; brazos con IK, tronco inclinado lo necesario para llegar.
"""
import math
import bpy
from mathutils import Vector, Matrix, Quaternion

TS = SPEC["terapeuta"]
T_BLEND = os.path.join(ROOT, "assets/rigs/terapeuta_m40.blend")
FLOOR_Z = floor.location.z + 0.01

with bpy.data.libraries.load(T_BLEND, link=False) as (_src, _dst):
    _dst.objects = list(_src.objects)
T_OBJS = []
for _o in _dst.objects:
    scene.collection.objects.link(_o)
    T_OBJS.append(_o)
trig = next(o for o in T_OBJS if o.type == "ARMATURE")
tbody = next(o for o in T_OBJS if o.type == "MESH" and o.name.startswith("Terapeuta"))
for _o in T_OBJS:
    if _o.type != "MESH":
        continue
    base_n = _o.name.split(".")[0]
    _o.color = {"Terapeuta": (0.55, 0.53, 0.52, 1), "Ropa": (0.86, 0.88, 0.90, 1),
                "Pelo": (0.18, 0.16, 0.15, 1), "Cejas": (0.18, 0.16, 0.15, 1)}.get(base_n, (0.6, 0.6, 0.6, 1))
    if base_n in ("Terapeuta", "Ropa"):
        _s = _o.modifiers.new("Suavizado", "SUBSURF")
        _s.levels = _s.render_levels = 1
for pb in trig.pose.bones:
    pb.rotation_mode = "QUATERNION"
T_REST = {b.name: b.matrix_local.to_3x3() for b in trig.data.bones}

# ── Contactos sobre la piel de la paciente (frame 1) ──
scene.frame_set(1)
update()
_bvh_t = _bvh_now()
_inv = body.matrix_world.inverted()
_rot = body.matrix_world.to_3x3()
CONTACTS = {}
for s, h in TS["manos"].items():
    pb = rig.pose.bones[h["hueso"]]
    P = rig.matrix_world @ pb.head.lerp(pb.tail, h.get("a", 0.5))
    d = Vector(h.get("desde", (0, 0, 1))).normalized()
    hit = _bvh_t.ray_cast(_inv @ (P + d * 0.6), _inv.to_3x3() @ -d, 1.2)
    if hit[0] is None:
        raise SystemExit(f"TERAPEUTA: la mano {s} no encuentra la piel ({h['hueso']})")
    C = body.matrix_world @ hit[0]
    n = (_rot @ hit[1]).normalized()
    if n.dot(d) < 0:
        n = -n
    CONTACTS[s] = (C, n, h)

# ── Posición del terapeuta ──
_co = eval_coords()[BODY_MASK]
_mid = sum((c for c, _, _ in CONTACTS.values()), Vector((0, 0, 0))) / len(CONTACTS)
lado = TS.get("lado", "derecha")
GAP = TS.get("distancia", 0.22)
lado = {"derecha": "x-", "izquierda": "x+", "cabeza": "y+", "pies": "y-"}.get(lado, lado)
_tab = bpy.data.objects.get("Camilla")
if _tab:                                                   # de pie junto al BORDE de la camilla
    _bb = [_tab.matrix_world @ Vector(c) for c in _tab.bound_box]
    _x0, _x1 = min(v.x for v in _bb), max(v.x for v in _bb)
    _y0, _y1 = min(v.y for v in _bb), max(v.y for v in _bb)
else:
    _x0, _x1 = float(_co[:, 0].min()), float(_co[:, 0].max())
    _y0, _y1 = float(_co[:, 1].min()), float(_co[:, 1].max())
GAP = TS.get("distancia", 0.14 if _tab else 0.22)
if lado == "x-":
    root = Vector((_x0 - GAP, _mid.y, FLOOR_Z)); yaw = 90
elif lado == "x+":
    root = Vector((_x1 + GAP, _mid.y, FLOOR_Z)); yaw = -90
elif lado == "y+":
    root = Vector((_mid.x, _y1 + GAP, FLOOR_Z)); yaw = 0
else:
    root = Vector((_mid.x, _y0 - GAP, FLOOR_Z)); yaw = 180
root += Vector(TS.get("desplazar", (0, 0, 0)))
trig.location = root
trig.rotation_euler = (0, 0, math.radians(yaw))
update()
FWD = Vector((math.sin(math.radians(yaw)), -math.cos(math.radians(yaw)), 0))


def _set_rot(bone, axis_arm, deg):
    """Rotación en el marco de la armadura (de reposo) → cuaternión local del hueso."""
    R = Matrix.Rotation(math.radians(deg), 3, axis_arm)
    trig.pose.bones[bone].rotation_quaternion = (T_REST[bone].inverted() @ R @ T_REST[bone]).to_quaternion()


# ── Inclinación del tronco (cadera como bisagra) hasta que los hombros lleguen a las manos ──
_hip = trig.matrix_world @ trig.pose.bones["spine05"].head
_sh0 = sum((trig.matrix_world @ trig.pose.bones[f"upperarm01.{s}"].head for s in ("L", "R")), Vector()) / 2
_torso = (_sh0 - _hip).length
_reach = TS.get("alcance", 0.50)
lean = TS.get("inclinacion")
if lean is None:
    lean = 0
    for a in range(0, 75, 3):
        sh = _hip + (FWD * math.sin(math.radians(a)) + Vector((0, 0, math.cos(math.radians(a))))) * _torso
        if max((sh - c).length for c, _, _ in CONTACTS.values()) <= _reach:
            lean = a
            break
    else:
        lean = 70
_flex = TS.get("rodillas", max(0, lean - 35) * 0.6)       # si se inclina mucho, también flexiona rodillas
for b_, w in (("spine05", 0.45), ("spine04", 0.3), ("spine03", 0.25)):
    _set_rot(b_, Vector((1, 0, 0)), lean * w)
_set_rot("neck01", Vector((1, 0, 0)), 10)
for s in ("L", "R"):
    _set_rot(f"upperleg01.{s}", Vector((1, 0, 0)), -_flex)
    _set_rot(f"lowerleg01.{s}", Vector((1, 0, 0)), 2 * _flex)
    _set_rot(f"foot.{s}", Vector((1, 0, 0)), -_flex)
update()
if _flex:                                                   # al flexionar rodillas, los pies siguen en el suelo
    _fz = min((trig.matrix_world @ trig.pose.bones[f"foot.{s}"].tail).z for s in ("L", "R"))
    trig.location.z += FLOOR_Z + 0.03 - _fz
    update()
print(f"TERAPEUTA lado={lado} inclinacion={lean} rodillas={_flex:.0f}")

# ── Ejes de la mano en reposo: palma y dedos ──
def _palm_local(s):
    b = trig.data.bones
    r = (b[f"finger3-3.{s}"].tail_local - b[f"wrist.{s}"].head_local).normalized()
    fx = (T_REST[f"finger3-1.{s}"] @ Vector((1, 0, 0))).normalized()
    palm = fx.cross(r).normalized()
    # la palma mira hacia el lado contrario al dorso (el dorso tiene los nudillos "hacia atrás" en pose A):
    # se comprueba con la flexión de los dedos, que lleva las puntas hacia la palma
    tip = b[f"finger3-3.{s}"].tail_local
    pb = trig.pose.bones[f"finger3-1.{s}"]
    if (Matrix.Rotation(math.radians(60), 3, fx) @ (tip - b[f"finger3-1.{s}"].head_local)).dot(palm) < 0:
        palm = -palm
    W = T_REST[f"wrist.{s}"]
    return (W.inverted() @ palm).normalized(), (W.inverted() @ r).normalized()


T_EMPTIES = []
for s, (C, n, h) in CONTACTS.items():
    palm_l, fing_l = _palm_local(s)
    sh = trig.matrix_world @ trig.pose.bones[f"upperarm01.{s}"].head
    tdir = Vector(h["dedos"]) if h.get("dedos") else (C - sh)
    tdir = (tdir - n * tdir.dot(n)).normalized()            # dedos en el plano de la piel
    # orientación deseada de la muñeca en el mundo: fing_l → tdir, palm_l → -n
    Mw = Matrix((tdir, -n, tdir.cross(-n))).transposed()          # columnas: dedos, palma, tercera
    Ml = Matrix((fing_l, palm_l, fing_l.cross(palm_l))).transposed()
    Rw = Mw @ Ml.inverted()                                        # rotación mundo de los ejes locales de la muñeca
    W = C + n * TS.get("grosor_mano", 0.018) - tdir * 0.075       # muñeca: 7,5 cm antes del centro de la palma
    e = bpy.data.objects.new(f"T_mano_{s}", None)
    scene.collection.objects.link(e)
    e.parent, e.parent_type, e.parent_bone = rig, "BONE", h["hueso"]
    update()
    e.matrix_world = Matrix.Translation(W) @ Rw.to_4x4()
    T_EMPTIES.append(e)
    pole = bpy.data.objects.new(f"T_polo_{s}", None)
    scene.collection.objects.link(pole)
    side = -1 if s == "R" else 1
    lat = FWD.cross(Vector((0, 0, 1))) * (-side)                  # hacia afuera del cuerpo del terapeuta
    pole.location = sh + lat * 0.5 + Vector((0, 0, -0.35)) - FWD * 0.2
    ik = trig.pose.bones[f"lowerarm02.{s}"].constraints.new("IK")
    ik.target, ik.chain_count = e, 4
    ik.pole_target, ik.pole_angle = pole, math.radians(-90)
    cr = trig.pose.bones[f"wrist.{s}"].constraints.new("COPY_ROTATION")
    cr.target = e
    for k in (1, 2, 3):                                            # dedos apenas flexionados, apoyados
        for f_ in (2, 3, 4, 5):
            trig.pose.bones[f"finger{f_}-{k}.{s}"].rotation_quaternion = Quaternion((1, 0, 0), math.radians(8))
update()

# ── Para la cámara: el terapeuta de la cintura para arriba entra en el encuadre ──
def terapeuta_puntos():
    """Encuadre: la zona tratada de la paciente (radio alrededor de las manos) + el terapeuta de la cintura arriba."""
    R_ = TS.get("encuadre_radio", 0.55)
    out = []
    for fr in range(1, FRAME_END + 1, 12):
        scene.frame_set(fr)
        co = eval_coords()[BODY_MASK]
        sel = co[np.linalg.norm(co - np.array(list(_mid)), axis=1) < R_]
        if len(sel):
            out += [Vector(sel.min(0).tolist()), Vector(sel.max(0).tolist())]
    scene.frame_set(1)
    me = tbody.evaluated_get(deps()).to_mesh()
    pts_ = [tbody.matrix_world @ me.vertices[i].co for i in range(0, len(me.vertices), 40)]
    tbody.to_mesh_clear()
    zc = min(c.z for c, _, _ in CONTACTS.values()) - 0.15
    return out + [p for p in pts_ if p.z > zc]
