"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ExerciseAnimationPlayer } from "@/components/exercises/ExerciseAnimationPlayer";
import { type LibraryItem, videoUrl } from "@/lib/videoLibrary";
import { useLibraryText } from "@/lib/useLibraryText";

// Video de la biblioteca clínica dentro del plan del paciente:
// el movimiento tal cual debe hacerlo y, si quiere, la vista de los músculos que trabajan.
export function PlanExerciseVideo({ item, variante }: { item: LibraryItem; variante?: string }) {
  const t = useTranslations("library");
  const lt = useLibraryText();
  const [anat, setAnat] = useState(false);
  const v = item.variantes.find((x) => x.variante === variante) ?? item.variantes[0];
  const showAnat = anat && !!item.anatomico;

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
        <ExerciseAnimationPlayer
          key={showAnat ? "anat" : v.variante}
          video={videoUrl(showAnat ? item.anatomico!.video : v.video)}
          poster={showAnat ? undefined : videoUrl(v.poster)}
          labels={showAnat ? videoUrl(item.anatomico!.etiquetas) : undefined}
          exerciseName={lt.name(item)}
          fit="contain"
          accentColor="#0ea5e9"
          className="absolute inset-0"
        />
      </div>
      {item.anatomico && (
        <div className="mt-2 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {[false, true].map((a) => (
            <button
              key={String(a)}
              onClick={() => setAnat(a)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                anat === a ? "bg-sky-500 text-white" : "text-slate-500 hover:bg-slate-50",
              )}
            >
              {t(a ? "view.anatomy" : "view.exercise")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
