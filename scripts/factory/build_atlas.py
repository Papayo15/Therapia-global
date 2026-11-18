"""
Ajusta el atlas muscular Z-Anatomy (CC BY-SA 4.0) a la paciente y lo deja riggeado en el avatar.

  blender -b assets/rigs/avatar_f40.blend -P scripts/factory/build_atlas.py

1. Centros articulares del esqueleto del atlas  ↔  cabezas/colas de los huesos del rig (pose de reposo).
2. Deformación thin-plate spline con puntos de control por segmento (eje + dos direcciones de marco),
   lo que respeta la rotación de cada segmento (brazos del atlas en posición anatómica → pose A del rig).
3. Pesos de esqueleto copiados del vértice de piel más cercano → los músculos siguen cualquier pose.
Resultado: colección oculta "Atlas" dentro de assets/rigs/avatar_f40.blend (objetos "ATL::<nombre>.<l|r>").
"""
import glob
import json
import os

import bpy
import numpy as np
from mathutils import Vector
from mathutils.kdtree import KDTree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ATLAS = os.path.join(ROOT, "assets/atlas")
MAP = json.load(open(os.path.join(ROOT, "data/atlas_map.json"), encoding="utf-8"))["mapa"]
WANTED = {n for v in MAP.values() for n in v}

