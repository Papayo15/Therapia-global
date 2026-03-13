"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical, Send, Copy, Search, X, CheckCircle2, Mail, MessageCircle, QrCode, Share2, Eye, ChevronDown, ChevronUp, FileDown, Clock, Repeat2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import exerciseRegistry from "@registry/exercises.json";

const _cdnReg = exerciseRegistry as Record<string, { video?: string }>;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RoutineExercise {
  uid: string;
  id: string;
  name: string;
  nameLocal: string;
  region: string;
  equipment: string;
  difficulty: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string;
}

interface SavedRoutine {
  id: string;
  name: string;
  exerciseCount: number;
  createdAt: string;
  sentTo?: string;
}

// ─── Biblioteca del builder ───────────────────────────────────────────────────
const EXERCISE_LIBRARY = [
  // Peso corporal
  { id:"glute-bridge",    nameLocal:"Puente de Glúteos",      name:"Glute Bridge",            region:"Glúteo",   equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:12, restSeconds:30 },
  { id:"bird-dog",        nameLocal:"Pájaro-Perro",           name:"Bird Dog",                region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:10, restSeconds:30 },
  { id:"dead-bug",        nameLocal:"Bicho Muerto",           name:"Dead Bug",                region:"Core",     equipment:"Peso corporal", difficulty:"intermediate", sets:3, reps:8,  restSeconds:45 },
  { id:"plank",           nameLocal:"Plancha",                name:"Plank",                   region:"Core",     equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:0,  restSeconds:45 },
  { id:"cat-cow",         nameLocal:"Gato-Vaca",              name:"Cat-Cow",                 region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:2, reps:10, restSeconds:20 },
  { id:"lunge",           nameLocal:"Zancada",                name:"Lunge",                   region:"Rodilla",  equipment:"Peso corporal", difficulty:"intermediate", sets:3, reps:10, restSeconds:45 },
  { id:"wall-sit",        nameLocal:"Sentadilla en Pared",    name:"Wall Sit",                region:"Rodilla",  equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:0,  restSeconds:45 },
  { id:"pelvic-tilt",     nameLocal:"Retroversión Pélvica",   name:"Pelvic Tilt",             region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:15, restSeconds:20 },
  { id:"knee-to-chest",   nameLocal:"Rodilla al Pecho",       name:"Knee to Chest",           region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:2, reps:0,  restSeconds:15 },
  { id:"lumbar-rotation", nameLocal:"Rotación Lumbar",        name:"Lumbar Rotation Stretch", region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:2, reps:0,  restSeconds:15 },
  { id:"prone-hip-ext",   nameLocal:"Extensión Cadera Prono", name:"Prone Hip Extension",     region:"Glúteo",   equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:12, restSeconds:25 },
  { id:"ankle-pumps",     nameLocal:"Bombeos de Tobillo",     name:"Ankle Pumps",             region:"Tobillo",  equipment:"Peso corporal", difficulty:"beginner",     sets:2, reps:20, restSeconds:15 },
  { id:"cervical-ret",    nameLocal:"Retracción Cervical",    name:"Cervical Retraction",     region:"Cervical", equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:10, restSeconds:20 },
  { id:"mckenzie-press",  nameLocal:"McKenzie Press-Up",      name:"McKenzie Press-Up",       region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:3, reps:10, restSeconds:30 },
  { id:"nerve-flossing",  nameLocal:"Deslizamiento Neural",   name:"Nerve Flossing",          region:"Nervio",   equipment:"Peso corporal", difficulty:"beginner",     sets:2, reps:15, restSeconds:20 },
  { id:"childs-pose",     nameLocal:"Postura del Niño",       name:"Child's Pose",            region:"Lumbar",   equipment:"Peso corporal", difficulty:"beginner",     sets:2, reps:0,  restSeconds:15 },
  // Mancuernas
  { id:"rdl",             nameLocal:"Peso Muerto Rumano",     name:"Romanian Deadlift",       region:"Lumbar",   equipment:"Mancuernas",    difficulty:"intermediate", sets:3, reps:10, restSeconds:60 },
  { id:"shoulder-press",  nameLocal:"Press de Hombro",        name:"Shoulder Press",          region:"Hombro",   equipment:"Mancuernas",    difficulty:"intermediate", sets:3, reps:10, restSeconds:60 },
  { id:"lateral-raise",   nameLocal:"Elevación Lateral",      name:"Lateral Raise",           region:"Hombro",   equipment:"Mancuernas",    difficulty:"beginner",     sets:3, reps:12, restSeconds:30 },
  { id:"bicep-curl",      nameLocal:"Curl de Bíceps",         name:"Bicep Curl",              region:"Codo",     equipment:"Mancuernas",    difficulty:"beginner",     sets:3, reps:12, restSeconds:30 },
  { id:"goblet-squat",    nameLocal:"Sentadilla Goblet",      name:"Goblet Squat",            region:"Rodilla",  equipment:"Mancuernas",    difficulty:"intermediate", sets:3, reps:10, restSeconds:45 },
  { id:"bent-row",        nameLocal:"Remo Inclinado",         name:"Bent Over Row",           region:"Hombro",   equipment:"Mancuernas",    difficulty:"intermediate", sets:3, reps:10, restSeconds:45 },
  { id:"tricep-ext",      nameLocal:"Extensión de Tríceps",   name:"Tricep Extension",        region:"Codo",     equipment:"Mancuernas",    difficulty:"beginner",     sets:3, reps:12, restSeconds:30 },
  // Ligas
  { id:"band-row",        nameLocal:"Remo con Banda",         name:"Band Row",                region:"Hombro",   equipment:"Ligas / Bandas", difficulty:"beginner",    sets:3, reps:12, restSeconds:30 },
  { id:"shldr-ext-rot",   nameLocal:"Rotación Externa Hombro",name:"Shoulder Ext. Rotation",  region:"Hombro",   equipment:"Ligas / Bandas", difficulty:"beginner",    sets:3, reps:15, restSeconds:30 },
  { id:"band-hip-abd",    nameLocal:"Abducción Cadera Banda", name:"Band Hip Abduction",      region:"Cadera",   equipment:"Ligas / Bandas", difficulty:"beginner",    sets:3, reps:15, restSeconds:30 },
  { id:"band-pull-apart", nameLocal:"Separación de Banda",    name:"Band Pull Apart",         region:"Hombro",   equipment:"Ligas / Bandas", difficulty:"beginner",    sets:3, reps:15, restSeconds:20 },
  { id:"band-calf-raise", nameLocal:"Elevación de Talones",   name:"Band Calf Raise",         region:"Tobillo",  equipment:"Ligas / Bandas", difficulty:"beginner",    sets:3, reps:15, restSeconds:20 },
  { id:"band-glute-kick", nameLocal:"Patada de Glúteo",       name:"Band Glute Kickback",     region:"Glúteo",   equipment:"Ligas / Bandas", difficulty:"beginner",    sets:3, reps:15, restSeconds:20 },
  // Pelota terapéutica
  { id:"ball-bridge",     nameLocal:"Puente con Pelota",      name:"Ball Bridge",             region:"Glúteo",   equipment:"Pelota",        difficulty:"intermediate", sets:3, reps:12, restSeconds:30 },
  { id:"ball-hamcurl",    nameLocal:"Curl Isquiotibiales",    name:"Ball Hamstring Curl",     region:"Rodilla",  equipment:"Pelota",        difficulty:"intermediate", sets:3, reps:10, restSeconds:45 },
  { id:"ball-squat",      nameLocal:"Sentadilla en Pared",    name:"Ball Wall Squat",         region:"Rodilla",  equipment:"Pelota",        difficulty:"beginner",     sets:3, reps:12, restSeconds:30 },
  { id:"ball-lumbar-ext", nameLocal:"Extensión Lumbar",       name:"Ball Lumbar Extension",   region:"Lumbar",   equipment:"Pelota",        difficulty:"beginner",     sets:3, reps:10, restSeconds:30 },
  // Foam Roller
  { id:"foam-thoracic",   nameLocal:"Extensión Torácica",     name:"Thoracic Extension FR",   region:"Torácica", equipment:"Foam Roller",   difficulty:"beginner",     sets:2, reps:8,  restSeconds:30 },
  { id:"foam-it-band",    nameLocal:"IT Band / Lateral muslo",name:"IT Band Release FR",      region:"Rodilla",  equipment:"Foam Roller",   difficulty:"beginner",     sets:2, reps:0,  restSeconds:30 },
  { id:"foam-calf",       nameLocal:"Pantorrilla",            name:"Calf Release FR",         region:"Tobillo",  equipment:"Foam Roller",   difficulty:"beginner",     sets:2, reps:0,  restSeconds:20 },
  // BOSU
  { id:"bosu-squat",      nameLocal:"Sentadilla BOSU",        name:"BOSU Squat",              region:"Rodilla",  equipment:"BOSU",          difficulty:"intermediate", sets:3, reps:10, restSeconds:45 },
  { id:"bosu-balance",    nameLocal:"Equilibrio BOSU",        name:"BOSU Balance",            region:"Tobillo",  equipment:"BOSU",          difficulty:"intermediate", sets:3, reps:0,  restSeconds:30 },
  { id:"bosu-plank",      nameLocal:"Plancha BOSU",           name:"BOSU Plank",              region:"Core",     equipment:"BOSU",          difficulty:"advanced",     sets:3, reps:0,  restSeconds:45 },
  { id:"bosu-hiphinge",   nameLocal:"Bisagra de Cadera BOSU", name:"BOSU Hip Hinge",          region:"Lumbar",   equipment:"BOSU",          difficulty:"intermediate", sets:3, reps:10, restSeconds:40 },
  // Kettlebell
  { id:"kb-swing",        nameLocal:"Swing Kettlebell",       name:"Kettlebell Swing",        region:"Lumbar",   equipment:"Kettlebell",    difficulty:"intermediate", sets:4, reps:12, restSeconds:60 },
  { id:"kb-goblet",       nameLocal:"Sentadilla Goblet KB",   name:"Kettlebell Goblet Squat", region:"Rodilla",  equipment:"Kettlebell",    difficulty:"intermediate", sets:3, reps:10, restSeconds:45 },
  // Peso tobillo
  { id:"knee-ext-seated", nameLocal:"Extensión de Rodilla",   name:"Seated Knee Extension",   region:"Rodilla",  equipment:"Peso tobillo",  difficulty:"beginner",     sets:3, reps:15, restSeconds:30 },
  { id:"hip-abd-sidelying",nameLocal:"Abducción de Cadera",   name:"Side-Lying Hip Abduction",region:"Cadera",   equipment:"Peso tobillo",  difficulty:"beginner",     sets:3, reps:15, restSeconds:25 },
  { id:"prone-hip-ext-wt",nameLocal:"Extensión Cadera Prono w/Peso",name:"Prone Hip Extension w/Weight",region:"Glúteo",equipment:"Peso tobillo",difficulty:"beginner",sets:3, reps:12, restSeconds:25 },
];

