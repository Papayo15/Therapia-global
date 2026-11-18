"""
Fábrica de video — motor de movimiento (se ejecuta dentro de Blender).

  blender -b -P scripts/factory/engine.py -- \
      --spec data/motion_specs/F-CAD-007.json --variant gym --out renders/F-CAD-007--gym

Principio: la física la decide este motor (rig + IK + contactos), no la IA.
Salidas en --out:
  gris/       PNG del maniquí gris (referencia para video-to-video)
  mascara/    PNG RGBA de la capa muscular (rojo/naranja/azul/hueso)
  silueta/    PNG RGBA de la silueta del cuerpo (para recortar la máscara)
  reporte.json  validación: contactos, penetración, loop, ROM
  escena.blend  escena final (para depurar)

Convenciones anatómicas (espacio armature; la paciente mira hacia -Y, +X = su izquierda):
  ángulos positivos = flexión / abducción / rotación externa / inclinación y
  rotación hacia la izquierda (columna). El motor espeja los ejes Y/Z para el lado derecho.
"""
import argparse
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--spec", required=True)
ap.add_argument("--variant", default="gym", choices=["gym", "casa"])
ap.add_argument("--out", required=True)
ap.add_argument("--avatar", default=os.path.join(ROOT, "assets/rigs/avatar_f40.blend"))
ap.add_argument("--no-render", action="store_true")
ap.add_argument("--solo-mascara", action="store_true", help="Re-renderiza sólo la capa muscular (el gris ya existe)")
ap.add_argument("--capa", choices=["atlas", "propia", "capsulas"], help="Capa muscular (por defecto: la de la ficha o 'propia')")
ap.add_argument("--still-capa", type=int, help="Foto de la capa muscular sobre el cuerpo en este frame (comparaciones)")
ap.add_argument("--still", type=int, help="Renderiza solo este frame del pase gris (pruebas rápidas)")
args = ap.parse_args(argv)

SPEC = json.load(open(args.spec, encoding="utf-8"))
LANDMARKS = json.load(open(os.path.join(ROOT, "data/muscle_landmarks.json"), encoding="utf-8"))["musculos"]
ROM = json.load(open(os.path.join(ROOT, "data/biomechanics_movements.json"), encoding="utf-8"))
os.makedirs(args.out, exist_ok=True)

FPS = SPEC.get("fps", 24)
DUR = float(SPEC["duracion_s"])
assert 5.0 <= DUR <= 10.0, "Regla del proyecto: clips de 5 a 10 s"
FRAME_END = int(round(DUR * FPS))          # el frame END+1 == frame 1 (loop perfecto)


def frame_of(t):
    return 1 + int(round(t * FPS))


# ─── Articulaciones clínicas → huesos ─────────────────────────────────────────
# (hueso, eje, signo_lado_izquierdo, peso). Ejes Y/Z se espejan para el lado R.
JOINTS = {
    "cadera_flex":    [("upperleg01.{s}", "X", -1, 1.0)],
    "cadera_abd":     [("upperleg01.{s}", "Y", -1, 1.0)],
    "cadera_re":      [("upperleg01.{s}", "Z", +1, 1.0)],
    "rodilla_flex":   [("lowerleg01.{s}", "X", +1, 1.0)],
    "tobillo_dorsi":  [("foot.{s}", "X", -1, 1.0)],
    "tobillo_inv":    [("foot.{s}", "Y", +1, 1.0)],
    "dedos_flex":     [(f"toe{n}-{k}.{{s}}", "LX", +1, w) for n in (2, 3, 4, 5) for k, w in ((1, 1.0), (2, 0.6), (3, 0.4))]
                      + [("toe1-1.{s}", "LX", +1, 1.0), ("toe1-2.{s}", "LX", +1, 0.6)],
    "hallux_flex":    [("toe1-1.{s}", "LX", +1, 1.0), ("toe1-2.{s}", "LX", +1, 0.6)],
    "dedos_menores_flex": [(f"toe{n}-{k}.{{s}}", "LX", +1, w) for n in (2, 3, 4, 5) for k, w in ((1, 1.0), (2, 0.6), (3, 0.4))],
    "hombro_flex":    [("upperarm01.{s}", "X", -1, 1.0)],
    "hombro_abd":     [("upperarm01.{s}", "Y", -1, 1.0)],
    "hombro_re":      [("upperarm01.{s}", "Z", +1, 1.0)],
    "hombro_abd_h":   [("upperarm01.{s}", "ZO", +1, 1.0)],      # abducción horizontal (eje vertical, tras la flexión)
    "codo_flex":      [("lowerarm01.{s}", "X", -1, 1.0)],
    "antebrazo_prono": [("lowerarm02.{s}", "LONG", +1, 1.0)],
    "muneca_ext":     [("wrist.{s}", "X", +1, 1.0)],
    # muñeca/mano con ejes anatómicos medidos sobre la mano (ver HAND_AXES)
    "muneca_flex":    [("wrist.{s}", "HFLEX", +1, 1.0)],
    "muneca_rad":     [("wrist.{s}", "HRAD", +1, 1.0)],
    "dedos_separar":  [("finger2-1.{s}", "LZ", +1, 1.0), ("finger4-1.{s}", "LZ", -1, 0.8), ("finger5-1.{s}", "LZ", -1, 1.3)],
    "dedos_ext":      [(f"finger{n}-{k}.{{s}}", "LX", -1, w) for n in (2, 3, 4, 5) for k, w in ((1, 1.0), (2, 0.3), (3, 0.2))],
    "pulgar_oposicion": [("finger1-1.{s}", "LZ", +1, 0.7), ("finger1-1.{s}", "LX", +1, 0.6), ("finger1-2.{s}", "LX", +1, 0.4),
                         ("finger1-3.{s}", "LX", +1, 0.3)],
    "pulgar_abd":     [("finger1-1.{s}", "LZ", +1, 1.0)],
    "atm_apertura":   [("jaw", "X", +1, 1.0)],
    "atm_lateral":    [("jaw", "Z", +1, 1.0)],
    "atm_protrusion": [("jaw", "TY", -1, 0.001)],          # valor en mm hacia delante
    "escapula_elev":  [("clavicle.{s}", "Y", -1, 0.7), ("shoulder01.{s}", "Y", -1, 0.3)],
    "escapula_prot":  [("clavicle.{s}", "Z", -1, 0.7), ("shoulder01.{s}", "Z", -1, 0.3)],
    "escapula_rot_sup": [("shoulder01.{s}", "Y", -1, 1.0)],
    "toracica_rot":   [("spine02", "Z", +1, .5), ("spine01", "Z", +1, .5)],
    "toracica_incl":  [("spine02", "Y", +1, .5), ("spine01", "Y", +1, .5)],
    "lumbar_rot":     [("spine05", "Z", +1, .3), ("spine04", "Z", +1, .35), ("spine03", "Z", +1, .35)],
    "mano_cerrar":    [(f"finger{n}-{k}.{{s}}", "LX", +1, w) for n in (2, 3, 4, 5) for k, w in ((1, 0.9), (2, 1.0), (3, 0.7))]
                      + [("finger1-2.{s}", "LX", +1, 0.4), ("finger1-3.{s}", "LX", +1, 0.4)],
    "lumbar_incl":    [("spine05", "Y", +1, .30), ("spine04", "Y", +1, .35), ("spine03", "Y", +1, .35)],
    "lumbar_flex":    [("spine05", "X", +1, .30), ("spine04", "X", +1, .35), ("spine03", "X", +1, .35)],
    "toracica_flex":  [("spine02", "X", +1, .5), ("spine01", "X", +1, .5)],
    "cervical_flex":  [("neck01", "X", +1, .4), ("neck02", "X", +1, .35), ("neck03", "X", +1, .25)],
    "cervical_incl":  [("neck01", "Y", +1, .4), ("neck02", "Y", +1, .35), ("neck03", "Y", +1, .25)],
    "cervical_rot":   [("neck01", "Z", +1, .4), ("neck02", "Z", +1, .35), ("neck03", "Z", +1, .25)],
}
# Mapeo a data/biomechanics_movements.json para validar rangos.
ROM_KEYS = {
    "cadera_flex": ("hip_flexion", "hip_extension"),
    "cadera_abd": ("hip_abduction", "hip_adduction"),
    "cadera_re": ("hip_external_rotation", "hip_internal_rotation"),
    "rodilla_flex": ("knee_flexion", None),
    "tobillo_dorsi": ("ankle_dorsiflexion", "ankle_plantarflexion"),
    "hombro_flex": ("shoulder_flexion", "shoulder_extension"),
    "hombro_abd": ("shoulder_abduction", "shoulder_adduction"),
    "hombro_re": ("shoulder_external_rotation", "shoulder_internal_rotation"),
    "codo_flex": ("elbow_flexion", None),
    "lumbar_flex": ("lumbar_flexion", "lumbar_extension"),
    "cervical_flex": ("cervical_flexion", "cervical_extension"),
    "cervical_incl": ("cervical_lateral_flexion", None),
    "cervical_rot": ("cervical_rotation", None),
}

AXES = {"X": Vector((1, 0, 0)), "Y": Vector((0, 1, 0)), "Z": Vector((0, 0, 1))}
COLORS = {
    "concentrico": (0.95, 0.12, 0.10), "isometrico": (0.95, 0.12, 0.10),
    "excentrico": (1.00, 0.50, 0.05), "elongacion": (0.15, 0.45, 1.00),
    "hueso": (1.00, 0.93, 0.78),
}


def split_joint(name):
    """'cadera_flex.R' → ('cadera_flex', 'R'); 'lumbar_flex' → ('lumbar_flex', None)."""
    return (name.rsplit(".", 1)[0], name.rsplit(".", 1)[1]) if "." in name else (name, None)


# ─── Carga del avatar ────────────────────────────────────────────────────────
bpy.ops.wm.open_mainfile(filepath=args.avatar)
scene = bpy.context.scene
rig = bpy.data.objects["Paciente_Rig"]
body = bpy.data.objects["Paciente"]
for pb in rig.pose.bones:
    pb.rotation_mode = "QUATERNION"
# Atlas muscular Z-Anatomy (CC BY-SA 4.0) ya ajustado al rig: colección "Atlas" del avatar.
ATLAS_OBJS = {o.name: o for o in bpy.data.objects if o.name.startswith("ATL::")}
ATLAS_MAP = json.load(open(os.path.join(ROOT, "data/atlas_map.json"), encoding="utf-8"))["mapa"] if ATLAS_OBJS else {}
CAPA = args.capa or SPEC.get("capa") or "atlas"
USE_ATLAS = bool(ATLAS_OBJS) and CAPA == "atlas"
USE_OWN = CAPA == "propia"
WEAR = {n: bpy.data.objects[n] for n in ("Ropa", "Pelo", "Cejas") if n in bpy.data.objects}
WEAR_COLOR = {"Ropa": (0.50, 0.52, 0.55, 1), "Pelo": (0.22, 0.19, 0.17, 1), "Cejas": (0.22, 0.19, 0.17, 1)}
for n, o in WEAR.items():
    o.color = WEAR_COLOR[n]
if "Ropa" in WEAR:
    _s = WEAR["Ropa"].modifiers.new("Suavizado", "SUBSURF")
    _s.levels = _s.render_levels = 1
sub = body.modifiers.new("Suavizado", "SUBSURF")
sub.levels = sub.render_levels = 1
class _Masks:
    """Todos los modificadores MASK del cuerpo (helpers + piel tapada por la ropa)."""
    mods = [m for m in body.modifiers if m.type == "MASK"]

    @property
    def show_viewport(self):
        return self.mods[0].show_viewport

    @show_viewport.setter
    def show_viewport(self, v):
        for m in self.mods:
            m.show_viewport = v


MASK_MOD = _Masks()
scene.frame_start, scene.frame_end = 1, FRAME_END
scene.render.fps = FPS


def update():
    bpy.context.view_layer.update()


def deps():
    return bpy.context.evaluated_depsgraph_get()


REST = {b.name: b.matrix_local.to_3x3() for b in rig.data.bones}
REST_INV = {k: v.inverted() for k, v in REST.items()}


def rest_dir(bone):
    return (REST[bone] @ Vector((0, 1, 0))).normalized()


# Posición anatómica: brazos de "pose A" → al costado (8° de abducción), codo y muñeca rectos.
NEUTRAL = {}
for s, sx in (("L", 1), ("R", -1)):
    target = Vector((sx * math.sin(math.radians(8)), 0, -math.cos(math.radians(8))))
    NEUTRAL[f"upperarm01.{s}"] = rest_dir(f"upperarm01.{s}").rotation_difference(target).to_matrix()
    NEUTRAL[f"lowerarm01.{s}"] = rest_dir(f"lowerarm01.{s}").rotation_difference(rest_dir(f"upperarm02.{s}")).to_matrix()
    NEUTRAL[f"wrist.{s}"] = rest_dir(f"wrist.{s}").rotation_difference(rest_dir(f"lowerarm02.{s}")).to_matrix()
    for n in (2, 3, 4, 5):                      # dedos largos rectos (mano relajada abierta)
        for seg in (2, 3):
            b, par = f"finger{n}-{seg}.{s}", f"finger{n}-{seg - 1}.{s}"
            NEUTRAL[b] = rest_dir(b).rotation_difference(rest_dir(par)).to_matrix()

# Datos de reposo (de pie) — sirven para apoyar pies planos en otras posiciones.
update()
STAND = {s: {"tobillo": rig.matrix_world @ rig.data.bones[f"lowerleg02.{s}"].tail_local,
             "pie_rot": (rig.matrix_world @ rig.data.bones[f"foot.{s}"].matrix_local).to_quaternion()}
         for s in ("L", "R")}


