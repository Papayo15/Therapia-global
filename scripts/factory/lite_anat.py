"""
Avatar anatómico LIGERO para render masivo: decima ATL/ATN/HUE y emparenta cada hueso (HUE::, rígido) a su hueso del rig
en lugar de deformarlo con un modificador. ~1,65 M → ~0,5 M vértices: el render de cada cuadro baja proporcionalmente.
  blender -b assets/rigs/avatar_f40_anat.blend -P scripts/factory/lite_anat.py -- [ratio_musculo] [ratio_hueso]
Salida: assets/rigs/avatar_f40_anat_lite.blend
"""
import os
import sys
import bpy

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
R_MUS = float(argv[0]) if argv else 0.35
R_HUE = float(argv[1]) if len(argv) > 1 else 0.25
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
for pb in rig.pose.bones:                                   # pose de reposo para emparentar sin saltos
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()

n0 = n1 = 0
for o in list(bpy.data.objects):
    if o.type != "MESH" or not o.name.startswith(("ATL::", "ATN::", "HUE::")):
        continue
    n0 += len(o.data.vertices)
    r = R_HUE if o.name.startswith("HUE::") else R_MUS
    if len(o.data.vertices) > 300 and not bpy.data.filepath.endswith("_lite.blend"):   # ya ligero: sólo re-emparentar
        if o.data.users > 1:
            o.data = o.data.copy()
        d = o.modifiers.new("Dec", "DECIMATE")
        d.ratio = r
        d.use_collapse_triangulate = False
        # aplicar el decimado ANTES del modificador de armadura (sobre la malla en reposo)
        with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o]):
            bpy.ops.object.modifier_move_to_index(modifier="Dec", index=0)
            bpy.ops.object.modifier_apply(modifier="Dec")
    if o.name.startswith("HUE::") and len(o.vertex_groups) == 1:
        bone = o.vertex_groups[0].name
        if bone in rig.data.bones:
            mw = o.matrix_world.copy()
            for m in list(o.modifiers):
                if m.type == "ARMATURE":
                    o.modifiers.remove(m)
            o.parent, o.parent_type, o.parent_bone = rig, "BONE", bone
            bpy.context.view_layer.update()
            o.matrix_world = mw
            o.vertex_groups.clear()
    n1 += len(o.data.vertices)
print(f"LITE vertices {n0} → {n1}")

# esqueleto axial (costillas, cartílagos, esternón, vértebras) → SIEMPRE al segmento de columna más cercano:
# por cercanía caían en brazo/hombro/mama y se movían con el brazo
from mathutils import Vector
from mathutils.geometry import intersect_point_line
AXIAL = ("rib", "costal", "sternum", "xiphoid", "manubrium", "vertebra", "sacrum", "coccyx", "atlas", "axis")
COL = [b for b in rig.data.bones if b.name.startswith(("spine", "neck", "root", "pelvis"))]


def _dist(p, b):
    h, t = rig.matrix_world @ b.head_local, rig.matrix_world @ b.tail_local
    q, f = intersect_point_line(p, h, t)
    return (p - (h if f < 0 else t if f > 1 else q)).length


nfix = 0
for o in bpy.data.objects:
    if not (o.name.startswith("HUE::") and o.parent_bone and any(k in o.name.lower() for k in AXIAL)):
        continue
    cen = o.matrix_world @ (sum((v.co for v in o.data.vertices), Vector()) / max(1, len(o.data.vertices)))
    b = min(COL, key=lambda b: _dist(cen, b))
    if b.name != o.parent_bone:
        mw = o.matrix_world.copy()
        o.parent_bone = b.name
        bpy.context.view_layer.update()
        o.matrix_world = mw
        nfix += 1
print("LITE axial reasignados", nfix)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "assets/rigs/avatar_f40_anat_lite.blend"), compress=True)
