"use client";

import { useEffect, useState, use } from "react";
import { supabase, RoutinePlan, PlanExercise } from "@/lib/supabase";

interface Props {
  params: Promise<{ plan_id: string; locale: string }>;
}

export default function PatientPlanPage({ params }: Props) {
  const { plan_id } = use(params);
  const [plan, setPlan] = useState<RoutinePlan | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      if (plan_id.startsWith("demo-")) {
        // Demo fallback
        setPlan(DEMO_PLAN);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("routine_plans")
        .select("*")
        .eq("id", plan_id)
        .single();
      if (!error && data) setPlan(data as RoutinePlan);
      setLoading(false);
    }
    fetchPlan();
  }, [plan_id]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer === null || restTimer <= 0) return;
    const t = setTimeout(() => setRestTimer((r) => (r ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Cargando tu programa...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Link no encontrado</h1>
          <p className="text-slate-500 text-sm">Este link puede haber expirado. Pide a tu terapeuta que lo reenvíe.</p>
        </div>
      </div>
    );
  }

  const exercises = plan.plan_json.exercises;
  const meta = plan.plan_json.meta;
  const active = exercises[activeIdx];
  const progress = Math.round((completed.size / exercises.length) * 100);

  function markDone(idx: number) {
    const next = new Set(completed);
    next.add(idx);
    setCompleted(next);
    setRestTimer(exercises[idx]?.rest_seconds ?? 60);
  }

  function youtubeUrl(ex: PlanExercise) {
    if (!ex.youtube_id) return null;
    const base = `https://www.youtube-nocookie.com/embed/${ex.youtube_id}`;
    const t = ex.youtube_start_seconds > 0 ? `?start=${ex.youtube_start_seconds}&autoplay=1&rel=0` : "?autoplay=1&rel=0";
    return base + t;
  }

  if (completed.size === exercises.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Rutina completada!</h1>
          <p className="text-slate-500 mb-6">Excelente trabajo. Tu terapeuta estará orgulloso.</p>
          <button
            onClick={() => { setCompleted(new Set()); setActiveIdx(0); }}
            className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium"
          >
            Repetir rutina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">Therapia Global</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{meta.diagnosis}</h1>
        <p className="text-sm text-slate-500">{meta.phase} · {meta.frequency_per_week}x semana</p>
        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{completed.size}/{exercises.length} ejercicios</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Rest timer banner */}
      {restTimer !== null && restTimer > 0 && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-700 font-medium mb-1">⏱ Descansando...</p>
          <p className="text-3xl font-bold text-amber-600">{restTimer}s</p>
          <button onClick={() => setRestTimer(null)} className="mt-2 text-xs text-amber-500 underline">
            Saltar descanso
          </button>
        </div>
      )}

      {/* Exercise list */}
      <div className="px-4 py-4 space-y-3">
        {exercises.map((ex, idx) => {
          const isDone = completed.has(idx);
          const isActive = idx === activeIdx && !isDone;

          return (
            <div
              key={ex.exercise_id}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? "border-sky-300 bg-sky-50 shadow-sm"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50 opacity-70"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isDone ? "bg-emerald-400 text-white" : isActive ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {isDone ? "✓" : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{ex.nombre_display}</p>
                  <p className="text-xs text-slate-500">{ex.sets} series · {ex.reps} reps · {ex.rest_seconds}s descanso</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  ex.equipment_used === "peso corporal"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-sky-100 text-sky-700"
                }`}>
                  {ex.equipment_used}
                </span>
              </div>

              {/* Expanded content when active */}
              {isActive && (
                <div className="border-t border-sky-100 px-4 pb-4">
                  {/* YouTube embed */}
                  {youtubeUrl(ex) ? (
                    <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-slate-900">
                      <iframe
                        src={youtubeUrl(ex)!}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-slate-100 aspect-video flex items-center justify-center">
                      <p className="text-slate-400 text-sm">Video próximamente</p>
                    </div>
                  )}

                  {/* Therapist note */}
                  {ex.note_from_therapist && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">📋 Nota de tu terapeuta</p>
                      <p className="text-sm text-amber-800">{ex.note_from_therapist}</p>
                    </div>
                  )}

                  {/* ELI5 steps */}
                  <div className="mt-3 space-y-2">
                    {ex.instructions_eli5.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Equipment alternative */}
                  {ex.equipment_alternative && ex.equipment_alternative !== ex.equipment_used && (
                    <p className="mt-3 text-xs text-slate-400">
                      ¿No tienes {ex.equipment_used}? Puedes usar{" "}
                      <span className="font-medium text-slate-600">{ex.equipment_alternative}</span>
                    </p>
                  )}

                  {/* Done button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); markDone(idx); if (idx < exercises.length - 1) setActiveIdx(idx + 1); }}
                    className="mt-4 w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    ✓ Ejercicio completado
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-8" />
    </div>
  );
}

// ── Demo fallback (for demo-* plan_ids) ──────────────────────────────────────
const DEMO_PLAN: RoutinePlan = {
  id: "demo",
  therapist_id: "demo",
  patient_name: "Paciente Demo",
  patient_phone: "",
  diagnosis: "Rehabilitación de hombro",
  plan_json: {
    meta: {
      diagnosis: "Síndrome de hombro doloroso",
      phase: "Fase 1 — Movilización activa",
      frequency_per_week: 3,
      duration_weeks: 4,
    },
    exercises: [
      {
        exercise_id: "A_HOM_001",
        nombre_display: "Elevación de hombro con liga",
        youtube_id: "",
        youtube_start_seconds: 0,
        sets: 3,
        reps: 15,
        rest_seconds: 60,
        frequency_per_week: 3,
        equipment_used: "banda",
        equipment_alternative: "peso corporal",
        note_from_therapist: "Mantén el codo ligeramente doblado durante todo el movimiento.",
        instructions_eli5: [
          "Párate derecho con la liga bajo tu pie",
          "Sube el brazo como si quisieras alcanzar un vaso en un estante alto",
          "Baja despacio contando hasta 3 — esa parte es la más importante"
        ],
        order: 1,
      },
      {
        exercise_id: "A_LUM_001",
        nombre_display: "Gato y vaca (lumbar)",
        youtube_id: "",
        youtube_start_seconds: 0,
        sets: 3,
        reps: 10,
        rest_seconds: 45,
        frequency_per_week: 3,
        equipment_used: "peso corporal",
        equipment_alternative: "peso corporal",
        note_from_therapist: "Respira con cada movimiento. Inhala al bajar, exhala al subir.",
        instructions_eli5: [
          "Ponte en cuatro patas como un perro descansando",
          "Hunde la espalda suave y mira hacia arriba — como un gato feliz",
          "Redondea la espalda hacia arriba — como un gato asustado"
        ],
        order: 2,
      },
    ],
  },
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
};
