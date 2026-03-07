"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, Star, AlertCircle,
  Clock, Repeat2, Zap, Youtube, FileText, Share2, Play, Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export interface ExerciseData {
  id: string;
  name: string;
  nameLocal?: string;
  region: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  musclesWorked: string[];
  steps: string[];
  tip?: string;
  keyPoint?: string;
  contraindications?: string;
  youtubeId?: string;
  youtubeSearch?: string;
  AnimComponent?: React.FC;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Básico", intermediate: "Intermedio",
  advanced: "Avanzado", expert: "Experto",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  advanced:     "bg-orange-500/15 text-orange-700 border-orange-500/30",
  expert:       "bg-red-500/15 text-red-700 border-red-500/30",
};

const REGION_COLOR: Record<string, string> = {
  "Hombro":    "#3b82f6", "Cervical":  "#8b5cf6", "Torácica":  "#06b6d4",
  "Lumbar":    "#f59e0b", "Cadera":    "#ec4899",  "Rodilla":  "#10b981",
  "Tobillo":   "#14b8a6", "Codo":      "#f97316",  "Core":     "#6366f1",
  "Glúteo":    "#a855f7", "Espalda":   "#0ea5e9",  "Muñeca":   "#ef4444",
};

// ─── Componente de video YouTube ──────────────────────────────────────────────
function YouTubePanel({ exercise }: { exercise: ExerciseData }) {
  const url = exercise.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${exercise.youtubeId}?rel=0&modestbranding=1&autoplay=1`
    : null;
  const searchUrl = exercise.youtubeSearch
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeSearch)}`
    : null;

  if (url) {
    return (
      <iframe
        src={url}
        title={exercise.nameLocal || exercise.name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1a2e]">
      <div className="w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-10 w-10 fill-red-500">
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="text-white font-semibold mb-1">{exercise.nameLocal || exercise.name}</p>
        <p className="text-white/50 text-sm mb-5">Busca el video de demostración en YouTube</p>
        {searchUrl && (
          <a href={searchUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
            Ver en YouTube
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Panel de animación (estilo Wibbi) ────────────────────────────────────────
function AnimationPanel({ exercise, searchUrl }: { exercise: ExerciseData; searchUrl: string | null }) {
  const regionColor = REGION_COLOR[exercise.region.split(" / ")[0]] ?? "#3b82f6";
  const Anim = exercise.AnimComponent;

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Zona de animación — fondo blanco puro estilo Wibbi */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)" }}>
        {/* Decoración sutil de región */}
        <div className="absolute top-3 start-3 flex items-center gap-1.5 z-10">
          <span className="w-2 h-2 rounded-full" style={{ background: regionColor }} />
          <span className="text-[11px] font-semibold text-slate-500">{exercise.region}</span>
        </div>

        {Anim ? (
          <div className="w-full h-full flex items-center justify-center p-2">
            <Anim />
          </div>
        ) : (
          /* Fallback ilustración cuando no hay animación */
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl border-2 border-dashed border-slate-200">
              🏃
            </div>
            <p className="text-sm text-slate-400 font-medium">{exercise.nameLocal || exercise.name}</p>
          </div>
        )}

        {/* Botón YouTube secundario */}
        {searchUrl && (
          <a href={searchUrl} target="_blank" rel="noopener noreferrer"
            className="absolute bottom-3 end-3 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
            onClick={(e) => e.stopPropagation()}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-red-500">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
            Ver video
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ExercisePlayer({
  exercise, isOpen, onClose, onPrev, onNext,
  hasPrev = false, hasNext = false,
  showAddToRoutine = false, onAddToRoutine,
}: {
  exercise: ExerciseData; isOpen: boolean; onClose: () => void;
  onPrev?: () => void; onNext?: () => void;
  hasPrev?: boolean; hasNext?: boolean;
  showAddToRoutine?: boolean; onAddToRoutine?: (exercise: ExerciseData) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [added, setAdded] = useState(false);
  const [mediaTab, setMediaTab] = useState<"demo" | "youtube">("demo");
  const overlayRef = useRef<HTMLDivElement>(null);

  const hasAnimation = !!exercise.AnimComponent;
  const youtubeSearchUrl = exercise.youtubeSearch
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeSearch)}`
    : null;
  const hasYoutube = !!(exercise.youtubeId || exercise.youtubeSearch);

  useEffect(() => {
    setActiveStep(0);
    setAdded(false);
    setMediaTab(hasAnimation ? "demo" : "youtube");
  }, [exercise.id, hasAnimation]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, hasPrev, hasNext, onClose, onPrev, onNext]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSteps = exercise.steps.length;
  const regionColor = REGION_COLOR[exercise.region.split(" / ")[0]] ?? "#3b82f6";

  function handleAdd() {
    onAddToRoutine?.(exercise);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-2xl bg-white border border-slate-200 flex flex-col shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: regionColor }} />
            <span className="text-xs font-semibold text-slate-500">{exercise.region}</span>
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", DIFFICULTY_COLORS[exercise.difficulty])}>
              {DIFFICULTY_LABEL[exercise.difficulty]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {(hasPrev || hasNext) && (
              <>
                <button onClick={onPrev} disabled={!hasPrev}
                  className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    hasPrev ? "text-slate-500 hover:bg-slate-100" : "text-slate-300 cursor-not-allowed")}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={onNext} disabled={!hasNext}
                  className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    hasNext ? "text-slate-500 hover:bg-slate-100" : "text-slate-300 cursor-not-allowed")}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            <button onClick={onClose}
              className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Tabs Demo / YouTube ─────────────────────────────────────────── */}
        {hasYoutube && (
          <div className="flex border-b border-slate-100 bg-white shrink-0">
            <button
              onClick={() => setMediaTab("demo")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                mediaTab === "demo"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Play className="h-3.5 w-3.5" />
              Demostración
            </button>
            <button
              onClick={() => setMediaTab("youtube")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                mediaTab === "youtube"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
              </svg>
              YouTube
            </button>
          </div>
        )}

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">

          {/* ── Media area ─────────────────────────────────────────────────── */}
          <div className="relative" style={{ aspectRatio: "16/9" }}>
            {mediaTab === "demo" || !hasYoutube ? (
              <AnimationPanel exercise={exercise} searchUrl={youtubeSearchUrl} />
            ) : (
              <YouTubePanel exercise={exercise} />
            )}

            {/* Sets × Reps badge */}
            {(exercise.durationSeconds || (exercise.sets && exercise.reps)) && mediaTab === "demo" && (
              <div className="absolute bottom-3 start-3 z-20 flex items-center gap-2">
                {exercise.durationSeconds ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-full shadow">
                    <Clock className="h-3 w-3" />{exercise.durationSeconds}s
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-full shadow">
                    <Repeat2 className="h-3 w-3" />{exercise.sets}×{exercise.reps}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <div className="p-5 space-y-5 bg-white">

            {/* Nombre */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {exercise.nameLocal || exercise.name}
              </h2>
              {exercise.nameLocal && (
                <p className="text-sm text-slate-400 mt-0.5">{exercise.name}</p>
              )}
            </div>

            {/* Key Point */}
            {exercise.keyPoint && (
              <div className="flex gap-2.5 rounded-xl p-3.5 border"
                style={{ background: `${regionColor}10`, borderColor: `${regionColor}30` }}>
                <Zap className="h-4 w-4 shrink-0 mt-0.5" style={{ color: regionColor }} />
                <p className="text-sm font-semibold leading-snug" style={{ color: regionColor }}>
                  {exercise.keyPoint}
                </p>
              </div>
            )}

            {/* Instrucciones paso a paso */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Instrucciones</h3>
                <span className="text-xs text-slate-400">
                  Paso {activeStep + 1} de {totalSteps}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="flex gap-1 mb-4">
                {exercise.steps.map((_, i) => (
                  <button key={i} onClick={() => setActiveStep(i)}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= activeStep ? regionColor : "#e2e8f0" }} />
                ))}
              </div>

              {/* Paso activo */}
              <div className="rounded-xl p-4 min-h-[4.5rem] relative border"
                style={{ background: `${regionColor}08`, borderColor: `${regionColor}20` }}>
                <div className="absolute top-3 start-3 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${regionColor}20` }}>
                  <span className="text-xs font-bold" style={{ color: regionColor }}>{activeStep + 1}</span>
                </div>
                <p className="ps-9 text-sm text-slate-700 leading-relaxed">
                  {exercise.steps[activeStep]}
                </p>
              </div>

              {/* Navegación de pasos */}
              <div className="flex gap-2 mt-3">
                <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className={cn("flex-1 h-9 rounded-xl text-xs font-semibold border transition-all",
                    activeStep === 0
                      ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white")}>
                  ← Anterior
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(totalSteps - 1, activeStep + 1))}
                  disabled={activeStep === totalSteps - 1}
                  className={cn("flex-1 h-9 rounded-xl text-xs font-semibold transition-all",
                    activeStep === totalSteps - 1
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                      : "text-white")}
                  style={activeStep === totalSteps - 1 ? {} : { background: regionColor }}
                >
                  {activeStep === totalSteps - 1 ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completado
                    </span>
                  ) : "Siguiente →"}
                </button>
              </div>
            </div>

            {/* Lista completa de pasos */}
            <details className="group">
              <summary className="text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-600 select-none list-none flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Ver todos los pasos
                <ChevronRight className="h-3.5 w-3.5 group-open:rotate-90 transition-transform" />
              </summary>
              <ol className="mt-3 space-y-2">
                {exercise.steps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </details>

            {/* Músculos */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Músculos trabajados
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {exercise.musclesWorked.map((m) => (
                  <span key={m} className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            {(exercise.sets || exercise.durationSeconds || exercise.restSeconds) && (
              <div className="grid grid-cols-3 gap-3">
                {exercise.sets && exercise.reps && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">{exercise.sets}×{exercise.reps}</p>
                    <p className="text-[10px] text-slate-400">Series × Reps</p>
                  </div>
                )}
                {exercise.durationSeconds && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">{exercise.durationSeconds}s</p>
                    <p className="text-[10px] text-slate-400">Duración</p>
                  </div>
                )}
                {exercise.restSeconds && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">{exercise.restSeconds}s</p>
                    <p className="text-[10px] text-slate-400">Descanso</p>
                  </div>
                )}
              </div>
            )}

            {/* Tip clínico */}
            {exercise.tip && (
              <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-0.5">Consejo clínico</p>
                  <p className="text-xs text-amber-700/80 leading-relaxed">{exercise.tip}</p>
                </div>
              </div>
            )}

            {/* Contraindicaciones */}
            {exercise.contraindications && (
              <div className="flex gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700 mb-0.5">Contraindicaciones</p>
                  <p className="text-xs text-red-700/80 leading-relaxed">{exercise.contraindications}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        {showAddToRoutine && (
          <div className="shrink-0 border-t border-slate-100 p-4 bg-white">
            <Button
              onClick={handleAdd}
              className={cn(
                "w-full h-11 font-bold text-sm transition-all rounded-xl",
                added
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "text-white shadow-sm"
              )}
              style={added ? {} : { background: regionColor }}
            >
              {added ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Agregado a la rutina
                </span>
              ) : ("+ Agregar a rutina")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
