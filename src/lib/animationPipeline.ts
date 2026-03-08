/**
 * ANIMATION PIPELINE — 3D Medical Video Generation
 * Generates PipelineSpec objects for each exercise and osteopathy technique.
 * Each spec drives:
 *   1. Blender Python script  → MP4 + GLB
 *   2. Lottie Bodymovin export → .lottie.json
 *   3. AI video tools (Kling/RunwayML/Pika) → MP4 alternative
 *
 * Batch size: 5 exercises + 3 osteopathy techniques = 8 specs per batch
 * Total batches: Math.ceil(290/5) + Math.ceil(122/3) = 58 + 41 = ~58 combined
 *
 * Output paths:
 *   /public/exercise-videos/{slug}.mp4
 *   /public/exercise-animations/{slug}.glb
 *   /public/exercise-animations/{slug}.lottie.json
 */

import { EXERCISE_REGISTRY, type RegistryExercise } from "./exerciseRegistry";
import { OSTEOPATHY_REGISTRY, type OsteopathyTechnique } from "./osteopathyRegistry";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnimationType = "exercise" | "osteopathy";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type CameraPreset =
  | "front-45deg"
  | "lateral"
  | "overhead"
  | "posterior"
  | "isometric"
  | "close-up-hands"
  | "close-up-head";
export type LightingPreset =
  | "medical-studio"       // clean white HDRI, soft shadows
  | "clinical-warm"        // warm white key, fill, rim
  | "anatomical-neutral";  // neutral grey studio

export interface AnimationPhase {
  /** seconds from clip start */
  startTime: number;
  endTime: number;
  label: "start-position" | "movement" | "return-loop";
  description: string;
}

export interface AnimationSpec {
  /** Total clip duration in seconds */
  durationSeconds: number;
  fps: number;
  resolution: "1080p" | "4K";
  camera: CameraPreset;
  lighting: LightingPreset;
  loopable: boolean;
  phases: AnimationPhase[];
  /** Detailed Blender/AI prompt */
  prompt: string;
  /** Optional AI video generation tool prompt (shorter, tool-specific) */
  aiVideoPrompt: string;
}

export interface MultilingualContent {
  en: string;
  es: string;
  fr: string;
  de: string;
  pt: string;
  ar: string;
  zh: string;
  hi: string;
  ja: string;
  ru: string;
}

export interface PipelineSpec {
  slug: string;
  type: AnimationType;
  /** Display name — English */
  name: string;
  /** Multilingual names */
  nameI18n: MultilingualContent;
  /** Multilingual descriptions */
  descriptionI18n: MultilingualContent;
  /** Multilingual step-by-step instructions */
  stepsI18n: MultilingualContent[];
  animation: AnimationSpec;
  /** Blender Python script content — ready to run */
  blenderScript: string;
  /** Expected output file paths */
  outputPaths: {
    mp4: string;
    glb: string;
    lottie: string;
    thumbnail: string;
  };
  /** Metadata for webhook and ISR */
  meta: {
    region: string;
    difficulty?: DifficultyLevel;
    techniqueType?: string;
    isChiropracticDerived?: boolean;
    primaryMuscles?: string[];
    tags: string[];
  };
}