const REGIONS = ["Todos", "Hombro", "Cervical", "Torácica", "Lumbar", "Core", "Cadera", "Glúteo", "Rodilla", "Tobillo", "Codo", "Muñeca/Mano", "Nervio"];
const EQUIPMENTS = ["Todos", "Peso corporal", "Mancuernas", "Ligas / Bandas", "Pelota", "Foam Roller", "BOSU", "Kettlebell", "Peso tobillo"];

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     "text-clinical-700 bg-clinical-500/10",
  intermediate: "text-amber-700 bg-amber-500/10",
  advanced:     "text-orange-700 bg-orange-500/10",
};
const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Básico", intermediate: "Intermedio", advanced: "Avanzado",
};

// ─── Item de ejercicio en la rutina ───────────────────────────────────────────
function RoutineItem({
  exercise, index, onRemove, onUpdate, onDragStart, onDragEnter, onDragEnd,
}: {
  exercise: RoutineExercise; index: number;
  onRemove: () => void;
  onUpdate: (field: keyof RoutineExercise, value: string | number) => void;
  onDragStart: () => void; onDragEnter: () => void; onDragEnd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      draggable onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="bg-white border border-surface-200 rounded-xl overflow-hidden group hover:border-brand-300 hover:shadow-sm transition-all select-none"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="cursor-grab active:cursor-grabbing text-surface-300 hover:text-surface-500">
          <GripVertical className="h-4 w-4" />
        </div>
        <span className="text-xs font-bold text-surface-400 w-4 shrink-0">{index}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 truncate">{exercise.nameLocal}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", DIFFICULTY_COLOR[exercise.difficulty])}>
              {DIFFICULTY_LABEL[exercise.difficulty]}
            </span>
            <span className="text-[10px] text-surface-400">{exercise.region}</span>
          </div>
        </div>
        {/* Series × Reps inline */}
        <div className="flex items-center gap-0.5 shrink-0">
          <input type="number" min="1" max="10" value={exercise.sets}
            onChange={(e) => onUpdate("sets", parseInt(e.target.value) || 1)}
            onClick={(e) => e.stopPropagation()}
            className="w-7 text-center text-xs font-bold border border-surface-200 rounded bg-surface-50 py-0.5" />
          <span className="text-[10px] text-surface-400 px-0.5">×</span>
          <input type="number" min="0" max="100" value={exercise.reps}
            onChange={(e) => onUpdate("reps", parseInt(e.target.value) || 0)}
            onClick={(e) => e.stopPropagation()}
            className="w-8 text-center text-xs font-bold border border-surface-200 rounded bg-surface-50 py-0.5" />
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="p-1 rounded text-surface-300 hover:text-surface-600 hover:bg-surface-50 transition-colors">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button onClick={onRemove}
          className="p-1 rounded text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-surface-100 px-3 py-3 bg-surface-50 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Series", field: "sets" as const, value: exercise.sets },
              { label: "Reps", field: "reps" as const, value: exercise.reps },
              { label: "Descanso (s)", field: "restSeconds" as const, value: exercise.restSeconds },
            ].map(({ label, field, value }) => (
              <div key={field}>
                <label className="text-[10px] text-surface-400 font-medium block mb-1">{label}</label>
                <input type="number" min="0" value={value}
                  onChange={(e) => onUpdate(field, parseInt(e.target.value) || 0)}
                  className="w-full text-center text-sm font-bold border border-surface-200 rounded-lg py-1.5 bg-white" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-surface-400 font-medium block mb-1">Nota para el paciente</label>
            <textarea value={exercise.notes}
              onChange={(e) => onUpdate("notes", e.target.value)}
              placeholder="Ej: Realiza lento y controlado..."
              rows={2}
              className="w-full text-xs border border-surface-200 rounded-lg p-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal de envío mejorado ───────────────────────────────────────────────────
function SendModal({ isOpen, onClose, routineName, exerciseCount, exercises }: {
  isOpen: boolean; onClose: () => void; routineName: string; exerciseCount: number;
  exercises: RoutineExercise[];
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"send" | "preview">("send");
  const link = "https://therapia.global/es/patient/demo-abc123";

  if (!isOpen) return null;

  function doSend(method: string) {
    if (method === "whatsapp") {
      // Build WhatsApp message with CDN video URLs from registry
      const lines = [
        `*${routineName}*`,
        `Tu programa de ejercicios:`,
        "",
        ...exercises.map((ex, i) => {
          const videoUrl = _cdnReg[ex.id]?.video ?? "";
          return [
            `${i + 1}️⃣ ${ex.nameLocal} — ${ex.sets}x${ex.reps}`,
            videoUrl ? `🎥 ${videoUrl}` : null,
          ].filter(Boolean).join("\n");
        }),
        "",
        "Generado con Therapia Global",
      ].join("\n");
      window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
    }
    setSent(method);
    setTimeout(() => { setSent(null); }, 1800);
  }

  function downloadPDF() {
    // Genera una ventana de impresión con el contenido de la rutina
    const content = `
      <html><head><title>${routineName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
        .exercise { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .ex-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .ex-num { width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .ex-name { font-size: 15px; font-weight: 700; color: #0f172a; }
        .ex-region { font-size: 11px; color: #64748b; }
        .stats { display: flex; gap: 16px; margin: 8px 0; }
        .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 12px; }
        .stat strong { display: block; font-size: 15px; font-weight: 700; }
        .notes { margin-top: 8px; padding: 10px; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; font-size: 12px; color: #713f12; }
        .footer { margin-top: 32px; text-align: center; color: #94a3b8; font-size: 11px; }
        @media print { body { padding: 16px; } }
      </style></head><body>
      <h1>${routineName}</h1>
      <p class="subtitle">${exerciseCount} ejercicios · Generado por Therapia Global · ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
      ${exercises.map((ex, i) => `
        <div class="exercise">
          <div class="ex-header">
            <div class="ex-num">${i + 1}</div>
            <div>
              <div class="ex-name">${ex.nameLocal}</div>
              <div class="ex-region">${ex.region} · ${ex.equipment}</div>
            </div>
          </div>
          <div class="stats">
            <div class="stat"><strong>${ex.sets}</strong>Series</div>
            <div class="stat"><strong>${ex.reps || "—"}</strong>Repeticiones</div>
            <div class="stat"><strong>${ex.restSeconds}s</strong>Descanso</div>
          </div>
          ${ex.notes ? `<div class="notes">📝 ${ex.notes}</div>` : ""}
        </div>
      `).join("")}
      <div class="footer">Therapia Global · therapia.global · ${link}</div>
      </body></html>
    `;
    const w = window.open("", "_blank");
    if (w) { w.document.write(content); w.document.close(); w.print(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div>
            <h2 className="text-base font-bold text-surface-900">Enviar rutina al paciente</h2>
            <p className="text-xs text-surface-400">{routineName} · {exerciseCount} ejercicios</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-100">
          {[
            { id: "send" as const, label: "Enviar" },
            { id: "preview" as const, label: "Vista previa PDF" },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("flex-1 py-2.5 text-xs font-semibold transition-colors",
                activeTab === t.id ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400 hover:text-surface-600")}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "send" ? (
          <div className="p-5 space-y-3">
            {/* PDF Download */}
            <button onClick={downloadPDF}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-brand-200 bg-brand-50 hover:bg-brand-100 transition-all text-brand-700">
              <FileDown className="h-5 w-5 text-brand-600" />
              <div className="text-start flex-1">
                <p className="text-sm font-bold">Descargar PDF</p>
                <p className="text-xs text-brand-500">Incluye ejercicios, series, reps y observaciones</p>
              </div>
            </button>

            {/* Link */}
            <div>
              <label className="text-xs font-semibold text-surface-600 block mb-1.5">Link del paciente</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-surface-500 truncate">{link}</p>
                </div>
                <button onClick={() => navigator.clipboard?.writeText(link)}
                  className="shrink-0 p-2 border border-surface-200 rounded-lg text-surface-500 hover:bg-surface-50">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email@paciente.com" type="email" className="flex-1" />
              <button onClick={() => doSend("email")}
                className={cn("shrink-0 px-4 h-10 rounded-lg text-sm font-semibold transition-all",
                  sent === "email" ? "bg-clinical-500 text-white" : "bg-brand-600 text-white hover:bg-brand-500")}>
                {sent === "email" ? <CheckCircle2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </button>
            </div>

            {/* WhatsApp / QR */}
            {[
              { id: "whatsapp", icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp", desc: "Abre WhatsApp con el link listo", color: "hover:border-green-300 hover:bg-green-50 hover:text-green-700" },
              { id: "qr",       icon: <QrCode className="h-5 w-5" />,       label: "Código QR", desc: "Imprime o muestra en consulta",  color: "hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700" },
            ].map(({ id, icon, label, desc, color }) => (
              <button key={id} onClick={() => doSend(id)}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 transition-all text-surface-700", color,
                  sent === id && "border-clinical-500 bg-clinical-50 text-clinical-700")}>
                {icon}
                <div className="text-start flex-1">
                  <p className="text-sm font-semibold">{sent === id ? "¡Enviado!" : `Enviar por ${label}`}</p>
                  <p className="text-xs text-surface-400">{desc}</p>
                </div>
                {sent === id && <CheckCircle2 className="h-4 w-4 text-clinical-500" />}
              </button>
            ))}
          </div>
        ) : (
          /* Vista previa PDF */
          <div className="p-5 max-h-80 overflow-y-auto space-y-3">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-surface-900">{routineName}</h3>
              <p className="text-xs text-surface-400">{exerciseCount} ejercicios · Therapia Global</p>
            </div>
            {exercises.map((ex, i) => (
              <div key={ex.uid} className="border border-surface-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">{ex.nameLocal}</p>
                    <p className="text-[10px] text-surface-400">{ex.region} · {ex.equipment}</p>
                  </div>
                </div>
                <div className="flex gap-2 ms-8">
                  <span className="text-[10px] bg-surface-100 px-2 py-0.5 rounded-lg font-medium">
                    {ex.sets} series
                  </span>
                  {ex.reps > 0 && <span className="text-[10px] bg-surface-100 px-2 py-0.5 rounded-lg font-medium">{ex.reps} reps</span>}
                  <span className="text-[10px] bg-surface-100 px-2 py-0.5 rounded-lg font-medium">{ex.restSeconds}s descanso</span>
                </div>
                {ex.notes && (
                  <p className="ms-8 mt-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                    {ex.notes}
                  </p>
                )}
              </div>
            ))}
            <button onClick={downloadPDF}
              className="w-full h-10 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <FileDown className="h-4 w-4" />
              Descargar este PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function RoutinesPage() {
  const [routineName, setRoutineName] = useState("Nueva rutina");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("Todos");
  const [equipFilter, setEquipFilter] = useState("Todos");
  const [sendOpen, setSendOpen] = useState(false);
  const [saved, setSaved] = useState<SavedRoutine[]>([
    { id:"s1", name:"Lumbar — Fase 1",        exerciseCount:5, createdAt:"2026-02-28", sentTo:"María López" },
    { id:"s2", name:"Hombro post-quirúrgico", exerciseCount:7, createdAt:"2026-03-01", sentTo:"Carlos Ruiz" },
    { id:"s3", name:"Rodilla — Protocolo ACL",exerciseCount:6, createdAt:"2026-03-01" },
  ]);

  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const filteredLib = EXERCISE_LIBRARY.filter((ex) => {
    const q = search.toLowerCase();
    const matchQ = !search || ex.nameLocal.toLowerCase().includes(q) || ex.name.toLowerCase().includes(q) || ex.region.toLowerCase().includes(q);
    const matchR = regionFilter === "Todos" || ex.region === regionFilter;
    const matchE = equipFilter === "Todos" || ex.equipment === equipFilter;
    return matchQ && matchR && matchE;
  });

  function addEx(ex: typeof EXERCISE_LIBRARY[0]) {
    setExercises((prev) => [...prev, { ...ex, uid: `${ex.id}-${Date.now()}`, notes: "" }]);
  }

  function removeEx(uid: string) {
    setExercises((prev) => prev.filter((e) => e.uid !== uid));
  }

  function reorderEx(from: number, to: number) {
    setExercises((prev) => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  }

  function updateEx(uid: string, field: keyof RoutineExercise, value: string | number) {
    setExercises((prev) => prev.map((e) => e.uid === uid ? { ...e, [field]: value } : e));
  }

  function saveRoutine() {
    setSaved((prev) => [{ id: `s${Date.now()}`, name: routineName, exerciseCount: exercises.length, createdAt: new Date().toISOString().split("T")[0] }, ...prev]);
    setExercises([]);
    setRoutineName("Nueva rutina");
  }

  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const estMin = Math.ceil(exercises.reduce((a, e) => a + (e.sets * 45 + e.restSeconds * Math.max(e.sets - 1, 0)) / 60, 0));

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Constructor de Rutinas" />

        <div className="flex flex-1 overflow-hidden">
          {/* ── Biblioteca ─────────────────────────────────────────────── */}
          <div className="w-80 shrink-0 border-e border-surface-200 bg-white flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-surface-100 space-y-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Biblioteca de ejercicios</p>
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar ejercicios..." className="ps-8 h-8 text-xs" />
              </div>
              <div className="flex gap-1.5">
                <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
                  className="flex-1 h-7 rounded-lg border border-surface-200 bg-surface-50 text-xs text-surface-600 px-2 focus:outline-none">
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <select value={equipFilter} onChange={(e) => setEquipFilter(e.target.value)}
                  className="flex-1 h-7 rounded-lg border border-surface-200 bg-surface-50 text-xs text-surface-600 px-2 focus:outline-none">
                  {EQUIPMENTS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredLib.map((ex) => {
                const isAdded = exercises.some((re) => re.id === ex.id);
                return (
                  <button key={ex.id} onClick={() => addEx(ex)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-brand-50 hover:border-brand-200 border border-transparent transition-all text-start group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isAdded ? "bg-clinical-500/15 text-clinical-600" : "bg-surface-100 text-surface-400 group-hover:bg-brand-100 group-hover:text-brand-600"
                    )}>
                      {isAdded ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-surface-800 truncate">{ex.nameLocal}</p>
                      <p className="text-[10px] text-surface-400">{ex.equipment} · {DIFFICULTY_LABEL[ex.difficulty]}</p>
                    </div>
                    <span className="text-[10px] text-surface-400 shrink-0">{ex.sets}×{ex.reps || "—"}</span>
                  </button>
                );
              })}
              {filteredLib.length === 0 && (
                <p className="text-center py-8 text-xs text-surface-400">Sin resultados</p>
              )}
            </div>
          </div>

          {/* ── Builder (centro) ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 bg-white border-e border-surface-200 flex flex-col overflow-hidden">
            {/* Nombre */}
            <div className="px-5 pt-4 pb-3 border-b border-surface-100">
              <Input value={routineName} onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Nombre de la rutina..."
                className="text-base font-semibold border-0 border-b border-surface-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-brand-500" />
            </div>

            {/* Stats */}
            {exercises.length > 0 && (
              <div className="px-5 py-2 bg-surface-50 border-b border-surface-100 flex gap-4">
                <span className="text-xs text-surface-500"><strong className="text-surface-900">{exercises.length}</strong> ejercicios</span>
                <span className="text-xs text-surface-500"><strong className="text-surface-900">{totalSets}</strong> series</span>
                <span className="text-xs text-surface-500"><strong className="text-surface-900">~{estMin} min</strong></span>
              </div>
            )}

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
                    <Plus className="h-7 w-7 text-surface-300" />
                  </div>
                  <p className="text-sm font-medium text-surface-500 mb-1">Rutina vacía</p>
                  <p className="text-xs text-surface-400 max-w-xs">Haz clic en + para agregar ejercicios desde la biblioteca</p>
                </div>
              ) : exercises.map((ex, i) => (
                <RoutineItem key={ex.uid} exercise={ex} index={i + 1}
                  onRemove={() => removeEx(ex.uid)}
                  onUpdate={(f, v) => updateEx(ex.uid, f, v)}
                  onDragStart={() => { dragItem.current = i; }}
                  onDragEnter={() => { dragOver.current = i; }}
                  onDragEnd={() => {
                    if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
                      reorderEx(dragItem.current, dragOver.current);
                    }
                    dragItem.current = null;
                    dragOver.current = null;
                  }}
                />
              ))}
            </div>

            {/* Footer CTA */}
            {exercises.length > 0 && (
              <div className="shrink-0 border-t border-surface-100 p-4 flex gap-2">
                <button onClick={() => window.open("/es/patient/demo", "_blank")}
                  className="flex-1 h-10 border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 flex items-center justify-center gap-1.5 transition-colors">
                  <Eye className="h-4 w-4" />
                  Vista paciente
                </button>
                <button onClick={() => setSendOpen(true)}
                  className="flex-1 h-10 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-colors">
                  <Send className="h-4 w-4" />
                  Enviar
                </button>
              </div>
            )}
          </div>

          {/* ── Rutinas guardadas ────────────────────────────────────────── */}
          <div className="w-72 shrink-0 bg-surface-50 flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-surface-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Guardadas</p>
              {exercises.length > 0 && (
                <button onClick={saveRoutine} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  + Guardar actual
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {saved.map((r) => (
                <div key={r.id}
                  className="bg-white border border-surface-200 rounded-xl p-3 hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer">
                  <p className="text-sm font-semibold text-surface-900 mb-0.5">{r.name}</p>
                  <p className="text-xs text-surface-400 mb-1.5">
                    {r.exerciseCount} ejercicios{r.sentTo ? ` · ${r.sentTo}` : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-surface-400">{r.createdAt}</span>
                    <div className="flex gap-1">
                      <button className="p-1 rounded text-surface-300 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button className="p-1 rounded text-surface-300 hover:text-green-500 hover:bg-green-50 transition-colors">
                        <Share2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SendModal isOpen={sendOpen} onClose={() => setSendOpen(false)}
        routineName={routineName} exerciseCount={exercises.length} exercises={exercises} />
    </div>
  );
}
