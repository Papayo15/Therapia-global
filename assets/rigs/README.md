# Therapia Global — Blender Rig Assets

Place the following GLB rig files in this directory before running the pipeline coordinator.

## Required Rig Files

### `human_standard.glb`
- Neutral humanoid, ~1.75m height
- Medical visualization style (light skin tone, clear joint markers)
- Minimal clothing (shorts/tank top) for joint visibility
- Compatible bone naming: spine_01, spine_02, spine_03, neck_01, head,
  upperarm_l, lowerarm_l, hand_l, upperarm_r, lowerarm_r, hand_r,
  thigh_l, calf_l, foot_l, thigh_r, calf_r, foot_r
- Used for: exercises (single avatar)

### `therapy_table.glb`
- Clinical treatment table, white/clinical grey
- Dimensions: ~0.6m wide × 2.0m long × 0.85m height (standard plinth)
- Clean medical aesthetic
- Used for: osteopathy techniques (background prop)

### `dual_rig_therapy.glb`
- Two linked humanoid rigs: patient (supine/seated) + therapist (standing)
- Patient and therapist positioned for manual therapy contact
- Bone naming same as human_standard, suffixed with _patient and _therapist
- Used for: osteopathy and manual therapy techniques

## Asset Sources
- Medical-grade avatars can be sourced from: Mixamo, TurboSquid (medical category), or custom Blender rig
- Ensure Creative Commons or commercial license for clinical use
- Export from Blender as GLB with Apply Modifiers enabled

## Pipeline Integration
The pipeline coordinator (`scripts/pipeline_coordinator.py`) reads these rigs via:
```python
AVATAR_PATH = os.path.join(os.getcwd(), "assets", "rigs", "human_standard.glb")
```
The Blender template (`scripts/blender_animation_template.py`) imports them via `bpy.ops.import_scene.gltf()`.
