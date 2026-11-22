"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Play, Loader2, VideoOff } from "lucide-react";
import { AnatomyLabels } from "./AnatomyLabels";

// ─── ExerciseAnimationPlayer ───────────────────────────────────────────────────
// Video player for exercise and osteopathy demonstrations.
// Accepts: local /videos/ paths, Pexels HTTPS, Cloudflare Stream URLs.
// Shows placeholder if no valid video is available.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExerciseAnimationPlayerProps {
  video?: string;
  exerciseName?: string;
  accentColor?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  /** etiquetas.json de la vista anatómica: nombres de los músculos que trabajan, en el idioma del paciente */
  labels?: string;
  /** cómo se ajusta el video al recuadro; "contain" no recorta (útil para la vista anatómica con nombres) */
  fit?: "cover" | "contain";
  poster?: string;
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
  labels,
  fit = "cover",
  poster,
}: ExerciseAnimationPlayerProps) {
  const t = useTranslations("exercises");
  const videoRef = useRef<HTMLVideoElement>(null);

  const isCloudflare = video
    ? video.includes("cloudflarestream.com") || video.includes("watch.videodelivery.net")
    : false;
  const safeVideo =
    video && (video.startsWith("/videos/") || video.startsWith("https://"))
      ? video
      : undefined;

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

  if (isCloudflare && safeVideo) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <iframe
          src={`${safeVideo}?autoplay=1&loop=1&muted=1&controls=0`}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={exerciseName}
        />
      </div>
    );
  }

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
        key={safeVideo}
        ref={videoRef}
        className={`w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        poster={poster}
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
      {labels && state !== "loading" && <AnatomyLabels videoRef={videoRef} src={labels} fit={fit} />}
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
