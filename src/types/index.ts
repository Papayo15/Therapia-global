import type { BodyRegion, DifficultyLevel, OsteopathyCategory, DeliveryChannel } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: "therapist" | "admin" | "student";
  plan: "free" | "professional" | "clinic" | "enterprise";
  locale: Locale;
  avatarUrl?: string;
  clinicId?: string;
  createdAt: string;
}

// ─── Exercise ─────────────────────────────────────────────────────────────────

export interface ExerciseTranslation {
  locale: Locale;
  title: string;
  description: string;
  indications: string;
  contraindications: string;
  subtitlesUrl?: string;
}

export interface Exercise {
  id: string;
  slug: string;
  durationSeconds: number;
  difficulty: DifficultyLevel;
  bodyRegions: BodyRegion[];
  muscles: string[];
  pathologies: string[];
  techniques: string[];
  videoUrl: string;
  thumbnailUrl: string;
  translations: ExerciseTranslation[];
  defaultSets: number;
  defaultReps: number;
  defaultDurationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Routine ──────────────────────────────────────────────────────────────────

export interface RoutineExercise {
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  notes?: string;
  order: number;
}

export interface Routine {
  id: string;
  therapistId: string;
  patientId?: string;
  title: string;
  diagnosisCode?: string;
  diagnosisLabel?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  therapistId: string;
  name: string;
  email?: string;
  phone?: string;
  locale: Locale;
  birthDate?: string;
  notes?: string;
  status: "active" | "inactive";
  adherenceRate?: number;
  lastActivityAt?: string;
  createdAt: string;
}

// ─── Routine Delivery ─────────────────────────────────────────────────────────

export interface RoutineDelivery {
  id: string;
  routineId: string;
  patientId: string;
  channel: DeliveryChannel;
  token: string;
  locale: Locale;
  sentAt: string;
  expiresAt?: string;
}

// ─── Exercise View (Tracking) ─────────────────────────────────────────────────

export interface ExerciseView {
  id: string;
  deliveryId: string;
  exerciseId: string;
  patientToken: string;
  viewedAt: string;
  completionPct: number;
  completed: boolean;
}

// ─── Osteopathy ───────────────────────────────────────────────────────────────

export interface OsteopathyTranslation {
  locale: Locale;
  title: string;
  clinicalExplanation: string;
  indications: string;
  contraindications: string;
  precautions: string;
  actionMechanism: string;
  subtitlesUrl?: string;
}

export interface OsteopathyTechnique {
  id: string;
  slug: string;
  category: OsteopathyCategory;
  bodyRegions: BodyRegion[];
  difficulty: DifficultyLevel;
  videoUrl: string;
  thumbnailUrl: string;
  translations: OsteopathyTranslation[];
  relatedAnatomy: string[];
  complexityLevel: 1 | 2 | 3 | 4;
  createdAt: string;
}

// ─── Anatomy ──────────────────────────────────────────────────────────────────

export interface AnatomyLayerTranslation {
  locale: Locale;
  content: string;
}

export interface AnatomyRegion {
  id: string;
  slug: BodyRegion;
  imageUrl: string;
  layers: {
    anatomy: AnatomyLayerTranslation[];
    physiology: AnatomyLayerTranslation[];
    dysfunctions: AnatomyLayerTranslation[];
    techniqueEffects: AnatomyLayerTranslation[];
    connections: AnatomyLayerTranslation[];
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  activePatients: number;
  routinesSentToday: number;
  lowAdherencePatients: number;
  totalExercisesLibrary: number;
}

export interface RecentPatient {
  id: string;
  name: string;
  avatarUrl?: string;
  lastActivity: string;
  adherenceRate: number;
  status: "active" | "inactive" | "attention";
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
