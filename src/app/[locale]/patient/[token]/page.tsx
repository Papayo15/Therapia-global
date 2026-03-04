"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Star, Clock, Repeat2, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimBirdDog } from "@/components/exercises/ExerciseAnimations";
import { AnimGluteBridge, AnimDeadBug } from "@/components/exercises/ExerciseAnimationsPart2";
import { AnimCatCow, AnimNerveFlossingSciatica } from "@/components/exercises/ExerciseAnimationsPart3";

// ─── Mapa de animaciones por ejercicio ───────────────────────────────────────
const EXERCISE_ANIM_MAP: Record<string, React.FC> = {
  "e1": AnimCatCow,
  "e2": AnimDeadBug,
  "e3": AnimBirdDog,
  "e4": AnimGluteBridge,
  "e5": AnimNerveFlossingSciatica,
};

// ─── Mock data (se reemplazará con API real en Parte 4) ─────────────────────
const MOCK_ROUTINE = {
  id: "rt-demo-001",
  token: "demo",
  therapistName: "Dr. Carlos Moreno",
  therapistSpecialty: "Fisioterapeuta · Osteópata",
  patientName: "María López",
  routineName: "Rehabilitación lumbar — Fase 1",
  diagnosis: "Lumbalgia crónica L4-L5",
  notes: "Realiza los ejercicios por la mañana, antes de desayunar. Si sientes dolor agudo, para y contáctame.",
  createdAt: "2026-03-01",
  daysPerWeek: 5,
  exercises: [
    {
      id: "e1",
      name: "Cat-Cow Stretch",
      nameEs: "Estiramiento gato-vaca",
      region: "Lumbar",
      sets: 3,
      reps: 10,
      restSeconds: 30,
      durationSeconds: null,
      difficulty: "beginner",
      instructions: [
        "Colócate en posición de cuatro apoyos (manos y rodillas).",
        "Inspira y arquea la espalda hacia abajo (posición vaca).",
        "Espira y curva la espalda hacia arriba (posición gato).",
        "Alterna suavemente entre las dos posiciones.",
      ],
      tip: "Mueve solo la columna. Las caderas y hombros permanecen quietos.",
      contraindications: null,
      videoThumb: null,
      musclesWorked: ["Erector spinae", "Multífidos", "Recto abdominal"],
    },
    {
      id: "e2",
      name: "Dead Bug",
      nameEs: "Bicho muerto",
      region: "Core",
      sets: 3,
      reps: 8,
      restSeconds: 45,
      durationSeconds: null,
      difficulty: "intermediate",
      instructions: [
        "Túmbate boca arriba con rodillas en 90° y brazos hacia el techo.",
        "Activa el core presionando la lumbar contra el suelo.",
        "Extiende simultáneamente el brazo derecho y la pierna izquierda.",
        "Vuelve al centro y repite con el lado contrario.",
      ],
      tip: "La zona lumbar debe mantenerse en contacto con el suelo durante todo el ejercicio.",
      contraindications: null,
      videoThumb: null,
      musclesWorked: ["Transverso abdominal", "Multífidos", "Diafragma"],
    },
    {
      id: "e3",
      name: "Bird Dog",
      nameEs: "Pájaro-perro",
      region: "Lumbar / Core",
      sets: 3,
      reps: 10,
      restSeconds: 30,
      durationSeconds: null,
      difficulty: "beginner",
      instructions: [
        "Posición de cuatro apoyos con columna neutra.",
        "Extiende el brazo derecho y la pierna izquierda simultáneamente.",
        "Mantén la posición 2 segundos con control.",
        "Vuelve al centro y cambia de lado.",
      ],
      tip: "Evita rotar la cadera al elevar la pierna. Imagina que tienes un vaso de agua en la espalda.",
      contraindications: "Evitar si hay dolor en sacroilíaca activo.",
      videoThumb: null,
      musclesWorked: ["Glúteo mayor", "Erector spinae", "Deltoides"],
    },
    {
      id: "e4",
      name: "Glute Bridge",
      nameEs: "Puente de glúteos",
      region: "Glúteo / Lumbar",
      sets: 4,
      reps: 12,
      restSeconds: 30,
      durationSeconds: null,
      difficulty: "beginner",
      instructions: [
        "Túmbate boca arriba, rodillas flexionadas, pies planos en el suelo.",
        "Activa glúteos y eleva las caderas formando una línea recta hombro-rodilla.",
        "Mantén 2 segundos arriba apretando glúteos.",
        "Baja lentamente el control.",
      ],
      tip: "No hiperextiendas la espalda. El movimiento viene de los glúteos, no de la lumbar.",
      contraindications: null,
      videoThumb: null,
      musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Erector spinae"],
    },
    {
      id: "e5",
      name: "Seated Nerve Flossing",
      nameEs: "Deslizamiento neural sciático",
      region: "Nervio ciático",
      sets: 2,
      reps: 15,
      restSeconds: 20,
      durationSeconds: null,
      difficulty: "beginner",
      instructions: [
        "Siéntate en el borde de una silla con la espalda recta.",
        "Extiende la pierna afectada mientras flexionas el pie (dorsiflexión).",
        "Simultáneamente flexiona un poco la cabeza hacia delante.",
        "Dobla la rodilla y relaja el pie. Repite rítmicamente.",
      ],
      tip: "Debe sentirse como un tirón tolerable, nunca como dolor agudo.",
      contraindications: "No realizar si hay hernia discal en fase aguda.",
      videoThumb: null,
      musclesWorked: ["Nervio ciático", "Isquiotibiales"],
    },
  ],
};

