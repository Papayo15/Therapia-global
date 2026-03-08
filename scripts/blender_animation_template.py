"""
Therapia Global — Blender Animation Template
=============================================
This template is used by pipeline_coordinator.py to render medical 3D animations.
It is parameterized via environment variables or direct script substitution.

Requirements:
  - Blender 3.6+ (LTS recommended)
  - mannequin_rig.glb in the assets/ directory (medical-grade neutral avatar)

Usage:
  blender --background --python scripts/blender_animation_template.py -- \
    --slug bird-dog \
    --type exercise \
    --camera front-45deg \
    --lighting medical-studio \
    --duration 5 \
    --fps 30 \
    --loopable true \
    --output-dir /path/to/therapia-global/public

Output files:
  /public/exercise-videos/{slug}.mp4
  /public/exercise-animations/{slug}.glb
  (Lottie export is handled separately by pipeline_coordinator.py via Bodymovin)

Animation phases (hard-coded, matches PipelineSpec):
  0.0–1.0s  Phase 1: Starting position
  1.0–4.0s  Phase 2: Primary therapeutic movement
  4.0–5.0s  Phase 3: Return to start / loop transition
"""

import bpy
import sys
import os
import argparse
import math

# ─── Argument Parsing ─────────────────────────────────────────────────────────
# Blender passes extra args after "--"
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []

parser = argparse.ArgumentParser(description="Therapia Global — Blender Animation Renderer")
parser.add_argument("--slug",        required=True,  help="Exercise or technique slug (e.g. bird-dog)")
parser.add_argument("--type",        default="exercise", choices=["exercise", "osteopathy"])
parser.add_argument("--camera",      default="front-45deg",
                    choices=["front-45deg","lateral","overhead","posterior","isometric","close-up-hands","close-up-head"])
parser.add_argument("--lighting",    default="medical-studio",
                    choices=["medical-studio","clinical-warm","anatomical-neutral"])
parser.add_argument("--duration",    type=float, default=5.0,   help="Clip duration in seconds")
parser.add_argument("--fps",         type=int,   default=30,    help="Frames per second")
parser.add_argument("--loopable",    default="true",            help="true/false")
parser.add_argument("--output-dir",  required=True,             help="Absolute path to /public directory")
parser.add_argument("--avatar-path", default="assets/mannequin_rig.glb", help="Path to avatar GLB")
args = parser.parse_args(argv)

SLUG        = args.slug
ANIM_TYPE   = args.type
CAMERA_PRESET = args.camera
LIGHTING    = args.lighting
DURATION    = args.duration
FPS         = args.fps
LOOPABLE    = args.loopable.lower() == "true"
OUTPUT_DIR  = args.output_dir
AVATAR_PATH = args.avatar_path

FRAME_END   = int(DURATION * FPS)
PHASE1_END  = int(1.0 * FPS)   # 30 frames
PHASE2_END  = int(4.0 * FPS)   # 120 frames

MP4_PATH  = os.path.join(OUTPUT_DIR, "exercise-videos",    f"{SLUG}.mp4")
GLB_PATH  = os.path.join(OUTPUT_DIR, "exercise-animations", f"{SLUG}.glb")

os.makedirs(os.path.dirname(MP4_PATH), exist_ok=True)
os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)

print(f"[PIPELINE] Rendering: {SLUG}")
print(f"[PIPELINE] Type: {ANIM_TYPE} | Camera: {CAMERA_PRESET} | Lighting: {LIGHTING}")
print(f"[PIPELINE] Output MP4: {MP4_PATH}")
print(f"[PIPELINE] Output GLB: {GLB_PATH}")

# ─── Scene Reset ──────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = FPS
scene.frame_start = 1
scene.frame_end = FRAME_END

# ─── Output Settings ─────────────────────────────────────────────────────────
scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"
scene.render.ffmpeg.codec = "H264"
scene.render.ffmpeg.constant_rate_factor = "HIGH"
scene.render.ffmpeg.audio_codec = "NONE"
scene.render.filepath = MP4_PATH

