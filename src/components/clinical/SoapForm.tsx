"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase, type SoapNote } from "@/lib/supabase";
import { Zap } from "lucide-react";

interface SoapFormProps {
  patientId: string;
  onSave: (note: SoapNote) => void;
  onCancel: () => void;
}

const FIELDS = [
  {
    key: "subjective" as const,
    label: "S — Subjetivo",
    placeholder: "¿Qué refiere el paciente? Dolor, localización, intensidad (EVA), inicio, factores que agravan/alivian...",
    hint: "Voz del paciente: síntomas, historia, contexto",
  },
  {
    key: "objective" as const,
    label: "O — Objetivo",
    placeholder: "Hallazgos clínicos: ROM, fuerza, palpación, tests ortopédicos, postura, marcha...",
    hint: "Lo que el terapeuta observa y mide",
  },
  {
    key: "assessment" as const,
    label: "A — Análisis / Evaluación",
    placeholder: "Diagnóstico funcional, hipótesis clínica, estructuras comprometidas, pronóstico...",
    hint: "Interpretación clínica de S + O",
  },
  {
    key: "diagnosis" as const,
    label: "Diagnóstico",
    placeholder: "Diagnóstico fisioterapéutico principal. Ej: Cervicobraquialgia C5-C6 por hernia discal",
    hint: "Diagnóstico oficial (ICD-10 si aplica)",
  },
  {
    key: "plan" as const,
    label: "P — Plan de tratamiento",
    placeholder: "Técnicas, ejercicios, frecuencia, objetivos a corto/largo plazo, criterios de alta...",
    hint: "Qué haremos y cuándo",
  },
] as const;

export function SoapForm({ patientId, onSave, onCancel }: SoapFormProps) {
  const [form, setForm] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    diagnosis: "",
    plan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subjective.trim()) { setError("La sección subjetiva es obligatoria"); return; }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error: err } = await supabase
        .from("soap_notes")
        .insert({
          patient_id: patientId,
          ...form,
          doctor: user?.email ?? "Terapeuta",
        })
        .select()
        .single();
      if (err) throw err;
      onSave(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar nota SOAP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map(({ key, label, placeholder, hint }) => (
        <div key={key}>
          <label className="block mb-1">
            <span className="text-sm font-bold text-slate-800">{label}</span>
            <span className="text-xs text-slate-400 ms-2">{hint}</span>
          </label>
          <textarea
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            rows={key === "plan" ? 4 : 3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none transition-colors"
          />
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Zap className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700">
          Al guardar podrás generar un plan de tratamiento con IA basado en estos datos clínicos.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : "Guardar nota SOAP"}
        </Button>
      </div>
    </form>
  );
}
