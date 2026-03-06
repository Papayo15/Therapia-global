"use client";

/**
 * ExerciseGif
 * ─────────────────────────────────────────────────────────────────────────────
 * Muestra el GIF animado de un ejercicio desde ExerciseDB.
 * Si no hay API key o no se encuentra el ejercicio, muestra el SVG fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ExerciseGifProps {
  exerciseName: string;
  /** Componente SVG de fallback si no hay GIF disponible */
  fallback?: React.FC;
  className?: string;
  /** Modo compacto para thumbnails de tarjeta */
  compact?: boolean;
}

export function ExerciseGif({
  exerciseName,
  fallback: Fallback,
  className,
  compact = false,
}: ExerciseGifProps) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGifUrl(null);

    fetch(`/api/exercise-gif?name=${encodeURIComponent(exerciseName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setGifUrl(data.gifUrl ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [exerciseName]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-gray-50", className)}>
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "rounded-full bg-teal-100 animate-pulse",
            compact ? "w-8 h-8" : "w-14 h-14"
          )} />
          {!compact && (
            <div className="h-2 w-20 bg-gray-200 rounded animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  // ── GIF real de ExerciseDB ────────────────────────────────────────────────
  if (gifUrl) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-white", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gifUrl}
          alt={exerciseName}
          className={cn(
            "object-contain",
            compact ? "w-full h-full" : "max-h-full max-w-full p-2"
          )}
        />
      </div>
    );
  }

  // ── Fallback: animación SVG (Thera mascot) ────────────────────────────────
  if (Fallback) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center", className)}>
        <Fallback />
      </div>
    );
  }

  // ── Placeholder vacío ─────────────────────────────────────────────────────
  return (
    <div className={cn(
      "w-full h-full flex flex-col items-center justify-center gap-2 bg-teal-50",
      className
    )}>
      <div className={cn(
        "rounded-2xl bg-teal-100 flex items-center justify-center",
        compact ? "w-10 h-10" : "w-16 h-16"
      )}>
        <span className={compact ? "text-xl" : "text-3xl"}>🏃</span>
      </div>
      {!compact && (
        <p className="text-xs text-gray-400 text-center px-2">
          Añade tu RAPIDAPI_KEY para ver el GIF
        </p>
      )}
    </div>
  );
}