// ─── Tipos ───────────────────────────────────────────────────────────────────
type ExerciseStatus = "pending" | "active" | "completed";

interface ExerciseState {
  id: string;
  status: ExerciseStatus;
  setsCompleted: number;
  isResting: boolean;
  restTimeLeft: number;
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function PatientView() {
  const routine = MOCK_ROUTINE;
  const totalExercises = routine.exercises.length;

  const [exerciseStates, setExerciseStates] = useState<Record<string, ExerciseState>>(() =>
    Object.fromEntries(
      routine.exercises.map((ex, i) => [
        ex.id,
        {
          id: ex.id,
          status: i === 0 ? "active" : "pending",
          setsCompleted: 0,
          isResting: false,
          restTimeLeft: 0,
        },
      ])
    )
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [routineCompleted, setRoutineCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [muted, setMuted] = useState(false);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const completedCount = Object.values(exerciseStates).filter(
    (s) => s.status === "completed"
  ).length;
  const progressPct = Math.round((completedCount / totalExercises) * 100);
  const activeExercise = routine.exercises[activeIndex];
  const activeState = exerciseStates[activeExercise.id];

  // ─── Limpiar timer al desmontar ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  // ─── Timer de descanso ───────────────────────────────────────────────────
  function startRestTimer(exerciseId: string, seconds: number) {
    setExerciseStates((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], isResting: true, restTimeLeft: seconds },
    }));

    restTimerRef.current = setInterval(() => {
      setExerciseStates((prev) => {
        const current = prev[exerciseId];
        if (current.restTimeLeft <= 1) {
          clearInterval(restTimerRef.current!);
          return {
            ...prev,
            [exerciseId]: { ...current, isResting: false, restTimeLeft: 0 },
          };
        }
        return {
          ...prev,
          [exerciseId]: { ...current, restTimeLeft: current.restTimeLeft - 1 },
        };
      });
    }, 1000);
  }

