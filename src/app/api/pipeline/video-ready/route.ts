/**
 * POST /api/pipeline/video-ready
 *
 * Webhook called by external tools (Blender/Runway/Pika/Sora/pipeline_coordinator.py)
 * when a slug's animation files are ready in /public/.
 *
 * Body:
 * {
 *   "slug": "cervical-side-flexion-stretch",
 *   "outputs": ["mp4", "glb", "lottie"]   // which files were produced
 * }
 *
 * Actions:
 * 1. Validate slug exists in EXERCISE_REGISTRY or OSTEOPATHY_REGISTRY
 * 2. Append to /public/pipeline-status.json (persistent completion log)
 * 3. Trigger Next.js ISR revalidation for exercises + osteopathy pages
 * 4. Return resolved output paths
 *
 * GET /api/pipeline/video-ready — returns current pipeline status
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { getSpecBySlug } from "@/lib/animationPipeline";

const STATUS_FILE = path.join(process.cwd(), "public", "pipeline-status.json");
const LOCALES = ["en","es","fr","de","pt","ar","zh","hi","ja","ru"];

type OutputType = "mp4" | "glb" | "lottie" | "thumbnail";

interface StatusEntry {
  slug: string;
  type: "exercise" | "osteopathy";
  outputs: OutputType[];
  paths: {
    mp4?: string;
    glb?: string;
    lottie?: string;
    thumbnail?: string;
  };
  completed_at: string;
}

async function readStatus(): Promise<StatusEntry[]> {
  try {
    const raw = await fs.readFile(STATUS_FILE, "utf-8");
    return JSON.parse(raw) as StatusEntry[];
  } catch {
    return [];
  }
}

async function writeStatus(entries: StatusEntry[]): Promise<void> {
  await fs.writeFile(STATUS_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  let body: { slug: string; outputs: OutputType[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, outputs } = body;

  if (!slug || !outputs || !Array.isArray(outputs)) {
    return NextResponse.json(
      { error: "Body must include { slug: string, outputs: string[] }" },
      { status: 400 }
    );
  }

  // ── Validate slug ─────────────────────────────────────────────────────────
  const spec = getSpecBySlug(slug);
  if (!spec) {
    return NextResponse.json(
      { error: `Unknown slug: ${slug}. Not found in exercise or osteopathy registry.` },
      { status: 404 }
    );
  }

  // ── Build output paths ────────────────────────────────────────────────────
  const paths: StatusEntry["paths"] = {};
  if (outputs.includes("mp4"))       paths.mp4       = `/exercise-videos/${slug}.mp4`;
  if (outputs.includes("glb"))       paths.glb       = `/exercise-animations/${slug}.glb`;
  if (outputs.includes("lottie"))    paths.lottie    = `/exercise-animations/${slug}.lottie.json`;
  if (outputs.includes("thumbnail")) paths.thumbnail = `/exercise-animations/${slug}.thumb.jpg`;

  // ── Update pipeline-status.json ───────────────────────────────────────────
  const statuses = await readStatus();
  const existingIndex = statuses.findIndex((e) => e.slug === slug);
  const newEntry: StatusEntry = {
    slug,
    type: spec.type,
    outputs,
    paths,
    completed_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    statuses[existingIndex] = newEntry; // overwrite (re-render)
  } else {
    statuses.push(newEntry);
  }
  await writeStatus(statuses);

  // ── ISR Revalidation ──────────────────────────────────────────────────────
  // Revalidate all locale variants of exercises and osteopathy pages
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}/exercises`);
    revalidatePath(`/${locale}/osteopathy`);
  }
  // Also revalidate root paths
  revalidatePath("/exercises");
  revalidatePath("/osteopathy");

  return NextResponse.json(
    {
      success: true,
      slug,
      type: spec.type,
      outputs,
      paths,
      completed_at: newEntry.completed_at,
      revalidated: LOCALES.map((l) => [`/${l}/exercises`, `/${l}/osteopathy`]).flat(),
      message: `ExerciseAnimationPlayer will serve ${slug} on next page load.`,
    },
    { status: 200 }
  );
}

export async function GET() {
  const statuses = await readStatus();
  return NextResponse.json(
    {
      total_completed: statuses.length,
      by_type: {
        exercise:   statuses.filter((s) => s.type === "exercise").length,
        osteopathy: statuses.filter((s) => s.type === "osteopathy").length,
      },
      entries: statuses,
    },
    { status: 200 }
  );
}
