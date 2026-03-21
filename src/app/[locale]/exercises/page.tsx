"use client";

import { useState, useMemo } from "react";
import { Search, Play, Dumbbell, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExercisePlayer, type ExerciseData } from "@/components/exercises/ExercisePlayer";
import masterRegistry from "../../../../data/master-registry.json";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Canal = "A" | "B" | "all";

interface RegistryEntry {
  id: string;
  canal: string;
  canal_label: string;
  tipo_osteopatia: string | null;
  grupo_articular: string;
  grupo_label: string;
  nombre_es: string;
  nombre_en: string;
  equipo: string[];
  difficulty: string;
  ejecucion_tecnica: string;
  fisiologia_basica: string;
  pasos: string[];
  visual_pixar: string;
  video_url: string;
  cloudflare_id: string;
}

const ALL_ENTRIES = Object.values(masterRegistry) as RegistryEntry[];

// ─── Constants ─────────────────────────────────────────────────────────────────
const GRUPOS = [
  { key: "cervical",    label: "Cervical" },
  { key: "toracica",   label: "Torácica" },
  { key: "lumbar",     label: "Lumbar" },
  { key: "sacroiliaca",label: "Sacroilíaca" },
  { key: "atm",        label: "ATM" },
  { key: "hombro",     label: "Hombro" },
  { key: "codo",       label: "Codo" },
  { key: "muneca",     label: "Muñeca" },
  { key: "cadera",     label: "Cadera" },
  { key: "rodilla",    label: "Rodilla" },
  { key: "tobillo",    label: "Tobillo" },
  { key: "pie",        label: "Pie" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced:     "bg-orange-100 text-orange-700",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Básico", intermediate: "Intermedio", advanced: "Avanzado",
};

const GRUPO_COLORS: Record<string, string> = {
  cervical: "#8b5cf6", toracica: "#06b6d4", lumbar: "#f59e0b",
  sacroiliaca: "#ec4899", atm: "#14b8a6", hombro: "#3b82f6",
  codo: "#f97316", muneca: "#ef4444", cadera: "#a855f7",
  rodilla: "#10b981", tobillo: "#0ea5e9", pie: "#84cc16",
};

// ─── Convert registry entry → ExerciseData ─────────────────────────────────────
function toExerciseData(entry: RegistryEntry): ExerciseData {
  return {
    id: entry.id,
    name: entry.nombre_en,
    nameLocal: entry.nombre_es,
    region: entry.grupo_label,
    difficulty: (entry.difficulty as ExerciseData["difficulty"]) ?? "beginner",
    musclesWorked: entry.equipo,
    steps: entry.pasos,
    videoSrc: entry.cloudflare_id
      ? `https://watch.videodelivery.net/${entry.cloudflare_id}`
      : entry.video_url || undefined,
    canal: entry.canal as "A" | "B",
    grupo_articular: entry.grupo_articular,
    equipo: entry.equipo,
    ejecucion_tecnica: entry.ejecucion_tecnica,
    fisiologia_basica: entry.fisiologia_basica,
    pasos: entry.pasos,
  };
}

// ─── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ entry, onClick }: { entry: RegistryEntry; onClick: () => void }) {
  const color = GRUPO_COLORS[entry.grupo_articular] ?? "#3b82f6";
  const hasVideo = !!(entry.cloudflare_id || entry.video_url);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Video thumbnail area */}
      <div
        className="relative h-36 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/60 shadow-sm group-hover:scale-110 transition-transform"
          style={{ background: `${color}30` }}
        >
          {hasVideo ? (
            <Play className="h-6 w-6" style={{ color }} />
          ) : (
            <Dumbbell className="h-6 w-6" style={{ color }} />
          )}
        </div>

        {/* Canal badge */}
        <span
          className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: color }}
        >
          {entry.canal === "A" ? "Activo" : entry.tipo_osteopatia ?? "Osteopatía"}
        </span>

        {/* Difficulty badge */}
        <span className={cn(
          "absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full",
          DIFFICULTY_COLORS[entry.difficulty] ?? "bg-slate-100 text-slate-600"
        )}>
          {DIFFICULTY_LABEL[entry.difficulty] ?? entry.difficulty}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
          {entry.nombre_es}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.equipo.slice(0, 2).map((eq) => (
            <span key={eq} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
              {eq}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExercisesPage() {
  const [canal, setCanal] = useState<Canal>("all");
  const [grupo, setGrupo] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [playerExercise, setPlayerExercise] = useState<ExerciseData | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);

  const filtered = useMemo(() => {
    return ALL_ENTRIES.filter((e) => {
      if (canal !== "all" && e.canal !== canal) return false;
      if (grupo !== "all" && e.grupo_articular !== grupo) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.nombre_es.toLowerCase().includes(q) ||
          e.nombre_en.toLowerCase().includes(q) ||
          e.grupo_label.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [canal, grupo, search]);

  function openPlayer(index: number) {
    setPlayerIndex(index);
    setPlayerExercise(toExerciseData(filtered[index]));
  }

  function closePlayer() {
    setPlayerExercise(null);
  }

  const countA = ALL_ENTRIES.filter((e) => e.canal === "A").length;
  const countB = ALL_ENTRIES.filter((e) => e.canal === "B").length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* ── Page header ───────────────────────────────────────────── */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Biblioteca de Técnicas</h1>
              <p className="text-slate-500 mt-1">
                {ALL_ENTRIES.length} técnicas · {countA} ejercicios activos · {countB} osteopatía
              </p>
            </div>

            {/* ── Canal tabs ────────────────────────────────────────────── */}
            <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit">
              {[
                { key: "all", label: "Todos" },
                { key: "A",   label: `Canal A — Activo (${countA})` },
                { key: "B",   label: `Canal B — Osteopatía (${countB})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setCanal(key as Canal); setGrupo("all"); }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    canal === key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Filters row ───────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar técnica..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white border-slate-200"
                />
              </div>

              {/* Grupo articular */}
              <div className="relative">
                <select
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los grupos</option>
                  {GRUPOS.map((g) => (
                    <option key={g.key} value={g.key}>{g.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* ── Joint group pills ─────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setGrupo("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  grupo === "all"
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                Todos
              </button>
              {GRUPOS.map((g) => {
                const count = ALL_ENTRIES.filter(
                  (e) => e.grupo_articular === g.key && (canal === "all" || e.canal === canal)
                ).length;
                const color = GRUPO_COLORS[g.key];
                return (
                  <button
                    key={g.key}
                    onClick={() => setGrupo(g.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      grupo === g.key
                        ? "text-white border-transparent"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                    style={grupo === g.key ? { background: color, borderColor: color } : {}}
                  >
                    {g.label} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* ── Results count ─────────────────────────────────────────── */}
            <p className="text-sm text-slate-500">
              {filtered.length} técnicas
              {grupo !== "all" && ` · ${GRUPOS.find(g => g.key === grupo)?.label}`}
            </p>

            {/* ── Grid ──────────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Sin resultados</p>
                <p className="text-sm mt-1">Prueba con otro filtro o búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filtered.map((entry, idx) => (
                  <ExerciseCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => openPlayer(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Player modal ──────────────────────────────────────────────────── */}
      {playerExercise && (
        <ExercisePlayer
          exercise={playerExercise}
          isOpen={!!playerExercise}
          onClose={closePlayer}
          hasPrev={playerIndex > 0}
          hasNext={playerIndex < filtered.length - 1}
          onPrev={() => openPlayer(playerIndex - 1)}
          onNext={() => openPlayer(playerIndex + 1)}
        />
      )}
    </div>
  );
}
