import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Patient {
  id: string;
  name: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  email?: string;
  doctor_id: string;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface SoapNote {
  id: string;
  patient_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  diagnosis: string;
  plan: string;
  doctor: string;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

/** Sesión completada por el paciente (seguimiento de adherencia) */
export interface RoutineSession {
  id: string;
  plan_id: string;
  completed_at: string;
  exercises_done: number;
  exercises_total: number;
  pain: number | null;
  difficulty: number | null;
  comment: string | null;
}

/** Rutina enviada (fila de routine_plans vista por el terapeuta) */
export interface RoutineRow {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string | null;
  diagnosis: string | null;
  title: string | null;
  plan_json: { meta: RoutinePlan["plan_json"]["meta"]; exercises: PlanExercise[] };
  created_at: string;
  updated_at: string | null;
  expires_at: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  soap_id?: string;
  diagnosis: string;
  ai_summary?: string;
  created_at: string;
  treatment_exercises?: TreatmentExercise[];
}

export interface TreatmentExercise {
  id: string;
  treatment_id: string;
  exercise_slug: string;
  sets?: number;
  reps?: number;
  notes?: string;
}

// ── Prescription Builder — Routine Plans ─────────────────────────────────────

export interface PlanExercise {
  exercise_id: string;
  nombre_display: string;
  youtube_id: string;
  youtube_start_seconds: number;
  sets: number;
  reps: number;
  rest_seconds: number;
  frequency_per_week: number;
  equipment_used: string;
  equipment_alternative: string;
  note_from_therapist: string;
  instructions_eli5: string[];
  order: number;
  /** variante del video de la biblioteca clínica (gym / casa / ambos) */
  variante?: string;
}

export interface RoutinePlan {
  id: string;
  therapist_id: string;
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  diagnosis: string;
  plan_json: {
    meta: {
      diagnosis: string;
      phase: string;
      frequency_per_week: number;
      duration_weeks: number;
    };
    exercises: PlanExercise[];
  };
  created_at: string;
  expires_at: string;
}
