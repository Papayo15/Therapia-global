"use client";

import { useState } from "react";
import { Save, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreatmentExerciseCard } from "./TreatmentExerciseCard";
import { supabase, type TreatmentPlan } from "@/lib/supabase";
import exerciseRegistry from "@registry/exercises.json";
import type { AITreatmentResult } from "./AITreatmentGenerator";

const reg = exerciseRegistry as Record<string, { video?: string }>;

interface TreatmentPlanEditorProps {
  patientId: string;
  soapId?: string;
  aiResult: AITreatmentResult;
  onSaved: (plan: TreatmentPlan) => void;
  onCancel: () => void;
}

interface ExEntry {
  slug: string;
  name?: string;
  sets: number;
  reps: number;
  notes: string;
}

export function TreatmentPlanEditor({
  patientId, soapId, aiResult, onSaved, onCancel,
}: TreatmentPlanEditorProps) {
  const [exercises, setExercises] = useState<ExEntry[]>(
    aiResult.recommended_exercises
      .filter((ex) => reg[ex.slug] !== undefined || ex.slug)
      .map((ex) => ({
        slug: ex.slug,
        name: ex.name,
        sets: ex.sets ?? 3,
        reps: ex.reps ?? 10,
        notes: ex.notes ?? "",
      }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(i: number, patch: Partial<ExEntry>) {
    setExercises((prev) => prev.map((ex, idx) => idx === i ? { ...ex, ...patch } : ex));
  }

  function remove(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function buildWhatsApp() {
    const text = exercises.map((ex, i) => {
      const videoUrl = reg[ex.slug]?.video ?? "";
      const name = ex.name || ex.slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
      return `${i + 1}️⃣ ${name} ${ex.sets}x${ex.reps}${videoUrl ? `\n🎥 ${videoUrl}` : ""}`;
    }).join("\n\n");

    const msg = `Tu programa de ejercicios:\n\n${text}\n\nGenerado con TherapIA — ${new Date().toLocaleDateString("es-MX")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function handleSave() {
    if (exercises.length === 0) { setError("Agrega al menos un ejercicio al plan"); return; }
    setLoading(true);
    setError("");
    try {
      // 1. Create treatment plan
      const { data: plan, error: planErr } = await supabase
        .from("treatment_plans")
        .insert({
          patient_id: patientId,
          soap_id: soapId ?? null,
          diagnosis: aiResult.diagnosis,
          ai_summary: aiResult.treatment_summary,
        })
        .select()
        .single();
      if (planErr) throw planErr;

      // 2. Insert treatment exercises
      const exerciseRows = exercises.map((ex) => ({
        treatment_id: plan.id,
        exercise_slug: ex.slug,
        sets: ex.sets,
        reps: ex.reps,
        notes: ex.notes || null,
      }));
      const { error: exErr } = await supabase.from("treatment_exercises").insert(exerciseRows);
      if (exErr) throw exErr;

      onSaved({ ...plan, treatment_exercises: exerciseRows.map((r, i) => ({ ...r, id: String(i) })) });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar el plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* AI Summary */}
      {aiResult.treatment_summary && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold text-blue-700 mb-1">Resumen clínico — TherapIA</p>
          <p className="text-sm text-blue-800 leading-relaxed">{aiResult.treatment_summary}</p>
        </div>
      )}

      {/* Exercise cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          Ejercicios del plan ({exercises.length})
        </h3>
        {exercises.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Sin ejercicios. La IA no encontró ejercicios válidos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exercises.map((ex, i) => (
              <TreatmentExerciseCard
                key={ex.slug + i}
                slug={ex.slug}
                name={ex.name}
                sets={ex.sets}
                reps={ex.reps}
                notes={ex.notes}
                onChangeSets={(v) => update(i, { sets: v })}
                onChangeReps={(v) => update(i, { reps: v })}
                onChangeNotes={(v) => update(i, { notes: v })}
                onRemove={() => remove(i)}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button variant="outline" onClick={buildWhatsApp} className="gap-1.5 shrink-0 text-green-700 border-green-200 hover:bg-green-50">
          <MessageCircle className="h-4 w-4" />WhatsApp
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1 gap-1.5">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : "Guardar plan"}
        </Button>
      </div>
    </div>
  );
}
