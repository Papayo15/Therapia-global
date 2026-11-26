"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Plus, Trash2, GripVertical, Send, Copy, Search, X, CheckCircle2, MessageCircle, Share2, Eye,
  ChevronDown, ChevronUp, FileDown, Save, FolderOpen, BookOpen, ListChecks, Play,
} from "lucide-react";
import Link from "next/link";
import { LibraryPlayerModal } from "@/components/library/LibraryPlayerModal";
import { readDraft, writeDraft, clearDraft } from "@/lib/routineDraft";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateRoutinePDF } from "@/lib/generatePDF";
import { encodePlanId } from "@/lib/planLink";
import { supabase, type PlanExercise, type RoutineRow } from "@/lib/supabase";
import { LIBRARY_ITEMS, REGION_GROUPS, regionGroup, videoUrl, type LibraryItem } from "@/lib/videoLibrary";
import { useLibraryText } from "@/lib/useLibraryText";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RoutineExercise {
  uid: string;
  id: string;
  region: string;
  prop: string;            // material principal ("" = peso corporal)
  equipmentOverride?: string;
  difficulty: Difficulty;
  sets: number;
  reps: number;
  restSeconds: number;
  frequencyPerWeek: number;
  notes: string;
  poster?: string;
}

interface Template {
  id: string;
  name: string;
  createdAt: string;
  exercises: RoutineExercise[];
}

type Difficulty = "beginner" | "intermediate" | "advanced";

// ─── Biblioteca del builder: técnicas con video (sin osteopatía, que la aplica el terapeuta) ──
const ITEM_BY_ID = new Map(LIBRARY_ITEMS.map((i) => [i.id, i]));
const EXERCISE_LIBRARY = LIBRARY_ITEMS.filter((i) => i.categoria !== "osteopatia").map((i) => {
  const stretch = i.categoria === "estiramiento";
  const nivel = i.nivel ?? 1;
  return {
    id: i.id,
    region: regionGroup(i),
    prop: i.props[0] ?? "",
    difficulty: (nivel <= 2 ? "beginner" : nivel === 3 ? "intermediate" : "advanced") as Difficulty,
    // valores de partida que el terapeuta ajusta; estiramientos: mantener (reps 0 = sostener)
    sets: stretch ? 2 : 3,
    reps: stretch ? 0 : 10,
    restSeconds: stretch ? 20 : 45,
    poster: videoUrl(i.variantes[0].poster),
  };
});
type LibEx = (typeof EXERCISE_LIBRARY)[number];

const REGIONS = REGION_GROUPS.map((g) => g.key).filter((k) => EXERCISE_LIBRARY.some((e) => e.region === k));
const PROPS = [...new Set(EXERCISE_LIBRARY.map((e) => e.prop).filter(Boolean))];
const OVERRIDES = ["", "banda_elastica", "mancuerna", "foam_roller", "pelota_pequena", "kettlebell", "toalla"];

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: "text-clinical-700 bg-clinical-500/10",
  intermediate: "text-amber-700 bg-amber-500/10",
  advanced: "text-orange-700 bg-orange-500/10",
};

function useNames() {
  const t = useTranslations("rb");
  const lt = useLibraryText();
  const name = (id: string) => {
    const it = ITEM_BY_ID.get(id);
    return it ? lt.name(it as LibraryItem) : id;
  };
  const prop = (p: string) => (p ? (t.has(`prop.${p}`) ? t(`prop.${p}`) : p.replace(/_/g, " ")) : t("prop.none"));
  return { t, lt, name, prop };
}

function toPlanExercises(exercises: RoutineExercise[], name: (id: string) => string, prop: (p: string) => string): PlanExercise[] {
  return exercises.map((ex, i) => ({
    exercise_id: ex.id,
    nombre_display: name(ex.id),
    youtube_id: "",
    youtube_start_seconds: 0,
    sets: ex.sets,
    reps: ex.reps,
    rest_seconds: ex.restSeconds,
    frequency_per_week: ex.frequencyPerWeek ?? 3,
    equipment_used: prop(ex.equipmentOverride ?? ex.prop),
    equipment_alternative: "",
    note_from_therapist: ex.notes,
    instructions_eli5: [],
    order: i + 1,
  }));
}