def apply_pose(angles):
    """angles: {'cadera_flex.L': 30, 'lumbar_flex': 10, '@pitch': 5, ...} en grados (absolutos).
    '@pitch/@roll/@yaw' giran el cuerpo entero (respecto a la orientación base)."""
    per_bone = {}
    if "ORIENT_ROT" in globals():
        o = ORIENT_ROT[orient]
        rig.rotation_euler = (math.radians(o[0] + angles.get("@pitch", 0)),
                              math.radians(o[1] + angles.get("@roll", 0)),
                              math.radians(o[2] + angles.get("@yaw", 0)))
    for name, deg in angles.items():
        if name.startswith("@"):
            continue
        joint, side = split_joint(name)
        if joint not in JOINTS:
            raise SystemExit(f"Articulación desconocida en spec: {name}")
        for bone_t, axis, sign_l, w in JOINTS[joint]:
            bone = bone_t.format(s=side) if side else bone_t
            sign = sign_l if (side != "R" or axis in ("X", "LX", "LZ", "HFLEX", "HRAD")) else -sign_l   # Y, Z, ZO se espejan
            per_bone.setdefault(bone, []).append((axis, sign * w * deg))
            if axis == "LONG":
                LONG_AXIS[bone] = rest_dir(bone)
            elif axis == "LX":
                LONG_AXIS[bone] = (REST[bone] @ Vector((1, 0, 0))).normalized()
            elif axis == "LZ":
                LONG_AXIS[bone] = (REST[bone] @ Vector((0, 0, 1))).normalized()
            elif axis in ("HFLEX", "HRAD"):
                LONG_AXIS[bone] = HAND_AXES[side][axis]
    for pb in rig.pose.bones:
        tvec = sum((Vector((0, d, 0)) for a, d in per_bone.get(pb.name, []) if a == "TY"), Vector((0, 0, 0)))
        pb.location = REST_INV[pb.name] @ tvec
        R = NEUTRAL.get(pb.name, Matrix.Identity(3))
        # orden: flexión (X) → abducción (Y) → rotación (Z), aplicadas en marco armature de reposo
        # orden anatómico: rotación axial (más interna) → abducción → flexión (más externa)
        for axis in ("LONG", "LX", "LZ", "HFLEX", "HRAD", "Z", "Y", "X", "ZO"):
            total = sum(d for a, d in per_bone.get(pb.name, []) if a == axis)
            if total:
                vec = LONG_AXIS[pb.name] if axis in ("LONG", "LX", "LZ", "HFLEX", "HRAD") else AXES["Z" if axis == "ZO" else axis]
                R = Matrix.Rotation(math.radians(total), 3, vec) @ R
        if pb.name in EXTRA_ROT:
            R = EXTRA_ROT[pb.name] @ R
        basis = REST_INV[pb.name] @ R @ REST[pb.name]
        pb.rotation_quaternion = basis.to_quaternion()


EXTRA_ROT = {}   # rotaciones adicionales (contrarrotación del pivote)
LONG_AXIS = {}


def calibrate_humeral_rotation():
    """Cero clínico de rotación del hombro: con codo a 90°, el antebrazo apunta al frente (-Y)."""
    for s in ("L", "R"):
        for _ in range(3):
            apply_pose({f"codo_flex.{s}": 90})
            update()
            e = rig.pose.bones[f"lowerarm01.{s}"]
            d = (e.tail - e.head)
            ang = math.atan2(d.x, -d.y)          # + = antebrazo hacia +X
            NEUTRAL[f"upperarm01.{s}"] = Matrix.Rotation(-ang, 3, "Z") @ NEUTRAL[f"upperarm01.{s}"]
        print(f"CALIBRACION hombro {s}: residuo {math.degrees(ang):.2f}°")
    apply_pose({})


def _hand_axes():
    """Ejes anatómicos de la muñeca en el marco de reposo: flexión (punta → palma) y desviación radial."""
    out = {}
    for s in ("L", "R"):
        b = rig.data.bones
        r = (b[f"finger3-3.{s}"].tail_local - b[f"wrist.{s}"].head_local).normalized()
        radial = (b[f"finger1-1.{s}"].head_local - b[f"finger5-1.{s}"].head_local)
        radial = (radial - r * radial.dot(r)).normalized()
        fx = (REST[f"finger3-1.{s}"] @ Vector((1, 0, 0))).normalized()
        palm = fx.cross(r).normalized()
        if (r.cross(palm)).dot(fx) < 0:
            palm = -palm
        out[s] = {"HFLEX": r.cross(palm).normalized(), "HRAD": r.cross(radial).normalized()}
    return out


HAND_AXES = _hand_axes()
calibrate_humeral_rotation()

# ─── Índices de vértices por grupo (para contactos y asentado) ───────────────
VG_NAMES = {g.index: g.name for g in body.vertex_groups}
_GROUP_VERTS = {}
for v in body.data.vertices:
    for g in v.groups:
        if g.weight > 0.5:
            _GROUP_VERTS.setdefault(VG_NAMES[g.group], []).append(v.index)
_SKIPG = {"Left", "Right", "Mid", "body", "HelperGeometry", "JointCubes"}
VERT_GROUP = []
for v in body.data.vertices:
    gs = [g for g in v.groups if VG_NAMES[g.group] not in _SKIPG]
    VERT_GROUP.append(VG_NAMES[max(gs, key=lambda g: g.weight).group] if gs else "?")
BODY_MASK = np.array([any(VG_NAMES[g.group] == "body" for g in v.groups) for v in body.data.vertices])


def eval_coords():
    """Coordenadas mundo del cuerpo deformado (sin subsurf, índices = malla base)."""
    sub.show_viewport = MASK_MOD.show_viewport = False
    update()
    ev = body.evaluated_get(deps())
    me = ev.to_mesh()
    co = np.empty(len(me.vertices) * 3)
    me.vertices.foreach_get("co", co)
    ev.to_mesh_clear()
    sub.show_viewport = MASK_MOD.show_viewport = True
    co = co.reshape(-1, 3)
    M = np.array(body.matrix_world)
    return co @ M[:3, :3].T + M[:3, 3]


def group_min_z(co, groups):
    idx = [i for g in groups for i in _GROUP_VERTS.get(g, [])]
    return float(co[idx, 2].min()) if idx else None


# ─── Músculos: cápsulas que siguen al esqueleto ──────────────────────────────
ANAT_DIR = {"lateral": (1, 0, 0), "medial": (-1, 0, 0), "anterior": (0, -1, 0),
            "posterior": (0, 1, 0), "superior": (0, 0, 1), "inferior": (0, 0, -1)}


def anat_vector(spec_dir, side):
    v = Vector((0, 0, 0))
    for part in spec_dir.split("+"):
        v += Vector(ANAT_DIR[part])
    if side == "R":
        v.x = -v.x
    return v.normalized()


update()
_bvh = BVHTree.FromObject(body, deps())


def landmark(lm, side, r_sup=None):
    bone = lm["hueso"].format(s=side) if "{s}" in lm["hueso"] else lm["hueso"]
    b = rig.data.bones[bone]
    p = b.head_local.lerp(b.tail_local, lm.get("t", 0.5))
    p = rig.matrix_world @ p
    d = anat_vector(lm["dir"], side)
    hit = _bvh.ray_cast(p, d)
    dist = (hit[0] - p).length if hit[0] else 0.05
    if r_sup is not None:                     # músculo superficial: centro a medio radio bajo la piel
        return bone, p + d * max(dist * 0.3, dist - 0.5 * r_sup)
    return bone, p + d * dist * lm.get("prof", 0.6)


def make_capsule(name, a, b, r0, r1, bone_a, bone_b, color):
    """Cápsula A→B con 'Stretch To': se estira con la articulación."""
    ea = bpy.data.objects.new(f"{name}_A", None)
    eb = bpy.data.objects.new(f"{name}_B", None)
    for e, bone, p in ((ea, bone_a, a), (eb, bone_b, b)):
        scene.collection.objects.link(e)
        e.parent, e.parent_type, e.parent_bone = rig, "BONE", bone
        update()
        e.matrix_world = Matrix.Translation(p)
    L = (b - a).length
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=1)
    cap = bpy.context.active_object
    cap.name = name
    me = cap.data
    for v in me.vertices:          # esfera → cápsula a lo largo de +Y, [0, L]
        y01 = (v.co.y + 1) / 2
        r = r0 + (r1 - r0) * y01
        v.co = Vector((v.co.x * r, y01 * L, v.co.z * r))
    cap.parent = ea
    cap.matrix_parent_inverse = Matrix.Identity(4)
    cap.location = (0, 0, 0)
    c = cap.constraints.new("STRETCH_TO")
    c.target, c.rest_length, c.volume = eb, L, "NO_VOLUME"
    cap.color = (*color, 1)
    return cap


# ─── Capa PROPIA (sin licencias de terceros): parches anatómicos recortados de la piel CC0 de MakeHuman ───
# Cada parte del músculo es una franja de piel que sigue la superficie de origen a inserción, con perfil
# fusiforme / abanico / plano. Al ser la misma piel (mismos pesos de huesos) se deforma exactamente igual.
FAN = {"pectoralis_major", "latissimus_dorsi", "trapezius", "trapezius_upper", "trapezius_middle", "trapezius_lower",
       "gluteus_maximus", "gluteus_medius", "deltoid", "deltoid_anterior", "deltoid_middle", "deltoid_posterior",
       "temporalis", "infraspinatus", "teres_major", "serratus_anterior", "adductor_magnus"}
FLAT = {"rectus_abdominis", "external_oblique", "internal_oblique", "transversus_abdominis", "rhomboid_major",
        "rhomboid_minor", "rhomboids", "erector_spinae", "erector_spinae_lumbar", "erector_spinae_thoracic",
        "quadratus_lumborum", "levator_scapulae", "splenius_capitis", "splenius_cervicis", "platysma", "masseter"}


def _eval_normals():
    sub.show_viewport = MASK_MOD.show_viewport = False
    update()
    ev = body.evaluated_get(deps())
    me = ev.to_mesh()
    n = np.empty(len(me.vertices) * 3)
    me.vertices.foreach_get("normal", n)
    ev.to_mesh_clear()
    sub.show_viewport = MASK_MOD.show_viewport = True
    return n.reshape(-1, 3) @ np.array(body.matrix_world.to_3x3()).T


_OWN_CACHE = {}


def _skin_hit(lm, side):
    bone = lm["hueso"].format(s=side) if "{s}" in lm["hueso"] else lm["hueso"]
    b = rig.data.bones[bone]
    p = rig.matrix_world @ b.head_local.lerp(b.tail_local, lm.get("t", 0.5))
    d = anat_vector(lm["dir"], side)
    hit = _bvh.ray_cast(p, d)
    return Vector(hit[0]) if hit[0] else p + d * 0.05


def _bones_between(ba, bb):
    """Huesos que cruza el músculo (camino en la jerarquía entre origen e inserción) + vecinos inmediatos."""
    def chain(n):
        out, b = [], rig.data.bones[n]
        while b:
            out.append(b.name)
            b = b.parent
        return out
    ca, cb = chain(ba), chain(bb)
    common = next((x for x in ca if x in cb), None)
    path = set(ca[:ca.index(common) + 1] if common else ca) | set(cb[:cb.index(common) + 1] if common else cb)
    near = set(path)
    for n in path:
        b = rig.data.bones[n]
        if b.parent:
            near.add(b.parent.name)
        near.update(c.name for c in b.children if not c.name.startswith(("finger", "metacarpal", "toe")))
    return near


def _skin_bvh():
    sub.show_viewport = False
    for m in MASK_MOD.mods:
        if m.name != "Hide helpers":
            m.show_viewport = False
    update()
    t = BVHTree.FromObject(body, deps())
    sub.show_viewport = True
    for m in MASK_MOD.mods:
        m.show_viewport = True
    update()
    return t


def make_patch(name, mid, part, side):
    global _bvh
    if "co" not in _OWN_CACHE:
        _OWN_CACHE["co"], _OWN_CACHE["n"] = eval_coords(), _eval_normals()
        _OWN_CACHE["bvh"] = _skin_bvh()
    _bvh_keep = _bvh
    _bvh = _OWN_CACHE["bvh"]
    try:
        return _make_patch(name, mid, part, side)
    finally:
        _bvh = _bvh_keep


def _make_patch(name, mid, part, side):
    co, nr = _OWN_CACHE["co"], _OWN_CACHE["n"]
    A, B = _skin_hit(part["a"], side), _skin_hit(part["b"], side)
    NS = 12                                         # trayecto sobre la superficie (no la cuerda por dentro)
    pts, nrm = [], []
    for i in range(NS + 1):
        q = A.lerp(B, i / NS)
        loc, n_, _, _ = _bvh.find_nearest(q)
        pts.append(np.array(loc if loc is not None else q))
        nrm.append(np.array(n_ if n_ is not None else (0, 0, 1)))
    pts, nrm = np.array(pts), np.array(nrm)
    best_d = np.full(len(co), 1e9)
    best_t = np.zeros(len(co))
    best_s = np.zeros(len(co), dtype=int)
    for i in range(NS):
        a, b = pts[i], pts[i + 1]
        ab = b - a
        L2 = max(float(ab @ ab), 1e-9)
        tl = np.clip(((co - a) @ ab) / L2, 0, 1)
        d = np.linalg.norm(co - (a + tl[:, None] * ab), axis=1)
        m = d < best_d
        best_d[m], best_t[m], best_s[m] = d[m], (i + tl[m]) / NS, i + (tl[m] > 0.5)
    r0, r1 = part["r"]
    t = best_t
    base = r0 + (r1 - r0) * t
    if mid in FAN:
        prof = 0.55 + 0.45 * np.clip(1 - t, 0, 1) ** 0.5 * (1 - np.clip((t - 0.85) / 0.15, 0, 1) * 0.6)
    elif mid in FLAT:
        prof = 0.9 * np.ones_like(t)
    else:                                            # fusiforme: vientre ancho, tendones finos
        prof = 0.25 + 0.95 * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.7
    w = 1.6 * base * prof
    facing = np.einsum("ij,ij->i", nr, nrm[best_s]) > 0.15
    ok_bones = _bones_between(part["a"]["hueso"].format(s=side), part["b"]["hueso"].format(s=side))
    if "bone" not in _OWN_CACHE:
        bn = set(b.name for b in rig.data.bones)
        dom = []
        for v in body.data.vertices:
            gs = [g for g in v.groups if VG_NAMES[g.group] in bn]
            dom.append(VG_NAMES[max(gs, key=lambda g: g.weight).group] if gs else "?")
        _OWN_CACHE["bone"] = dom
    in_bones = np.array([g in ok_bones for g in _OWN_CACHE["bone"]])
    sel = (best_d <= w) & facing & BODY_MASK & in_bones
    if sel.sum() < 4:
        return None
    o = body.copy()
    o.data = body.data.copy()
    o.name = name
    scene.collection.objects.link(o)
    for m in list(o.modifiers):
        if m.type != "ARMATURE":
            o.modifiers.remove(m)
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not sel[v.index]], context="VERTS")
    bm.to_mesh(o.data)
    bm.free()
    o.data.materials.clear()
    dsp = o.modifiers.new("Sobre_piel", "DISPLACE")
    dsp.strength, dsp.mid_level = 0.004, 0.0
    sm = o.modifiers.new("Suave", "SUBSURF")
    sm.levels = sm.render_levels = 2
    o.hide_render = False
    return o