rig = bpy.data.objects["Paciente_Rig"]
body = bpy.data.objects["Paciente"]
ANAT = os.environ.get("ATLAS_ANAT") == "1"     # vista anatómica: + resto de músculos (ATN::) + esqueleto rígido (HUE::)
old = bpy.data.collections.get("Atlas")
if old and not ANAT:
    for o in list(old.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(old)


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    bpy.context.view_layer.update()              # matrices del mundo actualizadas antes de leer vértices
    new = [o for o in bpy.data.objects if o not in before]
    for o in new:                                # se hornea la transformación y se quita la jerarquía del glTF
        if o.type == "MESH":
            mw = o.matrix_world.copy()
            o.parent = None
            o.matrix_world = mw
    bpy.context.view_layer.update()
    return new


def wverts(o):
    co = np.empty(len(o.data.vertices) * 3)
    o.data.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    M = np.array(o.matrix_world)
    return co @ M[:3, :3].T + M[:3, 3]


# ─── 1. Centros articulares del atlas ────────────────────────────────────────
skel = import_glb(os.path.join(ATLAS, "skeletal.glb"))
S = {o.name: wverts(o) for o in skel if o.type == "MESH"}


def top(v, d=0.035, medial=True):
    sel = v[v[:, 2] > v[:, 2].max() - d]
    if medial:
        sel = sel[np.abs(sel[:, 0]) <= np.median(np.abs(sel[:, 0]))]
    return sel.mean(0)


def bottom(v, d=0.025):
    return v[v[:, 2] < v[:, 2].min() + d].mean(0)


A = {}
for s, sl in (("L", "l"), ("R", "r")):
    fem, tib, fib = S[f"Femur.{sl}"], S[f"Tibia.{sl}"], S[f"Fibula.{sl}"]
    hum, rad, uln = S[f"Humerus.{sl}"], S[f"Radius.{sl}"], S[f"Ulna.{sl}"]
    A[f"hip.{s}"] = top(fem, 0.04)
    A[f"knee.{s}"] = (bottom(fem, 0.03) + top(tib, 0.03, False)) / 2
    A[f"ankle.{s}"] = (bottom(tib, 0.02) + bottom(fib, 0.02)) / 2
    A[f"toe.{s}"] = S[f"Distal phalanx of second finger of foot.{sl}"].mean(0)
    A[f"shoulder.{s}"] = top(hum, 0.03)
    A[f"elbow.{s}"] = bottom(hum, 0.025)
    A[f"wrist.{s}"] = (bottom(rad, 0.015) + bottom(uln, 0.015)) / 2
    A[f"hand.{s}"] = S[f"Distal phalanx of third finger of hand.{sl}"].mean(0)
    A[f"thumb.{s}"] = S[f"Proximal phalanx of first finger of hand.{sl}"].mean(0)
    A[f"pinky.{s}"] = S[f"Proximal phalanx of fifth finger of hand.{sl}"].mean(0)
A["c7"] = S["Vertebra C7"].mean(0)
par = np.vstack([v for n, v in S.items() if n.startswith("Parietal bone")])
A["skull"] = np.array([0.0, par[:, 1].mean(), par[:, 2].max()])
A["sacrum"] = S["Sacrum"].mean(0)
for o in skel:
    bpy.data.objects.remove(o, do_unlink=True)

# ─── Los mismos puntos en el rig (reposo) ────────────────────────────────────
B = {b.name: b for b in rig.data.bones}
W = np.array(rig.matrix_world)


def rp(v):
    v = np.array(v)
    return v @ W[:3, :3].T + W[:3, 3]


R = {}
for s in ("L", "R"):
    R[f"hip.{s}"] = rp(B[f"upperleg01.{s}"].head_local)
    R[f"knee.{s}"] = rp(B[f"lowerleg01.{s}"].head_local)
    R[f"ankle.{s}"] = rp(B[f"foot.{s}"].head_local)
    R[f"toe.{s}"] = rp(B[f"toe2-3.{s}"].tail_local)
    R[f"shoulder.{s}"] = rp(B[f"upperarm01.{s}"].head_local)
    R[f"elbow.{s}"] = rp(B[f"lowerarm01.{s}"].head_local)
    R[f"wrist.{s}"] = rp(B[f"wrist.{s}"].head_local)
    R[f"hand.{s}"] = rp(B[f"finger3-3.{s}"].tail_local)
    R[f"thumb.{s}"] = rp(B[f"finger1-2.{s}"].head_local)
    R[f"pinky.{s}"] = rp(B[f"finger5-1.{s}"].head_local)
R["c7"] = rp(B["neck01"].head_local)
R["skull"] = rp(B["head"].tail_local)
R["sacrum"] = rp(B["root"].head_local)

# ─── 2. Puntos de control: centros + marco de cada segmento ──────────────────
SEGS = []
for s in ("L", "R"):
    SEGS += [(f"hip.{s}", f"knee.{s}", "ant"), (f"knee.{s}", f"ankle.{s}", "ant"), (f"ankle.{s}", f"toe.{s}", "up"),
             (f"shoulder.{s}", f"elbow.{s}", "ant"), (f"elbow.{s}", f"wrist.{s}", f"rad.{s}"), (f"wrist.{s}", f"hand.{s}", f"rad.{s}")]
SEGS += [("sacrum", "c7", "ant"), ("c7", "skull", "ant")]


def frame(D, p, d, kind):
    P, Q = D[p], D[d]
    u = Q - P
    L = np.linalg.norm(u)
    u = u / L
    if kind == "ant":
        v = np.array([0, -1.0, 0])
    elif kind == "up":
        v = np.array([0, 0, 1.0])
    else:                                         # radial: pulgar ← meñique
        s = kind.split(".")[1]
        v = D[f"thumb.{s}"] - D[f"pinky.{s}"]
    v = v - u * v.dot(u)
    v /= np.linalg.norm(v)
    w = np.cross(u, v)
    M = (P + Q) / 2
    return [P, Q, M + v * 0.25 * L, M + w * 0.25 * L, M - v * 0.25 * L]


src, dst = [], []
for p, d, kind in SEGS:
    src += frame(A, p, d, kind)
    dst += frame(R, p, d, kind)
src, dst = np.array(src), np.array(dst)
_, keep = np.unique(np.round(src, 4), axis=0, return_index=True)
src, dst = src[sorted(keep)], dst[sorted(keep)]
n = len(src)
K = np.linalg.norm(src[:, None] - src[None], axis=2)
P = np.hstack([np.ones((n, 1)), src])
Lm = np.zeros((n + 4, n + 4))
Lm[:n, :n], Lm[:n, n:], Lm[n:, :n] = K, P, P.T
sol = np.linalg.solve(Lm, np.vstack([dst, np.zeros((4, 3))]))
Wt, Af = sol[:n], sol[n:]
for k_ in ("hip.L", "knee.L", "shoulder.L", "c7", "skull"):
    print("LANDMARK", k_, np.round(A[k_], 3), "→", np.round(R[k_], 3))
print(f"TPS con {n} puntos de control; error residual {np.abs(np.hstack([np.ones((n,1)),src]) @ Af + K @ Wt - dst).max():.2e}")


def warp(x):
    out = np.empty_like(x)
    for i in range(0, len(x), 20000):
        c = x[i:i + 20000]
        out[i:i + 20000] = np.linalg.norm(c[:, None] - src[None], axis=2) @ Wt + np.hstack([np.ones((len(c), 1)), c]) @ Af
    return out


# ─── 3. Músculos: importar, deformar, pesar y riggear ────────────────────────
col = bpy.data.collections.new("Atlas")
bpy.context.scene.collection.children.link(col)
bverts = np.array([v.co for v in body.data.vertices])
bvg = {g.index: g.name for g in body.vertex_groups}
bodymask = [any(bvg[g.group] == "body" for g in v.groups) for v in body.data.vertices]
kd = KDTree(int(sum(bodymask)))
for i, v in enumerate(body.data.vertices):
    if bodymask[i]:
        kd.insert(rig.matrix_world.inverted() @ (body.matrix_world @ v.co), i)
kd.balance()
bone_names = {b.name for b in rig.data.bones}
vweights = [[(bvg[g.group], g.weight) for g in v.groups if bvg[g.group] in bone_names and g.weight > 0.02] for v in body.data.vertices]

kept = 0
for f in sorted(glob.glob(os.path.join(ATLAS, "muscular-*.glb"))):
    for o in import_glb(f):
        base = o.name.rsplit(".", 1)[0] if o.name.endswith((".l", ".r")) else o.name
        if o.type != "MESH" or (base not in WANTED) != ANAT:
            bpy.data.objects.remove(o, do_unlink=True)
            continue
        side = o.name.rsplit(".", 1)[1] if o.name.endswith((".l", ".r")) else "c"
        if o.data.users > 1:                     # .l y .r comparten malla en el glTF: cada uno su copia
            o.data = o.data.copy()
        _pre = wverts(o)
        wv = warp(_pre)
        if base == "Gluteus maximus muscle" and side == "l":
            print("DBGW pre", np.round(_pre.mean(0), 3), "post", np.round(wv.mean(0), 3), "hipwarp", np.round(warp(A["hip.L"][None])[0], 3),
                  "rigW", np.round(np.array(rig.matrix_world), 3).tolist())
        o.parent = None
        o.matrix_world = rig.matrix_world.copy()
        loc = (wv - np.array(rig.matrix_world)[:3, 3]) @ np.linalg.inv(np.array(rig.matrix_world)[:3, :3]).T
        o.data.vertices.foreach_set("co", loc.ravel())
        o.data.update()
        if base == "Gluteus maximus muscle" and side == "l":
            bpy.context.view_layer.update()
            print("DBGW written", np.round(wverts(o).mean(0), 3), "mw", np.round(np.array(o.matrix_world), 3).tolist(), "shape_keys", bool(o.data.shape_keys))
        groups = {}
        for i, p in enumerate(loc):
            _, j, _ = kd.find(Vector(p))
            for g, w in vweights[j]:
                groups.setdefault(g, ([], []))
                groups[g][0].append(i)
                groups[g][1].append(w)
        for g, (idx, ws) in groups.items():
            vg = o.vertex_groups.new(name=g)
            for w in sorted(set(ws)):
                vg.add([i for i, ww in zip(idx, ws) if ww == w], w, "REPLACE")
        mod = o.modifiers.new("Armature", "ARMATURE")
        mod.object = rig
        o.parent = rig
        o.matrix_parent_inverse = rig.matrix_world.inverted()
        o.name = f"{'ATN' if ANAT else 'ATL'}::{base}.{side}"
        o["atlas"] = base
        o["lado"] = {"l": "L", "r": "R"}.get(side, "C")
        for c in o.users_collection:
            c.objects.unlink(o)
        col.objects.link(o)
        o.hide_render = True
        kept += 1
for o in [o for o in bpy.data.objects if o.type == "EMPTY" and not o.users_collection]:
    bpy.data.objects.remove(o, do_unlink=True)
col.hide_render = False
print(f"ATLAS_OK músculos ajustados: {kept}")
if not ANAT:
    bpy.ops.wm.save_mainfile()
    raise SystemExit(0)

# ─── 4. (vista anatómica) Esqueleto: cada hueso RÍGIDO al hueso del rig que más lo mueve ───
nb = 0
for o in import_glb(os.path.join(ATLAS, "skeletal.glb")):
    if o.type != "MESH":
        bpy.data.objects.remove(o, do_unlink=True)
        continue
    if o.data.users > 1:
        o.data = o.data.copy()
    wv = warp(wverts(o))
    o.parent = None
    o.matrix_world = rig.matrix_world.copy()
    loc = (wv - np.array(rig.matrix_world)[:3, 3]) @ np.linalg.inv(np.array(rig.matrix_world)[:3, :3]).T
    o.data.vertices.foreach_set("co", loc.ravel())
    o.data.update()
    # hueso del rig cuyo SEGMENTO (cabeza→cola) pasa más cerca del centro del hueso anatómico
    c_ = loc.mean(0)
    best, g = 1e9, None
    for b in rig.data.bones:
        if not b.use_deform or b.name.startswith(("oculi", "orbicularis", "levator", "risorius", "temporalis", "special",
                                                  "tongue", "breast", "toe", "finger", "metacarpal")):
            continue
        a_, b_ = np.array(b.head_local), np.array(b.tail_local)
        ab = b_ - a_
        t = np.clip(np.dot(c_ - a_, ab) / max(1e-9, np.dot(ab, ab)), 0, 1)
        dd = np.linalg.norm(c_ - (a_ + t * ab))
        if dd < best:
            best, g = dd, b.name
    # dedos de manos y pies: al hueso más cercano entre TODOS (falanges pequeñas)
    if best > 0.03:
        for b in rig.data.bones:
            if not b.use_deform:
                continue
            a_, b_ = np.array(b.head_local), np.array(b.tail_local)
            ab = b_ - a_
            t = np.clip(np.dot(c_ - a_, ab) / max(1e-9, np.dot(ab, ab)), 0, 1)
            dd = np.linalg.norm(c_ - (a_ + t * ab))
            if dd < best:
                best, g = dd, b.name
    vg = o.vertex_groups.new(name=g)
    vg.add(list(range(len(loc))), 1.0, "REPLACE")
    mod = o.modifiers.new("Armature", "ARMATURE")
    mod.object = rig
    o.parent = rig
    o.matrix_parent_inverse = rig.matrix_world.inverted()
    o.name = f"HUE::{o.name}"
    for c in o.users_collection:
        c.objects.unlink(o)
    col.objects.link(o)
    o.hide_render = True
    nb += 1
for o in [o for o in bpy.data.objects if o.type == "EMPTY" and not o.users_collection]:
    bpy.data.objects.remove(o, do_unlink=True)
print(f"ESQUELETO_OK huesos: {nb}")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "assets/rigs/avatar_f40_anat.blend"), compress=True)
