"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Play, Loader2, VideoOff } from "lucide-react";

// ─── ExerciseAnimationPlayer ───────────────────────────────────────────────────
// Unified animation player for 3D exercise and osteopathy demonstrations.
// Rendering priority:
//   1. Lottie JSON  → /public/exercise-animations/{id}.json
//   2. MP4/WebM     → /public/exercise-videos/{id}.mp4
//   3. Placeholder  → shows while assets are being generated
//
// Designed for Wibbi-level quality: accepts pre-rendered 3D humanized avatar
// videos at any resolution. The player imposes no quality ceiling on MP4.
// ─────────────────────────────────────────────────────────────────────────────

// Load lottie-react only on the client to avoid SSR hydration mismatch
const LottiePlayer = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => null,
});

export interface ExerciseAnimationPlayerProps {
  /** Path to Lottie JSON, e.g. /exercise-animations/bird-dog.json */
  animation?: string;
  /** Path to MP4 video, e.g. /exercise-videos/bird-dog.mp4 */
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

type MediaMode = "lottie" | "video" | "none";
type PlayerState = "pending" | "loading" | "ready" | "paused" | "error";

export function ExerciseAnimationPlayer({
  animation,
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

  // Determine which media source to attempt
  const initialMode: MediaMode = animation ? "lottie" : video ? "video" : "none";

  const [mode, setMode] = useState<MediaMode>(initialMode);
  const [state, setState] = useState<PlayerState>(initialMode === "none" ? "pending" : "loading");
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [isUserPaused, setIsUserPaused] = useState(false);

  // Reset when source props change
  useEffect(() => {
    const nextMode: MediaMode = animation ? "lottie" : video ? "video" : "none";
    setMode(nextMode);
    setState(nextMode === "none" ? "pending" : "loading");
    setLottieData(null);
    setIsUserPaused(false);
  }, [animation, video]);

  // Fetch and validate Lottie JSON
  useEffect(() => {
    if (mode !== "lottie" || !animation) return;

    const controller = new AbortController();

    fetch(animation, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setLottieData(data);
        setState("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // component unmounted or prop changed
        // Lottie file not found → fall through to video
        if (video) {
          setMode("video");
          setState("loading");
        } else {
          setState("error");
        }
      });

    return () => controller.abort();
  }, [animation, mode, video]);

  // ── Video event handlers ──────────────────────────────────────────────────
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

  // ── Placeholder: no source provided ──────────────────────────────────────
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
        <p className="text-xs text-slate-400 text-center px-8">{t("videoPending")}</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
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
        <p className="text-xs text-slate-400 text-center px-8">{t("videoUnavailable")}</p>
      </div>
    );
  }

  // ── Lottie player ─────────────────────────────────────────────────────────
  if (mode === "lottie") {
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
        {lottieData && (
          <LottiePlayer
            animationData={lottieData}
            loop={loop}
            autoplay={autoPlay}
            style={{ width: "100%", height: "100%" }}
          />
        )}
        {/* Loop badge */}
        {state === "ready" && lottieData && (
          <div className="absolute top-2 end-2 z-10">
            <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {t("loop")}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Video player (MP4/WebM — supports Wibbi-level 3D pre-rendered content) ─
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

      {video && (
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
          <source src={video} type="video/mp4" />
          <source src={video.replace(".mp4", ".webm")} type="video/webm" />
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
      {state === "ready" && (
        <div className="absolute top-2 end-2 z-10">
          <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {t("loop")}
          </span>
        </div>
      )}
    </div>
  );
}