# Músculos profundos: se muestran en rayos X (pase aparte, más suave). El resto se proyecta sobre la piel.
DEEP = {"iliopsoas", "piriformis", "gemellus_superior", "gemellus_inferior", "obturator_internus", "obturator_externus",
        "quadratus_femoris", "multifidus", "rotatores", "transversus_abdominis", "subscapularis", "longus_colli",
        "longus_capitis", "rectus_capitis_posterior_major", "rectus_capitis_posterior_minor", "obliquus_capitis_superior",
        "obliquus_capitis_inferior", "lateral_pterygoid", "medial_pterygoid", "popliteus", "tibialis_posterior",
        "flexor_digitorum_longus", "flexor_hallucis_longus", "vastus_intermedius", "gluteus_minimus", "adductor_brevis",
        "quadratus_lumborum", "pectoralis_minor", "supinator", "flexor_digitorum_profundus", "pronator_quadratus",
        "lumbricals_hand", "lumbricals_foot", "palmar_interossei", "dorsal_interossei_hand", "internal_oblique",
        "semispinalis_cervicis", "erector_spinae_cervical", "scalene_posterior", "coracobrachialis", "brachialis",
        "flexor_digitorum_brevis", "tibialis_posterior", "adductor_pollicis", "opponens_pollicis"}
_roles = SPEC["musculos"]
_principal = (_roles.get("activos") or _roles.get("estirados") or _roles.get("elongan") or [{"id": None}])[0]["id"]


def muscle_weight(rol, mid):
    if rol == "estirados":
        return 1.0
    if rol == "elongan":
        return 0.6
    if rol in ("estabilizan", "sostienen"):
        return 0.5
    return 1.0 if mid == _principal else 0.45


MUSCLE_OBJS = []          # (obj, rol)
MUSCLE_INFO = {}          # obj → {id, lado, parte, peso, profundo}
for rol, lista in SPEC["musculos"].items():
    for m in lista:
        mid, side = m["id"], m.get("lado")
        if mid not in LANDMARKS:
            raise SystemExit(f"Falta landmark para músculo {mid} en data/muscle_landmarks.json")
        sides = [side] if side else ["L", "R"]
        for sd in sides:
            atl = [ATLAS_OBJS.get(f"ATL::{n}.{sd.lower()}") for n in ATLAS_MAP.get(mid, [])] if USE_ATLAS else []
            atl = [o for o in atl if o is not None]
            if atl:                                   # músculo anatómico real
                for k, o in enumerate(atl):
                    if o in MUSCLE_INFO:
                        continue
                    o.color = (0, 0, 0, 1)
                    MUSCLE_OBJS.append((o, rol))
                    MUSCLE_INFO[o] = {"id": mid, "lado": sd, "parte": o["atlas"], "peso": muscle_weight(rol, mid),
                                      "profundo": mid in DEEP, "bilateral": not side}
                continue
            if USE_OWN and mid not in DEEP:
                made = False
                for k, part in enumerate(LANDMARKS[mid]):
                    obj = make_patch(f"M_{mid}_{sd}_{k}", mid, part, sd)
                    if obj is None:
                        continue
                    made = True
                    obj.color = (0, 0, 0, 1)
                    MUSCLE_OBJS.append((obj, rol))
                    MUSCLE_INFO[obj] = {"id": mid, "lado": sd, "parte": k, "peso": muscle_weight(rol, mid),
                                        "profundo": False, "bilateral": not side}
                if made:
                    continue
            for k, part in enumerate(LANDMARKS[mid]):
                sup = mid not in DEEP
                ba, pa = landmark(part["a"], sd, part["r"][0] if sup else None)
                bb, pb_ = landmark(part["b"], sd, part["r"][1] if sup else None)
                obj = make_capsule(f"M_{mid}_{sd}_{k}", pa, pb_, part["r"][0], part["r"][1], ba, bb, (0, 0, 0))
                MUSCLE_OBJS.append((obj, rol))
                MUSCLE_INFO[obj] = {"id": mid, "lado": sd, "parte": k, "peso": muscle_weight(rol, mid),
                                    "profundo": mid in DEEP, "bilateral": not side}

for _n, _o in list(ATLAS_OBJS.items()):           # los músculos del atlas no usados se eliminan
    if _o not in MUSCLE_INFO:
        bpy.data.objects.remove(_o, do_unlink=True)

JOINT_OBJS = []
for jh in SPEC.get("articulacion_resaltada", []):
    bone = jh["hueso"]
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=jh.get("r", 0.035))
    o = bpy.context.active_object
    o.name = f"J_{bone}"
    head = rig.matrix_world @ rig.data.bones[bone].head_local
    o.parent, o.parent_type, o.parent_bone = rig, "BONE", bone
    update()
    o.matrix_world = Matrix.Translation(head)
    JOINT_OBJS.append(o)

# ─── Posición base, suelo y apoyos ───────────────────────────────────────────
base = SPEC["base"]
SURF = 0.0
props_root = bpy.data.objects.new("Props", None)
scene.collection.objects.link(props_root)


def add_box(name, size, loc, color):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name, o.scale, o.color = name, size, (*color, 1)
    return o


floor = add_box("Suelo", (12, 12, 0.02), (0, 0, -0.01), (0.93, 0.93, 0.93))
if base.get("colchoneta"):
    SURF = 0.006

orient = base["orientacion"]
ORIENT_ROT = {
    "supino": (-90, 0, 0),                 # cara arriba, cabeza hacia +Y
    "prono": (90, 0, 180),                 # cara abajo, cabeza hacia +Y
    "cuadrupedia": (90, 0, 180),
    "decubito_lateral_L": (0, 90, 0),      # apoyada sobre el lado izquierdo
    "decubito_lateral_R": (0, -90, 0),
    "bipedo": (0, 0, 0), "sedente": (0, 0, 0), "rodillas": (0, 0, 0), "sedente_suelo": (0, 0, 0),
}
if orient not in ORIENT_ROT:
    raise SystemExit(f"Orientación no soportada: {orient}")
rig.rotation_mode = "XYZ"
rig.rotation_euler = [math.radians(a) for a in ORIENT_ROT[orient]]

BASE_ANGLES = dict(base.get("angulos", {}))
apply_pose(BASE_ANGLES)
update()

TORSO = [g for g in _GROUP_VERTS if g.startswith(("spine", "neck", "head", "pelvis", "clavicle"))]
FEET = [g for g in _GROUP_VERTS if g.startswith(("foot", "toe"))]
SHINS = [g for g in _GROUP_VERTS if g.startswith(("lowerleg",))]
GROUND_GROUPS = base.get("suelo") or {
    "bipedo": FEET, "sedente": FEET, "rodillas": SHINS, "cuadrupedia": SHINS,
    "sedente_suelo": [g for g in _GROUP_VERTS if g.startswith(("pelvis", "upperleg01", "upperleg02"))],
}.get(orient, TORSO)


GROUND_Z = base.get("superficie_banco", SURF)


def ground():
    rig.location.z += GROUND_Z - group_min_z(eval_coords(), GROUND_GROUPS)
    update()


ground()
if base.get("colchoneta"):
    _co = eval_coords()[BODY_MASK]
    _ext = np.ptp(_co, axis=0)
    _size = (1.85, 0.66, SURF) if _ext[0] > _ext[1] else (0.66, 1.85, SURF)
    add_box("Colchoneta", _size, (float(_co[:, 0].mean()), float(_co[:, 1].mean()), SURF / 2), (0.60, 0.66, 0.72))
if base.get("camilla"):                        # osteopatía: camilla de consultorio; el suelo baja a su altura
    _co = eval_coords()[BODY_MASK]
    _H = base.get("altura_camilla", 0.72)
    _cx, _cy = float(_co[:, 0].mean()), float(_co[:, 1].mean())
    _lx = max(0.70, float(np.ptp(_co[:, 0])) * 0.7)
    _ly = max(1.90, float(np.ptp(_co[:, 1])) + 0.25)
    if np.ptp(_co[:, 0]) > np.ptp(_co[:, 1]):     # decúbito lateral: el cuerpo va a lo largo de X
        _lx, _ly = max(1.90, float(np.ptp(_co[:, 0])) + 0.25), max(0.70, float(np.ptp(_co[:, 1])) * 0.7)
    add_box("Camilla", (_lx, _ly, 0.09), (_cx, _cy, SURF - 0.045), (0.36, 0.42, 0.48))
    for _sx in (-1, 1):
        for _sy in (-1, 1):
            add_box("Camilla_pata", (0.05, 0.05, _H - 0.09), (_cx + _sx * (_lx / 2 - 0.08), _cy + _sy * (_ly / 2 - 0.1),
                                                              SURF - 0.09 - (_H - 0.09) / 2), (0.55, 0.56, 0.58))
    floor.location.z = SURF - _H - 0.01

# Asentar: resuelve un ángulo para que un grupo toque la superficie (evita extremidades flotando).
ASENTADOS = []
for a in base.get("asentar", []) * 2:
    joint = a["art"]
    grupo = a["grupo"] if isinstance(a["grupo"], list) else [a["grupo"]]
    lo, hi = a.get("rango", [-30, 30])
    if a.get("abs"):                                  # rango absoluto → relativo al valor base
        lo, hi = lo - BASE_ANGLES.get(joint, 0), hi - BASE_ANGLES.get(joint, 0)

    def f(x):
        ang = dict(BASE_ANGLES)
        ang[joint] = BASE_ANGLES.get(joint, 0) + x
        apply_pose(ang)
        if joint.startswith("@") or a.get("reapoyar"):
            ground()
        return group_min_z(eval_coords(), grupo) - a.get("z", SURF)

    flo, fhi = f(lo), f(hi)
    if flo * fhi > 0:
        best = lo if abs(flo) < abs(fhi) else hi
    else:
        for _ in range(22):
            mid = (lo + hi) / 2
            fm = f(mid)
            if fm * flo > 0:
                lo, flo = mid, fm
            else:
                hi = mid
        best = (lo + hi) / 2
    BASE_ANGLES[joint] = BASE_ANGLES.get(joint, 0) + best
    apply_pose(BASE_ANGLES)
    ground()
    ASENTADOS.append({"art": joint, "ajuste_deg": round(best, 2)})
apply_pose(BASE_ANGLES)
update()

if base.get("elevar"):
    rig.location.z += base["elevar"]
    update()
if base.get("superficie_banco"):
    _co = eval_coords()
    idx = _GROUP_VERTS["spine01"]
    by = float(_co[idx, 1].mean())
    if base.get("rodillo_bajo"):
        rb = base["rodillo_bajo"]
        idx2 = _GROUP_VERTS[rb["grupo"]]
        bpy.ops.mesh.primitive_cylinder_add(radius=GROUND_Z / 2, depth=0.6, location=(0, float(_co[idx2, 1].mean()), GROUND_Z / 2),
                                            rotation=(0, math.radians(90), 0))
        bpy.context.active_object.name, bpy.context.active_object.color = "Rodillo", (0.45, 0.50, 0.58, 1)
    elif base.get("banco_largo"):
        tor = [i for g in TORSO if not g.startswith(("neck", "head")) for i in _GROUP_VERTS[g]]
        y0, y1 = float(_co[tor, 1].min()), float(_co[tor, 1].max())
        add_box("Banco", (0.40, y1 - y0 + 0.1, GROUND_Z), (0, (y0 + y1) / 2, GROUND_Z / 2), (0.30, 0.30, 0.34))
    else:
        add_box("Banco", (0.42, 0.45, GROUND_Z), (0, by + 0.20, GROUND_Z / 2), (0.30, 0.30, 0.34))   # bajo omóplatos
if base.get("almohada"):
    _co = eval_coords()
    hz = group_min_z(_co, ["head"])
    idx = _GROUP_VERTS["head"]
    hx, hy = float(_co[idx, 0].mean()), float(_co[idx, 1].mean())
    if hz > SURF + 0.01:
        add_box("Almohada", (0.30, 0.40, hz - SURF), (hx, hy, SURF + (hz - SURF) / 2), (0.90, 0.90, 0.95))
SEAT_Z = None
if base.get("silla"):
    _co = eval_coords()
    hips = [g for g in _GROUP_VERTS if g.startswith(("pelvis", "upperleg01"))]
    SEAT_Z = group_min_z(_co, hips)
    idx = [i for g in hips for i in _GROUP_VERTS[g]]
    back_y = float(_co[idx, 1].max())
    sx, sy = 0.46, 0.42
    cy = back_y - sy / 2 + 0.03
    add_box("Silla_asiento", (sx, sy, 0.03), (0, cy, SEAT_Z - 0.015), (0.62, 0.48, 0.34))
    add_box("Silla_respaldo", (sx, 0.03, 0.45), (0, back_y + 0.06, SEAT_Z + 0.25), (0.62, 0.48, 0.34))
    for lx in (-1, 1):
        for ly in (-1, 1):
            add_box("Silla_pata", (0.035, 0.035, SEAT_Z - 0.03),
                    (lx * (sx / 2 - 0.03), cy + ly * (sy / 2 - 0.03), (SEAT_Z - 0.03) / 2), (0.55, 0.42, 0.30))

# Pivote (p.ej. puente: el tronco rota sobre la línea escapular).
pivot = None
if SPEC.get("pivote"):
    pv = SPEC["pivote"]
    pivot = bpy.data.objects.new("Pivote", None)
    scene.collection.objects.link(pivot)
    pivot.location = rig.matrix_world @ rig.data.bones[pv["hueso"]].head_local
    pivot.rotation_mode = "XYZ"
    update()
    mw = rig.matrix_world.copy()
    rig.parent = pivot
    rig.matrix_world = mw

def _skin_only(on):
    """Malla de piel completa (incluida la tapada por ropa) SIN geometría auxiliar de MakeHuman."""
    sub.show_viewport = not on
    for m in MASK_MOD.mods:
        if m.name != "Hide helpers":
            m.show_viewport = not on
    update()


def _bvh_now():
    _skin_only(True)
    t = BVHTree.FromObject(body, deps())
    _skin_only(False)
    return t



# IK con objetivos fijos en el mundo (apoyos que NO se mueven).
IK_TARGETS = {}
IK_BASE = {}
POLES = {}


def chain_end(cadena):
    side = cadena[-1]
    return ("lowerleg02", "lowerleg01", "foot") if cadena.startswith("pierna") else ("lowerarm02", "lowerarm01", "wrist"), side


