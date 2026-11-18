"""
Fábrica de video — Fase 1: avatar base.
Crea con MPFB2 el TERAPEUTA (hombre ~40 años) para osteopatía con rig
"default" (dedos, mandíbula, dedos del pie) y la guarda como .blend reutilizable.

  blender -b -P scripts/factory/build_avatar.py -- --out assets/rigs/avatar_f40.blend
"""
import argparse, sys
import bpy
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
args = ap.parse_args(argv)

# Limpia la escena
bpy.ops.wm.read_factory_settings(use_empty=True)

macro = TargetService.get_default_macro_info_dict()
macro.update({
    "gender": 1.0,
    "age": 0.615,         # MPFB: 0.5 = 25 años, 1.0 = 90 → ~40 años
    "muscle": 0.5,
    "weight": 0.5,
    "height": 0.5,
    "proportions": 0.6,
})
body = HumanService.create_human(macro_detail_dict=macro, scale=0.1, feet_on_ground=True)
body.name = "Terapeuta"
rig = HumanService.add_builtin_rig(body, "default", import_weights=True)
rig.name = "Terapeuta_Rig"

# Ropa y pelo (paquete CC0 "makehuman_system_assets" instalado en los datos de usuario de MPFB)
import os
from bl_ext.blender_org.mpfb.services.locationservice import LocationService
ud = LocationService.get_user_data()
for rel, kind in (("clothes/male_worksuit01/male_worksuit01.mhclo", "Clothes"),
                  ("hair/short02/short02.mhclo", "Hair"),
                  ("eyebrows/eyebrow001/eyebrow001.mhclo", "Eyebrows")):
    f = os.path.join(ud, rel)
    if os.path.exists(f):
        obj = HumanService.add_mhclo_asset(f, body, asset_type=kind, subdiv_levels=0)
        obj.name = {"Clothes": "Ropa", "Hair": "Pelo", "Eyebrows": "Cejas"}[kind]
        print("ASSET_OK", rel)
    else:
        print("ASSET_FALTA", rel)

dims = body.dimensions
print(f"AVATAR_OK altura={dims.z:.3f}m huesos={len(rig.data.bones)}")
print("BONES", ",".join(b.name for b in rig.data.bones))
bpy.ops.wm.save_as_mainfile(filepath=bpy.path.abspath(args.out))
print("SAVED", args.out)
