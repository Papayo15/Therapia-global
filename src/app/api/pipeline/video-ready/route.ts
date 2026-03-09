/**
 * POST /api/pipeline/video-ready
 *
 * Webhook called by external tools (Blender/Runway/Pika/Kling/pipeline_coordinator.py)
 * when a slug's animation files are ready in /public/videos/ and /public/models/.
 *
 * Body:
 * {
 *   "slug": "lumbar-rotation-stretch",
 *   "outputs": ["mp4", "glb"],
 *   "renderEngine": "blender",   // optional
 *   "batchId": "batch_01",        // optional
 *   "video": "/videos/exercises/lumbar-rotation-stretch.mp4",  // optional override
 *   "model": "/models/exercises/lumbar-rotation-stretch.glb"   // optional override
 * }
 *
 * Actions:
 * 1. Validate slug exists in EXERCISE_REGISTRY or OSTEOPATHY_REGISTRY
 * 2. Update /data/pipeline-status.json (object format, keyed by slug)
 * 3. Update Prisma DB: videoUrl, modelUrl, videoReady=true, renderEngine, renderedAt
 * 4. Trigger ISR revalidation: list pages + per-slug pages for all 10 locales
 * 5. Return resolved output paths
 *
 * GET /api/pipeline/video-ready — returns current pipeline status object
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { getSpecBySlug } from "@/lib/animationPipeline";

const STATUS_FILE = path.join(process.cwd(), "data", "pipeline-status.json");
const LOCALES = ["en", "es", "fr", "de", "pt", "ar", "zh", "hi", "ja", "ru"];

type OutputType = "mp4" | "glb" | "lottie" | "thumbnail";

interface WebhookBody {
  slug: string;
  outputs: OutputType[];
  renderEngine?: string;
  batchId?: string;
  video?: string;
  model?: string;
}

interface PipelineStatusEntry {
  status: "ready" | "error";
  video?: string;
  model?: string;
  lottie?: string;
  renderEngine?: string;
  batch?: string;
  updated: string;
}

type PipelineStatus = Record<string, PipelineStatusEntry>;

async function readStatus(): Promise<PipelineStatus> {
  try {
    const raw = await fs.readFile(STATUS_FILE, "utf-8");
    return JSON.parse(raw) as PipelineStatus;
  } catch {
    return {};
  }
}

async function writeStatus(status: PipelineStatus): Promise<void> {
  // Guard: don't write to filesystem in Vercel serverless (ephemeral)
  if (process.env.VERCEL === "1") return;
  await fs.mkdir(path.dirname(STATUS_FILE), { recursive: true });
  await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  let body: WebhookBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, outputs, renderEngine, batchId, video, model } = body;

  if (!slug || !outputs || !Array.isArray(outputs)) {
    return NextResponse.json(
      { error: "Body must include { slug: string, outputs: string[] }" },
      { status: 400 }
    );
  }

  // ── Validate slug ──────────────────────────────────────────────────────────
  const spec = getSpecBySlug(slug);
  if (!spec) {
    return NextResponse.json(
      { error: `Unknown slug: ${slug}. Not found in exercise or osteopathy registry.` },
      { status: 404 }
    );
  }

  // ── Resolve paths (body overrides > spec defaults) ─────────────────────────
  const mp4Path  = video  ?? spec.outputPaths.mp4;
  const glbPath  = model  ?? spec.outputPaths.glb;
  const lottiePath = spec.outputPaths.lottie;

  // ── Update pipeline-status.json ────────────────────────────────────────────
  const statusObj = await readStatus();
  statusObj[slug] = {
    status: "ready",
    video:  outputs.includes("mp4") ? mp4Path : undefined,
    model:  outputs.includes("glb") ? glbPath : undefined,
    lottie: outputs.includes("lottie") ? lottiePath : undefined,
    renderEngine: renderEngine ?? "blender",
    batch: batchId,
    updated: new Date().toISOString(),
  };
  await writeStatus(statusObj);

  // ── Update Prisma DB ────────────────────────────────────────────────────────
  // Lazy import so the route works even without a connected DB (dev mode)
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    if (spec.type === "exercise") {
      await prisma.exercise.updateMany({
        where: { id: slug },
        data: {
          videoUrl:     outputs.includes("mp4") ? mp4Path  : undefined,
          modelUrl:     outputs.includes("glb") ? glbPath  : undefined,
          videoReady:   true,
          renderEngine: renderEngine ?? "blender",
          renderedAt:   new Date(),
        },
      });
    } else if (spec.type === "osteopathy") {
      await prisma.osteopathyTechnique.updateMany({
        where: { id: slug },
        data: {
          videoUrl:     outputs.includes("mp4") ? mp4Path  : undefined,
          modelUrl:     outputs.includes("glb") ? glbPath  : undefined,
          videoReady:   true,
          renderEngine: renderEngine ?? "blender",
          renderedAt:   new Date(),
        },
      });
    }

    await prisma.$disconnect();
  } catch {
    // DB not connected in dev/preview — continue without throwing
    console.warn(`[pipeline/video-ready] Prisma update skipped for ${slug} (no DB connection)`);
  }

  // ── ISR Revalidation — list pages + per-slug pages for all 10 locales ──────
  try {
    revalidatePath("/[locale]/exercises", "page");
    revalidatePath("/[locale]/osteopathy", "page");
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/exercise/${slug}`, "page");
      revalidatePath(`/${locale}/osteopathy/${slug}`, "page");
    }
  } catch {
    // revalidatePath may throw in non-Next.js contexts (tests, etc.)
  }

  const revalidated = LOCALES.flatMap((l) => [
    `/${l}/exercises`,
    `/${l}/osteopathy`,
    `/${l}/exercise/${slug}`,
    `/${l}/osteopathy/${slug}`,
  ]);

  return NextResponse.json(
    {
      success: true,
      slug,
      type: spec.type,
      outputs,
      paths: { mp4: mp4Path, glb: glbPath, lottie: lottiePath },
      renderEngine: renderEngine ?? "blender",
      batchId,
      revalidated,
      message: `ExerciseAnimationPlayer will serve ${slug} on next page load.`,
    },
    { status: 200 }
  );
}

export async function GET() {
  const statusObj = await readStatus();
  const entries = Object.entries(statusObj);
  return NextResponse.json(
    {
      total_completed: entries.length,
      by_status: {
        ready: entries.filter(([, e]) => e.status === "ready").length,
        error: entries.filter(([, e]) => e.status === "error").length,
      },
      entries: statusObj,
    },
    { status: 200 }
  );
}