for ik in SPEC.get("ik", []):
    (end, mid_b, eff), side = chain_end(ik["cadena"])
    end_b, mid_bn = f"{end}.{side}", f"{mid_b}.{side}"
    update()
    tgt = bpy.data.objects.new(f"IK_{ik['cadena']}", None)
    scene.collection.objects.link(tgt)
    fk_mid = rig.matrix_world @ rig.pose.bones[mid_bn].head
    if ik.get("pie_plano"):
        p = rig.matrix_world @ rig.pose.bones[end_b].tail
        p.z = STAND[side]["tobillo"].z + ik.get("z_suelo", SURF)
        tgt.location = p + Vector(ik.get("objetivo_rel", (0, 0, 0)))
        tgt.rotation_mode = "QUATERNION"
        tgt.rotation_quaternion = STAND[side]["pie_rot"]
    elif ik.get("a_hueso"):
        ah = ik["a_hueso"]
        bvh_t = _bvh_now()
        hb = rig.pose.bones[ah["hueso"]]
        src = rig.matrix_world @ hb.head.lerp(hb.tail, ah.get("t", 0.5))
        dirw = (rig.matrix_world.to_3x3() @ anat_vector(ah["dir"], ah.get("lado", side))).normalized()
        hit = bvh_t.ray_cast(src, dirw)
        tgt.location = (hit[0] if hit[0] else src) + dirw * ah.get("sep", 0.03)
        update()
        mw = tgt.matrix_world.copy()
        tgt.parent, tgt.parent_type, tgt.parent_bone = rig, "BONE", ah["hueso"]
        update()
        tgt.matrix_world = mw
    elif ik.get("objetivo_rel"):
        tgt.location = (rig.matrix_world @ rig.pose.bones[end_b].tail) + Vector(ik["objetivo_rel"])
    else:
        tgt.location = rig.matrix_world @ rig.pose.bones[end_b].tail
        if ik.get("al_suelo"):                    # mano apoyada: se baja/sube el objetivo hasta que la mano toque
            hg = [f"{b_}.{side}" for b_ in ("lowerarm02", "wrist")] + [f"finger{n}-{k}.{side}" for n in range(1, 6) for k in (1, 2, 3)]
            tgt.location.z -= group_min_z(eval_coords(), hg) - SURF
            ik.setdefault("orientacion_fija", True)
    if ik.get("orientacion_fija"):                 # la palma/planta conserva la orientación de la pose base
        tgt.rotation_mode = "QUATERNION"
        tgt.rotation_quaternion = (rig.matrix_world @ rig.pose.bones[f"{eff}.{side}"].matrix).to_quaternion()
    pole = bpy.data.objects.new(f"POLE_{ik['cadena']}", None)
    scene.collection.objects.link(pole)
    # polo automático: en la dirección real de la rodilla/codo (perpendicular a la línea raíz→extremo)
    root_b = "upperleg01" if ik["cadena"].startswith("pierna") else "upperarm01"
    hip = rig.matrix_world @ rig.pose.bones[f"{root_b}.{side}"].head
    endp = rig.matrix_world @ rig.pose.bones[end_b].tail
    axis = (endp - hip).normalized()
    perp = (fk_mid - hip) - axis * (fk_mid - hip).dot(axis)
    if perp.length > 0.01 and not ik.get("polo_manual"):
        pole.location = fk_mid + perp.normalized() * 0.6
    else:
        pole.location = fk_mid + Vector(ik.get("polo", (0, 0, 0.5)))
    c = rig.pose.bones[end_b].constraints.new("IK")
    c.target, c.pole_target, c.chain_count = tgt, pole, 4
    best = None
    for ang in range(-180, 180, 15):     # ángulo de polo automático
        c.pole_angle = math.radians(ang)
        update()
        err = ((rig.matrix_world @ rig.pose.bones[mid_bn].head) - fk_mid).length
        if best is None or err < best[0]:
            best = (err, ang)
    c.pole_angle = math.radians(best[1])
    if ik.get("pie_plano") or ik.get("orientacion_fija"):
        cr = rig.pose.bones[f"{eff}.{side}"].constraints.new("COPY_ROTATION")
        cr.target = tgt
    IK_TARGETS[ik["cadena"]] = tgt
    IK_BASE[ik["cadena"]] = tgt.location.copy()
    POLES[ik["cadena"]] = (pole, pole.location.copy())
    if ik.get("fijar_a"):                      # p.ej. talón contra talón (almeja)
        other = rig.matrix_world @ rig.pose.bones[f"lowerleg02.{ik['fijar_a']}"].tail
        tgt.location = other + Vector(ik.get("offset", (0, 0, 0)))
        IK_BASE[ik["cadena"]] = tgt.location.copy()
update()

# ─── Props por variante ──────────────────────────────────────────────────────
EQUIV = json.load(open(os.path.join(ROOT, "data/prop_equivalencias.json"), encoding="utf-8"))["equivalencias"]
PROP_STYLE = {   # (ancho, grosor, color) para correas/bandas
    "banda_elastica": (0.10, 0.004, (0.80, 0.25, 0.25)),
    "medias_nylon":   (0.05, 0.010, (0.85, 0.72, 0.60)),
    "correa":         (0.038, 0.004, (0.20, 0.30, 0.55)),
    "toalla":         (0.16, 0.012, (0.92, 0.88, 0.80)),
    "baston":         (0.028, 0.028, (0.62, 0.48, 0.30)),
    "palo_escoba":    (0.025, 0.025, (0.70, 0.55, 0.35)),
    "toalla_en_puerta": (0.10, 0.012, (0.92, 0.88, 0.80)),
    "polea":          (0.006, 0.006, (0.15, 0.15, 0.15)),
    "foam_roller":    (0.15, 0.15, (0.45, 0.50, 0.58)),
    "toalla_enrollada": (0.10, 0.10, (0.92, 0.88, 0.80)),
    "barra":          (0.03, 0.03, (0.40, 0.40, 0.42)),
}


def prop_kind(p, override=None):
    if args.variant == "gym":
        return p
    return override or EQUIV.get(p, {}).get("casa", p)


def hand_groups(s_):
    return [f"wrist.{s_}"] + [f"finger{n}-{k}.{s_}" for n in range(1, 6) for k in (1, 2, 3)] + [f"metacarpal{n}.{s_}" for n in range(1, 5)]


def bone_point(bone, offset, side=None):
    e = bpy.data.objects.new(f"P_{bone}", None)
    scene.collection.objects.link(e)
    b = rig.pose.bones[bone]
    e.parent, e.parent_type, e.parent_bone = rig, "BONE", bone
    update()
    e.matrix_world = Matrix.Translation((rig.matrix_world @ b.tail) + Vector(offset))
    return e


def strap(name, ea, eb, kind):
    w, th, col = PROP_STYLE[kind]
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.name = name
    for v in o.data.vertices:
        v.co = Vector((v.co.x * w, (v.co.y + 0.5), v.co.z * th))
    o.parent = ea
    o.matrix_parent_inverse = Matrix.Identity(4)
    c = o.constraints.new("STRETCH_TO")
    c.target, c.rest_length, c.volume, c.keep_axis = eb, 1.0, "NO_VOLUME", "PLANE_Z"
    o.color = (*col, 1)
    STRAPS.append((name, ea, eb))
    return o


