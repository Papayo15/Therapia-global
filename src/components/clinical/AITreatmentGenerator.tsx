"use client";

import { useState } from "react";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SoapNote } from "@/lib/supabase";

interface RecommendedExercise {
  slug: string;
  name?: string;
  sets?: number;
  reps?: number;
  notes?: string;
}

export interface AITreatmentResult {
  treatment_summary: string;
  diagnosis: string;
  recommended_exercises: RecommendedExercise[];
  raw?: unknown;
}

interface AITreatmentGeneratorProps {
  soap: SoapNote;
  onResult: (result: AITreatmentResult) => void;
}

export function AITreatmentGenerator({ soap, onResult }: AITreatmentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: soap.diagnosis,
          subjective: soap.subjective,
          objective: soap.objective,
          assessment: soap.assessment,
        }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();

      // Normalize response to our AITreatmentResult format
      const exercises: RecommendedExercise[] = (
        data.recommended_exercises ||
        data.exercises ||
        data.routine ||
        []
      ).map((ex: Record<string, unknown>) => ({
        slug: (ex.slug || ex.id || ex.exercise_id || "") as string,
        name: (ex.name || ex.nameLocal || ex.slug || ex.id || "") as string,
        sets: (ex.sets as number) || 3,
        reps: (ex.reps as number) || 10,
        notes: (ex.tip || ex.notes || ex.progressionTip || "") as string,
      })).filter((ex: RecommendedExercise) => ex.slug);

      onResult({
        treatment_summary: data.treatment_summary || data.ai_summary || data.clinicalReasoning || "Plan generado por IA",
        diagnosis: soap.diagnosis || data.diagnosis || "",
        recommended_exercises: exercises,
        raw: data,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al generar el plan con IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-bold text-slate-700">Datos clínicos para la IA</h3>
        {soap.diagnosis && (
          <div>
            <span className="text-xs font-semibold text-slate-500">Diagnóstico: </span>
            <span className="text-xs text-slate-700">{soap.diagnosis}</span>
          </div>
        )}
        {soap.assessment && (
          <div>
            <span className="text-xs font-semibold text-slate-500">Evaluación: </span>
            <span className="text-xs text-slate-700 line-clamp-2">{soap.assessment}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Button
        onClick={generate}
        disabled={loading}
        className="w-full gap-2"
        size="lg"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Generando plan con IA...</>
        ) : (
          <><Zap className="h-4 w-4" />Generar plan con TherapIA</>
        )}
      </Button>
    </div>
  );
}
