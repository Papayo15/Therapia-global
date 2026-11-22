"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical, Send, Copy, Search, X, CheckCircle2, MessageCircle, Share2, Eye, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateRoutinePDF } from "@/lib/generatePDF";
import masterRegistry from "@data/master-registry.json";
import { useTranslations } from "next-intl";
import { LIBRARY_ITEMS, REGION_GROUPS, regionGroup, videoUrl } from "@/lib/videoLibrary";

const _cdnReg = masterRegistry as Record<string, { video_url?: string; cloudflare_id?: string }>;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RoutineExercise {
  uid: string;
  id: string;
  name: string;
  nameLocal: string;
  region: string;
  equipment: string;
  equipmentOverride?: string; // therapist can switch to alternative
  difficulty: string;
  sets: number;
  reps: number;
  restSeconds: number;
  frequencyPerWeek: number;
  notes: string;
  poster?: string;
}

interface SavedRoutine {
  id: string;
  name: string;
  exerciseCount: number;
  createdAt: string;
  sentTo?: string;
}

// ─── Biblioteca del builder: técnicas con video de la fábrica (data/video-library.json) ──
const PROP_LABEL: Record<string, string> = {
  banda_elastica: "Banda elástica", mancuerna: "Mancuerna", pared: "Pared", toalla: "Toalla", martillo: "Martillo",
  barra: "Barra", silla: "Silla", escalon: "Escalón", marco_puerta: "Marco de puerta", masilla: "Masilla",
  pelota_pequena: "Pelota pequeña", polea: "Polea", banco: "Banco", mesa: "Mesa", camilla: "Camilla",
  foam_roller: "Foam roller", balon_medicinal: "Balón medicinal", barra_flexible: "Barra flexible", correa: "Correa",
  depresor_lingual: "Depresor lingual", baston: "Bastón", banco_romano: "Banco romano", tobillera: "Tobillera",
  espejo: "Espejo", trx: "TRX", kettlebell: "Kettlebell", esponja: "Esponja", hand_grip: "Hand grip",
  recipiente_arroz: "Recipiente con arroz", papel: "Papel", pinza_ropa: "Pinza de ropa", monedas: "Monedas",
  fitball: "Fitball", deslizadores: "Deslizadores", rodillo: "Rodillo", cojin_inestable: "Cojín inestable",
  canicas: "Canicas", rollo: "Rollo",
};
const BODYWEIGHT = "Peso corporal";

const EXERCISE_LIBRARY = LIBRARY_ITEMS.filter((i) => i.categoria !== "osteopatia").map((i) => {
  const stretch = i.categoria === "estiramiento";
  const nivel = i.nivel ?? 1;
  return {
    id: i.id,
    nameLocal: i.objetivo ? `${i.objetivo} · ${i.nombre}` : i.nombre,
    name: i.objetivo ? `${i.objetivo} · ${i.nombre}` : i.nombre,
    region: regionGroup(i),
    equipment: i.props.length ? PROP_LABEL[i.props[0]] ?? i.props[0] : BODYWEIGHT,
    difficulty: nivel <= 2 ? "beginner" : nivel === 3 ? "intermediate" : "advanced",
    // valores de partida que el terapeuta ajusta; estiramientos: mantener (reps 0 = sostener)
    sets: stretch ? 2 : 3,
    reps: stretch ? 0 : 10,
    restSeconds: stretch ? 20 : 45,
    poster: videoUrl(i.variantes[0].poster),
  };
});

