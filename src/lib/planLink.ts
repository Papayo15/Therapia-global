// Link de rutina AUTOCONTENIDO: la rutina va codificada dentro del propio link (/p/r-<base64url>), así el paciente
// la abre desde WhatsApp/mail sin que haga falta una base de datos. Se usa cuando Supabase no está disponible.
import type { PlanExercise, RoutinePlan } from "@/lib/supabase";

type Compact = {
  n: string; // paciente
  d: string; // diagnóstico / nombre de la rutina
  ph: string;
  f: number;
  w: number;
  // [exercise_id, nombre, series, reps, descanso_s, nota, material]
  e: [string, string, number, number, number, string, string][];
};

function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodePlanId(p: {
  patientName: string;
  diagnosis: string;
  phase: string;
  frequency_per_week: number;
  duration_weeks: number;
  exercises: PlanExercise[];
}): string {
  const c: Compact = {
    n: p.patientName,
    d: p.diagnosis,
    ph: p.phase,
    f: p.frequency_per_week,
    w: p.duration_weeks,
    e: p.exercises.map((x) => [
      x.exercise_id,
      x.nombre_display ?? "",
      x.sets,
      x.reps,
      x.rest_seconds,
      x.note_from_therapist ?? "",
      x.equipment_used ?? "",
    ]),
  };
  return "r-" + toB64Url(JSON.stringify(c));
}

export function decodePlanId(id: string): RoutinePlan | null {
  if (!id.startsWith("r-")) return null;
  try {
    const c = JSON.parse(fromB64Url(decodeURIComponent(id.slice(2)))) as Compact;
    const exercises: PlanExercise[] = c.e.map(([exercise_id, nombre, sets, reps, rest, nota, material], i) => ({
      exercise_id,
      nombre_display: nombre,
      youtube_id: "",
      youtube_start_seconds: 0,
      sets,
      reps,
      rest_seconds: rest,
      frequency_per_week: c.f,
      equipment_used: material,
      equipment_alternative: "",
      note_from_therapist: nota,
      instructions_eli5: [],
      order: i + 1,
    }));
    return {
      id,
      therapist_id: "link",
      patient_name: c.n,
      patient_phone: "",
      diagnosis: c.d,
      plan_json: {
        meta: { diagnosis: c.d, phase: c.ph, frequency_per_week: c.f, duration_weeks: c.w },
        exercises,
      },
    } as RoutinePlan;
  } catch {
    return null;
  }
}
