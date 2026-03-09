/**
 * GET /api/pipeline/health
 *
 * Returns pipeline completion status:
 * - total exercises + techniques
 * - videos ready
 * - videos missing
 * - completion percentage
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  EXERCISE_SPECS,
  OSTEOPATHY_SPECS,
  ALL_SPECS,
} from "@/lib/animationPipeline";

const STATUS_FILE = path.join(process.cwd(), "data", "pipeline-status.json");

export async function GET() {
  let statusObj: Record<string, { status: string; renderEngine?: string }> = {};

  try {
    const raw = await fs.readFile(STATUS_FILE, "utf-8");
    statusObj = JSON.parse(raw);
  } catch {
    // File doesn't exist yet — start with empty status
  }

  const entries = Object.values(statusObj);
  const ready = entries.filter((e) => e.status === "ready").length;
  const total = ALL_SPECS.length;

  const byEngine: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.renderEngine) {
      byEngine[entry.renderEngine] = (byEngine[entry.renderEngine] ?? 0) + 1;
    }
  }

  return NextResponse.json(
    {
      total_exercises: EXERCISE_SPECS.length,
      total_techniques: OSTEOPATHY_SPECS.length,
      total_specs: total,
      videos_ready: ready,
      videos_missing: total - ready,
      completion_pct: total > 0 ? Math.round((ready / total) * 100) : 0,
      by_render_engine: byEngine,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
