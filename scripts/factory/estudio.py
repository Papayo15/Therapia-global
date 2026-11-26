"""
Fábrica de video — acabado "estudio" (fondo blanco, piel, ropa de color, sombra suave).

Reutiliza la escena ya armada (escena.blend) de cada ejercicio: misma cámara, mismo movimiento, mismo
encuadre que la capa muscular ya compuesta. Solo cambia la base visual.

  blender -b renders/ola1/F-CER-001--ambos/escena.blend -P scripts/factory/estudio.py -- [--still N]

Salida: <carpeta>/estudio/f_####.png  (o still_estudio.png con --still)
"""
import os
import sys

import bmesh
import bpy

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
STILL = int(argv[argv.index("--still") + 1]) if "--still" in argv else None
OUT = os.path.dirname(bpy.data.filepath)
scene = bpy.context.scene


def lin(r, g, b):
    """sRGB 0-255 → lineal (Blender trabaja en lineal)."""
    f = lambda c: (c / 255) / 12.92 if c / 255 <= 0.04045 else (((c / 255) + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1)


PIEL = lin(226, 178, 148)
TOP = lin(104, 196, 186)          # verde agua
LEGGINS = lin(38, 39, 44)         # casi negro
PELO = lin(86, 58, 40)
METAL = lin(120, 123, 130)
SUELO = lin(250, 250, 250)

objs = scene.objects
body = objs["Paciente"]
BONES = {b.name for b in objs["Paciente_Rig"].data.bones}   # grupos de vértices que son huesos (no Left/Right/Mid/helpers)


def main_bone(v, names):
    gs = [g for g in v.groups if names.get(g.group) in BONES and g.weight > 0]
    return names[max(gs, key=lambda x: x.weight).group] if gs else ""

# ── ropa en dos piezas: playera arriba, leggins abajo (según el hueso que más mueve cada vértice) ──
ropa = objs.get("Ropa")
if ropa and "Ropa_inf" not in objs:
    # corte por CARAS a la altura de la cintura (en reposo): ninguna cara se pierde, así no quedan huecos
    rig = objs["Paciente_Rig"]
    # en el espacio del esqueleto (no del mundo): sirve igual de pie que acostada en la camilla
    cintura = rig.data.bones["spine05"].head_local.z + 0.03
    to_rig = rig.matrix_world.inverted() @ ropa.matrix_world
    me = ropa.data
    low_face = [sum((to_rig @ me.vertices[i].co).z for i in f.vertices) / len(f.vertices) < cintura for f in me.polygons]
    inf = ropa.copy()
    inf.data = ropa.data.copy()
    inf.name = "Ropa_inf"
    scene.collection.objects.link(inf)
    for ob, drop_low in ((ropa, True), (inf, False)):
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bm.faces.ensure_lookup_table()
        kill = [f for f in bm.faces if low_face[f.index] == drop_low]
        bmesh.ops.delete(bm, geom=kill, context="FACES_ONLY")
        loose = [v for v in bm.verts if not v.link_faces]
        bmesh.ops.delete(bm, geom=loose, context="VERTS")
        bm.to_mesh(ob.data)
        bm.free()
    ropa.color, inf.color = TOP, LEGGINS

body.color = PIEL
for n in ("Pelo", "Cejas"):
    if n in objs:
        objs[n].color = PELO
if "Suelo" in objs:
    objs["Suelo"].scale = (40, 40, 0.02)          # como en el render original: sin borde visible
# osteopatía: terapeuta con uniforme clínico azul marino
if "Terapeuta" in objs:
    objs["Terapeuta"].color = lin(205, 160, 128)
    for n, c in (("Ropa.001", lin(46, 72, 120)), ("Pelo.001", lin(48, 36, 28)), ("Cejas.001", lin(48, 36, 28))):
        if n in objs:
            objs[n].color = c

# ── qué se ve: cuerpo, ropa, pelo y objetos; nunca músculos, articulaciones ni el oclusor ──
WEAR = {"Paciente", "Ropa", "Ropa_inf", "Pelo", "Cejas", "Terapeuta", "Ropa.001", "Pelo.001", "Cejas.001"}
for o in objs:
    if o.type != "MESH":
        continue
    hide = o.name.startswith(("ATL::", "J_", "M_", "Musc")) or o.name == "Oclusor"
    o.hide_render = hide
    if hide or o.name in WEAR:
        continue
    base = o.name.split(".")[0]
    if base in ("Suelo",):
        o.color = SUELO
    elif base.startswith("Silla"):
        o.color = METAL
    else:                                           # props: se respeta su color, un poco más limpio
        o.color = tuple(min(1.0, c * 1.08) for c in o.color[:3]) + (1,)

# ── colores por vértice (Workbench en modo atributo): todos los objetos visibles llevan uno ──
TORSO = ("spine05", "spine04", "spine03", "spine02", "pelvis")       # abdomen: el top deportivo lo deja descubierto → playera completa


def paint(o, fn):
    me = o.data
    a = me.color_attributes.get("tg_col") or me.color_attributes.new("tg_col", "FLOAT_COLOR", "POINT")
    vals = [0.0] * (len(me.vertices) * 4)
    for v in me.vertices:
        vals[v.index * 4:v.index * 4 + 4] = fn(v)
    a.data.foreach_set("color", vals)
    me.color_attributes.active_color = a
    me.color_attributes.render_color_index = me.color_attributes.find("tg_col")


bnames = {g.index: g.name for g in body.vertex_groups}


def body_col(v):
    w = sum(g.weight for g in v.groups if bnames.get(g.group, "").startswith(TORSO))
    return TOP if w >= 0.4 else PIEL


for o in objs:
    if o.type != "MESH" or o.hide_render:
        continue
    if o is body:
        paint(o, body_col)
    elif o.name.split(".")[0] == "Suelo":
        paint(o, lambda v: (1.9, 1.9, 1.9, 1))
    else:
        c = tuple(o.color)
        paint(o, lambda v, c=c: c)

# ── render: Workbench (funciona sin pantalla y es determinista), luz de estudio, fondo blanco ──
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.render_aa = "16"
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
sh = scene.display.shading
sh.light = "STUDIO"
sh.studio_light = os.environ.get("TG_LIGHT", "paint.sl")
sh.use_world_space_lighting = os.environ.get("TG_WORLD", "0") == "1"
sh.studiolight_rotate_z = float(os.environ.get("TG_ROT", "0"))
sh.color_type = "VERTEX"
sh.show_shadows = True
sh.shadow_intensity = 0.22
scene.display.light_direction = (0.35, -0.45, 0.82)
scene.display.shadow_shift = 0.08
scene.display.shadow_focus = 0.6
sh.show_cavity = True
sh.cavity_type = "WORLD"
sh.cavity_ridge_factor = 0.4
sh.cavity_valley_factor = 0.7
sh.show_specular_highlight = True
sh.show_object_outline = False
scene.render.film_transparent = False
scene.world = scene.world or bpy.data.worlds.new("W")
scene.world.color = (1, 1, 1)
sh.background_type = "WORLD" if hasattr(sh, "background_type") else None
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"

if STILL:
    scene.frame_set(STILL)
    scene.render.resolution_percentage = int(os.environ.get("TG_PCT", "100"))
    scene.render.filepath = os.environ.get("TG_OUT") or os.path.join(OUT, "still_estudio.png")
    bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = os.path.join(OUT, "estudio", "f_")
    bpy.ops.render.render(animation=True)
print("ESTUDIO_OK", OUT)
