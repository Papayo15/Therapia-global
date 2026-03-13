"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Play, Loader2, VideoOff } from "lucide-react";

// ─── ExerciseAnimationPlayer ───────────────────────────────────────────────────
// Video player for exercise and osteopathy demonstrations.
// Accepts ONLY local MP4 paths starting with /videos/.
// If no valid local video is provided, shows a placeholder.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExerciseAnimationPlayerProps {
  /** Path to local MP4 video, must start with /videos/ */
  video?: string;
  /** Displayed in placeholder / error states */
  exerciseName?: string;
  /** Region accent color for UI elements */
  accentColor?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

type PlayerState = "loading" | "ready" | "paused" | "error";

export function ExerciseAnimationPlayer({
  video,
  exerciseName,
  accentColor = "#3b82f6",
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
}: ExerciseAnimationPlayerProps) {
  const t = useTranslations("exercises");
  const videoRef = useRef<HTMLVideoElement>(null);

  // STRICT VALIDATION: only accept local paths — reject CDN/remote URLs
  const safeVideo = video && video.startsWith("/videos/") ? video : undefined;

  const [state, setState] = useState<PlayerState>("loading");
  const [isUserPaused, setIsUserPaused] = useState(false);

  useEffect(() => {
    setState("loading");
    setIsUserPaused(false);
  }, [safeVideo]);

  function handleCanPlay() {
    setState("ready");
    if (autoPlay && !isUserPaused) {
      videoRef.current?.play().catch(() => setState("error"));
    }
  }

  function handleVideoError() {
    setState("error");
  }

  function togglePlayPause() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsUserPaused(false);
      setState("ready");
    } else {
      vid.pause();
      setIsUserPaused(true);
      setState("paused");
    }
  }

  // No valid local video → placeholder
  if (!safeVideo || state === "error") {
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
        <p className="text-xs text-slate-400 text-center px-8">{t("videoPending")}</p>
      </div>
    );
  }

  // Local MP4 video
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)" }}
    >
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        preload="metadata"
        onCanPlay={handleCanPlay}
        onError={handleVideoError}
        onClick={togglePlayPause}
        style={{ cursor: "pointer" }}
        aria-label={exerciseName}
      >
        <source src={safeVideo} type="video/mp4" />
      </video>
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
    </div>
  );
}
