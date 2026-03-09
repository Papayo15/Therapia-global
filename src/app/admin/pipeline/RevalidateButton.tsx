"use client";

import { useState } from "react";

interface RevalidateButtonProps {
  slug: string;
}

export function RevalidateButton({ slug }: RevalidateButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handle = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/pipeline/revalidate?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
    // Reset after 3s
    setTimeout(() => setState("idle"), 3000);
  };

  const labels = {
    idle:    "Revalidate",
    loading: "...",
    done:    "✓ Done",
    error:   "✗ Error",
  };

  const colors = {
    idle:    "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500",
    loading: "border-slate-700 text-slate-500 cursor-not-allowed",
    done:    "border-green-800 text-green-400",
    error:   "border-red-800 text-red-400",
  };

  return (
    <button
      onClick={handle}
      disabled={state !== "idle"}
      className={`text-xs px-2 py-1 rounded border transition-colors ${colors[state]}`}
    >
      {labels[state]}
    </button>
  );
}