STRAPS = []
BALLS = []
BENCH_TOPS = {}
HEAD_BAND_T = 0.62
HEAD_RING = []          # (aro, [puntos de su línea media en coordenadas del objeto])      # altura de la banda en la cabeza (frente, por encima de las cejas)
HEAD_BANDS = []   # (anclaje, empty, índice): la banda rodea la cabeza y sale por las tangentes
GRIP = []      # (empty_objetivo_mano, función_posición(t))
for pr in SPEC.get("props", []):
    kind = prop_kind(pr["tipo"], pr.get("casa"))
    if pr["uso"] == "correa_pie_manos":
        foot = f"foot.{pr['pie']}"
        sole = bone_point(foot, (0, 0, 0))
        for s in ("L", "R"):
            hand = IK_TARGETS[f"brazo.{s}"]
            strap(f"Correa_{s}", hand, sole, kind)
        GRIP.append(pr)
    elif pr["uso"] == "banda_anclada":
        hand = bone_point(f"wrist.{pr['mano']}", (0, 0, 0))
        anchor = bpy.data.objects.new("Anclaje", None)
        scene.collection.objects.link(anchor)
        update()
        hp = rig.matrix_world @ rig.pose.bones[f"lowerarm02.{pr['mano']}"].tail
        anchor.location = Vector(pr["anclaje"]) + Vector((0, hp.y - 0.20, hp.z))
        strap("Banda", hand, anchor, kind)
        ax = anchor.location
        if args.variant == "gym":
            bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=2.2, location=(ax.x + 0.03, ax.y, 1.1))
            bpy.context.active_object.color = (0.35, 0.35, 0.38, 1)
        else:
            add_box("Puerta", (0.04, 0.85, 2.05), (ax.x + 0.03, ax.y + 0.35, 1.025), (0.78, 0.70, 0.60))
            add_box("Manija", (0.06, 0.12, 0.02), (ax.x, ax.y, ax.z), (0.55, 0.55, 0.55))
    elif pr["uso"] == "banda_anclada_hueso":
        # banda desde un hueso (p.ej. tobillo) a un anclaje fijo relativo a su posición inicial
        bone = pr["hueso"]
        ea = bone_point(bone, (0, 0, 0))
        anchor = bpy.data.objects.new("Anclaje", None)
        scene.collection.objects.link(anchor)
        update()
        anchor.location = ea.matrix_world.translation + Vector(pr["anclaje_rel"])
        strap("Banda", ea, anchor, kind)
        ax = anchor.location
        if args.variant == "gym":
            bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=2.2, location=(ax.x, ax.y + 0.04 * (1 if pr["anclaje_rel"][1] > 0 else -1), 1.1))
            bpy.context.active_object.color = (0.35, 0.35, 0.38, 1)
        elif ax.z < 0.5:                      # anclaje bajo → pata de mesa
            add_box("Pata_mesa", (0.06, 0.06, 0.74), (ax.x, ax.y, 0.37), (0.62, 0.48, 0.34))
        else:
            dh = Vector((pr["anclaje_rel"][0], pr["anclaje_rel"][1], 0))
            dh = dh.normalized() if dh.length > 1e-6 else Vector((0, 1, 0))
            yaw = math.atan2(dh.y, dh.x)
            if ax.z >= 1.6:
                # anclaje sobre la cabeza → MARCO DE PUERTA que enmarca a la persona: dintel a la altura del anclaje
                # (la banda se engancha arriba) y jambas a los lados; nunca tapa el cuerpo.
                if "Marco_dintel" not in bpy.data.objects:           # un solo marco aunque haya dos bandas
                    cx, cy = float(eval_coords()[BODY_MASK][:, 0].mean()), ax.y
                    add_box("Marco_dintel", (1.6, 0.10, 0.08), (cx, cy, ax.z + 0.04), (0.78, 0.70, 0.60))
                    for jx in (-0.76, 0.76):
                        add_box("Marco_jamba", (0.08, 0.10, ax.z + 0.08), (cx + jx, cy, (ax.z + 0.08) / 2), (0.78, 0.70, 0.60))
            else:
                # anclaje medio → PUERTA detrás del anclaje, de cara a la persona: la banda sale de la manija
                ctr = ax + dh * 0.03
                bpy.ops.mesh.primitive_cube_add(size=1, location=(ctr.x, ctr.y, 2.05 / 2), rotation=(0, 0, yaw))
                door = bpy.context.active_object
                door.name, door.scale, door.color = "Puerta", (0.04, 0.85, 2.05), (0.78, 0.70, 0.60, 1)
                bpy.ops.mesh.primitive_cube_add(size=1, location=(ax.x, ax.y, ax.z), rotation=(0, 0, yaw))
                h = bpy.context.active_object
                h.name, h.scale, h.color = "Manija", (0.06, 0.12, 0.02), (0.55, 0.55, 0.55, 1)
    elif pr["uso"] == "lazo_rodillas":
        # banda/cinturón alrededor de los muslos, justo encima de las rodillas
        pts = []
        hb, ht = pr.get("hueso", "upperleg02"), pr.get("t", 0.85)
        bvh_now = _bvh_now()
        ring = {}
        for s, sx in (("L", 1), ("R", -1)):
            b = rig.pose.bones[f"{hb}.{s}"]
            p = rig.matrix_world @ b.head.lerp(b.tail, ht)
            for tag, d in (("ant", (0, -1, 0)), ("lat", (sx, 0, 0)), ("post", (0, 1, 0))):
                dirw = (rig.matrix_world.to_3x3() @ Vector(d)).normalized()
                hit = bvh_now.ray_cast(p, dirw)
                e = bpy.data.objects.new(f"Lazo_{s}_{tag}", None)
                scene.collection.objects.link(e)
                e.parent, e.parent_type, e.parent_bone = rig, "BONE", f"{hb}.{s}"
                update()
                e.matrix_world = Matrix.Translation((hit[0] if hit[0] else p) + dirw * 0.01)
                ring[(s, tag)] = e
        for a_, b_ in ((("L", "ant"), ("R", "ant")), (("L", "post"), ("R", "post")),
                       (("L", "ant"), ("L", "lat")), (("L", "lat"), ("L", "post")),
                       (("R", "ant"), ("R", "lat")), (("R", "lat"), ("R", "post"))):
            strap(f"Lazo_{a_[0]}{a_[1]}_{b_[0]}{b_[1]}", ring[a_], ring[b_], kind)
            STRAPS.pop()                    # el lazo rodea las piernas: no se valida como cruce
    elif pr["uso"] == "pelota_rodillas":
        hb, ht = pr.get("hueso", "lowerleg01"), pr.get("t", 0.0)
        kl = rig.matrix_world @ rig.pose.bones[f"{hb}.L"].head.lerp(rig.pose.bones[f"{hb}.L"].tail, ht)
        kr = rig.matrix_world @ rig.pose.bones[f"{hb}.R"].head.lerp(rig.pose.bones[f"{hb}.R"].tail, ht)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=pr.get("r") or max(pr.get("rmin", 0.05), (kl - kr).length / 2 - pr.get("holgura", 0.045)))
        ball = bpy.context.active_object
        ball.name, ball.color = "Pelota", (0.85, 0.55, 0.30, 1)
        for s in ("L", "R"):
            c = ball.constraints.new("COPY_LOCATION")
            c.target, c.subtarget, c.head_tail = rig, f"{hb}.{s}", ht
            c.influence = 1.0 if s == "L" else 0.5
    elif pr["uso"] == "tobillera":
        o_bone = f"lowerleg02.{pr['lado']}"
        bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=0.09)
        cuff = bpy.context.active_object
        cuff.name, cuff.color = "Tobillera", (0.30, 0.32, 0.36, 1)
        cuff.parent, cuff.parent_type, cuff.parent_bone = rig, "BONE", o_bone
        update()
        b = rig.pose.bones[o_bone]
        d = (rig.matrix_world.to_3x3() @ (b.tail - b.head)).normalized()
        cuff.matrix_world = Matrix.Translation(rig.matrix_world @ b.head.lerp(b.tail, 0.8)) @ \
            Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
    elif pr["uso"] == "en_mano":
        for s in pr.get("manos", ["L", "R"]):
            hb = rig.pose.bones[f"wrist.{s}"]
            if kind in ("mancuerna",):
                bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.26)
                col = (0.45, 0.45, 0.48, 1)
            elif kind.startswith("botella"):
                bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.30)
                col = (0.70, 0.82, 0.90, 1)
            else:
                bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.22)
                col = (0.5, 0.5, 0.5, 1)
            o = bpy.context.active_object
            o.name, o.color = f"Objeto_mano_{s}", col
            o.parent, o.parent_type, o.parent_bone = rig, "BONE", f"wrist.{s}"
            update()
            pos = rig.matrix_world @ hb.head.lerp(hb.tail, 0.9)
            ax = rig.matrix_world.to_3x3() @ (REST[f"wrist.{s}"] @ Vector((1, 0, 0)))
            o.matrix_world = Matrix.Translation(pos) @ Vector((0, 0, 1)).rotation_difference(ax).to_matrix().to_4x4()
    elif pr["uso"] == "carga_cadera":
        b = rig.pose.bones["pelvis.L"]
        if kind == "barra":
            bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=1.6)
            col = (0.4, 0.4, 0.42, 1)
        else:
            bpy.ops.mesh.primitive_cube_add(size=1)
            for v in bpy.context.active_object.data.vertices:      # mochila 32×22×12 cm (geometría, no escala)
                v.co = Vector((v.co.x * 0.32, v.co.y * 0.22, v.co.z * 0.12))
            col = (0.25, 0.35, 0.30, 1)
        o = bpy.context.active_object
        o.name, o.color = "Carga_cadera", col
        o.parent, o.parent_type, o.parent_bone = rig, "BONE", "root"
        update()
        hp = rig.matrix_world @ b.head
        front = (rig.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized()
        hit = _bvh_now().ray_cast(hp, front)
        pos = (hit[0] if hit[0] else hp) + front * (0.02 if kind == "barra" else 0.06)
        o.matrix_world = Matrix.Translation(pos) @ (Matrix.Rotation(math.radians(90), 4, "Y") if kind == "barra" else Matrix.Identity(4))
        if pr.get("agarre"):
            for s, sx in (("L", 1), ("R", -1)):
                tgt = bpy.data.objects.new(f"IK_mano_{s}", None)
                scene.collection.objects.link(tgt)
                tgt.parent = o
                update()
                lat = rig.matrix_world.to_3x3() @ Vector((sx * 0.24, 0, 0))
                tgt.matrix_world = Matrix.Translation(pos + lat)
                pole = bpy.data.objects.new(f"POLE_mano_{s}", None)
                scene.collection.objects.link(pole)
                pole.location = pos + lat * 2.2
                c = rig.pose.bones[f"lowerarm02.{s}"].constraints.new("IK")
                c.target, c.pole_target, c.chain_count, c.pole_angle = tgt, pole, 4, math.radians(-90)
    elif pr["uso"] == "rollo_bajo_hueso":
        b = rig.pose.bones[pr["hueso"]]
        pt = rig.matrix_world @ b.head.lerp(b.tail, pr.get("t", 1.0))
        r = pr.get("r", 0.07)
        rot_ = (math.radians(90), 0, 0) if pr.get("eje") == "y" else (0, math.radians(90), 0)
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=0.42, location=(pt.x, pt.y, SURF + r), rotation=rot_)
        bpy.context.active_object.name = "Rollo"
        bpy.context.active_object.color = (0.92, 0.88, 0.80, 1) if kind.startswith("toalla") else (0.45, 0.50, 0.58, 1)
    elif pr["uso"] == "bajo_pie":
        co_ = eval_coords()
        idx = [i for g in (f"foot.{pr['lado']}", "toenails") for i in _GROUP_VERTS.get(g, [])]
        fx, fy = float(co_[idx, 0].mean()), float(co_[idx, 1].mean())
        if kind == "canicas":
            for n in range(7):
                bpy.ops.mesh.primitive_uv_sphere_add(radius=0.008, location=(fx + 0.05 * math.cos(n), fy - 0.14 - 0.02 * (n % 3), 0.008))
                bpy.context.active_object.color = (0.35, 0.55, 0.85, 1)
            add_box("Recipiente", (0.10, 0.10, 0.04), (fx + 0.16, fy - 0.12, 0.02), (0.85, 0.85, 0.85))
        else:
            add_box("Toalla_suelo", (0.35, 0.55, 0.006), (fx, fy - 0.12, 0.003), (0.92, 0.88, 0.80))
    elif pr["uso"] == "baston_manos":
        a_ = bone_point("wrist.L", (0, 0, 0))
        b_ = bone_point("wrist.R", (0, 0, 0))
        d_ = (b_.matrix_world.translation - a_.matrix_world.translation).normalized() * 0.25
        e1 = bpy.data.objects.new("Baston_ext_L", None)
        e2 = bpy.data.objects.new("Baston_ext_R", None)
        for e, par, off in ((e1, a_, -d_), (e2, b_, d_)):
            scene.collection.objects.link(e)
            e.parent = par
            update()
            e.matrix_world = Matrix.Translation(par.matrix_world.translation + off)
        strap("Baston", e1, e2, kind if kind in PROP_STYLE else "baston")
        STRAPS.pop()
    elif pr["uso"] == "mesa_antebrazo":
        co_ = eval_coords()
        s_ = pr["lado"]
        grp = [f"lowerarm01.{s_}", f"lowerarm02.{s_}"]
        if pr.get("mano_apoyada"):                # ejercicios de dedos: la palma descansa SOBRE la mesa
            grp += [f"wrist.{s_}"] + [f"metacarpal{n}.{s_}" for n in range(1, 5)]
        idx = [i for g in grp for i in _GROUP_VERTS.get(g, [])]
        top = float(co_[idx, 2].min())
        wr = rig.matrix_world @ rig.pose.bones[f"lowerarm02.{s_}"].tail
        el = rig.matrix_world @ rig.pose.bones[f"lowerarm01.{s_}"].head
        y_edge = wr.y + 0.02                      # borde de la mesa justo en la muñeca: la mano queda libre
        if pr.get("mano_apoyada"):
            idx_h = [i for g in hand_groups(s_) for i in _GROUP_VERTS.get(g, [])]
            y_edge = float(co_[idx_h, 1].min()) - 0.12
        # mesa angosta y corrida hacia afuera del lado que trabaja: el otro brazo (colgando) no la atraviesa
        mx = wr.x + (0.12 if wr.x > 0 else -0.12)
        add_box("Mesa", (0.55, 0.6, 0.04), (mx, y_edge + 0.30, top - 0.02), (0.70, 0.58, 0.44))
        for lx in (-1, 1):
            add_box("Mesa_pata", (0.05, 0.05, top - 0.04), (mx + lx * 0.23, y_edge + 0.55, (top - 0.04) / 2), (0.62, 0.50, 0.38))
    elif pr["uso"] == "barra_manos":
        # la barra pasa por DENTRO del puño (centro de nudillos + primeras falanges), no por la muñeca
        co_ = eval_coords()
        fist = {}
        for s_ in ("L", "R"):
            gi = [i for g in [f"metacarpal{n}.{s_}" for n in range(1, 5)] + [f"finger{n}-{k}.{s_}" for n in range(2, 6) for k in (1, 2)]
                  for i in _GROUP_VERTS.get(g, [])]
            fist[s_] = Vector(co_[gi].mean(0).tolist())
        a, b = fist["L"], fist["R"]
        c = (a + b) / 2
        bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=1.4, location=c, rotation=(0, math.radians(90), 0))
        bpy.context.active_object.name, bpy.context.active_object.color = "Barra", (0.40, 0.40, 0.42, 1)
        if pr.get("soportes"):
            for x in (-0.7, 0.7):
                add_box("Soporte", (0.05, 0.05, c.z), (c.x + x, c.y, c.z / 2), (0.35, 0.35, 0.38))
    elif pr["uso"] == "pared_manos":
        if pr.get("lateral"):                      # pared al costado de la mano indicada
            s_ = pr["lateral"]
            a = rig.matrix_world @ rig.pose.bones[f"lowerarm01.{s_}"].head
            sx = 1 if s_ == "L" else -1
            add_box("Pared", (0.10, 2.4, 2.4), (a.x + sx * (0.10 + pr.get("sep", 0.0)), a.y, 1.2), (0.86, 0.86, 0.84))
        elif pr.get("detras"):
            co_ = eval_coords()[BODY_MASK]
            add_box("Pared", (2.4, 0.10, 2.4), (0, float(co_[:, 1].max()) + 0.05, 1.2), (0.86, 0.86, 0.84))
        else:
            a = rig.matrix_world @ rig.pose.bones["wrist.L"].tail
            add_box("Pared", (2.4, 0.10, 2.4), (0, a.y - 0.05 - pr.get("sep", 0.0), 1.2), (0.86, 0.86, 0.84))
    elif pr["uso"] == "pelota_manos":
        bpy.ops.mesh.primitive_uv_sphere_add(radius=pr.get("r", 0.11))
        ball = bpy.context.active_object
        ball.name, ball.color = "Balon", (0.55, 0.30, 0.25, 1)
        for s_, inf in (("L", 1.0), ("R", 0.5)):
            c = ball.constraints.new("COPY_LOCATION")
            c.target, c.subtarget, c.head_tail, c.influence = rig, f"wrist.{s_}", 1.0, inf
    elif pr["uso"] == "superficie_manos":
        co_ = eval_coords()
        idx = [i for s_ in ("L", "R") for g in (f"wrist.{s_}", f"metacarpal2.{s_}", f"metacarpal3.{s_}") for i in _GROUP_VERTS.get(g, [])]
        top = float(co_[idx, 2].min())
        cx, cy = float(co_[idx, 0].mean()), float(co_[idx, 1].mean())
        add_box("Mesa", (0.9, 0.5, 0.04), (cx, cy + pr.get("dy", 0.15), top - 0.02), (0.70, 0.58, 0.44))
        add_box("Mesa_base", (0.8, 0.4, top - 0.04), (cx, cy + pr.get("dy", 0.15), (top - 0.04) / 2), (0.62, 0.50, 0.38))
    elif pr["uso"] == "apoyo_pie":
        co_ = eval_coords()
        s_ = pr["lado"]
        idx = [i for g in (f"foot.{s_}",) for i in _GROUP_VERTS[g]]
        fx, fy = float(co_[idx, 0].mean()), float(co_[idx, 1].mean())
        if kind in ("pelota_pequena", "pelota_tenis", "calcetines_enrollados"):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=pr.get("alto", 0.065) / 2, location=(fx, fy, pr.get("alto", 0.065) / 2))
            bpy.context.active_object.color = (0.80, 0.85, 0.30, 1)
        else:
            add_box("Escalon", (0.45, 0.35, pr["alto"]), (fx, fy, pr["alto"] / 2), (0.55, 0.55, 0.58))
    elif pr["uso"] == "banda_cabeza":
        # banda que rodea la cabeza: dos tramos desde puntos de la piel hasta el anclaje
        bvh_c = _bvh_now()
        hb = rig.pose.bones["head"]
        hc = rig.matrix_world @ hb.head.lerp(hb.tail, HEAD_BAND_T)
        anchor = bpy.data.objects.new("Anclaje", None)
        scene.collection.objects.link(anchor)
        anchor.location = hc + Vector(pr["anclaje_rel"])
        for n, d in enumerate(pr["puntos"]):
            dirw = (rig.matrix_world.to_3x3() @ anat_vector(d, "L")).normalized()
            hit = bvh_c.ray_cast(hc, dirw)
            e = bpy.data.objects.new(f"Banda_cab_{n}", None)
            scene.collection.objects.link(e)
            e.location = (hit[0] if hit[0] else hc) + dirw * 0.01   # provisional; se recalcula por frame (tangentes)
            strap(f"Banda_{n}", e, anchor, kind)
            HEAD_BANDS.append((anchor, e, n))
        # aro de la banda alrededor de la cabeza (sigue a la cabeza): sin él sólo se veían dos tramos sueltos
        _ax = (rig.matrix_world.to_3x3() @ (hb.tail - hb.head)).normalized()
        _u = _ax.orthogonal().normalized()
        _v = _ax.cross(_u)
        w_, th_, col_ = PROP_STYLE.get(kind, PROP_STYLE["banda_elastica"])
        ring_v, ring_f, NR = [], [], 72
        # contorno real del cráneo a esa altura: vértices de piel de la cabeza en una franja de ±1,2 cm
        _co = eval_coords()
        _hi = np.array([i for i in _GROUP_VERTS["head"] if BODY_MASK[i]])
        _rel = _co[_hi] - np.array(hc)
        _h = _rel @ np.array(_ax)
        _sl = _rel[np.abs(_h) < 0.012]
        _ang = np.arctan2(_sl @ np.array(_v), _sl @ np.array(_u))
        _rad = np.linalg.norm(_sl - np.outer(_sl @ np.array(_ax), np.array(_ax)), axis=1)
        _bins = np.full(NR, np.nan)
        for a__, r__ in zip(((_ang + math.pi) / (2 * math.pi) * NR).astype(int) % NR, _rad):
            _bins[a__] = r__ if np.isnan(_bins[a__]) else max(_bins[a__], r__)
        _ok = ~np.isnan(_bins)
        _bins = np.interp(np.arange(NR), np.arange(NR)[_ok], _bins[_ok], period=NR)
        for k_ in range(NR):
            a_ = 2 * math.pi * k_ / NR - math.pi
            d_ = _u * math.cos(a_) + _v * math.sin(a_)
            p_ = hc + d_ * (float(_bins[k_]) + 0.012)
            ring_v += [p_ - _ax * (w_ / 2), p_ + _ax * (w_ / 2)]
        for k_ in range(NR):
            a0, a1 = 2 * k_, 2 * ((k_ + 1) % NR)
            ring_f.append((a0, a1, a1 + 1, a0 + 1))
        _me = bpy.data.meshes.new("Banda_aro")
        _me.from_pydata([tuple(v) for v in ring_v], [], ring_f)
        aro = bpy.data.objects.new("Banda_aro", _me)
        scene.collection.objects.link(aro)
        aro.color = (*col_, 1)
        aro.modifiers.new("Grosor", "SOLIDIFY").thickness = max(th_, 0.003)
        aro.parent, aro.parent_type, aro.parent_bone = rig, "BONE", "head"
        update()
        aro.matrix_parent_inverse = (rig.matrix_world @ rig.pose.bones["head"].matrix @ Matrix.Translation((0, rig.pose.bones["head"].length, 0))).inverted()
        HEAD_RING.append((aro, [(ring_v[2 * k_] + ring_v[2 * k_ + 1]) / 2 for k_ in range(NR)]))
        ax = anchor.location
        if args.variant == "gym":
            bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=2.2, location=(ax.x, ax.y, 1.1))
            bpy.context.active_object.color = (0.35, 0.35, 0.38, 1)
        else:
            add_box("Puerta", (0.85, 0.04, 2.05) if abs(pr["anclaje_rel"][1]) > abs(pr["anclaje_rel"][0]) else (0.04, 0.85, 2.05),
                    (ax.x, ax.y, 1.025), (0.78, 0.70, 0.60))
    elif pr["uso"] == "en_boca":
        # depresor lingual entre los incisivos: sale hacia delante de la boca y sigue a la mandíbula
        co_ = eval_coords()
        li = [i for g in ("lips", "teeth", "tongue") for i in _GROUP_VERTS.get(g, [])] or _GROUP_VERTS["jaw"]
        pts_ = co_[li]
        front = pts_[pts_[:, 1].argmin()]                 # punto más anterior de la boca (la cara mira a −Y)
        mouth = pts_.mean(0)
        bpy.ops.mesh.primitive_cube_add(size=1)
        dep = bpy.context.active_object
        L_ = 0.15
        for v in dep.data.vertices:
            v.co = Vector((v.co.x * 0.018, v.co.y * L_, v.co.z * 0.002))
        dep.name, dep.color = "Depresor", (0.85, 0.75, 0.55, 1)
        dep.parent, dep.parent_type, dep.parent_bone = rig, "BONE", "jaw"
        update()
        dep.matrix_world = Matrix.Translation(Vector((float(mouth[0]), float(front[1]) - L_ / 2 + 0.03, float(mouth[2]))))
    elif pr["uso"] == "banco_bajo_pie":
        # banco/silla bajo el empeine (o la planta) del pie indicado, a la altura que deja la pose base
        co_ = eval_coords()
        g_ = pr.get("grupo") or ([f"foot.{pr['lado']}"] + [f"toe{n}-1.{pr['lado']}" for n in range(1, 6)])
        idx = [i for g in g_ for i in _GROUP_VERTS.get(g, [])]
        top = float(co_[idx, 2].min())
        fx, fy = float(co_[idx, 0].mean()), float(co_[idx, 1].mean())
        BENCH_TOPS[pr["lado"]] = top
        add_box("Banco", (0.40, pr.get("largo", 0.40), top), (fx, fy + pr.get("dy", 0.08), top / 2), (0.30, 0.30, 0.34))
    elif pr["uso"] == "arroz_mano":
        # recipiente con arroz alrededor de la mano apoyada: el arroz cubre hasta media altura de los dedos
        co_ = eval_coords()
        s_ = pr.get("lado", "R")
        idx = [i for g in hand_groups(s_) if not g.startswith("wrist") for i in _GROUP_VERTS.get(g, [])]
        pts_ = co_[idx]
        cx, cy = float(pts_[:, 0].mean()), float(pts_[:, 1].mean())
        z0 = float(pts_[:, 2].min()) - 0.004
        zt = z0 + float(np.ptp(pts_[:, 2])) * 0.6
        bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=zt - z0 + 0.02, location=(cx, cy, (z0 + zt + 0.02) / 2))
        bowl = bpy.context.active_object
        bowl.name, bowl.color = "Recipiente", (0.85, 0.85, 0.88, 1)
        sol = bowl.modifiers.new("Pared", "SOLIDIFY")
        sol.thickness = 0.008
        bpy.ops.object.mode_set(mode="EDIT")
        import bmesh as _bm
        bmx = _bm.from_edit_mesh(bowl.data)
        for f_ in [f for f in bmx.faces if f.normal.z > 0.9]:
            bmx.faces.remove(f_)
        _bm.update_edit_mesh(bowl.data)
        bpy.ops.object.mode_set(mode="OBJECT")
        bpy.ops.mesh.primitive_cylinder_add(radius=0.142, depth=0.004, location=(cx, cy, zt))
        rice = bpy.context.active_object
        rice.name, rice.color = "Arroz", (0.95, 0.93, 0.85, 1)
    elif pr["uso"] == "balon_vuelo":
        # balón en la(s) mano(s); se suelta, va a la pared (rebote) y vuelve a la mano: se anima después de las keys
        bpy.ops.mesh.primitive_uv_sphere_add(radius=pr.get("r", 0.1))
        ball = bpy.context.active_object
        ball.name, ball.color = "Balon", (0.55, 0.30, 0.25, 1)
        cs = []
        for s_, inf in zip(pr["manos"], (1.0, 0.5)):
            c = ball.constraints.new("COPY_LOCATION")
            c.target, c.subtarget, c.head_tail, c.influence = rig, f"wrist.{s_}", 1.0, inf
            cs.append(c)
        BALLS.append((ball, cs, pr))
    elif pr["uso"] == "caja":
        add_box(pr.get("nombre", "Caja"), pr["tam"], pr["pos"], tuple(pr.get("color", (0.55, 0.55, 0.58))))
    elif pr["uso"] == "rollo_codo":
        o_bone = f"lowerarm01.{pr['lado']}"
        # toalla DOBLADA (no un cilindro): 4 cm de grosor entre codo y costado, bordes redondeados
        bpy.ops.mesh.primitive_cube_add(size=1)
        roll = bpy.context.active_object
        for v in roll.data.vertices:
            v.co = Vector((v.co.x * 0.045, v.co.y * 0.13, v.co.z * 0.17))
        bv = roll.modifiers.new("Bisel", "BEVEL")
        bv.width, bv.segments = 0.015, 4
        roll.name, roll.color = "Rollo_toalla", (0.92, 0.88, 0.80, 1)
        roll.rotation_euler = (math.radians(90), 0, 0)
        roll.parent, roll.parent_type, roll.parent_bone = rig, "BONE", o_bone
        update()
        hp = rig.matrix_world @ rig.pose.bones[o_bone].head
        sx = 1 if pr["lado"] == "L" else -1
        roll.matrix_world = Matrix.Translation(hp + Vector((-sx * 0.045, 0, 0.04)))