// ─── Item de ejercicio en la rutina ───────────────────────────────────────────
function RoutineItem({
  exercise, index, onRemove, onUpdate, onMove, onDragStart, onDragEnter, onDragEnd,
}: {
  exercise: RoutineExercise; index: number;
  onRemove: () => void;
  onUpdate: (field: keyof RoutineExercise, value: string | number) => void;
  onMove: (dir: -1 | 1) => void;
  onDragStart: () => void; onDragEnter: () => void; onDragEnd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t, name, prop } = useNames();
  const tl = useTranslations("library");

  return (
    <div
      draggable onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="bg-white border border-surface-200 rounded-xl overflow-hidden group hover:border-brand-300 hover:shadow-sm transition-all select-none"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="hidden sm:block cursor-grab active:cursor-grabbing text-surface-300 hover:text-surface-500">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex flex-col sm:hidden">
          <button onClick={() => onMove(-1)} aria-label="up" className="text-surface-300 hover:text-surface-600"><ChevronUp className="h-3.5 w-3.5" /></button>
          <button onClick={() => onMove(1)} aria-label="down" className="text-surface-300 hover:text-surface-600"><ChevronDown className="h-3.5 w-3.5" /></button>
        </div>
        <span className="text-xs font-bold text-surface-400 w-4 shrink-0">{index}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 line-clamp-2 sm:truncate">{name(exercise.id)}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", DIFFICULTY_COLOR[exercise.difficulty])}>
              {t(`diff.${exercise.difficulty}`)}
            </span>
            <span className="text-[10px] text-surface-400 truncate">{tl(`region.${exercise.region}`)}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <input type="number" min="1" max="10" value={exercise.sets} aria-label={t("sets")}
            onChange={(e) => onUpdate("sets", parseInt(e.target.value) || 1)}
            className="w-8 text-center text-xs font-bold border border-surface-200 rounded bg-surface-50 py-0.5" />
          <span className="text-[10px] text-surface-400 px-0.5">×</span>
          <input type="number" min="0" max="100" value={exercise.reps} aria-label={t("reps")}
            onChange={(e) => onUpdate("reps", parseInt(e.target.value) || 0)}
            className="w-9 text-center text-xs font-bold border border-surface-200 rounded bg-surface-50 py-0.5" />
        </div>
        <button onClick={() => setExpanded(!expanded)} aria-label={t("details")}
          className="p-1 rounded text-surface-300 hover:text-surface-600 hover:bg-surface-50 transition-colors">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button onClick={onRemove} aria-label={t("remove")}
          className="p-1 rounded text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-surface-100 px-3 py-3 bg-surface-50 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: t("sets"), field: "sets" as const, value: exercise.sets },
              { label: t("reps_hold"), field: "reps" as const, value: exercise.reps },
              { label: t("rest_s"), field: "restSeconds" as const, value: exercise.restSeconds },
              { label: t("days_week"), field: "frequencyPerWeek" as const, value: exercise.frequencyPerWeek },
            ].map(({ label, field, value }) => (
              <div key={field}>
                <label className="text-[10px] text-surface-400 font-medium block mb-1">{label}</label>
                <input type="number" min="0" max={field === "frequencyPerWeek" ? 7 : 300} value={value}
                  onChange={(e) => onUpdate(field, parseInt(e.target.value) || 0)}
                  className="w-full text-center text-sm font-bold border border-surface-200 rounded-lg py-1.5 bg-white" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-surface-400 font-medium block mb-1">
              {t("equipment")} — <span className="text-brand-500">{prop(exercise.equipmentOverride ?? exercise.prop)}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set([exercise.prop, ...OVERRIDES])].map((eq) => (
                <button key={eq || "none"} onClick={() => onUpdate("equipmentOverride", eq)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                    (exercise.equipmentOverride ?? exercise.prop) === eq
                      ? "border-brand-400 bg-brand-50 text-brand-700 font-semibold"
                      : "border-surface-200 text-surface-500 hover:border-surface-300"
                  )}>
                  {prop(eq)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-surface-400 font-medium block mb-1">{t("note")}</label>
            <textarea value={exercise.notes}
              onChange={(e) => onUpdate("notes", e.target.value)}
              placeholder={t("note_ph")}
              rows={2}
              className="w-full text-xs border border-surface-200 rounded-lg p-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal de envío ───────────────────────────────────────────────────────────
type Initial = { name: string; phone: string; dx: string; pid: string };
type PatientOpt = { id: string; name: string; phone: string | null };

function SendModal({ isOpen, onClose, routineName, exercises, initial, editId, onSaved }: {
  isOpen: boolean; onClose: () => void; routineName: string; exercises: RoutineExercise[];
  initial: Initial;
  /** rutina ya enviada que se está editando: se actualiza y el link no cambia */
  editId: string | null;
  onSaved: (id: string) => void;
}) {
  const locale = useLocale();
  const { t, name, prop } = useNames();
  const [patientName, setPatientName] = useState(initial.name);
  const [patientPhone, setPatientPhone] = useState(initial.phone);
  const [diagnosis, setDiagnosis] = useState(initial.dx);
  const [patientId, setPatientId] = useState(initial.pid);
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  useEffect(() => {
    setPatientName(initial.name);
    setPatientPhone(initial.phone);
    setDiagnosis(initial.dx);
    setPatientId(initial.pid);
  }, [initial.name, initial.phone, initial.dx, initial.pid]);
  useEffect(() => {
    if (!isOpen) return;
    supabase.from("patients").select("id, name, phone").is("deleted_at", null).order("name")
      .then(({ data }) => setPatients((data as PatientOpt[]) ?? []));
  }, [isOpen]);
  const [planLink, setPlanLink] = useState<string | null>(null);
  const [wasEdit, setWasEdit] = useState(false);      // el link mostrado viene de editar una rutina ya enviada
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const latin = ["es", "en", "pt", "fr", "de"].includes(locale);

  useEffect(() => {
    if (!isOpen) {
      setPlanLink(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const freq = Math.max(1, ...exercises.map((e) => e.frequencyPerWeek || 3));
  const meta = { diagnosis: diagnosis || routineName, phase: t("phase1"), frequency_per_week: freq, duration_weeks: 4 };
  const planExercises = () => toPlanExercises(exercises, name, prop);

  async function generatePlanLink() {
    setSending(true);
    const pName = patientName || t("patient");
    const selfLink = `${window.location.origin}/${locale}/p/${encodePlanId({
      patientName: pName, ...meta, exercises: planExercises(),
    })}`;
    try {
      // se guarda en la cuenta del terapeuta (ligada al paciente) → link corto /p/<id>; si falla, link autocontenido.
      // Al editar una rutina ya enviada se actualiza la misma fila: el paciente sigue usando el mismo link.
      const row = {
        patient_id: patientId || null,
        patient_name: pName,
        patient_phone: patientPhone || null,
        diagnosis: meta.diagnosis,
        title: routineName,
        plan_json: { meta, exercises: planExercises() },
      };
      const { data: saved, error } = editId
        ? await supabase.from("routine_plans").update(row).eq("id", editId).select("id").single()
        : await supabase.from("routine_plans").insert(row).select("id").single();
      setWasEdit(!!editId);
      if (!error && saved) onSaved(saved.id);
      setPlanLink(!error && saved ? `${window.location.origin}/${locale}/p/${saved.id}` : selfLink);
    } catch {
      setPlanLink(selfLink);
    }
    setSending(false);
  }

  function sendWhatsApp() {
    if (!planLink) return;
    const msg = [
      `*${routineName}*`,
      patientName ? t("wa_hello_name", { name: patientName }) : t("wa_hello"),
      t("wa_body"),
      planLink,
    ].join("\n");
    const phone = patientPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function sendEmail() {
    if (!planLink) return;
    const body = [patientName ? t("wa_hello_name", { name: patientName }) : t("wa_hello"), t("wa_body"), planLink].join("\n\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(routineName)}&body=${encodeURIComponent(body)}`;
  }

  async function downloadPDF() {
    await generateRoutinePDF(
      { patient_name: patientName || t("patient"), diagnosis: meta.diagnosis, share_url: planLink ?? undefined, phase: meta.phase,
        frequency_per_week: 3, duration_weeks: 4 },
      planExercises().map((e) => ({ ...e })),
      {
        diagnosis: t("pdf_diagnosis"), generated: t("pdf_generated"), exercises: t("exercises_n", { n: exercises.length }),
        sets: t("sets"), reps: t("reps"), hold: t("hold"), rest: t("rest"), perWeek: t("per_week"), scan: t("pdf_scan"),
        note: t("note"), patient: t("patient"), locale,
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-surface-900">{editId ? t("edit_title") : t("send_title")}</h2>
            <p className="text-xs text-surface-400 truncate">{routineName} · {t("exercises_n", { n: exercises.length })}</p>
          </div>
          <button onClick={onClose} aria-label={t("close")} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {patients.length > 0 && (
            <div>
              <label className="text-[11px] text-surface-500 font-semibold block mb-1">{t("link_patient")}</label>
              <select value={patientId} onChange={(e) => {
                  const p = patients.find((x) => x.id === e.target.value);
                  setPatientId(e.target.value);
                  if (p) { setPatientName(p.name); setPatientPhone(p.phone ?? ""); }
                }}
                className="w-full h-9 rounded-lg border border-surface-200 bg-white px-2 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">{t("no_patient_link")}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-surface-500 font-semibold block mb-1">{t("patient_name")}</label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-[11px] text-surface-500 font-semibold block mb-1">{t("whatsapp")}</label>
              <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="+52 55 1234 5678" className="text-sm" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-surface-500 font-semibold block mb-1">{t("diagnosis")}</label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="text-sm" />
          </div>

          {!planLink ? (
            <button onClick={generatePlanLink} disabled={sending}
              className="w-full h-11 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
              {sending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("generating")}</>
                : <><Share2 className="h-4 w-4" /> {editId ? t("save_changes") : t("generate_link")}</>}
            </button>
          ) : (
            <>
              <div className="bg-clinical-50 border border-clinical-200 rounded-xl p-3">
                <p className="text-[11px] text-clinical-600 font-semibold mb-1">✅ {wasEdit ? t("changes_saved") : t("link_ready")}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-clinical-700 truncate flex-1" dir="ltr">{planLink}</p>
                  <button onClick={() => { navigator.clipboard?.writeText(planLink); setCopied(true); }} aria-label={t("copy")}
                    className="shrink-0 p-1.5 border border-clinical-200 rounded-lg text-clinical-600 hover:bg-clinical-100">
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <button onClick={sendWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all text-green-700">
                <MessageCircle className="h-5 w-5" />
                <div className="text-start flex-1">
                  <p className="text-sm font-bold">{t("send_whatsapp")}</p>
                  <p className="text-xs text-green-600">{t("send_whatsapp_hint")}</p>
                </div>
              </button>
              <button onClick={sendEmail}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 hover:bg-surface-50 transition-all text-surface-700">
                <Send className="h-5 w-5 text-surface-500" />
                <p className="text-sm font-bold">{t("send_email")}</p>
              </button>
              <a href={planLink} target="_blank" rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 hover:bg-surface-50 transition-all text-surface-700">
                <Eye className="h-5 w-5 text-surface-500" />
                <p className="text-sm font-bold">{t("open_link")}</p>
              </a>
            </>
          )}

          {latin && (
            <button onClick={downloadPDF}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-surface-200 bg-surface-50 hover:bg-surface-100 transition-all text-surface-700">
              <FileDown className="h-5 w-5 text-surface-500" />
              <div className="text-start flex-1">
                <p className="text-sm font-bold">{t("download_pdf")}</p>
                <p className="text-xs text-surface-400">{t("download_pdf_hint")}</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function RoutinesPage() {
  const locale = useLocale();
  const tl = useTranslations("library");
  const { t, name, prop } = useNames();
  const [routineName, setRoutineName] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [propFilter, setPropFilter] = useState("__all");
  const [sendOpen, setSendOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tab, setTab] = useState<"lib" | "routine" | "saved">("lib");      // solo celular
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const tr = useTranslations("rd");

  const [initial, setInitial] = useState<Initial>({ name: "", phone: "", dx: "", pid: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const loadTemplates = () =>
    supabase.from("routine_templates").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setTemplates(((data as { id: string; name: string; created_at: string; exercises: RoutineExercise[] }[]) ?? [])
        .map((x) => ({ id: x.id, name: x.name, createdAt: x.created_at, exercises: x.exercises }))));
  useEffect(() => {
    loadTemplates();
    const q = new URLSearchParams(window.location.search);     // viene de la ficha del paciente
    const fromUrl = q.has("pid") || q.has("p");
    const draft = readDraft<RoutineExercise>();
    const init = fromUrl
      ? { name: q.get("p") ?? "", phone: q.get("tel") ?? "", dx: q.get("dx") ?? "", pid: q.get("pid") ?? "" }
      : draft.initial ?? { name: "", phone: "", dx: "", pid: "" };
    setInitial(init);
    // rutina en preparación: lo que ya estaba armado + lo agregado desde la Biblioteca
    const fromLib = draft.pending.map((id) => EXERCISE_LIBRARY.find((x) => x.id === id)).filter(Boolean)
      .map((ex, i) => ({ ...ex!, uid: `${ex!.id}-${Date.now()}-${i}`, notes: "", frequencyPerWeek: 3 }));
    if (!q.get("edit")) {
      setExercises([...draft.exercises, ...fromLib]);
      if (fromLib.length) setTab("routine");
    }
    setRoutineName((fromUrl ? init.dx || init.name : "") || draft.name || init.dx || init.name);
    setDraftReady(true);
    // editar una rutina ya enviada (?edit=<id>): se carga tal cual y al guardar se actualiza la misma
    const edit = q.get("edit");
    if (edit) {
      supabase.from("routine_plans").select("*").eq("id", edit).single().then(({ data }) => {
        const row = data as RoutineRow | null;
        if (!row) return;
        setEditId(row.id);
        setRoutineName(row.title || row.diagnosis || "");
        setInitial({ name: row.patient_name, phone: row.patient_phone ?? "", dx: row.diagnosis ?? "", pid: row.patient_id ?? "" });
        setExercises(row.plan_json.exercises.map((e, i) => {
          const lib = EXERCISE_LIBRARY.find((x) => x.id === e.exercise_id);
          return {
            ...(lib ?? { id: e.exercise_id, region: "", prop: "", difficulty: "beginner" as Difficulty, poster: "" }),
            uid: `${e.exercise_id}-${Date.now()}-${i}`,
            sets: e.sets, reps: e.reps, restSeconds: e.rest_seconds, frequencyPerWeek: e.frequency_per_week ?? 3,
            notes: e.note_from_therapist ?? "",
          } as RoutineExercise;
        }));
        setTab("routine");
      });
    }
  }, []);
  // guarda la rutina en preparación (no al editar una ya enviada)
  useEffect(() => {
    if (!draftReady || editId) return;
    writeDraft({ exercises, pending: [], name: routineName, initial });
  }, [draftReady, editId, exercises, routineName, initial]);
  useEffect(() => {
    if (!justAdded) return;
    const h = setTimeout(() => setJustAdded(null), 1200);
    return () => clearTimeout(h);
  }, [justAdded]);

  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const title = routineName || t("new_routine");

  const q = search.trim().toLowerCase();
  const filteredLib = EXERCISE_LIBRARY.filter((ex) => {
    const matchQ = !q || name(ex.id).toLowerCase().includes(q) || ex.id.toLowerCase().includes(q)
      || tl(`region.${ex.region}`).toLowerCase().includes(q);
    const matchR = !regionFilter || ex.region === regionFilter;
    const matchE = propFilter === "__all" || ex.prop === propFilter;
    return matchQ && matchR && matchE;
  });

  function addEx(ex: LibEx) {
    setExercises((prev) => [...prev, { ...ex, uid: `${ex.id}-${Date.now()}`, notes: "", frequencyPerWeek: 3 }]);
    setJustAdded(ex.id);
  }
  const removeEx = (uid: string) => setExercises((prev) => prev.filter((e) => e.uid !== uid));
  function reorderEx(from: number, to: number) {
    setExercises((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  }
  const updateEx = (uid: string, field: keyof RoutineExercise, value: string | number) =>
    setExercises((prev) => prev.map((e) => (e.uid === uid ? { ...e, [field]: value } : e)));

  async function saveTemplate() {
    await supabase.from("routine_templates").insert({ name: title, exercises });
    loadTemplates();
  }
  async function deleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((x) => x.id !== id));
    await supabase.from("routine_templates").delete().eq("id", id);
  }
  function loadTemplate(tp: Template) {
    setRoutineName(tp.name);
    setExercises(tp.exercises.map((e, i) => ({ ...e, uid: `${e.id}-${Date.now()}-${i}` })));
    setTab("routine");
  }
  function previewPatient() {
    const id = encodePlanId({
      patientName: t("patient"), diagnosis: title, phase: t("phase1"), frequency_per_week: 3, duration_weeks: 4,
      exercises: toPlanExercises(exercises, name, prop),
    });
    window.open(`/${locale}/p/${id}`, "_blank");
  }

  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const estMin = Math.ceil(exercises.reduce((a, e) => a + (e.sets * 45 + e.restSeconds * Math.max(e.sets - 1, 0)) / 60, 0));

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={t("title")} />

        {/* pestañas (celular) */}
        <div className="md:hidden flex border-b border-surface-200 bg-white">
          {([
            { id: "lib", icon: BookOpen, label: t("library") },
            { id: "routine", icon: ListChecks, label: `${t("routine")} (${exercises.length})` },
            { id: "saved", icon: FolderOpen, label: t("saved") },
          ] as const).map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)}
              className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold",
                tab === x.id ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-500")}>
              <x.icon className="h-3.5 w-3.5" /> {x.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Biblioteca ─────────────────────────────────────────────── */}
          <div className={cn("w-full md:w-80 shrink-0 border-e border-surface-200 bg-white flex-col overflow-hidden",
            tab === "lib" ? "flex" : "hidden md:flex")}>
            <div className="px-4 pt-4 pb-3 border-b border-surface-100 space-y-2">
              <div className="hidden md:flex items-center justify-between">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{t("library")}</p>
                <Link href={`/${locale}/exercises`} className="text-[11px] font-semibold text-brand-600 hover:text-brand-700">{tr("lib_link")}</Link>
              </div>
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="ps-8 h-9 text-sm md:h-8 md:text-xs" />
              </div>
              <div className="flex gap-1.5">
                <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} aria-label={tl("allRegions")}
                  className="flex-1 min-w-0 h-8 md:h-7 rounded-lg border border-surface-200 bg-surface-50 text-xs text-surface-600 px-2 focus:outline-none">
                  <option value="">{tl("allRegions")}</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{tl(`region.${r}`)}</option>)}
                </select>
                <select value={propFilter} onChange={(e) => setPropFilter(e.target.value)} aria-label={t("equipment")}
                  className="flex-1 min-w-0 h-8 md:h-7 rounded-lg border border-surface-200 bg-surface-50 text-xs text-surface-600 px-2 focus:outline-none">
                  <option value="__all">{t("all_equipment")}</option>
                  <option value="">{prop("")}</option>
                  {PROPS.map((p) => <option key={p} value={p}>{prop(p)}</option>)}
                </select>
              </div>
              <p className="text-[11px] text-surface-400">{t("results", { n: filteredLib.length })}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredLib.map((ex) => {
                const count = exercises.filter((re) => re.id === ex.id).length;
                return (
                  <div key={ex.id}
                    className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all group",
                      justAdded === ex.id ? "bg-clinical-50 border-clinical-200" : "border-transparent hover:bg-brand-50 hover:border-brand-200")}>
                    <button onClick={() => setPreview(ex.id)} aria-label={tr("preview")}
                      className="relative h-12 w-20 md:h-11 md:w-[72px] shrink-0 overflow-hidden rounded-lg bg-surface-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ex.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <Play className="h-4 w-4 text-white opacity-80 drop-shadow" fill="currentColor" />
                      </span>
                    </button>
                    <button onClick={() => addEx(ex)} className="flex flex-1 min-w-0 items-center gap-2 text-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-surface-800 line-clamp-2 leading-snug">{name(ex.id)}</p>
                        <p className="text-[10px] text-surface-400 truncate">{prop(ex.prop)} · {t(`diff.${ex.difficulty}`)}</p>
                      </div>
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        count ? "bg-clinical-500/15 text-clinical-600" : "bg-surface-100 text-surface-400 group-hover:bg-brand-600 group-hover:text-white"
                      )}>
                        {count ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  </div>
                );
              })}
              {filteredLib.length === 0 && <p className="text-center py-8 text-xs text-surface-400">{tl("noResults")}</p>}
            </div>
            {exercises.length > 0 && (
              <button onClick={() => setTab("routine")}
                className="md:hidden m-3 h-11 rounded-xl bg-brand-600 text-sm font-semibold text-white">
                {t("see_routine", { n: exercises.length })}
              </button>
            )}
          </div>

          {/* ── Rutina (centro) ─────────────────────────────────────────── */}
          <div className={cn("flex-1 min-w-0 bg-white border-e border-surface-200 flex-col overflow-hidden",
            tab === "routine" ? "flex" : "hidden md:flex")}>
            {editId && (
              <div className="flex items-center justify-between gap-2 bg-amber-50 border-b border-amber-100 px-5 py-2 text-xs text-amber-800">
                <span>{t("editing_sent")}</span>
                <button onClick={() => { clearDraft(); setEditId(null); setExercises([]); setRoutineName(""); setInitial({ name: "", phone: "", dx: "", pid: "" }); }}
                  className="font-semibold underline">{t("start_new")}</button>
              </div>
            )}
            <div className="px-5 pt-4 pb-3 border-b border-surface-100">
              <Input value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder={t("name_ph")}
                className="text-base font-semibold border-0 border-b border-surface-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-brand-500" />
            </div>

            {exercises.length > 0 && (
              <div className="px-5 py-2 bg-surface-50 border-b border-surface-100 flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-xs text-surface-500">{t("exercises_n", { n: exercises.length })}</span>
                <span className="text-xs text-surface-500">{t("sets_n", { n: totalSets })}</span>
                <span className="text-xs text-surface-500">~{estMin} min</span>
                {!editId && (
                  <button onClick={() => setExercises([])} className="ms-auto text-xs font-medium text-surface-400 hover:text-red-600">{tr("clear")}</button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
                    <Plus className="h-7 w-7 text-surface-300" />
                  </div>
                  <p className="text-sm font-medium text-surface-500 mb-1">{t("empty")}</p>
                  <p className="text-xs text-surface-400 max-w-xs">{t("empty_hint")}</p>
                  <button onClick={() => setTab("lib")} className="md:hidden mt-4 text-sm font-semibold text-brand-600">{t("library")}</button>
                </div>
              ) : exercises.map((ex, i) => (
                <RoutineItem key={ex.uid} exercise={ex} index={i + 1}
                  onRemove={() => removeEx(ex.uid)}
                  onUpdate={(f, v) => updateEx(ex.uid, f, v)}
                  onMove={(d) => reorderEx(i, i + d)}
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

            {exercises.length > 0 && (
              <div className="shrink-0 border-t border-surface-100 p-4 flex gap-2">
                <button onClick={previewPatient}
                  className="flex-1 h-10 border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 flex items-center justify-center gap-1.5 transition-colors">
                  <Eye className="h-4 w-4" /> {t("patient_view")}
                </button>
                <button onClick={() => setSendOpen(true)}
                  className="flex-1 h-10 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-colors">
                  <Send className="h-4 w-4" /> {editId ? t("save_changes") : t("send")}
                </button>
              </div>
            )}
          </div>

          {/* ── Plantillas guardadas ───────────────────────────────────── */}
          <div className={cn("w-full md:w-64 lg:w-72 shrink-0 bg-surface-50 flex-col overflow-hidden",
            tab === "saved" ? "flex" : "hidden lg:flex")}>
            <div className="px-4 pt-4 pb-3 border-b border-surface-100 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{t("saved")}</p>
              {exercises.length > 0 && (
                <button onClick={saveTemplate} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                  <Save className="h-3.5 w-3.5" /> {t("save_current")}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {templates.length === 0 && <p className="px-1 text-xs text-surface-400">{t("saved_empty")}</p>}
              {templates.map((r) => (
                <div key={r.id} className="bg-white border border-surface-200 rounded-xl p-3 hover:border-brand-300 hover:shadow-sm transition-all">
                  <button onClick={() => loadTemplate(r)} className="w-full text-start">
                    <p className="text-sm font-semibold text-surface-900 mb-0.5 truncate">{r.name}</p>
                    <p className="text-xs text-surface-400">{t("exercises_n", { n: r.exercises.length })}</p>
                  </button>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-surface-400">{new Date(r.createdAt).toLocaleDateString(locale)}</span>
                    <button onClick={() => deleteTemplate(r.id)} aria-label={t("remove")}
                      className="p-1 rounded text-surface-300 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SendModal isOpen={sendOpen} onClose={() => setSendOpen(false)} routineName={title} exercises={exercises} initial={initial}
        editId={editId} onSaved={(id) => { clearDraft(); setEditId(id); }} />
      {preview && ITEM_BY_ID.get(preview) && (
        <LibraryPlayerModal item={ITEM_BY_ID.get(preview)!} onClose={() => setPreview(null)}
          inRoutine={exercises.some((e) => e.id === preview)}
          onToggleRoutine={() => {
            const ex = EXERCISE_LIBRARY.find((x) => x.id === preview);
            if (!ex) return;
            if (exercises.some((e) => e.id === ex.id)) setExercises((prev) => prev.filter((e) => e.id !== ex.id));
            else addEx(ex);
          }} />
      )}
    </div>
  );
}
