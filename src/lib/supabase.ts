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
  created_at: string;
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
