/**
 * @deprecated Use ExerciseAnimationPlayer instead.
 * Superseded by the unified Lottie + MP4 player. Kept for reference.
 */
"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Play, Loader2, VideoOff } from "lucide-react";

// ─── ExerciseVideoPlayer ───────────────────────────────────────────────────────
// Mobile-first video component for 3D exercise demonstrations.
// Replaces SVG/framer-motion animations throughout the platform.
// Videos stored in: /public/exercise-videos/{exercise-id}.mp4
// ─────────────────────────────────────────────────────────────────────────────

export interface ExerciseVideoPlayerProps {
  /** Path to MP4 video, e.g. /exercise-videos/bird-dog.mp4 */
  src?: string;
  /** Displayed in placeholder / error states */
  exerciseName?: string;
  /** Region accent color for UI elements */
  accentColor?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

type VideoState = "pending" | "loading" | "playing" | "paused" | "error";

export function ExerciseVideoPlayer({
  src,
  exerciseName,
  accentColor = "#3b82f6",
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
}: ExerciseVideoPlayerProps) {
  const t = useTranslations("exercises");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>(src ? "loading" : "pending");
  const [isUserPaused, setIsUserPaused] = useState(false);

  useEffect(() => {
    setState(src ? "loading" : "pending");
    setIsUserPaused(false);
  }, [src]);

  function handleCanPlay() {
    setState("playing");
    if (autoPlay && !isUserPaused) {
      videoRef.current?.play().catch(() => setState("error"));
    }
  }
  function handleError() { setState("error"); }
  function handleLoadedData() { setState("playing"); }

  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsUserPaused(false);
      setState("playing");
    } else {
      video.pause();
      setIsUserPaused(true);
      setState("paused");
    }
  }

  // ── Placeholder: video not yet generated ──────────────────────────────────
  if (state === "pending") {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center gap-3 ${className}`}
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed"
          style={{ borderColor: `${accentColor}40`, background: `${accentColor}10` }}
        >
          <VideoOff className="h-7 w-7" style={{ color: accentColor }} />
        </div>
        {exerciseName && (
          <p className="text-sm font-medium text-slate-600 text-center px-6">{exerciseName}</p>
        )}
        <p className="text-xs text-slate-400 text-center px-8">
          {t("videoPending")}
        </p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center gap-3 ${className}`}
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl">
          🏃
        </div>
        {exerciseName && (
          <p className="text-sm font-medium text-slate-600 text-center px-6">{exerciseName}</p>
        )}
        <p className="text-xs text-slate-400 text-center px-8">
          {t("videoUnavailable")}
        </p>
      </div>
    );
  }

  // ── Video player ───────────────────────────────────────────────────────────
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)" }}
    >
      {/* Loading overlay */}
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
        </div>
      )}

      {/* Main video — mobile optimized */}
      {src && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          onCanPlay={handleCanPlay}
          onLoadedData={handleLoadedData}
          onError={handleError}
          onClick={togglePlayPause}
          style={{ cursor: "pointer" }}
          aria-label={exerciseName}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Pause overlay */}
      {state === "paused" && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center z-10 bg-black/20"
          aria-label={t("play")}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: accentColor }}
          >
            <Play className="h-6 w-6 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {/* Loop badge */}
      {state === "playing" && (
        <div className="absolute top-2 end-2 z-10">
          <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            LOOP
          </span>
        </div>
      )}
    </div>
  );
}