# ─── Animación ───────────────────────────────────────────────────────────────
BASE_LOC = rig.location.copy()
keys = SPEC["keys"]
RESOLVER_REF = {}
assert keys[0]["t"] == 0 and abs(keys[-1]["t"] - DUR) < 1e-6, "keys debe cubrir 0..duracion"
AVANCE = Vector(SPEC.get("avance", (0, 0, 0)))   # locomoción: desplazamiento por ciclo (la cámara acompaña)


def _menos_avance(v, k_):
    if v is None or not SPEC.get("avance"):
        return v
    if k_ == "raiz":
        return [round(a - b, 6) for a, b in zip(v, AVANCE)]
    if k_ in ("ik", "polo"):
        return {c: [round(a - b, 6) for a, b in zip(o, AVANCE)] for c, o in v.items()}
    return v


for k in ("art", "pivote_x", "p", "raiz", "ik", "polo"):
    a0 = keys[0].get(k)
    a1 = _menos_avance(keys[-1].get(k), k)
    assert (a0 == a1) or (SPEC.get("avance") and k in ("raiz", "ik", "polo") and json.dumps(a0) == json.dumps(a1)), \
        f"Loop: la primera y la última key deben coincidir en '{k}'"

_prev_fase, _prev_fr = None, -1
for k in keys:
    fr = frame_of(k["t"])
    scene.frame_set(fr)
    ang = dict(BASE_ANGLES)
    for j, d in k.get("art", {}).items():
        ang[j] = BASE_ANGLES.get(j, 0) + d
    EXTRA_ROT.clear()
    if pivot is not None:
        px = k.get("pivote_x", 0)
        py = k.get("pivote_y", 0)
        pivot.rotation_euler = (math.radians(px), math.radians(py), 0)
        pivot.keyframe_insert("rotation_euler", frame=fr)
        cr = SPEC["pivote"].get("contrarrotar")
        inv = (rig.matrix_world.to_3x3().inverted() @ Matrix.Rotation(math.radians(-py), 3, "Y") @ rig.matrix_world.to_3x3()) \
            if py else Matrix.Identity(3)
        for bname in ([cr] if isinstance(cr, str) else (cr or [])):
            EXTRA_ROT[bname] = Matrix.Rotation(math.radians(-px), 3, "X") @ inv
    if SPEC.get("resolver"):
        # Por key: se busca x (grados de @pitch/@roll) con articulaciones compensadas (p.ej. cadera −x para que los
        # muslos no cambien de dirección) tal que los apoyos "a" y "b" toquen a la vez; "b" no se desliza.
        rv = SPEC["resolver"]
        comp = rv.get("compensar", {})
        idx_b = np.array(sorted({i for g in rv["b"] for i in _GROUP_VERTS[g]}))

        def _pose_x(x):
            a2 = dict(ang)
            a2[rv.get("art", "@pitch")] = a2.get(rv.get("art", "@pitch"), 0) + x
            for j, fac in comp.items():
                a2[j] = a2.get(j, 0) + fac * x
            apply_pose(a2)
            rig.location = BASE_LOC.copy()
            update()
            co_ = eval_coords()
            rig.location.z += rv.get("zb", SURF) - group_min_z(co_, rv["b"])
            if RESOLVER_REF.get("b") is not None:
                cb = co_[idx_b, :2].mean(0)
                rig.location.x += float(RESOLVER_REF["b"][0] - cb[0])
                rig.location.y += float(RESOLVER_REF["b"][1] - cb[1])
            update()
            co_ = eval_coords()
            return a2, (group_min_z(co_, rv["a"]) - rv.get("za", SURF))

        lo, hi = rv.get("rango", [-25, 25])
        flo, fhi = _pose_x(lo)[1], _pose_x(hi)[1]
        if flo * fhi > 0:
            xs = lo if abs(flo) < abs(fhi) else hi
        else:
            for _ in range(20):
                mid = (lo + hi) / 2
                fm = _pose_x(mid)[1]
                if fm * flo > 0:
                    lo, flo = mid, fm
                else:
                    hi = mid
            xs = (lo + hi) / 2
        ang, _ = _pose_x(xs)
        if RESOLVER_REF.get("b") is None:
            RESOLVER_REF["b"] = eval_coords()[idx_b, :2].mean(0)
        k["_resuelto"] = round(xs, 2)
        rig.keyframe_insert("location", frame=fr)
        rig.keyframe_insert("rotation_euler", frame=fr)
    for ak in SPEC.get("asentar_keys", []):
        # Por key: corrige UNA articulación para que un grupo siga tocando la superficie (p.ej. la mano que se
        # desliza por la colchoneta durante un arco de aducción).
        if not SPEC.get("resolver"):
            rig.location = BASE_LOC + Vector(k.get("raiz", (0, 0, 0)))
        grp_ = ak["grupo"] if isinstance(ak["grupo"], list) else [ak["grupo"]]

        def _fa(x):
            a2 = dict(ang)
            a2[ak["art"]] = a2.get(ak["art"], 0) + x
            apply_pose(a2)
            update()
            return group_min_z(eval_coords(), grp_) - ak.get("z", SURF)

        lo, hi = ak.get("rango", [-20, 20])
        if ak.get("solo_bajo") and _fa(0) >= 0:      # sólo corrige si el grupo ATRAVIESA la superficie
            continue
        flo, fhi = _fa(lo), _fa(hi)
        if flo * fhi > 0:
            xa = lo if abs(flo) < abs(fhi) else hi
        else:
            for _ in range(18):
                mid = (lo + hi) / 2
                fm = _fa(mid)
                if fm * flo > 0:
                    lo, flo = mid, fm
                else:
                    hi = mid
            xa = (lo + hi) / 2
        ang[ak["art"]] = ang.get(ak["art"], 0) + xa
    apply_pose(ang)
    for pb in rig.pose.bones:
        pb.keyframe_insert("rotation_quaternion", frame=fr)
        if pb.name == "jaw":
            pb.keyframe_insert("location", frame=fr)
    if not SPEC.get("resolver") and ("raiz" in k or any(j.startswith("@") for j in k.get("art", {})) or SPEC.get("reapoyar")):
        rig.location = BASE_LOC + Vector(k.get("raiz", (0, 0, 0)))
        if SPEC.get("reapoyar"):
            update()
            ra = SPEC["reapoyar"]
            rig.location.z += ra.get("z", SURF) - group_min_z(eval_coords(), ra["grupos"])
        rig.keyframe_insert("location", frame=fr)
        rig.keyframe_insert("rotation_euler", frame=fr)
    for cadena, off in k.get("polo", {}).items():
        pole, p0 = POLES[cadena]
        pole.location = p0 + Vector(off)
        pole.keyframe_insert("location", frame=fr)
    for cadena, off in k.get("ik", {}).items():
        tgt = IK_TARGETS[cadena]
        tgt.location = IK_BASE[cadena] + Vector(off)
        tgt.keyframe_insert("location", frame=fr)
    update()
    for pr in GRIP:                       # manos siguen la correa
        sole = rig.matrix_world @ rig.pose.bones[f"foot.{pr['pie']}"].tail
        sh = [(rig.matrix_world @ rig.pose.bones[f"upperarm01.{s}"].head) for s in ("L", "R")]
        mid = (sh[0] + sh[1]) / 2
        hp = mid.lerp(sole, pr.get("fraccion", 0.55))
        for s, sx in (("L", 1), ("R", -1)):
            tgt = IK_TARGETS[f"brazo.{s}"]
            tgt.location = hp + Vector((sx * 0.07, 0, 0))
            tgt.keyframe_insert("location", frame=fr)
    p = k["p"]
    fase = k.get("fase", "concentrico")
    for obj, rol in MUSCLE_OBJS:
        def _col(f_):
            return COLORS["elongacion"] if rol in ("elongan", "estirados") else \
                COLORS["isometrico"] if rol in ("estabilizan", "sostienen") else COLORS[f_]
        w = p * MUSCLE_INFO[obj]["peso"]
        # el TONO de un tramo es el de la fase que lo inicia (sin fundido rojo→naranja); sólo la intensidad se interpola
        if _prev_fase is not None and fr - 1 > _prev_fr:
            c0 = _col(_prev_fase)
            obj.color = (c0[0] * w, c0[1] * w, c0[2] * w, 1)
            obj.keyframe_insert("color", frame=fr - 1)
        col = _col(fase)
        obj.color = (col[0] * w, col[1] * w, col[2] * w, 1)
        obj.keyframe_insert("color", frame=fr)
    _prev_fase, _prev_fr = fase, fr
    for o in JOINT_OBJS:
        c = COLORS["hueso"]
        jp = k.get("p_articulacion", p)
        o.color = (c[0] * jp, c[1] * jp, c[2] * jp, 1)
        o.keyframe_insert("color", frame=fr)