  // ─── Completar una serie ─────────────────────────────────────────────────
  function handleSetComplete() {
    const ex = activeExercise;
    const state = activeState;
    const newSets = state.setsCompleted + 1;

    if (newSets >= ex.sets) {
      // Ejercicio completado
      const newStates = {
        ...exerciseStates,
        [ex.id]: { ...state, setsCompleted: newSets, status: "completed" as ExerciseStatus, isResting: false },
      };

      // Activar siguiente ejercicio si existe
      if (activeIndex + 1 < totalExercises) {
        const nextEx = routine.exercises[activeIndex + 1];
        newStates[nextEx.id] = { ...newStates[nextEx.id], status: "active" };
      }

      setExerciseStates(newStates);

      if (activeIndex + 1 < totalExercises) {
        // Auto-avanzar después de un momento
        setTimeout(() => setActiveIndex((i) => i + 1), 600);
      } else {
        setRoutineCompleted(true);
      }
    } else {
      // Serie completada, iniciar descanso
      setExerciseStates((prev) => ({
        ...prev,
        [ex.id]: { ...prev[ex.id], setsCompleted: newSets },
      }));
      startRestTimer(ex.id, ex.restSeconds);
    }
  }

  function goToExercise(index: number) {
    if (index < 0 || index >= totalExercises) return;
    setActiveIndex(index);
  }

  function getDifficultyColor(d: string) {
    if (d === "beginner") return "bg-clinical-500/15 text-clinical-700";
    if (d === "intermediate") return "bg-amber-500/15 text-amber-700";
    return "bg-red-500/15 text-red-700";
  }

  function getDifficultyLabel(d: string) {
    if (d === "beginner") return "Básico";
    if (d === "intermediate") return "Intermedio";
    return "Avanzado";
  }

