"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain, Sparkles, AlertTriangle, ChevronRight, Copy, Check, Send,
  BookOpen, Activity, Target, Clock, TrendingUp, Shield, Zap, Plus,
  RefreshCw, RotateCcw, Info, Pencil, Trash2, ArrowUp, ArrowDown,
  Mail, MessageCircle, X, FileText, ChevronDown, ChevronUp, Database,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EXERCISE_REGISTRY } from "@/lib/exerciseRegistry";
import { OSTEOPATHY_REGISTRY } from "@/lib/osteopathyRegistry";

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
  { value: "acute",       label: "Agudo",        desc: "0–2 semanas", color: "text-red-600 bg-red-50 border-red-200" },
  { value: "subacute",    label: "Subagudo",      desc: "2–6 semanas", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "chronic",     label: "Crónico",       desc: ">6 semanas",  color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "maintenance", label: "Mantenimiento", desc: "Alta / Sport", color: "text-clinical-600 bg-clinical-50 border-clinical-200" },
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

// ─── Physio Technique Library ─────────────────────────────────────────────────
interface PhysioTechnique {
  id: string;
  name: string;
  nameEs: string;
  category: "electrotherapy" | "thermotherapy" | "manual" | "needling" | "shockwave" | "ultrasound";
  indication: string;
  contraindications: string[];
  dosage: string;
  phases: string[];   // acute, subacute, chronic, maintenance
  regions: string[];  // which body regions apply (empty = all)
  evidenceLevel: "A" | "B" | "C";
}