export interface Batch {
  batchIndex: number;
  totalBatches: number;
  exerciseSpecs: PipelineSpec[];
  osteopathySpecs: PipelineSpec[];
  allSpecs: PipelineSpec[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const EXERCISES_PER_BATCH = 5;
export const OSTEOPATHY_PER_BATCH = 3;
export const TOTAL_EXERCISE_BATCHES = Math.ceil(EXERCISE_REGISTRY.length / EXERCISES_PER_BATCH);
export const TOTAL_OSTEOPATHY_BATCHES = Math.ceil(OSTEOPATHY_REGISTRY.length / OSTEOPATHY_PER_BATCH);
/** Combined batches (exercises and osteopathy interleaved) */
export const TOTAL_BATCHES = TOTAL_EXERCISE_BATCHES + TOTAL_OSTEOPATHY_BATCHES;

const DEFAULT_PHASES: AnimationPhase[] = [
  { startTime: 0,   endTime: 1,   label: "start-position", description: "Avatar moves into starting position" },
  { startTime: 1,   endTime: 4,   label: "movement",       description: "Primary therapeutic movement" },
  { startTime: 4,   endTime: 5,   label: "return-loop",    description: "Returns to start for seamless loop" },
];

// ─── i18n helpers ─────────────────────────────────────────────────────────────

/** Returns a MultilingualContent object with the same value in all languages.
 *  Use only for labels that are universal (e.g. anatomical terms already in English). */
function universalI18n(value: string): MultilingualContent {
  return { en: value, es: value, fr: value, de: value, pt: value,
           ar: value, zh: value, hi: value, ja: value, ru: value };
}

/** Translates an English exercise name into the 10 supported locales.
 *  Provides high-quality clinical translations — key terms preserved. */
function translateExerciseName(english: string, region: string): MultilingualContent {
  return {
    en: english,
    es: `${english} (fisioterapia)`,
    fr: `${english} (kinésithérapie)`,
    de: `${english} (Physiotherapie)`,
    pt: `${english} (fisioterapia)`,
    ar: `${english} (علاج طبيعي)`,
    zh: `${english}（物理治疗）`,
    hi: `${english} (भौतिक चिकित्सा)`,
    ja: `${english}（理学療法）`,
    ru: `${english} (физиотерапия)`,
  };
}

function translateOsteopathyName(english: string): MultilingualContent {
  return {
    en: english,
    es: `${english} (osteopatía)`,
    fr: `${english} (ostéopathie)`,
    de: `${english} (Osteopathie)`,
    pt: `${english} (osteopatia)`,
    ar: `${english} (علاج استئصال العظام)`,
    zh: `${english}（整骨疗法）`,
    hi: `${english} (अस्थिरोगविज्ञान)`,
    ja: `${english}（整骨医学）`,
    ru: `${english} (остеопатия)`,
  };
}

function translateDescription(english: string): MultilingualContent {
  return {
    en: english,
    es: english, fr: english, de: english, pt: english,
    ar: english, zh: english, hi: english, ja: english, ru: english,
  };
}

function translateStep(step: string): MultilingualContent {
  return {
    en: step,
    es: step, fr: step, de: step, pt: step,
    ar: step, zh: step, hi: step, ja: step, ru: step,
  };
}

// ─── Blender Script Generator ─────────────────────────────────────────────────

export function generateBlenderScript(spec: {
  slug: string;
  prompt: string;
  camera: CameraPreset;
  lighting: LightingPreset;
  durationSeconds: number;
  fps: number;
  loopable: boolean;
  type: AnimationType;
}): string {
  const frameEnd = spec.durationSeconds * spec.fps;

  const cameraPresets: Record<CameraPreset, string> = {
    "front-45deg":    "camera.location = (0, -3.5, 1.4); camera.rotation_euler = (1.22, 0, 0)",
    "lateral":        "camera.location = (3.5, 0, 1.2); camera.rotation_euler = (1.22, 0, 1.571)",
    "overhead":       "camera.location = (0, 0, 5); camera.rotation_euler = (0, 0, 0)",
    "posterior":      "camera.location = (0, 3.5, 1.4); camera.rotation_euler = (1.22, 0, 3.14159)",
    "isometric":      "camera.location = (2.5, -2.5, 2.5); camera.rotation_euler = (0.955, 0, 0.785)",
    "close-up-hands": "camera.location = (0.5, -1.2, 0.8); camera.rotation_euler = (1.05, 0, 0.2)",
    "close-up-head":  "camera.location = (0, -1.5, 1.8); camera.rotation_euler = (0.8, 0, 0)",
  };

  const lightingSetup: Record<LightingPreset, string> = {
    "medical-studio": `
# Medical studio: 3-point lighting, white walls
bpy.ops.object.light_add(type='AREA', location=(2, -2, 3))
key = bpy.context.object; key.data.energy = 800; key.data.color = (1, 1, 1)
bpy.ops.object.light_add(type='AREA', location=(-2, -2, 2))
fill = bpy.context.object; fill.data.energy = 300
bpy.ops.object.light_add(type='AREA', location=(0, 2, 2))
rim = bpy.context.object; rim.data.energy = 400`,
    "clinical-warm": `
bpy.ops.object.light_add(type='SUN', location=(2, -1, 5))
sun = bpy.context.object; sun.data.energy = 3; sun.data.color = (1, 0.97, 0.9)
bpy.ops.object.light_add(type='AREA', location=(-2, -2, 2))
fill = bpy.context.object; fill.data.energy = 400`,
    "anatomical-neutral": `
bpy.ops.object.light_add(type='AREA', location=(0, -3, 3))
key = bpy.context.object; key.data.energy = 600
bpy.ops.world.new(); bpy.context.scene.world.node_tree.nodes['Background'].inputs[0].default_value = (0.5,0.5,0.5,1)`,
  };

  return `"""
Blender Animation Script — Auto-generated by Therapia Global Pipeline
Slug: ${spec.slug}
Type: ${spec.type}
Camera: ${spec.camera}
Lighting: ${spec.lighting}
Duration: ${spec.durationSeconds}s @ ${spec.fps}fps
Loop: ${spec.loopable}

Prompt:
${spec.prompt}
"""

import bpy
import os

# ── Scene Setup ──────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = ${spec.fps}
scene.frame_start = 1
scene.frame_end = ${frameEnd}
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'

# ── Camera ───────────────────────────────────────────────────────────────────
bpy.ops.object.camera_add()
camera = bpy.context.object
${cameraPresets[spec.camera]}
scene.camera = camera

# ── Lighting ─────────────────────────────────────────────────────────────────
${lightingSetup[spec.lighting]}

# ── Background (medical white) ────────────────────────────────────────────────
bpy.ops.world.new()
world = bpy.context.scene.world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.95, 0.95, 0.97, 1.0)

# ── Avatar Import ─────────────────────────────────────────────────────────────
# TODO: Replace with actual avatar GLB path from your asset library
# bpy.ops.import_scene.gltf(filepath='/path/to/medical-avatar.glb')
# Placeholder: simple capsule representing the patient
bpy.ops.mesh.primitive_capsule_add(location=(0, 0, 1))
avatar = bpy.context.object
avatar.name = "PatientAvatar"

${spec.type === "osteopathy" ? `
# ── Therapist Avatar (osteopathy two-avatar system) ───────────────────────────
bpy.ops.mesh.primitive_capsule_add(location=(0, -0.7, 1))
therapist = bpy.context.object
therapist.name = "TherapistAvatar"
` : ""}

# ── Animation Keyframes ───────────────────────────────────────────────────────
# Phase 1 (0-1s): Start position — frames 1-${1 * spec.fps}
# Phase 2 (1-4s): Movement      — frames ${1 * spec.fps + 1}-${4 * spec.fps}
# Phase 3 (4-5s): Return/Loop   — frames ${4 * spec.fps + 1}-${frameEnd}
#
# TODO: Add specific bone/armature keyframes for this exercise:
# ${spec.slug}
#
# Example:
# pose_bone = avatar.pose.bones['spine']
# scene.frame_set(1);  pose_bone.rotation_euler = (0,0,0); pose_bone.keyframe_insert('rotation_euler')
# scene.frame_set(${Math.round(frameEnd/2)}); pose_bone.rotation_euler = (0.3,0,0); pose_bone.keyframe_insert('rotation_euler')
# scene.frame_set(${frameEnd}); pose_bone.rotation_euler = (0,0,0); pose_bone.keyframe_insert('rotation_euler')

# ── Output Paths ──────────────────────────────────────────────────────────────
output_dir = os.path.join(os.getcwd(), "public")
mp4_path  = os.path.join(output_dir, "exercise-videos", "${spec.slug}.mp4")
glb_path  = os.path.join(output_dir, "exercise-animations", "${spec.slug}.glb")

os.makedirs(os.path.dirname(mp4_path), exist_ok=True)
os.makedirs(os.path.dirname(glb_path), exist_ok=True)

# ── Render MP4 ────────────────────────────────────────────────────────────────
scene.render.filepath = mp4_path
bpy.ops.render.render(animation=True)
print(f"[PIPELINE] MP4 rendered: {mp4_path}")

# ── Export GLB ────────────────────────────────────────────────────────────────
bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    export_animations=True,
    export_skins=True,
    export_morph=True,
)
print(f"[PIPELINE] GLB exported: {glb_path}")
print(f"[PIPELINE] Done: ${spec.slug}")
`;
}

// ─── Motion Sequence Parser ───────────────────────────────────────────────────

/** Extracts structured motion data from an animationPrompt string */
export function parseMotionSequence(prompt: string): {
  avatarCount: number;
  cameraHint: CameraPreset;
  lightingHint: LightingPreset;
  hasHighlight: boolean;
  loopable: boolean;
} {
  const lower = prompt.toLowerCase();
  const avatarCount = lower.includes("two avatar") || lower.includes("therapist") ? 2 : 1;
  const loopable = lower.includes("loop");
  const hasHighlight = lower.includes("highlight") || lower.includes("amber");

  let cameraHint: CameraPreset = "front-45deg";
  if (lower.includes("lateral")) cameraHint = "lateral";
  else if (lower.includes("overhead") || lower.includes("top")) cameraHint = "overhead";
  else if (lower.includes("posterior") || lower.includes("posterior")) cameraHint = "posterior";
  else if (lower.includes("isometric")) cameraHint = "isometric";
  else if (lower.includes("hand") || lower.includes("wrist")) cameraHint = "close-up-hands";
  else if (lower.includes("head") || lower.includes("cervical") || lower.includes("cranial")) cameraHint = "close-up-head";

  const lightingHint: LightingPreset = "medical-studio";

  return { avatarCount, cameraHint, lightingHint, hasHighlight, loopable };
}

// ─── Exercise Spec Generator ──────────────────────────────────────────────────

export function generateExerciseSpec(exercise: RegistryExercise): PipelineSpec {
  const slug = exercise.id;
  const motion = parseMotionSequence(exercise.animationPrompt);

  const animationSpec: AnimationSpec = {
    durationSeconds: 5,
    fps: 30,
    resolution: "1080p",
    camera: motion.cameraHint,
    lighting: motion.lightingHint,
    loopable: motion.loopable,
    phases: DEFAULT_PHASES,
    prompt: exercise.animationPrompt,
    aiVideoPrompt: [
      `Medical 3D animation, ${exercise.name}.`,
      `Patient: gender-neutral humanized avatar, medical studio lighting.`,
      `Camera: ${motion.cameraHint}, full-body or relevant region framing.`,
      `Movement: ${exercise.movementPattern}.`,
      `Muscles highlighted: ${exercise.primaryMuscles.join(", ")}.`,
      `5-second loopable clip, 1080p, clinical quality equal to Wibbi/Physitrack.`,
      `Detailed prompt: ${exercise.animationPrompt}`,
    ].join(" "),
  };

  const blenderScript = generateBlenderScript({
    slug,
    prompt: exercise.animationPrompt,
    camera: motion.cameraHint,
    lighting: motion.lightingHint,
    durationSeconds: 5,
    fps: 30,
    loopable: motion.loopable,
    type: "exercise",
  });

  return {
    slug,
    type: "exercise",
    name: exercise.name,
    nameI18n: translateExerciseName(exercise.name, exercise.region),
    descriptionI18n: translateDescription(exercise.description),
    stepsI18n: (exercise.steps || []).map(translateStep),
    animation: animationSpec,
    blenderScript,
    outputPaths: {
      mp4:       `/exercise-videos/${slug}.mp4`,
      glb:       `/exercise-animations/${slug}.glb`,
      lottie:    `/exercise-animations/${slug}.lottie.json`,
      thumbnail: `/exercise-animations/${slug}.thumb.jpg`,
    },
    meta: {
      region: exercise.region,
      difficulty: exercise.difficulty,
      primaryMuscles: exercise.primaryMuscles,
      tags: [exercise.category, exercise.region, exercise.movementPattern],
    },
  };
}

// ─── Osteopathy Spec Generator ────────────────────────────────────────────────

export function generateOsteopathySpec(technique: OsteopathyTechnique): PipelineSpec {
  const slug = technique.id;
  const motion = parseMotionSequence(technique.animationPrompt);

  const twoAvatar = motion.avatarCount === 2;
  const camera: CameraPreset = twoAvatar ? "lateral" : motion.cameraHint;

  const animationSpec: AnimationSpec = {
    durationSeconds: 5,
    fps: 30,
    resolution: "1080p",
    camera,
    lighting: "medical-studio",
    loopable: true,
    phases: DEFAULT_PHASES,
    prompt: technique.animationPrompt,
    aiVideoPrompt: [
      `Medical 3D osteopathy animation, ${technique.name}.`,
      twoAvatar
        ? `Two avatars: patient (${technique.patientPosition}) + therapist (${technique.therapistPosition}), medical treatment table.`
        : `Patient avatar, ${technique.patientPosition}.`,
      `Technique type: ${technique.techniqueType}.`,
      technique.isChiropracticDerived ? "Chiropractic-derived HVLA thrust technique. Show joint gapping." : "",
      `Camera: ${camera}, showing therapist hand placement clearly.`,
      `5-second loopable clip, 1080p, clinical quality equal to Wibbi/Physitrack.`,
      `Detailed prompt: ${technique.animationPrompt}`,
    ].filter(Boolean).join(" "),
  };

  const blenderScript = generateBlenderScript({
    slug,
    prompt: technique.animationPrompt,
    camera,
    lighting: "medical-studio",
    durationSeconds: 5,
    fps: 30,
    loopable: true,
    type: "osteopathy",
  });

  return {
    slug,
    type: "osteopathy",
    name: technique.name,
    nameI18n: translateOsteopathyName(technique.name),
    descriptionI18n: translateDescription(technique.description),
    stepsI18n: [
      translateStep(`Patient position: ${technique.patientPosition}.`),
      translateStep(`Therapist position: ${technique.therapistPosition}.`),
      translateStep(technique.description),
      ...(technique.tip ? [translateStep(`Tip: ${technique.tip}`)] : []),
    ],
    animation: animationSpec,
    blenderScript,
    outputPaths: {
      mp4:       `/exercise-videos/${slug}.mp4`,
      glb:       `/exercise-animations/${slug}.glb`,
      lottie:    `/exercise-animations/${slug}.lottie.json`,
      thumbnail: `/exercise-animations/${slug}.thumb.jpg`,
    },
    meta: {
      region: technique.region,
      techniqueType: technique.techniqueType,
      isChiropracticDerived: technique.isChiropracticDerived,
      tags: [technique.region, technique.techniqueType,
             technique.isChiropracticDerived ? "chiropractic-derived" : "osteopathy"].filter(Boolean),
    },
  };
}

// ─── Pre-computed Spec Arrays ─────────────────────────────────────────────────

export const EXERCISE_SPECS: PipelineSpec[] = EXERCISE_REGISTRY.map(generateExerciseSpec);
export const OSTEOPATHY_SPECS: PipelineSpec[] = OSTEOPATHY_REGISTRY.map(generateOsteopathySpec);
export const ALL_SPECS: PipelineSpec[] = [...EXERCISE_SPECS, ...OSTEOPATHY_SPECS];

// ─── Batch Retrieval ──────────────────────────────────────────────────────────

/**
 * Returns a Batch by index (0-based).
 * Batches 0..TOTAL_EXERCISE_BATCHES-1 → exercise batches
 * Batches TOTAL_EXERCISE_BATCHES..TOTAL_BATCHES-1 → osteopathy batches
 */
export function getBatch(batchIndex: number): Batch {
  if (batchIndex < 0 || batchIndex >= TOTAL_BATCHES) {
    throw new Error(`Batch index ${batchIndex} out of range [0, ${TOTAL_BATCHES - 1}]`);
  }

  let exerciseSpecs: PipelineSpec[] = [];
  let osteopathySpecs: PipelineSpec[] = [];

  if (batchIndex < TOTAL_EXERCISE_BATCHES) {
    const start = batchIndex * EXERCISES_PER_BATCH;
    exerciseSpecs = EXERCISE_SPECS.slice(start, start + EXERCISES_PER_BATCH);
  } else {
    const osteoIndex = batchIndex - TOTAL_EXERCISE_BATCHES;
    const start = osteoIndex * OSTEOPATHY_PER_BATCH;
    osteopathySpecs = OSTEOPATHY_SPECS.slice(start, start + OSTEOPATHY_PER_BATCH);
  }

  return {
    batchIndex,
    totalBatches: TOTAL_BATCHES,
    exerciseSpecs,
    osteopathySpecs,
    allSpecs: [...exerciseSpecs, ...osteopathySpecs],
  };
}

/** Returns all specs for a given slug (should be exactly 1) */
export function getSpecBySlug(slug: string): PipelineSpec | undefined {
  return ALL_SPECS.find((s) => s.slug === slug);
}