# Reapoyo denso: corrige la altura del cuerpo cada 3 frames (sin deriva entre keys).
if SPEC.get("reapoyar"):
    ra = SPEC["reapoyar"]
    for fr in list(range(1, FRAME_END + 1, 3)) + [FRAME_END + 1]:
        scene.frame_set(fr)
        rig.location.z += ra.get("z", SURF) - group_min_z(eval_coords(), ra["grupos"])
        rig.keyframe_insert("location", frame=fr)

# Balón en vuelo: sujeto a la mano salvo entre 'suelta' y 'atrapa'; en el vuelo va en línea a la pared y vuelve.
for ball, cs, pr in BALLS:
    v = pr["vuelo"]
    f0, f1 = frame_of(v["suelta"]), frame_of(v["atrapa"])
    fm = (f0 + f1) // 2
    scene.frame_set(f0)
    p0 = ball.matrix_world.translation.copy()
    scene.frame_set(f1)
    p1 = ball.matrix_world.translation.copy()
    pw = p0 + Vector(v["pared"])
    for c in cs:
        w = c.influence
        for fr, val in ((1, w), (f0, w), (f0 + 1, 0.0), (f1 - 1, 0.0), (f1, w), (FRAME_END + 1, w)):
            c.influence = val
            c.keyframe_insert("influence", frame=fr)
    for fr, loc in ((f0 + 1, p0), (fm, pw), (f1 - 1, p1)):
        ball.location = loc
        ball.keyframe_insert("location", frame=fr)
    for fc in ball.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR" if fc.data_path == "location" else "CONSTANT"
    if pr.get("pared_visible", True):
        add_box("Pared_rebote", (1.6, 0.06, 2.4) if abs(v["pared"][1]) >= abs(v["pared"][0]) else (0.06, 1.6, 2.4),
                (pw.x + (0.06 if v["pared"][0] > 0 else -0.06) * (abs(v["pared"][0]) > abs(v["pared"][1])),
                 pw.y + (0.06 if v["pared"][1] > 0 else -0.06) * (abs(v["pared"][1]) >= abs(v["pared"][0])), 1.2),
                (0.86, 0.86, 0.84))

# Interpolación suave tipo "ease" (sin rebotes) en todas las curvas.
for ob in [rig, pivot] + [o for o, _ in MUSCLE_OBJS] + JOINT_OBJS + list(IK_TARGETS.values()) + [p for p, _ in POLES.values()]:
    if ob and ob.animation_data and ob.animation_data.action:
        for fc in ob.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "BEZIER"
                kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"

# Apoyo doble: en cada frame se inclina el cuerpo entero (eje @pitch/@roll) hasta que DOS apoyos toquen a la vez
# (p.ej. manos y rodillas en gato-camello, antebrazos y pelvis en esfinge). El apoyo "b" queda fijo en el suelo
# (no se desliza): la rotación pivota sobre él.
if SPEC.get("apoyo_doble"):
    ad = SPEC["apoyo_doble"]
    ax_i = {"@pitch": 0, "@roll": 1, "@yaw": 2}[ad.get("eje", "@pitch")]
    ga, gb = ad["a"], ad["b"]
    za, zb = ad.get("za", SURF), ad.get("zb", SURF)
    lo0, hi0 = ad.get("rango", [-20, 20])
    idx_b = np.array(sorted({i for g in gb for i in _GROUP_VERTS[g]}))
    ref_b = None
    rig.rotation_mode = "XYZ"
    for fr in list(range(1, FRAME_END + 1, 2)) + [FRAME_END + 1]:
        scene.frame_set(fr)
        r0 = rig.rotation_euler[ax_i]

        def g_(x):
            rig.rotation_euler[ax_i] = r0 + math.radians(x)
            update()
            co_ = eval_coords()
            return (group_min_z(co_, ga) - za) - (group_min_z(co_, gb) - zb)

        lo, hi = lo0, hi0
        flo, fhi = g_(lo), g_(hi)
        if flo * fhi > 0:
            x = lo if abs(flo) < abs(fhi) else hi
        else:
            for _ in range(20):
                mid = (lo + hi) / 2
                fm = g_(mid)
                if fm * flo > 0:
                    lo, flo = mid, fm
                else:
                    hi = mid
            x = (lo + hi) / 2
        g_(x)
        co_ = eval_coords()
        rig.location.z += zb - group_min_z(co_, gb)
        cb = co_[idx_b, :2].mean(0)
        if ref_b is None:
            ref_b = cb.copy()
        rig.location.x += float(ref_b[0] - cb[0])
        rig.location.y += float(ref_b[1] - cb[1])
        rig.keyframe_insert("location", frame=fr)
        rig.keyframe_insert("rotation_euler", frame=fr)
    for fc in rig.animation_data.action.fcurves:
        if fc.data_path in ("location", "rotation_euler"):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"

# Bandas de cabeza: en cada frame los tramos salen de los puntos TANGENTES de la cabeza vistos desde
# el anclaje (la banda envuelve el lado opuesto, como en la realidad) → nunca cruzan la cabeza.
HB_PTS = {}
if HEAD_BANDS:
    for fr in list(range(1, FRAME_END + 1, 2)) + [FRAME_END + 1]:
        scene.frame_set(fr)
        hb = rig.pose.bones["head"]
        M = rig.matrix_world
        hc = M @ hb.head.lerp(hb.tail, HEAD_BAND_T)
        ax = (M.to_3x3() @ (hb.tail - hb.head)).normalized()
        ring_w = [aro_.matrix_world @ c_ for aro_, cl_ in HEAD_RING for c_ in cl_]   # línea media del aro, en el mundo
        for anchor, e, n in HEAD_BANDS:
            A = anchor.matrix_world.translation
            d = A - hc
            dn = (d - ax * d.dot(ax)).normalized()
            perp = ax.cross(dn).normalized()
            best = None
            for pt in ring_w:                         # tangente al ARO visto desde el anclaje
                v = pt - A
                ang = math.atan2(v.dot(perp), v.dot(-dn)) * (1 if n == 0 else -1)
                if best is None or ang > best[0]:
                    best = (ang, pt)
            if best:
                HB_PTS.setdefault(n, []).append((fr, best[1].copy()))
    # suavizado temporal (ventana 7 frames): el punto tangente salta entre vértices de la malla → la banda "temblaba"
    for (anchor, e, n) in HEAD_BANDS:
        pts = HB_PTS.get(n, [])
        for i, (fr, _) in enumerate(pts):
            win = [pts[i][1]]
            e.location = sum(win, Vector((0, 0, 0))) / len(win)
            e.keyframe_insert("location", frame=fr)
    for _, e, _ in HEAD_BANDS:
        for fc in e.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"

# ─── Validación ──────────────────────────────────────────────────────────────
report = {"id": SPEC["id"], "variante": args.variant, "duracion_s": DUR, "frames": FRAME_END,
          "asentados": ASENTADOS, "checks": {}}
contacts = SPEC.get("contactos", [])
def cname(c):
    return "+".join(c["grupo"]) if isinstance(c["grupo"], list) else c["grupo"]


worst = {cname(c): 0.0 for c in contacts}
TOL = {cname(c): c.get("tol_cm", 1.5) / 100 for c in contacts}
min_z = 1e9
pen_info = {}
loop_ref = None
hits = {}
hits_info = {}
for fr in list(range(1, FRAME_END + 1, 2)) + [FRAME_END + 1]:
    scene.frame_set(fr)
    co = eval_coords()
    zc = np.where(BODY_MASK, co[:, 2], 1e9)
    vi = int(zc.argmin())
    if zc[vi] < min_z:
        min_z, pen_info = float(zc[vi]), {"grupo": VERT_GROUP[vi], "t": round((fr - 1) / FPS, 2)}
    t_now = (fr - 1) / FPS
    for c in contacts:
        if not (c.get("desde", 0) - 1e-6 <= t_now <= c.get("hasta", DUR) + 1e-6):
            continue
        g = c["grupo"] if isinstance(c["grupo"], list) else [c["grupo"]]
        surf = SEAT_Z if c.get("superficie") == "silla" else BENCH_TOPS.get(c.get("banco"), c.get("z", SURF))
        gz = group_min_z(co, g) - surf
        worst[cname(c)] = max(worst[cname(c)], abs(gz))
    if STRAPS:
        bvh = _bvh_now()
        for name, ea, eb in STRAPS:
            a, b = ea.matrix_world.translation, eb.matrix_world.translation
            L = (b - a).length
            inside = []
            for i in range(0, 41):
                q = a.lerp(b, i / 40)
                loc, nrm, _, dist = bvh.find_nearest(q)
                inside.append(dist if (loc is not None and (q - loc).dot(nrm) < 0 and dist > 0.004) else 0.0)
            # se ignoran los tramos pegados a los extremos (la banda nace en la mano/cabeza/pie que la sujeta)
            i0 = 0
            while i0 < len(inside) and inside[i0] > 0:
                i0 += 1
            i1 = len(inside) - 1
            while i1 >= 0 and inside[i1] > 0:
                i1 -= 1
            for i in range(i0, i1 + 1):
                q = a.lerp(b, i / 40)
                excl = min(0.16, L * 0.4) if name.startswith("Banda_") else min(0.10, L * 0.3)   # banda apoyada sobre la cabeza
                if inside[i] > 0 and min((q - a).length, (q - b).length) >= excl:
                    vi_ = int(np.where(BODY_MASK, np.linalg.norm(co - np.array(q), axis=1), 1e9).argmin())   # sólo piel, sin helpers
                    g_ = VERT_GROUP[vi_]
                    if g_.startswith(("finger", "metacarpal", "wrist", "hand")):   # la banda pasa por el puño que la sujeta
                        continue
                    if name.startswith("Banda_") and g_.startswith(("ear", "scalp")):   # aplasta oreja/pelo
                        continue
                    if inside[i] > hits.get(name, 0):
                        hits_info[name] = {"grupo": g_, "t": round(t_now, 2), "pos_banda": round(i / 40, 2)}
                    hits[name] = max(hits.get(name, 0), inside[i])
    if fr == 1:
        loop_ref = co.copy()
    if fr == FRAME_END + 1:
        loop_err = float(np.linalg.norm(co - np.array(AVANCE) - loop_ref, axis=1).max())

TOL_CONTACT, TOL_PEN, TOL_LOOP = 0.015, 0.015, 0.003   # 1,5 cm ≈ compresión real del tejido blando
report["checks"]["contactos"] = {g: {"error_max_cm": round(e * 100, 2), "ok": e <= TOL[g]} for g, e in worst.items()}
report["checks"]["penetracion_suelo"] = {"z_min_cm": round((min_z - SURF) * 100, 2), "ok": (min_z - SURF) >= -TOL_PEN, **pen_info}
report["checks"]["props_atraviesan_cuerpo"] = {"max_cm": {k: round(v * 100, 1) for k, v in hits.items()}, "ok": all(v <= (0.02 if k.startswith("Banda_") else 0.015) for k, v in hits.items()), "donde": hits_info}   # 1,5 cm: la banda se apoya sobre ropa/tejido
report["checks"]["loop"] = {"error_max_mm": round(loop_err * 1000, 2), "ok": loop_err <= TOL_LOOP}

rom = []
for k in keys:
    for j, d in k.get("art", {}).items():
        val = BASE_ANGLES.get(j, 0) + d
        joint, _ = split_joint(j)
        pos_key, neg_key = ROM_KEYS.get(joint, (None, None))
        key = pos_key if val >= 0 else (neg_key or pos_key)
        if key:
            lim = max(abs(x) for x in ROM[key]["range"])
            # rango PASIVO declarado en la ficha (p.ej. sentarse sobre los talones: rodilla ~155°, cargada por el peso)
            lim = max(lim, abs(SPEC.get("rom_pasivo", {}).get(joint + ("+" if val >= 0 else "-"), 0)))
            ok = abs(val) <= lim
        else:
            ok = val >= 0 or joint not in ROM_KEYS
        if not ok:
            rom.append({"t": k["t"], "art": j, "valor": round(val, 1)})
report["checks"]["rom"] = {"fuera_de_rango": rom, "ok": not rom}
report["ok"] = all(v["ok"] for v in [report["checks"]["penetracion_suelo"], report["checks"]["loop"], report["checks"]["rom"],
                                     report["checks"]["props_atraviesan_cuerpo"]]) \
    and all(v["ok"] for v in report["checks"]["contactos"].values())
json.dump(report, open(os.path.join(args.out, "reporte.json"), "w"), ensure_ascii=False, indent=2)
print("REPORTE", json.dumps(report, ensure_ascii=False))

# ─── Cámara fija con encuadre automático ─────────────────────────────────────
cam_spec = SPEC.get("camara", {"dir": [1, 0, 0.25]})
pts = []
_cam_idx = None
if cam_spec.get("grupos"):
    _cam_idx = np.array(sorted({i for g in cam_spec["grupos"] for i in _GROUP_VERTS.get(g, [])}))
def _avance_en(fr):
    return np.array(AVANCE) * ((fr - 1) / FRAME_END)


for fr in range(1, FRAME_END + 1, 6):
    scene.frame_set(fr)
    co = eval_coords()
    co = co[_cam_idx] if _cam_idx is not None else co[BODY_MASK]
    co = co - _avance_en(fr)                       # encuadre relativo al avance (la cámara acompaña)
    pts.append(co.min(0))
    pts.append(co.max(0))