const PHYSIO_TECHNIQUES: PhysioTechnique[] = [
  // ─ Electrotherapy ─
  {
    id: "tens", name: "TENS", nameEs: "TENS (Neuroestimulación Eléctrica Transcutánea)",
    category: "electrotherapy",
    indication: "Modulación del dolor agudo y crónico. Activa la teoría del gate control y libera endorfinas.",
    contraindications: ["Marcapasos", "Embarazo (zona lumbar)", "Zonas con pérdida de sensibilidad"],
    dosage: "Frecuencia: 80-150 Hz (convencional) / 2-4 Hz (acupuntura). 20-30 min/sesión.",
    phases: ["acute", "subacute", "chronic"],
    regions: [],
    evidenceLevel: "A",
  },
  {
    id: "interferential", name: "Interferential Currents", nameEs: "Corrientes Interferenciales",
    category: "electrotherapy",
    indication: "Analgesia profunda y efecto vasodilatador. Mayor penetración que TENS.",
    contraindications: ["Marcapasos", "Trombosis venosa profunda", "Tumores"],
    dosage: "Frecuencia de batido: 80-100 Hz. Electrodos cuadripolar. 15-20 min/sesión.",
    phases: ["subacute", "chronic"],
    regions: ["lumbar", "shoulder", "knee", "hip"],
    evidenceLevel: "B",
  },
  {
    id: "nmes", name: "NMES / EMS", nameEs: "Electroestimulación Neuromuscular (NMES/EMS)",
    category: "electrotherapy",
    indication: "Activación muscular forzada. Atrofia por desuso, fortalecimiento post-quirúrgico, inhibición refleja.",
    contraindications: ["Fractura no consolidada", "Implantes metálicos cercanos", "Epilepsia"],
    dosage: "Pulso bifásico 250-350 µs. Frecuencia: 35-50 Hz. Relación on/off 1:3 inicial.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: ["knee", "shoulder", "hip", "ankle"],
    evidenceLevel: "A",
  },
  {
    id: "magnetotherapy", name: "Magnetotherapy (PEMF)", nameEs: "Magnetoterapia (PEMF)",
    category: "electrotherapy",
    indication: "Analgesia, efecto antiinflamatorio, regeneración ósea. Útil en artrosis y fracturas.",
    contraindications: ["Marcapasos", "Embarazo", "Prótesis metálicas (relativo)"],
    dosage: "Frecuencia: 5-50 Hz. Intensidad: 5-30 mT. 20-30 min/sesión. 10-15 sesiones.",
    phases: ["acute", "subacute", "chronic"],
    regions: [],
    evidenceLevel: "B",
  },
  {
    id: "laser-therapy", name: "Low-Level Laser Therapy (LLLT)", nameEs: "Láser Terapéutico (LLLT / Fotobiomodulación)",
    category: "electrotherapy",
    indication: "Efecto bioestimulante en tejido blando. Cicatrización, tendinopatías, neuropatías.",
    contraindications: ["Tumores", "Zonas fotosensibles", "Directamente sobre ojos"],
    dosage: "830 nm (infrarrojo). 4-8 J/cm². Aplicación puntual sobre trigger points o tendones.",
    phases: ["acute", "subacute", "chronic"],
    regions: [],
    evidenceLevel: "B",
  },
  {
    id: "iontophoresis", name: "Iontophoresis", nameEs: "Iontoforesis",
    category: "electrotherapy",
    indication: "Administración transdérmica de fármacos (dexametasona, AINE) via corriente galvánica.",
    contraindications: ["Piel lesionada", "Alergia al fármaco usado", "Marcapasos"],
    dosage: "Corriente galvánica DC. 0.1-0.4 mA/cm². 20-40 min/sesión.",
    phases: ["acute", "subacute"],
    regions: ["elbow", "shoulder", "knee", "ankle"],
    evidenceLevel: "B",
  },
  {
    id: "richelli", name: "Richelli's Painreliever", nameEs: "Richelli's Painreliever (Neuromodulación percutánea)",
    category: "electrotherapy",
    indication: "Neuromodulación percutánea local y sistémica. Dolor musculoesquelético crónico, fibromialgia, cefalea.",
    contraindications: ["Marcapasos", "Embarazo", "Epilepsia activa"],
    dosage: "Aplicación percutánea 5-10 min sobre zona diana. 2-3 sesiones/semana.",
    phases: ["subacute", "chronic"],
    regions: [],
    evidenceLevel: "B",
  },
  // ─ Shock Wave & Ultrasound ─
  {
    id: "shock-wave", name: "Extracorporeal Shock Wave Therapy (ESWT)", nameEs: "Ondas de Choque Extracorpóreas (ESWT)",
    category: "shockwave",
    indication: "Tendinopatías crónicas, calcificaciones, fascitis plantar, pseudoartrosis, puntos gatillo.",
    contraindications: ["Fase aguda", "Anticoagulantes", "Zonas epifisarias en crecimiento", "Embarazo"],
    dosage: "2000-3000 impulsos, 1-2 bar. 1 sesión/semana × 3-6 semanas.",
    phases: ["chronic"],
    regions: ["shoulder", "knee", "ankle", "elbow"],
    evidenceLevel: "A",
  },
  {
    id: "ultrasound-therapy", name: "Therapeutic Ultrasound", nameEs: "Ultrasonido Terapéutico",
    category: "ultrasound",
    indication: "Efecto térmico y mecánico profundo. Cicatrización de tejido blando, tendinopatías.",
    contraindications: ["Zonas epifisarias", "Trombosis", "Zona cardiaca", "Embarazo"],
    dosage: "1 MHz (profundo) / 3 MHz (superficial). 0.5-2 W/cm². 5-10 min por área.",
    phases: ["subacute", "chronic"],
    regions: ["shoulder", "elbow", "wrist", "ankle", "knee"],
    evidenceLevel: "B",
  },
  // ─ Thermotherapy ─
  {
    id: "cryotherapy", name: "Cryotherapy", nameEs: "Crioterapia (Frío)",
    category: "thermotherapy",
    indication: "Reduce inflamación aguda, espasmo muscular y dolor. Ideal en fase aguda post-lesión.",
    contraindications: ["Raynaud", "Crioglobulinemia", "Sensibilidad disminuida"],
    dosage: "Compresas de hielo 15-20 min. Barrera de tela. Cada 2-3h en fase aguda.",
    phases: ["acute"],
    regions: [],
    evidenceLevel: "A",
  },
  {
    id: "thermotherapy", name: "Thermotherapy (Heat)", nameEs: "Termoterapia (Calor húmedo/seco)",
    category: "thermotherapy",
    indication: "Aumenta extensibilidad del tejido, reduce espasmo muscular crónico, mejora circulación.",
    contraindications: ["Fase aguda/inflamatoria", "Insuficiencia vascular", "Sensibilidad disminuida"],
    dosage: "Compresas calientes 20 min. Calor húmedo preferible. Antes del ejercicio terapéutico.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: [],
    evidenceLevel: "A",
  },
  {
    id: "paraffin-bath", name: "Paraffin Bath", nameEs: "Baño de Parafina",
    category: "thermotherapy",
    indication: "Calor profundo en manos y pies. Artrosis, artritis reumatoide, rigidez post-inmovilización.",
    contraindications: ["Heridas abiertas", "Alergias a la parafina", "Vasculopatía periférica"],
    dosage: "52-54°C. Inmersión 5-10 capas. 20-30 min. Envolver en toalla.",
    phases: ["subacute", "chronic"],
    regions: ["elbow", "wrist"],
    evidenceLevel: "B",
  },
  {
    id: "infrared", name: "Infrared Therapy", nameEs: "Infrarrojos (Lámpara IR)",
    category: "thermotherapy",
    indication: "Calor superficial, relajación muscular, efecto analgésico. Contracturas, espasmos.",
    contraindications: ["Inflamación aguda", "Tumores", "Sensibilidad disminuida"],
    dosage: "30-60 cm de distancia. 15-20 min. No contacto directo con piel.",
    phases: ["subacute", "chronic"],
    regions: [],
    evidenceLevel: "C",
  },
  // ─ Manual Therapy ─
  {
    id: "manual-therapy", name: "Manual Therapy / Joint Mobilization", nameEs: "Terapia Manual / Movilización Articular (Maitland)",
    category: "manual",
    indication: "Restaurar rango articular, reducir dolor articular, normalizar patrones de movimiento.",
    contraindications: ["Fractura reciente", "Inestabilidad ligamentosa severa", "Tumor óseo"],
    dosage: "Grados Maitland I-IV. 30-60 seg/técnica. 3-5 técnicas por sesión.",
    phases: ["subacute", "chronic"],
    regions: [],
    evidenceLevel: "A",
  },
  {
    id: "massage-therapy", name: "Massage Therapy", nameEs: "Masaje Terapéutico",
    category: "manual",
    indication: "Reducción de tensión muscular, mejora circulación local, modulación del dolor.",
    contraindications: ["Trombosis", "Lesiones cutáneas activas", "Fracturas"],
    dosage: "15-30 min. Técnicas: effleurage, petrissage, fricción profunda. Integrar con ejercicio.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: [],
    evidenceLevel: "B",
  },
  {
    id: "myofascial-release", name: "Myofascial Release", nameEs: "Liberación Miofascial",
    category: "manual",
    indication: "Restricciones fasciales, síndrome de dolor miofascial, rigidez post-quirúrgica.",
    contraindications: ["Anticoagulantes", "Osteoporosis severa", "Tumor en zona"],
    dosage: "Presión sostenida 90-120 seg en barrera tisular. Sin deslizamiento. 3-5 puntos/sesión.",
    phases: ["subacute", "chronic"],
    regions: [],
    evidenceLevel: "B",
  },
  {
    id: "iastm", name: "IASTM / Graston Technique", nameEs: "IASTM / Técnica de Graston (Liberación Miofascial Instrumental)",
    category: "manual",
    indication: "Restricciones fasciales, tejido cicatricial, tendinopatías crónicas.",
    contraindications: ["Anticoagulantes", "Heridas abiertas", "Trombosis"],
    dosage: "Instrumentos IASTM o Graston. Angulación 45-60°. 2-3 min por zona. 2-3 sesiones/semana.",
    phases: ["subacute", "chronic"],
    regions: [],
    evidenceLevel: "B",
  },
  {
    id: "lymphatic-drainage", name: "Manual Lymphatic Drainage (MLD)", nameEs: "Drenaje Linfático Manual (DLM)",
    category: "manual",
    indication: "Edema post-quirúrgico o post-traumático, linfedema, recuperación post-esfuerzo.",
    contraindications: ["Infección activa", "Trombosis", "Insuficiencia cardíaca descompensada"],
    dosage: "Presión muy suave (< 30 mmHg). Movimientos circulares suaves. 45-60 min/sesión.",
    phases: ["acute", "subacute"],
    regions: [],
    evidenceLevel: "A",
  },
  {
    id: "traction", name: "Traction Therapy", nameEs: "Tracción Vertebral (Cervical / Lumbar)",
    category: "manual",
    indication: "Descompresión discal, hernia discal, radiculopatía, síndrome facetario.",
    contraindications: ["Inestabilidad cervical", "Osteoporosis severa", "Tumor vertebral"],
    dosage: "Tracción intermitente: 10-15 kg (cervical) / 25-40% peso corporal (lumbar). 15-20 min.",
    phases: ["subacute", "chronic"],
    regions: ["lumbar", "cervical"],
    evidenceLevel: "B",
  },
  {
    id: "pnf", name: "PNF (Proprioceptive Neuromuscular Facilitation)", nameEs: "FNP — Facilitación Neuromuscular Propioceptiva",
    category: "manual",
    indication: "Mejora de fuerza, coordinación, rango articular y control neuromuscular.",
    contraindications: ["Lesión aguda", "Fatiga neuromuscular severa"],
    dosage: "Técnicas: hold-relax, contract-relax, reversión lenta. 3-5 repeticiones por patrón.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: [],
    evidenceLevel: "A",
  },
  {
    id: "neurodynamics", name: "Neurodynamic Techniques", nameEs: "Técnicas Neurodinámicas (Flossing Neural)",
    category: "manual",
    indication: "Sensibilización del sistema nervioso periférico. Radiculopatías, nervio ciático, nervio mediano.",
    contraindications: ["Lesión nerviosa activa severa", "CRPS activo"],
    dosage: "Movilización neural activa/pasiva. 10-15 repeticiones suaves. No provocar síntomas.",
    phases: ["subacute", "chronic"],
    regions: ["lumbar", "cervical", "shoulder", "knee"],
    evidenceLevel: "A",
  },
  // ─ Needling ─
  {
    id: "dry-needling", name: "Dry Needling", nameEs: "Punción Seca (Dry Needling)",
    category: "needling",
    indication: "Desactivación de puntos gatillo miofasciales. Reduce dolor y mejora rango articular.",
    contraindications: ["Anticoagulantes", "Infección local", "Aguijofobia severa", "Embarazo (zonas específicas)"],
    dosage: "Técnica de Hong (LSNT). 1-3 niveles por punto. 1 sesión/semana × 3-6 sesiones.",
    phases: ["subacute", "chronic"],
    regions: ["lumbar", "cervical", "shoulder", "hip", "knee"],
    evidenceLevel: "A",
  },
  {
    id: "percutaneous-electrolysis", name: "Percutaneous Electrolysis (EPI)", nameEs: "Electrólisis Percutánea Intratisular (EPI / PNE)",
    category: "needling",
    indication: "Tendinopatías degenerativas crónicas, fascitis plantar. Degeneración del colágeno.",
    contraindications: ["Fase aguda", "Anticoagulantes", "Implantes metálicos cercanos"],
    dosage: "Aguja de acupuntura guiada por ecografía. 3-6 mA × 3 seg. 1 sesión/semana × 3-6 semanas.",
    phases: ["chronic"],
    regions: ["shoulder", "elbow", "knee", "ankle"],
    evidenceLevel: "B",
  },
  // ─ Taping ─
  {
    id: "kinesiotaping", name: "Kinesiotaping / Neuromuscular Taping", nameEs: "Vendaje Neuromuscular (Kinesiotaping / RockTape / McConnell)",
    category: "manual",
    indication: "Modulación del dolor, facilitación/inhibición muscular, reducción de edema, soporte articular.",
    contraindications: ["Alergia al látex/acrílico", "Heridas abiertas", "Piel frágil"],
    dosage: "Aplicar con tensión 10-50% según objetivo (inhibición/facilitación). Mantener 3-5 días.",
    phases: ["acute", "subacute", "chronic", "maintenance"],
    regions: [],
    evidenceLevel: "B",
  },
  {
    id: "flossing", name: "Voodoo Flossing / Band Flossing", nameEs: "Flossing (Venda de compresión dinámica)",
    category: "manual",
    indication: "Mejora de rango articular, reducción de edema, movilización de tejidos blandos.",
    contraindications: ["Trombosis", "Síndrome compartimental", "Arteriopatía periférica"],
    dosage: "Banda elástica con compresión moderada. 2 min de movilización activa. Retirar si parestesias.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: ["ankle", "knee", "shoulder", "elbow", "wrist"],
    evidenceLevel: "C",
  },
  // ─ Hydrotherapy ─
  {
    id: "hydrotherapy", name: "Aquatic Therapy / Hydrotherapy", nameEs: "Hidroterapia / Terapia Acuática",
    category: "manual",
    indication: "Ejercicio con descarga de peso, rehabilitación neurológica, artrosis severa, post-quirúrgico.",
    contraindications: ["Heridas abiertas", "Infecciones dérmicas", "Incontinencia no controlada"],
    dosage: "Piscina 32-35°C. Sesiones 30-45 min. 2-3 sesiones/semana. Combinar con ejercicio.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: [],
    evidenceLevel: "A",
  },
  // ─ Cupping ─
  {
    id: "cupping", name: "Cupping Therapy (Ventosas)", nameEs: "Ventosas / Terapia de Ventosas",
    category: "manual",
    indication: "Reducción de tensión miofascial, mejora de la circulación local, relajación muscular.",
    contraindications: ["Anticoagulantes", "Piel con eczema/psoriasis activo", "Tumores"],
    dosage: "Ventosas de silicona o de vacío. Deslizamiento 5-10 min. Estáticas 5-10 min. 1-2 sesiones/semana.",
    phases: ["subacute", "chronic"],
    regions: ["lumbar", "shoulder", "cervical"],
    evidenceLevel: "C",
  },
  // ─ Biofeedback ─
  {
    id: "biofeedback", name: "EMG Biofeedback", nameEs: "Biofeedback Electromiográfico",
    category: "manual",
    indication: "Re-educación neuromuscular, suelo pélvico, control motor post-lesión.",
    contraindications: ["Marcapasos", "Implantes electrónicos"],
    dosage: "Electrodos EMG en músculo diana. Umbral visual/auditivo. 20-30 min. 10-15 sesiones.",
    phases: ["subacute", "chronic", "maintenance"],
    regions: [],
    evidenceLevel: "A",
  },
];

