/**
 * /admin/pipeline — Pipeline Diagnostics Dashboard
 *
 * Server component that reads /data/pipeline-status.json and displays:
 * - Total specs vs videos ready
 * - Per-slug status, render engine, batch, render date
 * - Action buttons: Revalidate ISR cache, Open video
 *
 * Access: /admin/pipeline (no auth in dev; add auth middleware for production)
 */

import { readFile } from "fs/promises";
import path from "path";
import { RevalidateButton } from "./RevalidateButton";

interface PipelineEntry {
  status: "ready" | "error" | string;
  video?: string;
  model?: string;
  lottie?: string;
  renderEngine?: string;
  batch?: string;
  updated?: string;
}

type PipelineStatus = Record<string, PipelineEntry>;

async function getPipelineStatus(): Promise<PipelineStatus> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "pipeline-status.json"),
      "utf-8"
    );
    return JSON.parse(raw) as PipelineStatus;
  } catch {
    return {};
  }
}

export default async function PipelineDashboard() {
  const status = await getPipelineStatus();
  const entries = Object.entries(status);
  const ready = entries.filter(([, e]) => e.status === "ready").length;
  const pct = entries.length > 0 ? Math.round((ready / entries.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pipeline Diagnostics</h1>
        <p className="text-slate-400 mt-1">
          3D Medical Animation Pipeline — Therapia Global
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Slugs</p>
          <p className="text-3xl font-bold text-white mt-1">{entries.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Ready</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{ready}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Missing</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{entries.length - ready}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Complete</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{ready} / {entries.length} videos rendered</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-lg font-medium">No videos rendered yet</p>
          <p className="text-sm mt-2">
            Run{" "}
            <code className="bg-slate-800 px-2 py-0.5 rounded text-green-400">
              python scripts/pipeline_coordinator.py --batch-index 0
            </code>{" "}
            to start rendering
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="pb-3 pr-4 text-slate-400 font-medium">Slug</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Status</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Engine</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Batch</th>
                <th className="pb-3 pr-4 text-slate-400 font-medium">Updated</th>
                <th className="pb-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([slug, entry]) => (
                <tr
                  key={slug}
                  className="border-b border-slate-800/50 hover:bg-slate-900/50"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">{slug}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.status === "ready"
                          ? "bg-green-900/50 text-green-400"
                          : "bg-amber-900/50 text-amber-400"
                      }`}
                    >
                      {entry.status === "ready" ? "✓" : "⏳"} {entry.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {entry.renderEngine ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {entry.batch ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {entry.updated
                      ? new Date(entry.updated).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <RevalidateButton slug={slug} />
                      {entry.video && (
                        <a
                          href={entry.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-800/50 hover:border-blue-600"
                        >
                          ▶ Video
                        </a>
                      )}
                      {entry.model && (
                        <a
                          href={entry.model}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 rounded border border-purple-800/50 hover:border-purple-600"
                        >
                          ⬡ GLB
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer instructions */}
      <div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500">
        <p className="font-medium text-slate-400 mb-2">Pipeline Commands</p>
        <div className="space-y-1 font-mono">
          <p>
            Render batch 0:{" "}
            <code className="text-green-400">
              python scripts/pipeline_coordinator.py --batch-index 0
            </code>
          </p>
          <p>
            Render all:{" "}
            <code className="text-green-400">
              python scripts/pipeline_coordinator.py --all-batches
            </code>
          </p>
          <p>
            Dry run:{" "}
            <code className="text-green-400">
              python scripts/pipeline_coordinator.py --dry-run --batch-index 0
            </code>
          </p>
          <p>
            Health API:{" "}
            <code className="text-blue-400">GET /api/pipeline/health</code>
          </p>
        </div>
      </div>
    </main>
  );
}
