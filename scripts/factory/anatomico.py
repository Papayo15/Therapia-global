"""
Fábrica de video — VISTA ANATÓMICA (se ejecuta con exec() dentro de engine.py con --anatomico).

  - figura muscular completa del atlas en tono neutro; los músculos que trabajan en su color de fase
    (rojo concéntrico/isométrico, naranja excéntrico, azul elongación), que se enciende y apaga con el movimiento
  - piel sólo en cabeza (y manos/pies si no son la zona trabajada)
  - cámara en vaivén ±A° alrededor del cuerpo (vuelve al inicio: loop perfecto)
  - etiquetas.json: posición en pantalla de cada músculo trabajado, por cuadro (la app dibuja el nombre en su idioma)
Salida en la carpeta: anat/f_####.png → anatomico.mp4 (lo arma composite_anat.py) + etiquetas.json
"""
import json
import math
from bpy_extras.object_utils import world_to_camera_view

NEU = (0.70, 0.55, 0.52)                   # músculo en reposo: rosa grisáceo apagado (el color vivo = trabaja)
BG = (0.13, 0.14, 0.16)
A_SWING = SPEC.get("camara", {}).get("vaiven", 15 if _occ_props else 30)
OUTD = os.path.abspath(args.out)


def _fcurves(o):
    ad = o.animation_data
    if not ad or not ad.action:
        return []
    act = ad.action
    try:
        return [fc for fc in act.fcurves if fc.data_path == "color"]
    except AttributeError:                                  # acciones por capas (Blender ≥ 4.4)
        out = []
        for lay in act.layers:
            for st in lay.strips:
                for cb in st.channelbags:
                    out += [fc for fc in cb.fcurves if fc.data_path == "color"]
        return out


# ── 1) colores: neutro + color de fase mezclado según la intensidad ──
HUESO = (0.93, 0.90, 0.82)
for o in NEUTROS:
    o.color = (*(HUESO if o.name.startswith("HUE::") else NEU), 1)
for o, _ in MUSCLE_OBJS:
    fcs = {fc.array_index: fc for fc in _fcurves(o)}
    if len(fcs) < 3:
        o.color = (*NEU, 1)
        continue
    for i in range(len(fcs[0].keyframe_points)):
        c = [fcs[j].keyframe_points[i].co[1] for j in range(3)]
        k = max(c)
        for j in range(3):
            kp = fcs[j].keyframe_points[i]
            kp.co[1] = NEU[j] * (1 - k) + c[j]
            kp.interpolation = "LINEAR"
    for fc in fcs.values():
        fc.update()

# ── 2) piel sólo donde el atlas no tiene músculos ──
_hand_ids = {"abductor_digiti_minimi_hand", "abductor_pollicis_brevis", "adductor_pollicis", "dorsal_interossei_hand", "palmar_interossei",
             "lumbricals_hand", "opponens_pollicis", "flexor_pollicis_brevis"}
_foot_ids = {"flexor_digitorum_brevis", "extensor_digitorum_brevis", "lumbricals_foot"}
_act_ids = {MUSCLE_INFO[o]["id"] for o, _ in MUSCLE_OBJS}
_pref = ["head", "jaw", "eye", "tongue", "teeth", "neck03"]
if not _act_ids & _hand_ids:
    _pref += ["wrist", "finger", "metacarpal"]
if not _act_ids & _foot_ids:
    _pref += ["foot", "toe"]
vg = body.vertex_groups.new(name="ANAT_PIEL")
vg.add([i for i, g in enumerate(VERT_GROUP) if g.startswith(tuple(_pref))], 1.0, "REPLACE")
for m in body.modifiers:
    if m.type == "MASK":
        m.show_render = m.show_viewport = False
mk = body.modifiers.new("Anat_piel", "MASK")
mk.vertex_group = "ANAT_PIEL"
body.color = (0.42, 0.43, 0.46, 1)

# ── 3) cámara en vaivén ──
_d0 = cam.location - center
for fr in range(1, FRAME_END + 2):
    yaw = math.radians(A_SWING) * math.sin(2 * math.pi * (fr - 1) / FRAME_END)
    dv = Matrix.Rotation(yaw, 3, "Z") @ _d0
    loc, f_ = _encuadre(dv)
    cam.location = loc
    cam.rotation_euler = f_.to_track_quat("-Z", "Y").to_euler()
    cam.keyframe_insert("location", frame=fr)
    cam.keyframe_insert("rotation_euler", frame=fr)

