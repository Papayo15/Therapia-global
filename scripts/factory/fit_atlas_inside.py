"""
Mete el atlas muscular DENTRO de la piel de la paciente (vista anatómica).

El ajuste de build_atlas.py usa sólo centros articulares: en cadera/muslo/abdomen el atlas (pelvis masculina, más ancha
en trocánteres) quedaba hasta ~12 cm por fuera de la silueta → figura con "alforjas" que asusta. Aquí, en pose de reposo:
  1. cada vértice de músculo (ATL::/ATN::) que queda fuera de la piel o a menos de MARGEN se lleva bajo la piel
     (punto más cercano de la piel − normal × MARGEN);
  2. el desplazamiento se suaviza sobre la malla (sin pliegues) y se repite hasta que nada sobresale;
  3. los huesos (HUE::) que sobresalgan se mueven en bloque (son rígidos).
  blender -b assets/rigs/avatar_f40_anat_lite.blend -P scripts/factory/fit_atlas_inside.py -- [salida.blend]
"""
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else bpy.data.filepath
MARGEN = 0.004          # músculo superficial ~4 mm bajo la piel
Z_MAX = 1.0              # por encima (cintura) no se toca: ver abajo
X_MIN = 0.10             # ni la zona central (pelvis profunda, periné)

rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
for pb in rig.pose.bones:
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
body = bpy.data.objects["Paciente"]
for m in body.modifiers:
    if m.type == "MASK":
        m.show_viewport = False
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()

# piel (sólo el grupo "body": sin ojos, dientes, pelo) en coordenadas de mundo, pose de reposo, separada por zona:
# en la pose A la mano queda junto al muslo y el brazo junto al tronco → un músculo de pierna/tronco nunca debe
# "pegarse" a la piel del brazo (ni al revés)
ARM = ("upperarm", "lowerarm", "wrist", "finger", "metacarpal")
LEG = ("upperleg", "lowerleg", "foot", "toe")


def clase(n):
    return "arm" if n.startswith(ARM) else "leg" if n.startswith(LEG) else "tronco"


be = body.evaluated_get(dg)
bm = be.to_mesh()
gname = {g.index: g.name for g in body.vertex_groups}
gi = body.vertex_groups["body"].index
keep = np.array([any(g.group == gi and g.weight > 0.5 for g in v.groups) for v in body.data.vertices])
vclase = []
for v in body.data.vertices:
    w = {}
    for g in v.groups:
        n = gname[g.group]
        if n != "body" and not n.startswith("ANAT"):
            w[clase(n)] = w.get(clase(n), 0) + g.weight
    # piel con cualquier peso de brazo = brazo (la mano en pose A toca el muslo y tiene pesos mezclados)
    vclase.append("arm" if w.get("arm", 0) > 0.05 else max(w, key=w.get) if w else "tronco")
MW = body.matrix_world
verts = [MW @ v.co for v in bm.vertices]
SKIN = {}
for c, excl in (("arm", "leg"), ("leg", "arm"), ("tronco", "arm")):
    polys = [list(p.vertices) for p in bm.polygons if all(keep[i] and vclase[i] != excl for i in p.vertices)]
    SKIN[c] = BVHTree.FromPolygons(verts, polys)
    print(f"piel para {c}: {len(polys)} caras")
be.to_mesh_clear()
skin = SKIN["tronco"]


def fuera(p, tree=None):
    """distancia con signo a la piel (+ = fuera) y el punto/normal más cercanos"""
    loc, nor, _, _ = (tree or skin).find_nearest(p)
    if loc is None:
        return -1, None, None
    return (p - loc).dot(nor), loc, nor


def aristas(me):
    e = np.empty(len(me.edges) * 2, dtype=np.int64)
    me.edges.foreach_get("vertices", e)
    return e.reshape(-1, 2)


def suavizar(D, E, n_it=12):
    """promedio de vecinos, conservando siempre el desplazamiento mayor (lo necesario para quedar dentro)"""
    n = len(D)
    deg = np.bincount(E.ravel(), minlength=n).astype(float)
    deg[deg == 0] = 1
    for _ in range(n_it):
        S = np.zeros_like(D)
        np.add.at(S, E[:, 0], D[E[:, 1]])
        np.add.at(S, E[:, 1], D[E[:, 0]])
        m_ = S / deg[:, None]
        D = np.where((np.linalg.norm(D, axis=1) >= np.linalg.norm(m_, axis=1))[:, None], D, m_)
    return D


tot = mov = 0
peor = []
for o in bpy.data.objects:
    if o.type != "MESH" or not o.name.startswith(("ATL::", "ATN::")):
        continue
    me = o.data
    if me.users > 1:
        o.data = me = me.copy()
    M = o.matrix_world
    Mi = M.inverted()
    co = np.array([tuple(M @ v.co) for v in me.vertices])
    _gn = {g.index: g.name for g in o.vertex_groups}
    _w = {}
    for v in me.vertices:
        for g in v.groups:
            _w[clase(_gn[g.group])] = _w.get(clase(_gn[g.group]), 0) + g.weight
    _cl = max(_w, key=_w.get) if _w else "tronco"
    # sólo pelvis y muslos (donde el atlas masculino desborda a la paciente); tronco y brazos ya ajustan bien y
    # proyectarlos dejaba costillas a la vista y bandas brazo→cadera
    if _cl == "arm" or co[:, 2].mean() > Z_MAX - 0.05:
        continue
    tree = SKIN[_cl]
    nb = None
    maxd0 = 0
    for it in range(6):
        D = np.zeros_like(co)
        viol = 0
        for i, p in enumerate(co):
            s, loc, nor = fuera(Vector(p), tree)
            # sólo la cara externa de cadera/muslo/pierna: en zonas cóncavas (ingle, periné) la piel más cercana a un
            # músculo profundo de la pelvis es la cara interna del muslo y el signo "fuera" engaña
            if loc is not None and s > -MARGEN and p[2] < Z_MAX and abs(p[0]) > X_MIN:
                D[i] = np.array(loc - nor * MARGEN) - p
                viol += 1
                if it == 0:
                    maxd0 = max(maxd0, s + MARGEN)
        if not viol:
            break
        if nb is None:
            nb = aristas(me)
        co = co + suavizar(D, nb)      # sin escalones entre lo movido y lo que no
    tot += 1
    if maxd0 > 0.002:
        mov += 1
        peor.append((maxd0, o.name))
        for v, p in zip(me.vertices, co):
            v.co = Mi @ Vector(p)
        me.update()

# huesos (HUE::) no se mueven: son rígidos y moverlos los separaría de sus articulaciones; sólo se informa
for o in bpy.data.objects:
    if o.type == "MESH" and o.name.startswith("HUE::"):
        M = o.matrix_world
        w_ = max((fuera(M @ v.co)[0] for v in list(o.data.vertices)[:: max(1, len(o.data.vertices) // 200)]), default=-1)
        if w_ > 0.005:
            print(f"  HUESO FUERA {w_ * 100:.1f} cm {o.name}")

peor.sort(reverse=True)
print(f"FIT_INSIDE objetos {tot}, ajustados {mov}")
for d, n in peor[:20]:
    print(f"  {d * 100:5.1f} cm  {n}")
for m in body.modifiers:
    if m.type == "MASK":
        m.show_viewport = True
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("GUARDADO", OUT)