T_OBJS = []
if SPEC.get("terapeuta"):                      # osteopatía: terapeuta con las manos sobre la paciente
    exec(open(os.path.join(ROOT, "scripts/factory/terapeuta.py"), encoding="utf-8").read())
    pts = [np.array(list(p_)) for p_ in terapeuta_puntos()]      # encuadre: zona tratada + terapeuta
pts = np.array(pts)
lo, hi = pts.min(0), pts.max(0)
center = Vector(((lo + hi) / 2).tolist())
corners = [Vector((x, y, z)) for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])]
fwd = -Vector(cam_spec["dir"]).normalized()
right = fwd.cross(Vector((0, 0, 1))).normalized()
up = right.cross(fwd)
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = cam_spec.get("lente", 50)
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
W, H = SPEC.get("resolucion", [1280, 720])
scene.render.resolution_x, scene.render.resolution_y = W, H
cam_data.sensor_fit = "HORIZONTAL"
th = cam_data.sensor_width / (2 * cam_data.lens)
tv = th * H / W
margin = cam_spec.get("margen", 1.18)
def _encuadre(dirv):
    f = -Vector(dirv).normalized()
    r = f.cross(Vector((0, 0, 1))).normalized()
    u = r.cross(f)
    d = max(max((c - center).dot(f) + abs((c - center).dot(r)) * margin / th,
                (c - center).dot(f) + abs((c - center).dot(u)) * margin / tv) for c in corners)
    return center - f * d, f


# Ningún objeto (pared, silla, banco, columna…) puede tapar a la paciente: si tapa >8 % del cuerpo se gira la
# cámara alrededor del eje vertical y se elige el ángulo menos tapado y más cercano al pedido por la ficha.
_skip_occ = {o for o, _ in MUSCLE_OBJS} | set(JOINT_OBJS) | set(WEAR.values()) | {body} | set(T_OBJS)
_occ_props = [o for o in scene.objects if o.type == "MESH" and o not in _skip_occ
              and o.name.split(".")[0] not in ("Suelo", "Colchoneta")]
_occ_samples = []
# En solo-máscara la cámara debe ser la MISMA del gris ya existente: el giro existe desde la fase 3
# (14-nov-2026 08:00 CST); los gris anteriores se renderizaron sin giro.
_T_GIRO = 1794664857
_gris_mp4 = os.path.join(os.path.abspath(args.out), "gris.mp4")
_giro_ok = not args.solo_mascara or (os.path.exists(_gris_mp4) and os.path.getmtime(_gris_mp4) > _T_GIRO)
if _occ_props and _giro_ok:
    _rng = np.random.default_rng(1)
    for fr in (1, FRAME_END // 2):
        scene.frame_set(fr)
        _co = eval_coords()[BODY_MASK] - _avance_en(fr)
        _occ_samples += [Vector(p.tolist()) for p in _co[_rng.choice(len(_co), 150, replace=False)]]
    _occ_set = set(_occ_props)

    def _ocluido(loc):
        n = 0
        dg = deps()
        for p in _occ_samples:
            dv = p - loc
            L = dv.length
            dv.normalize()
            o_, h = loc, False
            for _ in range(8):
                ok, hit, _n, _i, ob, _m = scene.ray_cast(dg, o_, dv, distance=(p - o_).length - 0.01)
                if not ok:
                    break
                if ob in _occ_set or ob.original in _occ_set:
                    h = True
                    break
                o_ = hit + dv * 0.003
            n += h
        return n / len(_occ_samples)

    scene.frame_set(1)
    _d0 = Vector(cam_spec["dir"])
    _loc, _f = _encuadre(_d0)
    _occ0 = _ocluido(_loc)
    if _occ0 > 0.08:
        _best = (_occ0, 0, _d0)
        for ang in (20, -20, 40, -40, 60, -60, 90, -90, 120, -120, 150, -150, 180):
            dv = Matrix.Rotation(math.radians(ang), 3, "Z") @ _d0
            oc = _ocluido(_encuadre(dv)[0])
            if oc + 0.0015 * abs(ang) < _best[0] + 0.0015 * abs(_best[1]):
                _best = (oc, ang, dv)
            if oc <= 0.02 and abs(ang) <= 60:
                break
        print("CAMARA_OCLUIDA", round(_occ0, 2), "-> giro", _best[1], "ocl", round(_best[0], 2))
        cam_spec = dict(cam_spec, dir=list(_best[2]))
        report["camara_giro"] = {"ocl_original": round(_occ0, 2), "giro_deg": _best[1], "ocl": round(_best[0], 2)}
        json.dump(report, open(os.path.join(args.out, "reporte.json"), "w"), ensure_ascii=False, indent=2)
cam.location, fwd = _encuadre(cam_spec["dir"])
right = fwd.cross(Vector((0, 0, 1))).normalized()
up = right.cross(fwd)
cam.rotation_euler = fwd.to_track_quat("-Z", "Y").to_euler()
if SPEC.get("avance"):                             # travelling lineal que acompaña el avance del ciclo
    _c0 = cam.location.copy()
    for fr in (1, FRAME_END + 1):
        cam.location = _c0 + Vector(_avance_en(fr).tolist())
        cam.keyframe_insert("location", frame=fr)
    for fc in cam.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    floor.scale = (60, 60, 0.02)
scene.frame_set(1)

# A) Lado visible: de cada músculo bilateral se dibuja sólo el lado más cercano a la cámara.
scene.frame_set(1)
update()
_hidden_far = set()
_pairs = {}
for o, info in MUSCLE_INFO.items():
    if info["bilateral"]:
        _pairs.setdefault((info["id"], info["parte"]), []).append(o)
for objs in _pairs.values():
    if len(objs) == 2:
        d = [(o.matrix_world.translation - cam.location).length for o in objs]
        _hidden_far.add(objs[0] if d[0] > d[1] else objs[1])

# B) Profundos del lado LEJANO a la cámara (p.ej. pectoral menor visto desde la espalda) no se dibujan: en rayos X
# se verían a través del tronco y confundirían el lado que trabaja.
_bvh_c = _bvh_now()
_far_deep = set()
for o, info in MUSCLE_INFO.items():
    if not info["profundo"] or o in _hidden_far:
        continue
    _me = o.evaluated_get(deps()).to_mesh()
    _pts = [o.matrix_world @ v.co for v in _me.vertices]
    o.to_mesh_clear()
    if not _pts:
        continue
    _c = sum(_pts, Vector((0, 0, 0))) / len(_pts)
    _inv = body.matrix_world.inverted()          # el BVH está en coordenadas LOCALES del cuerpo
    _cl, _c = _inv @ cam.location, _inv @ _c
    _dv = (_c - _cl)
    _dist = _dv.length
    _dv.normalize()
    _hit_in = _bvh_c.ray_cast(_cl, _dv)
    _hit_out = _bvh_c.ray_cast(_c + _dv * 2.0, -_dv)
    if _hit_in[0] is None or _hit_out[0] is None:
        continue
    d_in = (_hit_in[0] - _cl).length
    d_out = (_hit_out[0] - _cl).length
    if d_out > d_in and (_dist - d_in) / (d_out - d_in) > 0.55:
        _far_deep.add(o)
# …salvo que sean los ÚNICOS de su color (cuadrado lumbar, piriforme, pterigoideos): entonces se dibujan igual.
_BLUE_R = ("elongan", "estirados")
for _azul in (True, False):
    _grupo = [o for o, rol in MUSCLE_OBJS if (rol in _BLUE_R) == _azul]
    if _grupo and all(o in _hidden_far or o in _far_deep for o in _grupo):
        _far_deep -= set(_grupo)
_hidden_far |= _far_deep
print("PROFUNDOS_LEJANOS", sorted({MUSCLE_INFO[o]["id"] for o in _far_deep}))

# C) Superficiales TAPADOS por la propia piel desde esta cámara (trapecio superior visto de frente, dorsal visto de
# lado…): si son los únicos de su color, se pasan a rayos X; si no, el video quedaría sin ese color.
_kp = max(keys, key=lambda k: k.get("p", 0))
scene.frame_set(int(round(_kp["t"] * FPS)) + 1)
update()
_bvh_p = _bvh_now()
_tapado = set()
for o, info in MUSCLE_INFO.items():
    if info["profundo"] or o in _hidden_far:
        continue
    _me = o.evaluated_get(deps()).to_mesh()
    _vs = [o.matrix_world @ v.co for v in _me.vertices]
    o.to_mesh_clear()
    _vs = _vs[::max(1, len(_vs) // 300)]
    if not _vs:
        continue
    _vis = 0
    _inv = body.matrix_world.inverted()          # el BVH está en coordenadas LOCALES del cuerpo
    _cl = _inv @ cam.location
    for p_ in _vs:
        _dv = _inv @ p_ - _cl
        _dd = _dv.length
        _h = _bvh_p.ray_cast(_cl, _dv.normalized(), _dd)
        if _h[0] is None or (_h[0] - _cl).length > _dd - 0.015:
            _vis += 1
    print("VISIBLE", MUSCLE_INFO[o]["id"], round(_vis / len(_vs), 3))
    if _vis / len(_vs) < 0.30:
        _tapado.add(o)
_rayosx = set()
for _azul in (True, False):
    _grupo = [o for o, rol in MUSCLE_OBJS if (rol in _BLUE_R) == _azul and o not in _hidden_far]
    _verdes = [o for o in _grupo if MUSCLE_INFO[o]["profundo"] or o not in _tapado]
    if _grupo and not _verdes:
        _rayosx |= set(_grupo) & _tapado
print("TAPADOS_A_RAYOSX", sorted({MUSCLE_INFO[o]["id"] for o in _rayosx}))
scene.frame_set(1)
update()

# Oclusor: copia del cuerpo encogida 1,5 cm. Tapa lo profundo; lo superficial aflora con su forma sobre la piel.
occluder = body.copy()
occluder.data = body.data
occluder.name = "Oclusor"
scene.collection.objects.link(occluder)
for m in list(occluder.modifiers):
    if m.type == "SUBSURF":
        occluder.modifiers.remove(m)
for m in list(occluder.modifiers):          # piel COMPLETA: sin recortes bajo la ropa (si no, por el hueco se ve
    if m.type == "MASK" and m.name != "Hide helpers":   # la espalda a través del pecho)
        occluder.modifiers.remove(m)
dsp = occluder.modifiers.new("Encoger", "DISPLACE")
dsp.strength, dsp.mid_level = -0.015, 0.0
occluder.color = (0, 0, 0, 1)
occluder.hide_render = True

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "escena.blend"), compress=True)
if args.no_render:
    sys.exit(0)

# ─── Render de 3 pases (Workbench: rápido y determinista) ────────────────────
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
sh = scene.display.shading
muscles = [o for o, _ in MUSCLE_OBJS] + JOINT_OBJS
props = [o for o in scene.objects if o.type == "MESH" and o not in muscles and o is not body and o is not occluder]
# (el disco de "articulación resaltada" ya no se dibuja: sobre la piel se leía como una mancha blanca)
sup_muscles = [o for o, _ in MUSCLE_OBJS if o not in _hidden_far and not MUSCLE_INFO[o]["profundo"] and o not in _rayosx]
deep_muscles = [o for o, _ in MUSCLE_OBJS if o not in _hidden_far and (MUSCLE_INFO[o]["profundo"] or o in _rayosx)]
wear = list(WEAR.values())


def render_pass(folder, visible, light, transparent, bg=(0.97, 0.97, 0.97)):
    for o in scene.objects:
        if o.type == "MESH":
            o.hide_render = o not in visible
    sh.light = light
    sh.color_type = "OBJECT"
    sh.show_shadows = light == "STUDIO"
    sh.show_cavity = light == "STUDIO"
    scene.render.film_transparent = transparent
    scene.world = scene.world or bpy.data.worlds.new("W")
    scene.world.color = bg
    scene.render.filepath = os.path.join(os.path.abspath(args.out), folder, "f_")
    bpy.ops.render.render(animation=True)


body.color = (0.62, 0.63, 0.65, 1)
scene.world = scene.world or bpy.data.worlds.new("W")
scene.world.color = (0.97, 0.97, 0.97)
floor.scale = (40, 40, 0.02)
if args.still_capa:
    for o in scene.objects:
        if o.type == "MESH":
            o.hide_render = not (o is body or o is floor or o in sup_muscles or o in deep_muscles)
    body.color = (0.80, 0.80, 0.82, 1)
    for m in MASK_MOD.mods:                      # piel completa (sin ropa) para ver la capa
        if m.name != "Hide helpers":
            m.show_render = m.show_viewport = False
    sh.light, sh.color_type, sh.show_shadows, sh.show_cavity = "STUDIO", "OBJECT", False, False
    scene.frame_set(args.still_capa)
    for o, _ in MUSCLE_OBJS:                     # color de la capa, legible sobre el gris
        c = o.color
        k = max(c[0], c[1], c[2])
        if k > 0.02:
            o.color = (0.80 * (1 - k) + c[0], 0.80 * (1 - k) + c[1], 0.82 * (1 - k) + c[2], 1)
        else:
            o.hide_render = True
    scene.render.filepath = os.path.join(os.path.abspath(args.out), f"capa_{CAPA}_{args.still_capa}.png")
    bpy.ops.render.render(write_still=True)
    sys.exit(0)
if args.still:
    for o in scene.objects:
        if o.type == "MESH":
            o.hide_render = o in muscles
    sh.light, sh.color_type, sh.show_shadows = "STUDIO", "OBJECT", True
    scene.frame_set(args.still)
    scene.render.filepath = os.path.join(os.path.abspath(args.out), f"still_{args.still}.png")
    bpy.ops.render.render(write_still=True)
    sys.exit(0)
if not args.solo_mascara:
    render_pass("gris", [body] + props, "STUDIO", False)
# Los objetos (caja, mesa, banco, barra, puerta…) TAPAN la capa muscular: se pintan negros (= transparentes en la composición).
# (la ropa, el pelo y las cejas NO son objetos: si se pintan negros tapan toda la capa bajo la ropa)
mask_props = [o for o in props if o.name.split(".")[0] not in ("Suelo", "Colchoneta") and o not in wear and o not in T_OBJS]
for o in mask_props:
    o.color = (0, 0, 0, 1)
render_pass("mascara", sup_muscles + [occluder] + mask_props, "FLAT", True)
render_pass("mascara_prof", (deep_muscles or [occluder]) + mask_props, "FLAT", True)
body.color = (1, 1, 1, 1)
for o in wear:
    o.color = (1, 1, 1, 1)
render_pass("silueta", [body] + [WEAR[n] for n in ("Ropa",) if n in WEAR], "FLAT", True)
print("RENDER_OK", args.out)
