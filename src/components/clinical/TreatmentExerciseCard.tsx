"use client";

import { Play, Minus, Plus, Trash2 } from "lucide-react";
import { ExerciseAnimationPlayer } from "@/components/exercises/ExerciseAnimationPlayer";
import exerciseRegistry from "@registry/exercises.json";

const reg = exerciseRegistry as Record<string, { video?: string; category?: string }>;

interface TreatmentExerciseCardProps {
  slug: string;
  name?: string;
  sets: number;
  reps: number;
  notes?: string;
  onChangeSets: (sets: number) => void;
  onChangeReps: (reps: number) => void;
  onChangeNotes: (notes: string) => void;
  onRemove: () => void;
  editable?: boolean;
}

export function TreatmentExerciseCard({
  slug, name, sets, reps, notes,
  onChangeSets, onChangeReps, onChangeNotes, onRemove,
  editable = true,
}: TreatmentExerciseCardProps) {
  const videoUrl = reg[slug]?.video;
  const displayName = name || slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Video thumbnail */}
      <div className="relative bg-slate-100" style={{ aspectRatio: "16/7" }}>
        <ExerciseAnimationPlayer
          video={videoUrl}
          exerciseName={displayName}
          accentColor="#3b82f6"
          className="absolute inset-0"
          autoPlay={false}
          loop={false}
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Name + remove */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{slug}</p>
          </div>
          {editable && (
            <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sets × Reps */}
        <div className="flex items-center gap-4">
          {[
            { label: "Series", value: sets, onChange: onChangeSets },
            { label: "Reps", value: reps, onChange: onChangeReps },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onChange(Math.max(1, value - 1))}
                  disabled={!editable}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-slate-800">{value}</span>
                <button
                  onClick={() => onChange(value + 1)}
                  disabled={!editable}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {(editable || notes) && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Notas clínicas</p>
            {editable ? (
              <textarea
                value={notes || ""}
                onChange={(e) => onChangeNotes(e.target.value)}
                placeholder="Indicaciones específicas, progresión..."
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              />
            ) : (
              <p className="text-xs text-slate-600">{notes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