# ─── Camera Setup ─────────────────────────────────────────────────────────────
bpy.ops.object.camera_add()
camera = bpy.context.object
camera.name = "MainCamera"
scene.camera = camera

CAMERA_CONFIGS = {
    "front-45deg":    {"loc": (0, -3.5, 1.4),     "rot": (math.radians(75), 0, 0)},
    "lateral":        {"loc": (3.5, 0,   1.2),     "rot": (math.radians(75), 0, math.radians(90))},
    "overhead":       {"loc": (0,   0,   5.0),     "rot": (0, 0, 0)},
    "posterior":      {"loc": (0,   3.5, 1.4),     "rot": (math.radians(75), 0, math.radians(180))},
    "isometric":      {"loc": (2.5, -2.5, 2.5),   "rot": (math.radians(55), 0, math.radians(45))},
    "close-up-hands": {"loc": (0.5, -1.2, 0.8),   "rot": (math.radians(60), 0, math.radians(12))},
    "close-up-head":  {"loc": (0,   -1.5, 1.8),   "rot": (math.radians(46), 0, 0)},
}

cfg = CAMERA_CONFIGS.get(CAMERA_PRESET, CAMERA_CONFIGS["front-45deg"])
camera.location = cfg["loc"]
camera.rotation_euler = cfg["rot"]

# ─── Lighting Setup ───────────────────────────────────────────────────────────
def add_area_light(name, location, energy, color=(1,1,1), size=2.0):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.color = color
    light.data.size = size
    return light

if LIGHTING == "medical-studio":
    # 3-point medical studio: clean white, soft shadows
    add_area_light("KeyLight",  (2.5, -2.5, 3.5), energy=900,  color=(1.0, 1.0, 1.0))
    add_area_light("FillLight", (-2.5, -1.5, 2.0), energy=350, color=(0.95, 0.97, 1.0))
    add_area_light("RimLight",  (0, 2.5, 2.5),    energy=500,  color=(1.0, 1.0, 1.0))
    # White world background
    bpy.ops.world.new()
    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.95, 0.95, 0.97, 1.0)

elif LIGHTING == "clinical-warm":
    bpy.ops.object.light_add(type="SUN", location=(2, -1, 5))
    sun = bpy.context.object
    sun.data.energy = 3.5
    sun.data.color = (1.0, 0.97, 0.92)
    add_area_light("FillLight", (-2, -2, 2), energy=450, color=(0.9, 0.95, 1.0))
    bpy.ops.world.new()
    bpy.context.scene.world.use_nodes = True
    bpy.context.scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.98, 0.96, 0.93, 1.0)

else:  # anatomical-neutral
    add_area_light("MainLight", (0, -3, 3.5), energy=700)
    bpy.ops.world.new()
    bpy.context.scene.world.use_nodes = True
    bpy.context.scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.5, 0.5, 0.5, 1.0)

# ─── Avatar Import ────────────────────────────────────────────────────────────
avatar_obj = None
therapist_obj = None

if os.path.exists(AVATAR_PATH):
    bpy.ops.import_scene.gltf(filepath=AVATAR_PATH)
    imported = [o for o in bpy.context.selected_objects if o.type in ("ARMATURE", "MESH")]
    if imported:
        avatar_obj = imported[0]
        avatar_obj.name = "PatientAvatar"
        print(f"[PIPELINE] Avatar imported: {AVATAR_PATH}")
else:
    print(f"[PIPELINE] WARNING: Avatar not found at {AVATAR_PATH}. Using placeholder capsule.")
    bpy.ops.mesh.primitive_capsule_add(radius=0.35, depth=1.7, location=(0, 0, 0.85))
    avatar_obj = bpy.context.object
    avatar_obj.name = "PatientAvatar"