# los rayos de scene.ray_cast ven lo visible en el VISOR, no en el render: la ropa, la piel completa, etc. (ocultas
# en el render) tapaban a todos los músculos → se igualan las dos visibilidades antes de cada pasada de rayos
def _rayos_como_render(visibles):
    for o in scene.objects:
        if o.type == "MESH":
            o.hide_viewport = o not in visibles
    update()


def _visor_normal():
    for o in scene.objects:
        if o.type == "MESH":
            o.hide_viewport = False
    update()


_PROPS_VIS = [o for o in props if o not in wear and o not in WEAR.values()]

# ── 4) músculos neutros que TAPAN a un músculo profundo que trabaja: se ocultan (como quitar una capa) ──
_deep_act = [o for o, _ in MUSCLE_OBJS if MUSCLE_INFO[o]["profundo"]]
if _deep_act:
    _kp = max(keys, key=lambda k: k.get("p", 0))
    for o in NEUTROS:
        o.hide_render = False
    _rayos_como_render(set(NEUTROS) | {o for o, _ in MUSCLE_OBJS} | {body} | set(_PROPS_VIS))
    for fr in (frame_of(_kp["t"]), max(1, frame_of(_kp["t"]) - FRAME_END // 4), min(FRAME_END, frame_of(_kp["t"]) + FRAME_END // 4)):
        scene.frame_set(fr)
        dg = deps()
        _neu = set(NEUTROS)
        for o in _deep_act:
            me = o.evaluated_get(dg).to_mesh()
            pts_ = [o.matrix_world @ me.vertices[i].co for i in range(0, len(me.vertices), max(1, len(me.vertices) // 120))]
            o.to_mesh_clear()
            for p_ in pts_:
                org = cam.matrix_world.translation
                for _ in range(4):
                    dv = p_ - org
                    L = dv.length
                    if L < 1e-4:
                        break
                    ok, hit, _n, _i, ob, _m = scene.ray_cast(dg, org, dv.normalized(), distance=L - 0.002)
                    if not ok:
                        break
                    obo = ob.original if hasattr(ob, "original") else ob
                    if obo in _neu and obo.hide_render is False:
                        obo.hide_render = True
                        obo["_quitado"] = True
                    org = hit + dv.normalized() * 0.001
    _visor_normal()
    print("NEUTROS_QUITADOS", sum(1 for o in NEUTROS if o.get("_quitado")))

# ── 5) render ──
_vis = set([o for o, _ in MUSCLE_OBJS] + [o for o in NEUTROS if not o.get("_quitado")] + [body]
           + [o for o in props if o not in wear])
for o in scene.objects:
    if o.type == "MESH":
        o.hide_render = o not in _vis
for o in WEAR.values():
    o.hide_render = True
if "Pelo" in WEAR:                                           # el pelo sí (cabeza reconocible)
    WEAR["Pelo"].hide_render = False
floor.color = (0.20, 0.21, 0.23, 1)
for o in scene.objects:
    if o.name.startswith("Colchoneta"):
        o.color = (0.26, 0.28, 0.31, 1)
sh.light, sh.color_type = "STUDIO", "OBJECT"
sh.show_shadows, sh.show_cavity = True, True
sh.cavity_type = "BOTH"
sh.show_specular_highlight = True
scene.render.film_transparent = False
scene.world.color = BG
scene.display.render_aa = "5"                               # suficiente a 720p y ~40 % más rápido que 8
if os.environ.get("ANAT_PROF"):
    import time
    for fr in (10, 11, 12):
        t0 = time.time(); scene.frame_set(fr); deps(); t1 = time.time()
        print(f"PROF frame_set {t1 - t0:.2f}s")
    for aa, shd, cav in (("5", True, True), ("5", False, True), ("5", True, False), ("5", False, False), ("OFF", False, False)):
        scene.display.render_aa = aa
        sh.show_shadows, sh.show_cavity = shd, cav
        scene.render.filepath = os.path.join(OUTD, f"prof_{aa}_{shd}_{cav}.png")
        t0 = time.time(); bpy.ops.render.render(write_still=True); print(f"PROF render aa={aa} sombras={shd} cavidad={cav} {time.time() - t0:.2f}s")
    for fr in (20, 21):
        scene.frame_set(fr)
        scene.render.filepath = os.path.join(OUTD, f"prof_gl{fr}.png")
        t0 = time.time()
        try:
            bpy.ops.render.opengl(write_still=True)
            print(f"PROF opengl {time.time() - t0:.2f}s")
        except Exception as e:
            print("PROF opengl ERROR", e)
    _h = [o for o in NEUTROS if not o.hide_render]
    for o in _h:
        o.hide_render = True
    scene.render.filepath = os.path.join(OUTD, "prof_sin_neutros.png")
    t0 = time.time(); bpy.ops.render.render(write_still=True); print(f"PROF render sin {len(_h)} neutros {time.time() - t0:.2f}s")
    for o in _h:
        o.hide_render = False
    mods = {}
    for o in scene.objects:
        if o.type == "MESH" and not o.hide_render:
            for m in o.modifiers:
                if m.show_render:
                    mods[m.type] = mods.get(m.type, 0) + 1
    print("PROF mods", mods, "verts", sum(len(o.data.vertices) for o in scene.objects if o.type == "MESH" and not o.hide_render))
    raise SystemExit(0)
if os.environ.get("ANAT_STILL"):
    scene.frame_set(int(os.environ["ANAT_STILL"]))
    scene.render.filepath = os.path.join(OUTD, f"anat_{os.environ['ANAT_STILL']}.png")
    bpy.ops.render.render(write_still=True)
    raise SystemExit(0)
if not os.environ.get("ANAT_SOLO_ETIQUETAS"):                # recalcular sólo etiquetas.json (sin volver a renderizar)
    scene.render.filepath = os.path.join(OUTD, "anat", "f_")
    bpy.ops.render.render(animation=True)
_rayos_como_render({o for o in scene.objects if o.type == "MESH" and not o.hide_render})

# ── 6) etiquetas: posición en pantalla de cada músculo trabajado, cuadro a cuadro ──
_grupos = {}
for o, rol in MUSCLE_OBJS:
    i_ = MUSCLE_INFO[o]
    _grupos.setdefault((i_["id"], i_["lado"]), {"objs": [], "rol": rol})["objs"].append(o)
NOMBRES = json.load(open(os.path.join(ROOT, "data/muscle_names.json"), encoding="utf-8"))["es"]
lab = {"fps": FPS, "frames": FRAME_END, "resolucion": [scene.render.resolution_x, scene.render.resolution_y],
       "musculos": [{"id": k[0], "lado": k[1], "rol": v["rol"], "nombre_es": NOMBRES.get(k[0], k[0])} for k, v in _grupos.items()],
       "pos": []}
_STEP = 2                                                    # cada 2 cuadros (la app interpola)
lab["paso"] = _STEP
for fr in range(1, FRAME_END + 1, _STEP):
    scene.frame_set(fr)
    dg = deps()
    row = []
    for (mid, sd), g in _grupos.items():
        pts_, inten = [], 0.0
        for o in g["objs"]:
            me = o.evaluated_get(dg).to_mesh()
            pts_ += [o.matrix_world @ me.vertices[i].co for i in range(0, len(me.vertices), max(1, len(me.vertices) // 60))]
            o.to_mesh_clear()
            c = o.color
            mx, mn = max(c[:3]), min(c[:3])
            inten = max(inten, (mx - mn) / mx if mx > 0 else 0)
        if not pts_:
            row.append(None)
            continue
        cen = sum(pts_, Vector()) / len(pts_)
        # punto del músculo más cercano al centro que se VEA desde la cámara
        org = cam.matrix_world.translation
        best = None
        for p_ in sorted(pts_, key=lambda q: (q - cen).length)[:12]:
            dv = p_ - org
            ok, hit, _n, _i, ob, _m = scene.ray_cast(dg, org, dv.normalized(), distance=dv.length + 0.01)
            obo = ob.original if (ok and hasattr(ob, "original")) else ob
            if ok and obo in g["objs"]:
                best = hit
                break
        q = best or cen
        v = world_to_camera_view(scene, cam, q)
        row.append([round(v.x, 4), round(1 - v.y, 4), 1 if best else 0, round(inten, 2)])
    lab["pos"].append(row)
json.dump(lab, open(os.path.join(OUTD, "etiquetas.json"), "w"), ensure_ascii=False)
print("ANATOMICO_OK", OUTD)