  // ─── Pantalla de finalización ────────────────────────────────────────────
  if (routineCompleted) {
    return <CompletionScreen routine={routine} completedCount={totalExercises} />;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Header del terapeuta */}
      <header className="sticky top-0 z-50 bg-surface-950/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
              {routine.therapistName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-none">{routine.therapistName}</p>
              <p className="text-[10px] text-surface-400 leading-none mt-0.5">{routine.therapistSpecialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="bg-brand-600/20 text-brand-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              Therapia Global
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-24">
        {/* Info de la rutina */}
        <div className="pt-5 pb-4">
          <p className="text-surface-400 text-xs uppercase tracking-wider mb-1">Tu rutina personalizada</p>
          <h1 className="text-xl font-bold text-white mb-1">{routine.routineName}</h1>
          <p className="text-sm text-surface-400">{routine.diagnosis}</p>

          {/* Nota del terapeuta */}
          {routine.notes && (
            <div className="mt-3 bg-brand-600/10 border border-brand-600/20 rounded-xl p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-300 leading-relaxed">{routine.notes}</p>
            </div>
          )}
        </div>

        {/* Barra de progreso global */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-surface-400">
              {completedCount} de {totalExercises} ejercicios
            </span>
            <span className="text-xs font-bold text-clinical-500">{progressPct}%</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-clinical-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Lista de ejercicios (miniaturas) */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {routine.exercises.map((ex, i) => {
            const state = exerciseStates[ex.id];
            return (
              <button
                key={ex.id}
                onClick={() => goToExercise(i)}
                className={cn(
                  "flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border text-center",
                  activeIndex === i
                    ? "border-brand-500 bg-brand-600/20"
                    : state.status === "completed"
                    ? "border-clinical-500/40 bg-clinical-500/10"
                    : "border-white/5 bg-white/5"
                )}
              >
                {state.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-clinical-500" />
                ) : (
                  <span
                    className={cn(
                      "text-xs font-bold",
                      activeIndex === i ? "text-brand-400" : "text-surface-400"
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[9px] leading-tight px-0.5 line-clamp-1",
                    activeIndex === i ? "text-white" : "text-surface-500"
                  )}
                >
                  {ex.nameEs}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ejercicio activo */}
        <ExerciseCard
          exercise={activeExercise}
          state={activeState}
          exerciseNumber={activeIndex + 1}
          totalExercises={totalExercises}
          showInstructions={showInstructions}
          onToggleInstructions={() => setShowInstructions(!showInstructions)}
          onSetComplete={handleSetComplete}
          onPrev={() => goToExercise(activeIndex - 1)}
          onNext={() => goToExercise(activeIndex + 1)}
          canPrev={activeIndex > 0}
          canNext={activeIndex < totalExercises - 1}
          getDifficultyColor={getDifficultyColor}
          getDifficultyLabel={getDifficultyLabel}
          AnimComponent={EXERCISE_ANIM_MAP[activeExercise.id]}
        />
      </main>
    </div>
  );
}

// ─── Tarjeta de ejercicio ────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  state,
  exerciseNumber,
  totalExercises,
  showInstructions,
  onToggleInstructions,
  onSetComplete,
  onPrev,
  onNext,
  canPrev,
  canNext,
  getDifficultyColor,
  getDifficultyLabel,
  AnimComponent,
}: {
  exercise: typeof MOCK_ROUTINE.exercises[0];
  state: ExerciseState;
  exerciseNumber: number;
  totalExercises: number;
  showInstructions: boolean;
  onToggleInstructions: () => void;
  onSetComplete: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  getDifficultyColor: (d: string) => string;
  getDifficultyLabel: (d: string) => string;
  AnimComponent?: React.FC;
}) {
  const isCompleted = state.status === "completed";
  const setsLeft = exercise.sets - state.setsCompleted;

  return (
    <div className="bg-surface-900 rounded-2xl overflow-hidden border border-white/5">
      {/* Animación del ejercicio */}
      <div className="relative bg-surface-800 overflow-hidden" style={{ aspectRatio: "16/10" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 to-transparent z-10 pointer-events-none" />

        {/* Animación SVG */}
        {AnimComponent ? (
          <div className="w-full h-full p-4 flex items-center justify-center">
            <AnimComponent />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-surface-900/80" />
            <div className="relative z-10 w-full h-full flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-black text-brand-400">{exerciseNumber}</span>
                </div>
                <p className="text-white font-semibold text-lg">{exercise.nameEs}</p>
                <p className="text-surface-400 text-sm">{exercise.name}</p>
              </div>
            </div>
          </>
        )}

        {/* Nombre del ejercicio superpuesto */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-4 py-3">
          <p className="text-white font-semibold text-sm drop-shadow">{exercise.nameEs}</p>
          <p className="text-surface-300 text-xs drop-shadow">{exercise.name}</p>
        </div>

        {/* Badge completado */}
        {isCompleted && (
          <div className="absolute inset-0 z-30 bg-clinical-900/85 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-clinical-400 mx-auto mb-2" />
              <p className="text-clinical-300 font-semibold">Completado</p>
            </div>
          </div>
        )}

        {/* Navegación anterior/siguiente */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all",
              canPrev ? "text-white hover:bg-black/70" : "text-surface-600 cursor-not-allowed opacity-40"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-white/70 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
            {exerciseNumber} / {totalExercises}
          </span>
          <button
            onClick={onNext}
            disabled={!canNext}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all",
              canNext ? "text-white hover:bg-black/70" : "text-surface-600 cursor-not-allowed opacity-40"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getDifficultyColor(exercise.difficulty))}>
            {getDifficultyLabel(exercise.difficulty)}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-surface-300">
            {exercise.region}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-surface-300">
            <Repeat2 className="h-3 w-3" />
            {exercise.sets} series × {exercise.reps} reps
          </span>
          {exercise.restSeconds && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-surface-300">
              <Clock className="h-3 w-3" />
              {exercise.restSeconds}s descanso
            </span>
          )}
        </div>

        {/* Progreso de series */}
        {!isCompleted && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-surface-400">Series completadas</span>
              <span className="text-xs font-bold text-white">
                {state.setsCompleted} / {exercise.sets}
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: exercise.sets }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all duration-300",
                    i < state.setsCompleted ? "bg-clinical-500" : "bg-surface-700"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Timer de descanso */}
        {state.isResting && (
          <RestTimer seconds={state.restTimeLeft} totalSeconds={exercise.restSeconds} />
        )}

        {/* Músculos trabajados */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exercise.musclesWorked.map((m) => (
            <span key={m} className="text-[10px] text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
              {m}
            </span>
          ))}
        </div>

        {/* Instrucciones (colapsable) */}
        <button
          onClick={onToggleInstructions}
          className="w-full flex items-center justify-between text-sm font-semibold text-surface-300 hover:text-white mb-3 transition-colors"
        >
          <span>Instrucciones paso a paso</span>
          <span className="text-xs text-surface-500">{showInstructions ? "Ocultar" : "Mostrar"}</span>
        </button>

        {showInstructions && (
          <ol className="space-y-2 mb-4">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-surface-300 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-600/20 text-brand-400 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        )}

        {/* Tip del terapeuta */}
        {exercise.tip && (
          <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
            <Star className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">{exercise.tip}</p>
          </div>
        )}

        {/* Contraindicación */}
        {exercise.contraindications && (
          <div className="flex gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{exercise.contraindications}</p>
          </div>
        )}

        {/* CTA principal */}
        {!isCompleted && !state.isResting && (
          <Button
            onClick={onSetComplete}
            className="w-full h-14 text-base font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all active:scale-95"
          >
            {state.setsCompleted === 0
              ? "Empezar serie 1"
              : setsLeft === 1
              ? "¡Última serie!"
              : `Serie ${state.setsCompleted + 1} completada →`}
          </Button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 h-14 bg-clinical-500/15 rounded-xl border border-clinical-500/20">
            <CheckCircle2 className="h-5 w-5 text-clinical-400" />
            <span className="text-clinical-400 font-semibold">Ejercicio completado</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Timer de descanso ───────────────────────────────────────────────────────
function RestTimer({ seconds, totalSeconds }: { seconds: number; totalSeconds: number }) {
  const pct = Math.round(((totalSeconds - seconds) / totalSeconds) * 100);
  return (
    <div className="mb-4 bg-surface-800 rounded-xl p-4 text-center">
      <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">Tiempo de descanso</p>
      <div className="text-4xl font-black text-white tabular-nums mb-3">{seconds}s</div>
      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-surface-500 mt-2">Prepárate para la siguiente serie</p>
    </div>
  );
}

// ─── Pantalla de finalización ────────────────────────────────────────────────
function CompletionScreen({
  routine,
  completedCount,
}: {
  routine: typeof MOCK_ROUTINE;
  completedCount: number;
}) {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Confetti visual */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-clinical-500/20 flex items-center justify-center mx-auto">
          <div className="w-16 h-16 rounded-full bg-clinical-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-clinical-400" />
          </div>
        </div>
        {/* Destellos */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-clinical-500"
            style={{
              top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 6)}%`,
              left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 6)}%`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <h1 className="text-3xl font-black text-white mb-2">¡Sesión completada!</h1>
      <p className="text-surface-400 mb-1">
        {completedCount} ejercicios completados
      </p>
      <p className="text-sm text-surface-500 mb-8">
        {routine.routineName}
      </p>

      {/* Stats */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Ejercicios", value: completedCount },
          { label: "Series", value: routine.exercises.reduce((a, e) => a + e.sets, 0) },
          { label: "Repeticiones", value: routine.exercises.reduce((a, e) => a + e.sets * e.reps, 0) },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-900 rounded-xl p-3 border border-white/5">
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-surface-400 max-w-xs mb-8">
        Tu terapeuta <span className="text-white font-medium">{routine.therapistName}</span> verá
        que completaste la sesión de hoy. ¡Excelente trabajo!
      </p>

      <div className="flex items-center gap-2 bg-surface-900 border border-white/5 rounded-xl px-4 py-3">
        <div className="w-6 h-6 rounded bg-brand-600/20 flex items-center justify-center">
          <span className="text-brand-400 text-xs font-bold">T</span>
        </div>
        <span className="text-xs text-surface-400">
          Enviado a través de <span className="text-surface-200 font-medium">Therapia Global</span>
        </span>
      </div>
    </div>
  );
}