# Osteopathy: add therapist avatar
if ANIM_TYPE == "osteopathy":
    if os.path.exists(AVATAR_PATH):
        bpy.ops.import_scene.gltf(filepath=AVATAR_PATH)
        therapist_objs = [o for o in bpy.context.selected_objects if o.type in ("ARMATURE", "MESH")]
        if therapist_objs:
            therapist_obj = therapist_objs[0]
            therapist_obj.name = "TherapistAvatar"
            therapist_obj.location = (0, -0.7, 0)
    else:
        bpy.ops.mesh.primitive_capsule_add(radius=0.35, depth=1.7, location=(0, -0.7, 0.85))
        therapist_obj = bpy.context.object
        therapist_obj.name = "TherapistAvatar"

# ─── Muscle Highlight Material ────────────────────────────────────────────────
def create_highlight_material(name, color_rgba):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = color_rgba
    emit.inputs["Strength"].default_value = 0.3
    output = nodes.new("ShaderNodeOutputMaterial")
    mat.node_tree.links.new(emit.outputs[0], output.inputs[0])
    return mat

highlight_mat = create_highlight_material("MuscleHighlight", (0.0, 0.6, 1.0, 1.0))  # clinical blue

# ─── Animation Keyframes ──────────────────────────────────────────────────────
#
# THREE-PHASE ANIMATION (standard for all Therapia Global clips):
#
#   Phase 1 (frames 1–30):    Starting position
#     → Avatar moves to exercise starting position
#     → Camera settles
#
#   Phase 2 (frames 31–120):  Primary therapeutic movement
#     → Main exercise/technique motion
#     → Gradual, anatomically correct execution
#     → Muscle highlights pulse (keyframed emission strength)
#
#   Phase 3 (frames 121–150): Return to start / loop transition
#     → Smooth return to starting position
#     → Seamless loop point if LOOPABLE=True
#
# HOW TO ADD EXERCISE-SPECIFIC KEYFRAMES:
# 1. Select the avatar armature: bpy.context.view_layer.objects.active = avatar_obj
# 2. Enter pose mode: bpy.ops.object.mode_set(mode='POSE')
# 3. Get a bone: bone = avatar_obj.pose.bones['spine_01']
# 4. Set frame and insert keyframe:
#    scene.frame_set(1)
#    bone.rotation_euler = (0, 0, 0)
#    bone.keyframe_insert(data_path='rotation_euler')
#    scene.frame_set(75)
#    bone.rotation_euler = (math.radians(30), 0, 0)
#    bone.keyframe_insert(data_path='rotation_euler')
#    scene.frame_set(150)
#    bone.rotation_euler = (0, 0, 0)
#    bone.keyframe_insert(data_path='rotation_euler')
# 5. Exit pose mode: bpy.ops.object.mode_set(mode='OBJECT')
#
# NOTE: The actual keyframe values must be derived from the exercise's
# animationPrompt and biomechanical description. This template provides the
# scaffold — bone-level specifics are added per exercise by the coordinator.

# Placeholder keyframe to mark loop point
if avatar_obj and LOOPABLE:
    avatar_obj.keyframe_insert(data_path="location", frame=1)
    avatar_obj.keyframe_insert(data_path="location", frame=FRAME_END)
    print(f"[PIPELINE] Loop keyframes inserted at frames 1 and {FRAME_END}")

# ─── Treatment Table (for osteopathy techniques) ──────────────────────────────
if ANIM_TYPE == "osteopathy":
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.4))
    table = bpy.context.object
    table.name = "TreatmentTable"
    table.scale = (0.6, 2.0, 0.1)
    # White material for table
    table_mat = bpy.data.materials.new(name="TableWhite")
    table_mat.use_nodes = True
    table_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.95, 0.95, 0.95, 1)
    table.data.materials.append(table_mat)

# ─── Render MP4 ──────────────────────────────────────────────────────────────
print(f"[PIPELINE] Starting render... ({FRAME_END} frames @ {FPS}fps)")
bpy.ops.render.render(animation=True)
print(f"[PIPELINE] MP4 complete: {MP4_PATH}")

# ─── Export GLB ──────────────────────────────────────────────────────────────
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_morph=True,
    export_cameras=False,
    export_lights=False,
)
print(f"[PIPELINE] GLB complete: {GLB_PATH}")
print(f"[PIPELINE] SUCCESS: {SLUG}")
