# Therapia Global — Universal Medical Avatar System

Standardized patient and therapist avatars for all platform animations.

## Avatar Files

### `therapy_patient.glb`
- Neutral adult patient avatar
- Light, minimal clothing (shorts/sports top) for joint/muscle visibility
- Clear anatomical landmarks
- Neutral posture, suitable for all exercise starting positions
- Skin tone: neutral/light for clinical visibility

### `therapy_therapist.glb`
- Clinical therapist avatar
- Professional clinical attire (light scrubs or clinic polo)
- Standing neutral pose
- Used in osteopathy + manual therapy dual-avatar scenes

## Design Principles
- **Medical visualization style**: clean lines, no distracting details
- **Joint visibility**: clear articulation at shoulder, elbow, wrist, hip, knee, ankle, spine
- **Consistent scale**: both avatars compatible with same scene scale (1 Blender unit = 1 meter)
- **Neutral expression**: medical/professional, non-gendered when possible

## File Requirements
- Format: GLB (binary GLTF 2.0)
- Armature: compatible with Blender 3.6+ importss
- Polygon count: optimized for real-time + Cycles rendering (~15k–30k tris)
- UV mapped for material application (skin, clothing separate materials)

## Pipeline Usage
```python
# In blender_animation_template.py:
PATIENT_AVATAR  = "assets/avatars/therapy_patient.glb"
THERAPIST_AVATAR = "assets/avatars/therapy_therapist.glb"
```

These replace or supplement `assets/rigs/human_standard.glb` for final rendered outputs.
Rigs are used for keyframe animation; avatars are the visual mesh applied on top.
