"use client";

/**
 * ExercisePlayer
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal de reproducción de ejercicio con animación SVG + instrucciones.
 * Reutilizable en: biblioteca de ejercicios, rutinas, vista del paciente.
 * Máx. ~1 min de lectura de las instrucciones.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Star, AlertCircle, Clock, Repeat2, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export interface ExerciseData {
  id: string;
  name: string;
  nameLocal?: string;       // nombre en idioma local
  region: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  sets?: number;
  reps?: number;
  durationSeconds?: number; // si es por tiempo
  restSeconds?: number;
  musclesWorked: string[];
  steps: string[];          // instrucciones paso a paso (≤6 pasos)
  tip?: string;
  keyPoint?: string;        // el punto clínico más importante (1 línea)
  contraindications?: string;
  AnimComponent?: React.FC; // animación SVG
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     "Básico",
  intermediate: "Intermedio",
  advanced:     "Avanzado",
  expert:       "Experto",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "bg-clinical-500/15 text-clinical-700 border-clinical-500/30",
  intermediate: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  advanced:     "bg-orange-500/15 text-orange-700 border-orange-500/30",
  expert:       "bg-red-500/15 text-red-700 border-red-500/30",
};

// ─── Componente principal ─────────────────────────────────────────────────────
export function ExercisePlayer({
  exercise,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  showAddToRoutine = false,
  onAddToRoutine,
}: {
  exercise: ExerciseData;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  showAddToRoutine?: boolean;
  onAddToRoutine?: (exercise: ExerciseData) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [added, setAdded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset al cambiar de ejercicio
  useEffect(() => {
    setActiveStep(0);
    setAdded(false);
  }, [exercise.id]);

  // Cerrar con Escape
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

  // Bloquear scroll del body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const AnimComponent = exercise.AnimComponent;
  const totalSteps = exercise.steps.length;

  function handleAdd() {
    onAddToRoutine?.(exercise);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-surface-900 border border-white/10 flex flex-col shadow-2xl">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", DIFFICULTY_COLORS[exercise.difficulty])}>
              {DIFFICULTY_LABEL[exercise.difficulty]}
            </span>
            <span className="text-xs text-surface-400">{exercise.region}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Nav prev/next */}
            {(hasPrev || hasNext) && (
              <>
                <button onClick={onPrev} disabled={!hasPrev}
                  className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    hasPrev ? "text-surface-300 hover:bg-white/10 hover:text-white" : "text-surface-700 cursor-not-allowed")}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={onNext} disabled={!hasNext}
                  className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    hasNext ? "text-surface-300 hover:bg-white/10 hover:text-white" : "text-surface-700 cursor-not-allowed")}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            <button onClick={onClose}
              className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:bg-white/10 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {/* Animación SVG */}
          <div className="relative bg-surface-800" style={{ aspectRatio: "16/9" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-900/40 z-10 pointer-events-none" />
            {AnimComponent ? (
              <div className="w-full h-full p-6 flex items-center justify-center">
                <AnimComponent />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900/30 to-surface-800">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-3">
                    <Target className="h-8 w-8 text-brand-400" />
                  </div>
                  <p className="text-surface-400 text-sm">Animación en preparación</p>
                </div>
              </div>
            )}

            {/* Badge de duración sobre la animación */}
            <div className="absolute bottom-3 end-3 z-20 flex items-center gap-3">
              {exercise.durationSeconds && (
                <span className="flex items-center gap-1 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  {exercise.durationSeconds}s
                </span>
              )}
              {exercise.sets && exercise.reps && (
                <span className="flex items-center gap-1 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Repeat2 className="h-3 w-3" />
                  {exercise.sets}×{exercise.reps}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Nombre */}
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {exercise.nameLocal || exercise.name}
              </h2>
              {exercise.nameLocal && (
                <p className="text-sm text-surface-400 mt-0.5">{exercise.name}</p>
              )}
            </div>

            {/* Key Point clínico */}
            {exercise.keyPoint && (
              <div className="flex gap-2.5 bg-brand-600/10 border border-brand-600/20 rounded-xl p-3">
                <Zap className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-300 font-medium leading-snug">{exercise.keyPoint}</p>
              </div>
            )}

            {/* Instrucciones paso a paso (interactivo) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Instrucciones</h3>
                <span className="text-xs text-surface-500">
                  Paso {activeStep + 1} de {totalSteps}
                </span>
              </div>

              {/* Barra de progreso de pasos */}
              <div className="flex gap-1 mb-4">
                {exercise.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-300",
                      i <= activeStep ? "bg-brand-500" : "bg-surface-700"
                    )}
                  />
                ))}
              </div>

              {/* Paso activo */}
              <div className="bg-surface-800 rounded-xl p-4 min-h-[4rem] relative overflow-hidden">
                <div className="absolute top-3 start-3 w-6 h-6 rounded-full bg-brand-600/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-400">{activeStep + 1}</span>
                </div>
                <p className="ps-9 text-sm text-surface-200 leading-relaxed">
                  {exercise.steps[activeStep]}
                </p>
              </div>

              {/* Botones de navegación de pasos */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className={cn(
                    "flex-1 h-9 rounded-lg text-xs font-semibold transition-all border",
                    activeStep === 0
                      ? "border-white/5 text-surface-600 cursor-not-allowed"
                      : "border-white/10 text-surface-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(totalSteps - 1, activeStep + 1))}
                  disabled={activeStep === totalSteps - 1}
                  className={cn(
                    "flex-1 h-9 rounded-lg text-xs font-semibold transition-all",
                    activeStep === totalSteps - 1
                      ? "bg-clinical-500/20 text-clinical-400 border border-clinical-500/30 cursor-default"
                      : "bg-brand-600 text-white hover:bg-brand-500"
                  )}
                >
                  {activeStep === totalSteps - 1 ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completado
                    </span>
                  ) : "Siguiente →"}
                </button>
              </div>
            </div>

            {/* Músculos */}
            <div>
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                Músculos trabajados
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {exercise.musclesWorked.map((m) => (
                  <span key={m} className="text-xs text-surface-300 bg-surface-800 border border-white/5 px-2.5 py-1 rounded-lg">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Tip */}
            {exercise.tip && (
              <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                <Star className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-300 mb-0.5">Consejo clínico</p>
                  <p className="text-xs text-amber-200/80 leading-relaxed">{exercise.tip}</p>
                </div>
              </div>
            )}

            {/* Contraindicaciones */}
            {exercise.contraindications && (
              <div className="flex gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-300 mb-0.5">Contraindicaciones</p>
                  <p className="text-xs text-red-200/80 leading-relaxed">{exercise.contraindications}</p>
                </div>
              </div>
            )}

            {/* Descanso */}
            {exercise.restSeconds && (
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Clock className="h-3.5 w-3.5" />
                Descanso entre series: <span className="font-semibold text-surface-200">{exercise.restSeconds}s</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        {showAddToRoutine && (
          <div className="shrink-0 border-t border-white/5 p-4">
            <Button
              onClick={handleAdd}
              className={cn(
                "w-full h-11 font-semibold transition-all",
                added
                  ? "bg-clinical-500/20 text-clinical-400 border border-clinical-500/30 hover:bg-clinical-500/30"
                  : "bg-brand-600 hover:bg-brand-500 text-white"
              )}
            >
              {added ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Agregado a la rutina
                </span>
              ) : (
                "+ Agregar a rutina"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
