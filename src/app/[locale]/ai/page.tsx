"use client";

import { useState } from "react";
import {
  Brain, Sparkles, AlertTriangle, ChevronRight, Copy, Check, Send,
  BookOpen, Activity, Target, Clock, TrendingUp, Shield, Zap, Plus,
  RefreshCw, RotateCcw, Info
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClinicalInput {
  diagnosis: string;
  region: string;
  phase: string;
  painLevel: number;
  contraindications: string[];
  goals: string[];
  equipment: string[];
  age: string;
  comorbidities: string[];
}

interface RecommendedExercise {
  id: string;
  name: string;
  nameEs: string;
  rationale: string;
  sets: number;
  reps: number | null;
  restSeconds: number;
  progressionTip: string;
  redFlags: string[];
  evidenceLevel: "A" | "B" | "C";
  category: string;
}

interface AIRecommendation {
  routineName: string;
  clinicalReasoning: string;
  phaseDescription: string;
  precautions: string[];
  exercises: RecommendedExercise[];
  progressionTimeline: string;
  expectedOutcomes: string;
  referralCriteria: string;
  evidenceSummary: string;
  generatedAt: string;
  modelVersion: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const REGIONS = [
  { value: "lumbar",    label: "Columna Lumbar" },
  { value: "thoracic",  label: "Columna Torácica" },
  { value: "cervical",  label: "Columna Cervical" },
  { value: "shoulder",  label: "Hombro" },
  { value: "elbow",     label: "Codo" },
  { value: "knee",      label: "Rodilla" },
  { value: "hip",       label: "Cadera" },
  { value: "ankle",     label: "Tobillo / Pie" },
  { value: "core",      label: "Core / Suelo Pélvico" },
  { value: "global",    label: "Global / Sistémico" },
];

const PHASES = [
  { value: "acute",       label: "Agudo",       desc: "0–2 semanas", color: "text-red-600 bg-red-50 border-red-200" },
  { value: "subacute",    label: "Subagudo",    desc: "2–6 semanas", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "chronic",     label: "Crónico",     desc: ">6 semanas",  color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "maintenance", label: "Mantenimiento",desc: "Alta / Sport",color: "text-clinical-600 bg-clinical-50 border-clinical-200" },
];

const EQUIPMENT_OPTIONS = [
  "Peso corporal", "Mancuernas", "Ligas / Bandas", "Pelota terapéutica",
  "Foam Roller", "BOSU", "Kettlebell", "Peso tobillo",
];

const EVIDENCE_COLORS: Record<string, string> = {
  A: "bg-clinical-500 text-white",
  B: "bg-brand-500 text-white",
  C: "bg-surface-400 text-white",
};

const CATEGORY_ICONS: Record<string, string> = {
  mobility:       "🔄",
  stabilization:  "🔒",
  strengthening:  "💪",
  activation:     "⚡",
  scapular:       "🦅",
  neuromuscular:  "🧠",
};

// ─── Component: Phase Selector ────────────────────────────────────────────────
function PhaseSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PHASES.map((p) => (
        <button key={p.value} onClick={() => onChange(p.value)}
          className={cn(
            "px-3 py-2.5 rounded-xl border text-start transition-all",
            value === p.value ? p.color : "border-surface-200 hover:border-surface-300 bg-white text-surface-600"
          )}>
          <p className="text-xs font-semibold">{p.label}</p>
          <p className="text-[10px] opacity-70">{p.desc}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Component: Pain Slider ───────────────────────────────────────────────────
function PainSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const color = value <= 3 ? "text-clinical-600" : value <= 6 ? "text-amber-600" : "text-red-600";
  const bg = value <= 3 ? "accent-clinical-500" : value <= 6 ? "accent-amber-500" : "accent-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-surface-600">Nivel de dolor (EVA)</label>
        <span className={cn("text-lg font-bold", color)}>{value}<span className="text-xs font-normal text-surface-400">/10</span></span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className={cn("w-full h-2 rounded-full appearance-none bg-surface-200 cursor-pointer", bg)} />
      <div className="flex justify-between text-[10px] text-surface-400">
        <span>Sin dolor</span>
        <span>Moderado</span>
        <span>Máximo</span>
      </div>
    </div>
  );
}

// ─── Component: Tag Input ─────────────────────────────────────────────────────
function TagInput({ label, placeholder, tags, onChange }: {
  label: string; placeholder: string;
  tags: string[]; onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-surface-600">{label}</label>
      <div className="flex gap-1.5">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder} className="h-8 text-xs flex-1" />
        <button onClick={add} className="px-3 h-8 bg-surface-100 hover:bg-surface-200 rounded-lg text-xs font-medium text-surface-600 transition-colors">
          +
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 border border-brand-200 rounded-full text-[11px] text-brand-700">
              {t}
              <button onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-red-500 transition-colors">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Component: Exercise Card in Result ──────────────────────────────────────
function ExerciseResultCard({ ex, index, onAdd }: {
  ex: RecommendedExercise; index: number; onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    setAdded(true);
    onAdd();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-white border border-surface-200 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
          <span className="text-base">{CATEGORY_ICONS[ex.category] || "💊"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-surface-900">{ex.nameEs}</p>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", EVIDENCE_COLORS[ex.evidenceLevel])}>
              Evidencia {ex.evidenceLevel}
            </span>
          </div>
          <p className="text-[10px] text-surface-400">
            {ex.sets} series × {ex.reps ?? "Hold"} {ex.reps ? "reps" : ""} · {ex.restSeconds}s descanso
          </p>
        </div>
        <button onClick={handleAdd}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            added
              ? "bg-clinical-500 text-white"
              : "bg-surface-100 text-surface-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-transparent"
          )}>
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Agregado" : "Rutina"}
        </button>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <p className="text-xs text-surface-600 leading-relaxed">{ex.rationale}</p>
        <div className="flex items-start gap-1.5">
          <TrendingUp className="h-3 w-3 text-clinical-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-clinical-700 font-medium">{ex.progressionTip}</p>
        </div>
        {ex.redFlags.length > 0 && (
          <div className="flex items-start gap-1.5 bg-red-50 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700">{ex.redFlags.join(" · ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIPage() {
  const [form, setForm] = useState<ClinicalInput>({
    diagnosis: "",
    region: "lumbar",
    phase: "chronic",
    painLevel: 5,
    contraindications: [],
    goals: [],
    equipment: ["Peso corporal"],
    age: "",
    comorbidities: [],
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedExercises, setAddedExercises] = useState<Set<string>>(new Set());

  function toggleEquipment(eq: string) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }));
  }

  async function generate() {
    if (!form.diagnosis.trim()) {
      setError("Escribe el diagnóstico del paciente.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: parseInt(form.age) || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error en el servidor");
      setResult(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result) return;
    const text = `${result.routineName}\n\n${result.clinicalReasoning}\n\nEjercicios:\n${result.exercises.map((e, i) => `${i + 1}. ${e.nameEs} — ${e.sets}×${e.reps ?? "Hold"} (${e.rationale})`).join("\n")}\n\nProgresión: ${result.progressionTimeline}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setResult(null);
    setAddedExercises(new Set());
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Motor IA Clínico" />

        <div className="flex flex-1 overflow-hidden">

          {/* ── Panel de entrada ──────────────────────────────────────────── */}
          <div className="w-96 shrink-0 bg-white border-e border-surface-200 flex flex-col overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-surface-100">
              <div className="flex items-center gap-2 mb-0.5">
                <Brain className="h-4 w-4 text-brand-600" />
                <p className="text-sm font-bold text-surface-900">Prescripción IA</p>
              </div>
              <p className="text-xs text-surface-400">Completa los datos clínicos del paciente</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Diagnóstico */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-700">Diagnóstico principal *</label>
                <Input
                  value={form.diagnosis}
                  onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))}
                  placeholder="Ej: Lumbalgia mecánica L4-L5, Tendinopatía manguito..."
                  className="text-sm"
                />
              </div>

              {/* Región */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-700">Región anatómica</label>
                <select
                  value={form.region}
                  onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-700 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500">
                  {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Fase */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-700">Fase clínica</label>
                <PhaseSelector value={form.phase} onChange={(v) => setForm((p) => ({ ...p, phase: v }))} />
              </div>

              {/* Dolor */}
              <PainSlider value={form.painLevel} onChange={(v) => setForm((p) => ({ ...p, painLevel: v }))} />

              {/* Equipo disponible */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-700">Equipo disponible</label>
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <button key={eq} onClick={() => toggleEquipment(eq)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                        form.equipment.includes(eq)
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-surface-600 border-surface-200 hover:border-brand-300"
                      )}>
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edad */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-700">Edad del paciente</label>
                <Input
                  type="number" min="5" max="99"
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  placeholder="Ej: 45"
                  className="text-sm w-28"
                />
              </div>

              {/* Contraindicaciones */}
              <TagInput
                label="Contraindicaciones"
                placeholder="Ej: osteoporosis, embarazo..."
                tags={form.contraindications}
                onChange={(tags) => setForm((p) => ({ ...p, contraindications: tags }))}
              />

              {/* Objetivos */}
              <TagInput
                label="Objetivos del paciente"
                placeholder="Ej: volver a correr..."
                tags={form.goals}
                onChange={(tags) => setForm((p) => ({ ...p, goals: tags }))}
              />

              {/* Comorbilidades */}
              <TagInput
                label="Comorbilidades"
                placeholder="Ej: diabetes, HTA..."
                tags={form.comorbidities}
                onChange={(tags) => setForm((p) => ({ ...p, comorbidities: tags }))}
              />
            </div>

            {/* CTA */}
            <div className="px-5 pb-5 pt-3 border-t border-surface-100 space-y-2">
              {error && (
                <div className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              <button
                onClick={generate}
                disabled={loading}
                className={cn(
                  "w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                  loading
                    ? "bg-brand-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 shadow-lg hover:shadow-brand-500/30"
                )}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analizando caso clínico...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generar prescripción IA
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-surface-400">
                TherapIA-v1.0 · Basado en guías NICE, Cochrane, JOSPT
              </p>
            </div>
          </div>

          {/* ── Panel de resultados ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
                  <Brain className="h-9 w-9 text-brand-300" />
                </div>
                <h3 className="text-lg font-bold text-surface-700 mb-2">Motor IA Clínico</h3>
                <p className="text-sm text-surface-400 max-w-sm mb-6">
                  Completa los datos del paciente y genera una prescripción de ejercicios basada en evidencia clínica.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { icon: <BookOpen className="h-4 w-4" />, label: "Evidencia A/B/C", desc: "Clasificación GRADE" },
                    { icon: <Shield className="h-4 w-4" />, label: "Banderas rojas", desc: "Criterios de alerta" },
                    { icon: <TrendingUp className="h-4 w-4" />, label: "Progresión", desc: "Timeline clínico" },
                  ].map((f) => (
                    <div key={f.label} className="bg-white border border-surface-200 rounded-xl p-3 text-center">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center mx-auto mb-2 text-brand-500">
                        {f.icon}
                      </div>
                      <p className="text-xs font-semibold text-surface-700">{f.label}</p>
                      <p className="text-[10px] text-surface-400">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 animate-pulse">
                  <Brain className="h-8 w-8 text-brand-500" />
                </div>
                <p className="text-sm font-semibold text-surface-700 mb-1">Analizando caso clínico...</p>
                <p className="text-xs text-surface-400">Consultando evidencia clínica · Generando prescripción</p>
                <div className="flex gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="p-6 space-y-5">

                {/* Header del resultado */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-brand-500" />
                      <h2 className="text-lg font-bold text-surface-900">{result.routineName}</h2>
                    </div>
                    <p className="text-xs text-surface-400">{result.phaseDescription} · {result.modelVersion}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={copyResult}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-surface-200 rounded-lg text-xs font-medium text-surface-600 hover:bg-surface-50 transition-all">
                      {copied ? <Check className="h-3.5 w-3.5 text-clinical-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                    <button onClick={reset}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-surface-200 rounded-lg text-xs font-medium text-surface-600 hover:bg-surface-50 transition-all">
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reiniciar
                    </button>
                  </div>
                </div>

                {/* Razonamiento clínico */}
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-brand-600" />
                    <p className="text-xs font-bold text-brand-800 uppercase tracking-wider">Razonamiento Clínico</p>
                  </div>
                  <p className="text-sm text-brand-900 leading-relaxed">{result.clinicalReasoning}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Activity className="h-4 w-4" />, label: "Ejercicios", value: result.exercises.length, color: "text-brand-600 bg-brand-50" },
                    { icon: <Target className="h-4 w-4" />, label: "Series tot.", value: result.exercises.reduce((a, e) => a + e.sets, 0), color: "text-clinical-600 bg-clinical-50" },
                    { icon: <Clock className="h-4 w-4" />, label: "Est. min.", value: `~${Math.ceil(result.exercises.reduce((a, e) => a + (e.sets * 45 + e.restSeconds * (e.sets - 1)) / 60, 0))}`, color: "text-amber-600 bg-amber-50" },
                    { icon: <Zap className="h-4 w-4" />, label: "Evidencia", value: `${result.exercises.filter((e) => e.evidenceLevel === "A").length}A/${result.exercises.filter((e) => e.evidenceLevel === "B").length}B`, color: "text-purple-600 bg-purple-50" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-surface-200 rounded-xl p-3 text-center">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5", s.color)}>{s.icon}</div>
                      <p className="text-lg font-bold text-surface-900">{s.value}</p>
                      <p className="text-[10px] text-surface-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Ejercicios recomendados */}
                <div>
                  <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Ejercicios prescriptos</h3>
                  <div className="space-y-3">
                    {result.exercises.map((ex, i) => (
                      <ExerciseResultCard key={ex.id + i} ex={ex} index={i + 1}
                        onAdd={() => setAddedExercises((prev) => new Set([...prev, ex.id]))} />
                    ))}
                  </div>
                </div>

                {/* Precauciones */}
                {result.precautions.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Precauciones</p>
                    </div>
                    <ul className="space-y-1">
                      {result.precautions.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                          <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline + Outcomes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-surface-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-clinical-500" />
                      <p className="text-xs font-bold text-surface-700 uppercase tracking-wider">Progresión</p>
                    </div>
                    <p className="text-xs text-surface-600 leading-relaxed">{result.progressionTimeline}</p>
                  </div>
                  <div className="bg-white border border-surface-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-brand-500" />
                      <p className="text-xs font-bold text-surface-700 uppercase tracking-wider">Resultados esperados</p>
                    </div>
                    <p className="text-xs text-surface-600 leading-relaxed">{result.expectedOutcomes}</p>
                  </div>
                </div>

                {/* Referral + Evidence */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Criterios de derivación</p>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">{result.referralCriteria}</p>
                  </div>
                  <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-surface-500" />
                      <p className="text-xs font-bold text-surface-700 uppercase tracking-wider">Evidencia</p>
                    </div>
                    <p className="text-xs text-surface-600 leading-relaxed">{result.evidenceSummary}</p>
                  </div>
                </div>

                {/* Send to routine CTA */}
                {addedExercises.size > 0 && (
                  <div className="sticky bottom-0 bg-white border border-surface-200 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-surface-900">{addedExercises.size} ejercicio{addedExercises.size > 1 ? "s" : ""} seleccionado{addedExercises.size > 1 ? "s" : ""}</p>
                      <p className="text-xs text-surface-400">Listo para agregar al constructor de rutinas</p>
                    </div>
                    <button
                      onClick={() => window.open("/es/routines", "_blank")}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors">
                      <Send className="h-4 w-4" />
                      Ir al constructor
                    </button>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-2 px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-200">
                  <Info className="h-3.5 w-3.5 text-surface-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-surface-400 leading-relaxed">
                    TherapIA es una herramienta de apoyo clínico. No reemplaza el juicio del profesional de salud. Siempre valide con la evaluación individual del paciente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