const REGIONS = ["Todos", ...REGION_GROUPS.map((g) => g.key).filter((k) => EXERCISE_LIBRARY.some((e) => e.region === k))];
const EQUIPMENTS = ["Todos", BODYWEIGHT, ...[...new Set(EXERCISE_LIBRARY.map((e) => e.equipment))].filter((e) => e !== BODYWEIGHT).sort()];

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
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Series", field: "sets" as const, value: exercise.sets },
              { label: "Reps", field: "reps" as const, value: exercise.reps },
              { label: "Descanso(s)", field: "restSeconds" as const, value: exercise.restSeconds },
              { label: "Días/sem", field: "frequencyPerWeek" as const, value: exercise.frequencyPerWeek },
            ].map(({ label, field, value }) => (
              <div key={field}>
                <label className="text-[10px] text-surface-400 font-medium block mb-1">{label}</label>
                <input type="number" min="0" max={field === "frequencyPerWeek" ? 7 : 100} value={value}
                  onChange={(e) => onUpdate(field, parseInt(e.target.value) || 0)}
                  className="w-full text-center text-sm font-bold border border-surface-200 rounded-lg py-1.5 bg-white" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-surface-400 font-medium block mb-1">
              Implemento — <span className="text-brand-500">{exercise.equipmentOverride ?? exercise.equipment}</span>
            </label>
            <div className="flex gap-2">
              {["Peso corporal", "Ligas / Bandas", "Mancuernas", "Foam Roller", "BOSU", "Pelota", "Kettlebell"].map((eq) => (
                <button key={eq} onClick={() => onUpdate("equipmentOverride", eq)}
                  className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                    (exercise.equipmentOverride ?? exercise.equipment) === eq
                      ? "border-brand-400 bg-brand-50 text-brand-700 font-semibold"
                      : "border-surface-200 text-surface-400 hover:border-surface-300"
                  )}>
                  {eq}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-surface-400 font-medium block mb-1">Nota personal del Dr.</label>
            <textarea value={exercise.notes}
              onChange={(e) => onUpdate("notes", e.target.value)}
              placeholder="Ej: Juan, recuerda mantener la espalda recta en este..."
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
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [planLink, setPlanLink] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"send" | "preview">("send");

  if (!isOpen) return null;

  async function generatePlanLink() {
    setSending(true);
    try {
      const payload = {
        therapist_id: "demo-therapist",
        patient: { name: patientName || "Paciente", phone: patientPhone },
        meta: {
          diagnosis: diagnosis || routineName,
          phase: "Fase 1",
          frequency_per_week: 3,
          duration_weeks: 4,
        },
        exercises: exercises.map((ex, i) => ({
          exercise_id: ex.id,
          nombre_display: ex.nameLocal,
          youtube_id: (_cdnReg[ex.id] as Record<string, unknown>)?.youtube_id as string ?? "",
          youtube_start_seconds: (_cdnReg[ex.id] as Record<string, unknown>)?.youtube_start_seconds as number ?? 0,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds,
          frequency_per_week: ex.frequencyPerWeek ?? 3,
          equipment_used: ex.equipmentOverride ?? ex.equipment,
          equipment_alternative: "peso corporal",
          note_from_therapist: ex.notes,
          instructions_eli5: ((_cdnReg[ex.id] as Record<string, unknown>)?.instructions_eli5 as string[]) ?? [
            "Posición inicial cómoda",
            "Realiza el movimiento lentamente",
            "Vuelve al inicio y respira"
          ],
          order: i + 1,
        })),
      };
      const res = await fetch("/api/routines/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setPlanLink(data.share_url);
    } catch {
      setPlanLink(`${window.location.origin}/es/p/demo-${Date.now()}`);
    }
    setSending(false);
  }

  function sendWhatsApp() {
    if (!planLink) return;
    const msg = [
      `*${routineName}*`,
      patientName ? `Hola ${patientName}! 👋` : "Hola!",
      `Tu programa de ejercicios está listo. Ábrelo aquí:`,
      planLink,
      ``,
      `_Therapia Global — therapia.global_`,
    ].join("\n");
    const phone = patientPhone.replace(/\D/g, "");
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  async function downloadPDF() {
    await generateRoutinePDF(
      {
        patient_name: patientName || "Paciente",
        diagnosis: diagnosis || routineName,
        plan_id: planLink ? planLink.split("/").pop() : undefined,
        phase: "Fase 1",
        frequency_per_week: 3,
        duration_weeks: 4,
      },
      exercises.map((ex, i) => ({
        order: i + 1,
        nombre_display: ex.nameLocal,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.restSeconds,
        frequency_per_week: ex.frequencyPerWeek ?? 3,
        equipment_used: ex.equipmentOverride ?? ex.equipment,
        note_from_therapist: ex.notes,
        instructions_eli5: ((_cdnReg[ex.id] as Record<string, unknown>)?.instructions_eli5 as string[]) ?? [
          "Adopta la posición inicial cómoda",
          "Realiza el movimiento lento y controlado",
          "Vuelve al inicio y respira profundo",
        ],
      }))
    );
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
            {/* Patient info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-surface-500 font-semibold block mb-1">Nombre del paciente</label>
                <Input value={patientName} onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Ej: Juan García" className="text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-surface-500 font-semibold block mb-1">WhatsApp (con código)</label>
                <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+52 55 1234 5678" className="text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-surface-500 font-semibold block mb-1">Diagnóstico / Motivo</label>
              <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Ej: Síndrome de hombro doloroso" className="text-sm" />
            </div>

            {/* Generate link */}
            {!planLink ? (
              <button onClick={generatePlanLink} disabled={sending}
                className="w-full h-11 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando link...</>
                ) : (
                  <><Share2 className="h-4 w-4" /> Generar link del paciente</>
                )}
              </button>
            ) : (
              <>
                {/* Link box */}
                <div className="bg-clinical-50 border border-clinical-200 rounded-xl p-3">
                  <p className="text-[10px] text-clinical-600 font-semibold mb-1">✅ Link generado</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-clinical-700 truncate flex-1">{planLink}</p>
                    <button onClick={() => navigator.clipboard?.writeText(planLink)}
                      className="shrink-0 p-1.5 border border-clinical-200 rounded-lg text-clinical-600 hover:bg-clinical-100">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* WhatsApp send */}
                <button onClick={sendWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all text-green-700">
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-start flex-1">
                    <p className="text-sm font-bold">Enviar por WhatsApp</p>
                    <p className="text-xs text-green-600">Abre WhatsApp con el link listo para enviar</p>
                  </div>
                </button>
              </>
            )}

            {/* PDF Download */}
            <button onClick={downloadPDF}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-surface-200 bg-surface-50 hover:bg-surface-100 transition-all text-surface-700">
              <FileDown className="h-5 w-5 text-surface-500" />
              <div className="text-start flex-1">
                <p className="text-sm font-bold">Descargar PDF</p>
                <p className="text-xs text-surface-400">Incluye ejercicios, series, reps y observaciones</p>
              </div>
            </button>
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
  const tl = useTranslations("library");
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
    const matchQ = !search || ex.nameLocal.toLowerCase().includes(q) || ex.name.toLowerCase().includes(q) || ex.region.toLowerCase().includes(q) || ex.id.toLowerCase().includes(q);
    const matchR = regionFilter === "Todos" || ex.region === regionFilter;
    const matchE = equipFilter === "Todos" || ex.equipment === equipFilter;
    return matchQ && matchR && matchE;
  });

  function addEx(ex: typeof EXERCISE_LIBRARY[0]) {
    setExercises((prev) => [...prev, { ...ex, uid: `${ex.id}-${Date.now()}`, notes: "", frequencyPerWeek: 3 }]);
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
                  {REGIONS.map((r) => <option key={r} value={r}>{r === "Todos" ? r : tl(`region.${r}`)}</option>)}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ex.poster} alt="" loading="lazy" className="h-9 w-14 shrink-0 rounded-md object-cover bg-surface-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-surface-800 line-clamp-2 leading-snug">{ex.nameLocal}</p>
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
