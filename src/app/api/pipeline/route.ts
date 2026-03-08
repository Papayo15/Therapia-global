/**
 * GET /api/pipeline
 *
 * Query params:
 *   batch=N         → returns Batch N (0-based), all specs as JSON
 *   slug=<slug>     → returns single PipelineSpec for that slug
 *   format=prompts  → returns only AI video prompts + i18n names (lighter payload)
 *   format=blender  → returns only Blender scripts (larger payload)
 *   format=full     → returns full PipelineSpec including all 10 locale fields (default)
 *
 * Examples:
 *   GET /api/pipeline
 *   GET /api/pipeline?batch=0
 *   GET /api/pipeline?batch=0&format=prompts
 *   GET /api/pipeline?slug=cervical-side-flexion-stretch
 *   GET /api/pipeline?slug=cervical-side-flexion-stretch&format=blender
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBatch,
  getSpecBySlug,
  TOTAL_BATCHES,
  TOTAL_EXERCISE_BATCHES,
  TOTAL_OSTEOPATHY_BATCHES,
  EXERCISE_SPECS,
  OSTEOPATHY_SPECS,
  type PipelineSpec,
} from "@/lib/animationPipeline";

type Format = "full" | "prompts" | "blender";

function applyFormat(spec: PipelineSpec, format: Format) {
  if (format === "prompts") {
    return {
      slug: spec.slug,
      type: spec.type,
      name: spec.name,
      nameI18n: spec.nameI18n,          // all 10 locales
      descriptionI18n: spec.descriptionI18n,
      animation: {
        prompt: spec.animation.prompt,
        aiVideoPrompt: spec.animation.aiVideoPrompt,
        camera: spec.animation.camera,
        lighting: spec.animation.lighting,
        durationSeconds: spec.animation.durationSeconds,
        fps: spec.animation.fps,
        loopable: spec.animation.loopable,
        phases: spec.animation.phases,
      },
      outputPaths: spec.outputPaths,
      meta: spec.meta,
    };
  }

  if (format === "blender") {
    return {
      slug: spec.slug,
      type: spec.type,
      name: spec.name,
      nameI18n: spec.nameI18n,
      blenderScript: spec.blenderScript,
      outputPaths: spec.outputPaths,
      animation: {
        camera: spec.animation.camera,
        lighting: spec.animation.lighting,
        durationSeconds: spec.animation.durationSeconds,
        fps: spec.animation.fps,
        loopable: spec.animation.loopable,
        phases: spec.animation.phases,
      },
    };
  }

  return spec; // "full" — includes nameI18n, descriptionI18n, stepsI18n, blenderScript
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const batchParam = searchParams.get("batch");
  const slugParam  = searchParams.get("slug");
  const format     = (searchParams.get("format") ?? "full") as Format;

  // ── Single slug ───────────────────────────────────────────────────────────
  if (slugParam) {
    const spec = getSpecBySlug(slugParam);
    if (!spec) {
      return NextResponse.json(
        { error: `Slug not found: ${slugParam}` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { spec: applyFormat(spec, format) },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      }
    );
  }

  // ── Batch ─────────────────────────────────────────────────────────────────
  if (batchParam !== null) {
    const batchIndex = parseInt(batchParam, 10);
    if (isNaN(batchIndex) || batchIndex < 0 || batchIndex >= TOTAL_BATCHES) {
      return NextResponse.json(
        { error: `Invalid batch index. Must be 0–${TOTAL_BATCHES - 1}` },
        { status: 400 }
      );
    }

    const batch = getBatch(batchIndex);
    return NextResponse.json(
      {
        batchIndex: batch.batchIndex,
        totalBatches: batch.totalBatches,
        specsCount: batch.allSpecs.length,
        specs: batch.allSpecs.map((s) => applyFormat(s, format)),
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      }
    );
  }

  // ── Index (no params) — pipeline overview ─────────────────────────────────
  return NextResponse.json(
    {
      pipeline: {
        totalBatches: TOTAL_BATCHES,
        exerciseBatches: TOTAL_EXERCISE_BATCHES,
        osteopathyBatches: TOTAL_OSTEOPATHY_BATCHES,
        totalExercises: EXERCISE_SPECS.length,
        totalOsteopathy: OSTEOPATHY_SPECS.length,
        totalSpecs: EXERCISE_SPECS.length + OSTEOPATHY_SPECS.length,
        supportedLocales: ["en","es","fr","de","pt","ar","zh","hi","ja","ru"],
      },
      usage: {
        index:   "GET /api/pipeline",
        batch:   "GET /api/pipeline?batch=N",
        single:  "GET /api/pipeline?slug=<slug>",
        formats: ["full (default)", "prompts", "blender"],
        webhook: "POST /api/pipeline/video-ready",
      },
      coordinatorFlow: [
        "1. GET /api/pipeline?batch=N  → receive specs (5 exercises + 3 osteopathy per batch)",
        "2. For each spec: run blenderScript in Blender → {slug}.mp4 + {slug}.glb",
        "3. Export Lottie from GLB → {slug}.lottie.json",
        "4. OR send animation.aiVideoPrompt to Runway/Pika/Sora → {slug}.mp4",
        "5. Copy outputs to /public/exercise-videos/ and /public/exercise-animations/",
        "6. POST /api/pipeline/video-ready { slug, outputs: ['mp4','glb','lottie'] }",
        "7. Platform ISR revalidates → ExerciseAnimationPlayer displays video immediately",
      ],
    },
    { status: 200 }
  );
}
