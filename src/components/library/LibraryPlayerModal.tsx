"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, ChevronLeft, ChevronRight, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExerciseAnimationPlayer } from "@/components/exercises/ExerciseAnimationPlayer";
import { type LibraryItem, videoUrl, regionGroup, regionColor } from "@/lib/videoLibrary";
import { useLibraryText } from "@/lib/useLibraryText";

// ─── LibraryPlayerModal ───────────────────────────────────────────────────────
// Video de la biblioteca clínica en grande, con dos vistas:
//  · Ejercicio: el movimiento tal cual lo hará el paciente (con la capa muscular de color)
//  · Anatomía: cámara que muestra los músculos que trabajan, con sus nombres en el idioma del usuario
// ─────────────────────────────────────────────────────────────────────────────

type View = "exercise" | "anatomy";

export function LibraryPlayerModal({
  item,
  initialView,
  onClose,
  onPrev,
  onNext,
  inRoutine,
  onToggleRoutine,
}: {
  item: LibraryItem;
  initialView?: View;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** si se pasa, muestra el botón para agregar/quitar la técnica de la rutina en preparación */
  inRoutine?: boolean;
  onToggleRoutine?: () => void;
}) {
  const t = useTranslations("library");
  const tr = useTranslations("rd");
  const tm = useTranslations("muscles");
  const lt = useLibraryText();
  const name = lt.name(item);
  const [view, setView] = useState<View>(initialView ?? "exercise");
  const [variant, setVariant] = useState(item.variantes[0].variante);

  useEffect(() => {
    setVariant((v) => (item.variantes.some((x) => x.variante === v) ? v : item.variantes[0].variante));
    if (!item.anatomico) setView("exercise");
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const v = item.variantes.find((x) => x.variante === variant) ?? item.variantes[0];
  const showAnat = view === "anatomy" && !!item.anatomico;
  const color = regionColor(regionGroup(item));
  const muscle = (id: string) => (tm.has(id) ? tm(id) : id.replace(/_/g, " "));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-0 sm:p-4" onClick={onClose}>
      <div
        className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[95vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={name}
      >
        {/* Cabecera */}
        <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="rounded-full px-2 py-0.5 text-white" style={{ background: color }}>
                {t(`category.${item.categoria}`)}
              </span>
              <span className="text-slate-500">{lt.region(item)}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-400">{item.id}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900">{name}</h2>
          </div>
          {onToggleRoutine && (
            <button onClick={onToggleRoutine}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                inRoutine ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-blue-600 text-white hover:bg-blue-700")}>
              {inRoutine ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="hidden sm:inline">{inRoutine ? tr("added") : tr("add")}</span>
            </button>
          )}
          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={!onPrev} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label={t("prev")}>
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button onClick={onNext} disabled={!onNext} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label={t("next")}>
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={t("close")}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video */}
        <div className="relative aspect-video w-full bg-slate-100">
          {showAnat ? (
            <ExerciseAnimationPlayer
              key={`anat-${item.id}`}
              video={videoUrl(item.anatomico!.video)}
              labels={videoUrl(item.anatomico!.etiquetas)}
              exerciseName={name}
              accentColor={color}
              fit="contain"
              className="absolute inset-0"
            />
          ) : (
            <ExerciseAnimationPlayer
              key={`ej-${item.id}-${v.variante}`}
              video={videoUrl(v.video)}
              poster={videoUrl(v.poster)}
              exerciseName={name}
              accentColor={color}
              fit="contain"
              className="absolute inset-0"
            />
          )}
        </div>

        {/* Controles y detalle */}
        <div className="space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {item.anatomico && (
              <Segmented
                value={view}
                onChange={(x) => setView(x as View)}
                options={[
                  { key: "exercise", label: t("view.exercise") },
                  { key: "anatomy", label: t("view.anatomy") },
                ]}
              />
            )}
            {item.variantes.length > 1 && view === "exercise" && (
              <Segmented
                value={variant}
                onChange={setVariant}
                options={item.variantes.map((x) => ({ key: x.variante, label: t(`variant.${x.variante}`) }))}
              />
            )}
            {item.nivel_nombre && (
              <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                {t("level", { n: item.nivel ?? 0 })} · {lt.level(item)}
              </span>
            )}
            {item.tipo && <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">{lt.type(item)}</span>}
          </div>

          <Legend />

          {item.musculos.activos.length > 0 && (
            <MuscleRow title={t("works")} dot="#ef4444" names={item.musculos.activos.map(muscle)} />
          )}
          {item.musculos.elongan.length > 0 && (
            <MuscleRow title={t("stretches")} dot="#3b82f6" names={item.musculos.elongan.map(muscle)} />
          )}
          {item.estructuras && item.estructuras.length > 0 && (
            <MuscleRow title={t("structures")} dot="#94a3b8" names={item.estructuras} />
          )}
        </div>
      </div>
    </div>
  );

  function Legend() {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <LegendDot c="#ef4444" label={t("legend.concentric")} />
        <LegendDot c="#f97316" label={t("legend.eccentric")} />
        <LegendDot c="#3b82f6" label={t("legend.stretch")} />
      </div>
    );
  }
}

function LegendDot({ c, label }: { c: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
      {label}
    </span>
  );
}

function MuscleRow({ title, dot, names }: { title: string; dot: string; names: string[] }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {[...new Set(names)].map((n) => (
          <span key={n} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (k: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            value === o.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