// Map clinical region values to registry region strings
const REGION_MAP: Record<string, string[]> = {
  lumbar:    ["Lumbar", "lumbar"],
  thoracic:  ["Thoracic", "thoracic"],
  cervical:  ["Cervical", "cervical"],
  shoulder:  ["Shoulder", "shoulder"],
  elbow:     ["Elbow", "elbow"],
  knee:      ["Knee", "knee"],
  hip:       ["Hip", "hip"],
  ankle:     ["Ankle", "Foot", "ankle", "foot"],
  core:      ["Core", "Functional", "core", "functional"],
  global:    ["Functional", "Core", "functional"],
  wrist:     ["Wrist", "wrist"],
};

const PHYSIO_CATEGORY_ICONS: Record<string, string> = {
  electrotherapy: "⚡",
  thermotherapy:  "🌡️",
  manual:         "🤲",
  needling:       "💉",
  shockwave:      "🌊",
  ultrasound:     "📡",
};

const PHYSIO_CATEGORY_LABELS: Record<string, string> = {
  electrotherapy: "Electroterapia",
  thermotherapy:  "Termoterapia / Frío-Calor",
  manual:         "Terapia Manual",
  needling:       "Punción Seca",
  shockwave:      "Ondas de Choque",
  ultrasound:     "Ultrasonido",
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
  label: string; placeholder: string; tags: string[]; onChange: (tags: string[]) => void;
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
        <button onClick={add} className="px-3 h-8 bg-surface-100 hover:bg-surface-200 rounded-lg text-xs font-medium text-surface-600 transition-colors">+</button>
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

// ─── Component: Editable Exercise Card ───────────────────────────────────────
function EditableExerciseCard({
  ex, index, total,
  onUpdate, onRemove, onMoveUp, onMoveDown,
}: {
  ex: RecommendedExercise;
  index: number;
  total: number;
  onUpdate: (updated: RecommendedExercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ex);

  function save() {
    onUpdate(draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(ex);
    setEditing(false);
  }

  return (
    <div className={cn(
      "bg-white border rounded-xl overflow-hidden transition-all",
      editing ? "border-brand-400 shadow-md" : "border-surface-200 hover:border-brand-300 hover:shadow-sm"
    )}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={onMoveUp} disabled={index === 0}
            className="p-0.5 rounded hover:bg-surface-100 disabled:opacity-30 transition-colors">
            <ArrowUp className="h-3 w-3 text-surface-400" />
          </button>
          <span className="text-[10px] text-center text-surface-400 font-bold">{index + 1}</span>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="p-0.5 rounded hover:bg-surface-100 disabled:opacity-30 transition-colors">
            <ArrowDown className="h-3 w-3 text-surface-400" />
          </button>
        </div>

        {/* Icon */}
        <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
          <span className="text-base">{CATEGORY_ICONS[ex.category] || "💊"}</span>
        </div>

        {/* Name + evidence + metrics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold text-surface-900">{ex.nameEs}</p>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", EVIDENCE_COLORS[ex.evidenceLevel])}>
              Evidencia {ex.evidenceLevel}
            </span>
          </div>
          {!editing && (
            <p className="text-[10px] text-surface-400">
              {ex.sets} series × {ex.reps ?? "Hold"} {ex.reps ? "reps" : ""} · {ex.restSeconds}s descanso
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing(!editing)}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              editing ? "bg-brand-100 text-brand-600" : "hover:bg-surface-100 text-surface-400 hover:text-surface-700"
            )}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-all">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-4 pb-4 border-t border-surface-100 pt-3 space-y-3 bg-surface-50/50">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide">Series</label>
              <input type="number" min="1" max="10" value={draft.sets}
                onChange={(e) => setDraft((d) => ({ ...d, sets: parseInt(e.target.value) || 1 }))}
                className="w-full h-8 px-2 rounded-lg border border-surface-200 text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide">Reps</label>
              <input type="number" min="1" max="30" value={draft.reps ?? ""}
                placeholder="Hold"
                onChange={(e) => setDraft((d) => ({ ...d, reps: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full h-8 px-2 rounded-lg border border-surface-200 text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide">Descanso (s)</label>
              <input type="number" min="10" max="180" step="5" value={draft.restSeconds}
                onChange={(e) => setDraft((d) => ({ ...d, restSeconds: parseInt(e.target.value) || 30 }))}
                className="w-full h-8 px-2 rounded-lg border border-surface-200 text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide">Razonamiento clínico</label>
            <textarea rows={2} value={draft.rationale}
              onChange={(e) => setDraft((d) => ({ ...d, rationale: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="flex-1 h-8 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors">
              Guardar cambios
            </button>
            <button onClick={cancel}
              className="px-4 h-8 border border-surface-200 hover:bg-surface-50 text-surface-600 rounded-lg text-xs font-medium transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Read-only details */}
      {!editing && (
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
      )}
    </div>
  );
}

// ─── Component: Database Suggestions Panel ────────────────────────────────────
function DatabaseSuggestionsPanel({
  region,
  onAddExercise,
}: {
  region: string;
  onAddExercise: (ex: RecommendedExercise) => void;
}) {
  const [open, setOpen] = useState(false);
  const [addedSlugs, setAddedSlugs] = useState<Set<string>>(new Set());

  const regionKeys = REGION_MAP[region] ?? [region];

  const exerciseSuggestions = EXERCISE_REGISTRY
    .filter((e) => regionKeys.some((k) => e.region.toLowerCase() === k.toLowerCase()))
    .slice(0, 8);

  const osteopathySuggestions = OSTEOPATHY_REGISTRY
    .filter((t) => regionKeys.some((k) => t.region.toLowerCase() === k.toLowerCase()))
    .slice(0, 4);

  const totalSuggestions = exerciseSuggestions.length + osteopathySuggestions.length;

  if (totalSuggestions === 0) return null;

  function handleAdd(slug: string, name: string, category: string) {
    const newEx: RecommendedExercise = {
      id: slug,
      name,
      nameEs: name,
      rationale: "Agregado desde la base de datos clínica.",
      sets: 3,
      reps: 10,
      restSeconds: 30,
      progressionTip: "Ajustar según respuesta del paciente.",
      redFlags: [],
      evidenceLevel: "B",
      category,
    };
    onAddExercise(newEx);
    setAddedSlugs((prev) => new Set([...prev, slug]));
  }

  return (
    <div className="border border-surface-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 hover:bg-surface-100 transition-colors">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-brand-500" />
          <span className="text-xs font-bold text-surface-700 uppercase tracking-wider">
            Sugerencias de la base de datos
          </span>
          <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
            {totalSuggestions} disponibles
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-surface-400" /> : <ChevronDown className="h-4 w-4 text-surface-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {/* Exercise suggestions */}
          {exerciseSuggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                Ejercicios — {region}
              </p>
              <div className="space-y-2">
                {exerciseSuggestions.map((ex) => {
                  const added = addedSlugs.has(ex.id);
                  return (
                    <div key={ex.id} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-surface-200 rounded-xl hover:border-brand-200 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-surface-900 truncate">{ex.name}</p>
                        <p className="text-[10px] text-surface-400">
                          {ex.difficulty} · {ex.primaryMuscles.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => !added && handleAdd(ex.id, ex.name, ex.category ?? "mobility")}
                        className={cn(
                          "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                          added
                            ? "bg-clinical-100 text-clinical-700 cursor-default"
                            : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                        )}>
                        {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {added ? "Agregado" : "Agregar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Osteopathy suggestions */}
          {osteopathySuggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                Técnicas de Osteopatía — {region}
              </p>
              <div className="space-y-2">
                {osteopathySuggestions.map((tech) => {
                  const added = addedSlugs.has(tech.id);
                  return (
                    <div key={tech.id} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-surface-200 rounded-xl hover:border-clinical-200 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-xs font-semibold text-surface-900 truncate">{tech.name}</p>
                          {tech.isChiropracticDerived && (
                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold shrink-0">HVLA</span>
                          )}
                        </div>
                        <p className="text-[10px] text-surface-400">{tech.techniqueType} · {tech.region}</p>
                      </div>
                      <button
                        onClick={() => !added && handleAdd(tech.id, tech.name, tech.techniqueType)}
                        className={cn(
                          "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                          added
                            ? "bg-clinical-100 text-clinical-700 cursor-default"
                            : "bg-clinical-50 text-clinical-700 hover:bg-clinical-100 border border-clinical-200"
                        )}>
                        {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {added ? "Agregada" : "Agregar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component: Share Modal ───────────────────────────────────────────────────
function ShareModal({
  result,
  form,
  exercises,
  onClose,
}: {
  result: AIRecommendation;
  form: ClinicalInput;
  exercises: RecommendedExercise[];
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const regionLabel = REGIONS.find((r) => r.value === form.region)?.label ?? form.region;
  const phaseLabel  = PHASES.find((p) => p.value === form.phase)?.label ?? form.phase;

  const planText = [
    `*TherapIA — ${result.routineName}*`,
    `Diagnóstico: ${form.diagnosis}`,
    `Región: ${regionLabel} | Fase: ${phaseLabel} | Dolor: ${form.painLevel}/10`,
    ``,
    `Ejercicios prescritos:`,
    ...exercises.map((e, i) => `${i + 1}. ${e.nameEs} — ${e.sets} series × ${e.reps ?? "Hold"} ${e.reps ? "reps" : ""} (${e.restSeconds}s descanso)`),
    ``,
    `Progresión: ${result.progressionTimeline}`,
    ``,
    `Generado por TherapIA · Therapia Global`,
  ].join("\n");

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(planText)}`;

  function handleEmailSend() {
    // Mock send — in production wire to backend email service
    setTimeout(() => setEmailSent(true), 600);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(planText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePDF() {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html><head><title>${result.routineName}</title>
      <style>
        body { font-family: -apple-system,sans-serif; padding: 40px; color: #1a1a2e; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 13px; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .ex { display: flex; justify-content: space-between; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 6px; font-size: 12px; }
        .ex .name { font-weight: 600; }
        .ex .meta2 { color: #888; }
        .footer { margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; }
      </style></head><body>
      <h1>${result.routineName}</h1>
      <div class="meta">Diagnóstico: ${form.diagnosis} · Región: ${regionLabel} · Fase: ${phaseLabel} · ${new Date().toLocaleDateString("es")}</div>
      <div class="section"><h2>Razonamiento Clínico</h2><p style="font-size:12px">${result.clinicalReasoning}</p></div>
      <div class="section"><h2>Ejercicios Prescritos</h2>
        ${exercises.map((e, i) => `<div class="ex"><span class="name">${i + 1}. ${e.nameEs}</span><span class="meta2">${e.sets} series × ${e.reps ?? "Hold"} reps · ${e.restSeconds}s</span></div>`).join("")}
      </div>
      <div class="section"><h2>Progresión</h2><p style="font-size:12px">${result.progressionTimeline}</p></div>
      <div class="section"><h2>Resultados Esperados</h2><p style="font-size:12px">${result.expectedOutcomes}</p></div>
      <div class="footer">Generado por TherapIA · Therapia Global · ${result.modelVersion}</div>
      </body></html>
    `);
    printWin.document.close();
    printWin.print();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div>
            <p className="text-sm font-bold text-surface-900">Enviar plan de tratamiento</p>
            <p className="text-xs text-surface-400">{exercises.length} ejercicios · {result.routineName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
            <X className="h-4 w-4 text-surface-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Enviar por email
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="paciente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-sm"
              />
              <button
                onClick={handleEmailSend}
                disabled={!email || emailSent}
                className={cn(
                  "px-4 h-9 rounded-lg text-xs font-semibold transition-all shrink-0",
                  emailSent
                    ? "bg-clinical-100 text-clinical-700"
                    : "bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                )}>
                {emailSent ? <><Check className="h-3.5 w-3.5 inline mr-1" />Enviado</> : "Enviar"}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[10px] text-surface-400">o comparte vía</span>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-10 bg-[#25D366] hover:bg-[#20bc5a] text-white rounded-xl font-semibold text-sm transition-colors">
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </a>

          {/* Copy + PDF row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 h-9 border border-surface-200 hover:bg-surface-50 rounded-xl text-xs font-semibold text-surface-700 transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-clinical-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar texto"}
            </button>
            <button
              onClick={handlePDF}
              className="flex items-center justify-center gap-2 h-9 border border-surface-200 hover:bg-surface-50 rounded-xl text-xs font-semibold text-surface-700 transition-colors">
              <FileText className="h-3.5 w-3.5" />
              Descargar PDF
            </button>
          </div>

          <p className="text-[10px] text-center text-surface-400">
            El plan incluye diagnóstico, ejercicios con dosis, progresión y evidencia clínica.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Physio Clinical Reasoning ────────────────────────────────────────────────
function generatePhysioReasoning(phase: string, region: string, techniques: PhysioTechnique[]): string {
  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const categoryCount = new Set(techniques.map((t) => t.category)).size;
  const evidenceA = techniques.filter((t) => t.evidenceLevel === "A").length;

  const phaseRationale: Record<string, string> = {
    acute:       "En la fase aguda, la prioridad es el control del dolor e inflamación con técnicas de baja carga tisular. Se priorizan modalidades analgésicas (TENS, crioterapia) para modular el dolor sin provocar estrés mecánico adicional.",
    subacute:    "En la fase subaguda, el tejido entra en remodelación. Las técnicas seleccionadas combinan analgesia residual con estimulación del proceso de cicatrización (ultrasonido, termoterapia) y trabajo de movilidad articular.",
    chronic:     "En la fase crónica, el objetivo es la desensibilización central y periférica, desactivación de puntos gatillo y restauración de la función. Se combina ejercicio activo con técnicas de modulación del dolor profundo.",
    maintenance: "En fase de mantenimiento/alta, las técnicas apoyan la recuperación del rendimiento, prevención de recidivas y optimización del tejido musculoesquelético.",
  };

  return `${phaseRationale[phase] ?? ""} Para la región ${regionLabel}, se sugieren ${techniques.length} modalidades agrupadas en ${categoryCount} categorías, con ${evidenceA} técnicas de evidencia nivel A. Estas técnicas se aplican como adjunto al ejercicio terapéutico, nunca como sustituto.`;
}

// ─── Component: Physio Techniques Suggestions ────────────────────────────────
function PhysioTechniquesSuggestions({
  phase,
  region,
}: {
  phase: string;
  region: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const suggestions = PHYSIO_TECHNIQUES.filter((t) => {
    const phaseMatch  = t.phases.includes(phase);
    const regionMatch = t.regions.length === 0 || t.regions.includes(region);
    return phaseMatch && regionMatch;
  });

  if (suggestions.length === 0) return null;

  const reasoning = generatePhysioReasoning(phase, region, suggestions);

  // Group by category
  const grouped = suggestions.reduce<Record<string, PhysioTechnique[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="border border-clinical-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-clinical-50 hover:bg-clinical-100 transition-colors">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-clinical-600" />
          <span className="text-xs font-bold text-clinical-800 uppercase tracking-wider">
            Técnicas de Fisioterapia sugeridas
          </span>
          <span className="text-[10px] bg-clinical-200 text-clinical-800 px-2 py-0.5 rounded-full font-semibold">
            {suggestions.length} modalidades
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-clinical-400" /> : <ChevronDown className="h-4 w-4 text-clinical-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          <p className="text-[10px] text-surface-400">
            Modalidades con evidencia para <strong>{REGIONS.find(r => r.value === region)?.label ?? region}</strong> en fase <strong>{PHASES.find(p => p.value === phase)?.label ?? phase}</strong>. Combinar con ejercicio terapéutico.
          </p>

          {/* Clinical Reasoning */}
          <div className="bg-clinical-50 border border-clinical-200 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2">
              <Brain className="h-3.5 w-3.5 text-clinical-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-clinical-700 uppercase tracking-wide mb-1">Razonamiento clínico</p>
                <p className="text-xs text-clinical-800 leading-relaxed">{reasoning}</p>
              </div>
            </div>
          </div>

          {Object.entries(grouped).map(([cat, techs]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{PHYSIO_CATEGORY_ICONS[cat]}</span>
                {PHYSIO_CATEGORY_LABELS[cat] ?? cat}
              </p>
              <div className="space-y-2">
                {techs.map((tech) => (
                  <div key={tech.id} className="border border-surface-200 rounded-xl overflow-hidden bg-white">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-start hover:bg-surface-50 transition-colors"
                      onClick={() => setExpanded(expanded === tech.id ? null : tech.id)}>
                      <span className="text-base shrink-0">{PHYSIO_CATEGORY_ICONS[tech.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-surface-900">{tech.nameEs}</p>
                        <p className="text-[10px] text-surface-400 truncate">{tech.indication.slice(0, 70)}...</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", EVIDENCE_COLORS[tech.evidenceLevel])}>
                          {tech.evidenceLevel}
                        </span>
                        {expanded === tech.id
                          ? <ChevronUp className="h-3.5 w-3.5 text-surface-400" />
                          : <ChevronDown className="h-3.5 w-3.5 text-surface-400" />
                        }
                      </div>
                    </button>

                    {expanded === tech.id && (
                      <div className="px-4 pb-3 pt-1 space-y-2.5 border-t border-surface-100 bg-surface-50/50">
                        <div>
                          <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-0.5">Indicación</p>
                          <p className="text-xs text-surface-700 leading-relaxed">{tech.indication}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-0.5">Dosificación</p>
                          <p className="text-xs text-clinical-700 font-medium">{tech.dosage}</p>
                        </div>
                        {tech.contraindications.length > 0 && (
                          <div className="bg-red-50 rounded-lg px-3 py-2">
                            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1">Contraindicaciones</p>
                            <p className="text-[11px] text-red-700">{tech.contraindications.join(" · ")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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

  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<AIRecommendation | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Editable exercises state — copy of result.exercises, mutated by therapist
  const [editedExercises, setEditedExercises] = useState<RecommendedExercise[]>([]);

  // Sync editedExercises whenever a new result arrives
  useEffect(() => {
    if (result) setEditedExercises([...result.exercises]);
  }, [result]);

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
    setEditedExercises([]);

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

  function reset() {
    setResult(null);
    setEditedExercises([]);
  }

  function copyResult() {
    if (!result) return;
    const text = `${result.routineName}\n\n${result.clinicalReasoning}\n\nEjercicios:\n${editedExercises.map((e, i) => `${i + 1}. ${e.nameEs} — ${e.sets}×${e.reps ?? "Hold"} (${e.rationale})`).join("\n")}\n\nProgresión: ${result.progressionTimeline}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Exercise list mutations
  function updateExercise(index: number, updated: RecommendedExercise) {
    setEditedExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)));
  }
  function removeExercise(index: number) {
    setEditedExercises((prev) => prev.filter((_, i) => i !== index));
  }
  function moveExercise(index: number, direction: "up" | "down") {
    setEditedExercises((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }
  function addFromDatabase(ex: RecommendedExercise) {
    setEditedExercises((prev) => [...prev, ex]);
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
                  <><RefreshCw className="h-4 w-4 animate-spin" />Analizando caso clínico...</>
                ) : (
                  <><Sparkles className="h-4 w-4" />Generar prescripción IA</>
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
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center mx-auto mb-2 text-brand-500">{f.icon}</div>
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

                {/* Stats — live from editedExercises */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Activity className="h-4 w-4" />, label: "Ejercicios", value: editedExercises.length, color: "text-brand-600 bg-brand-50" },
                    { icon: <Target className="h-4 w-4" />, label: "Series tot.", value: editedExercises.reduce((a, e) => a + e.sets, 0), color: "text-clinical-600 bg-clinical-50" },
                    { icon: <Clock className="h-4 w-4" />, label: "Est. min.", value: `~${Math.ceil(editedExercises.reduce((a, e) => a + (e.sets * 45 + e.restSeconds * (e.sets - 1)) / 60, 0))}`, color: "text-amber-600 bg-amber-50" },
                    { icon: <Zap className="h-4 w-4" />, label: "Evidencia", value: `${editedExercises.filter((e) => e.evidenceLevel === "A").length}A/${editedExercises.filter((e) => e.evidenceLevel === "B").length}B`, color: "text-purple-600 bg-purple-50" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-surface-200 rounded-xl p-3 text-center">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5", s.color)}>{s.icon}</div>
                      <p className="text-lg font-bold text-surface-900">{s.value}</p>
                      <p className="text-[10px] text-surface-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Editable exercise list */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                      Ejercicios prescritos
                      {editedExercises.length !== result.exercises.length && (
                        <span className="ml-2 text-brand-500 normal-case font-normal">
                          ({editedExercises.length} editados)
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-surface-400 flex items-center gap-1">
                      <Pencil className="h-3 w-3" />
                      Edita cada ejercicio individualmente
                    </span>
                  </div>
                  {editedExercises.length === 0 ? (
                    <div className="text-center py-8 text-surface-400 text-sm border border-dashed border-surface-300 rounded-xl">
                      <Plus className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      Agrega ejercicios desde la base de datos abajo
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editedExercises.map((ex, i) => (
                        <EditableExerciseCard
                          key={`${ex.id}-${i}`}
                          ex={ex}
                          index={i}
                          total={editedExercises.length}
                          onUpdate={(updated) => updateExercise(i, updated)}
                          onRemove={() => removeExercise(i)}
                          onMoveUp={() => moveExercise(i, "up")}
                          onMoveDown={() => moveExercise(i, "down")}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Database suggestions — exercises + osteopathy from registry */}
                <DatabaseSuggestionsPanel
                  region={form.region}
                  onAddExercise={addFromDatabase}
                />

                {/* Physio technique suggestions — electro, cold/heat, dry needling, etc. */}
                <PhysioTechniquesSuggestions
                  phase={form.phase}
                  region={form.region}
                />

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

                {/* Sticky footer: Send + Routines */}
                <div className="sticky bottom-0 bg-white border border-surface-200 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-surface-900">{editedExercises.length} ejercicio{editedExercises.length !== 1 ? "s" : ""} en el plan</p>
                    <p className="text-xs text-surface-400">Plan listo para enviar o agregar a rutinas</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowShare(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-surface-200 hover:bg-surface-50 text-surface-700 rounded-xl text-xs font-semibold transition-colors">
                      <Send className="h-3.5 w-3.5" />
                      Enviar plan
                    </button>
                    <button
                      onClick={() => window.open("/es/routines", "_blank")}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                      Constructor
                    </button>
                  </div>
                </div>

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

      {/* Share Modal */}
      {showShare && result && (
        <ShareModal
          result={result}
          form={form}
          exercises={editedExercises}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
