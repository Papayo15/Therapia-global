-- ============================================================
-- THERAPIA GLOBAL — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Tabla principal de planes de rehabilitación
CREATE TABLE IF NOT EXISTS routine_plans (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id TEXT        NOT NULL DEFAULT 'demo-therapist',
  patient_id   TEXT,
  patient_name TEXT        NOT NULL,
  patient_phone TEXT,
  diagnosis    TEXT,
  plan_json    JSONB       NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_routine_plans_therapist ON routine_plans(therapist_id);
CREATE INDEX IF NOT EXISTS idx_routine_plans_expires   ON routine_plans(expires_at);
CREATE INDEX IF NOT EXISTS idx_routine_plans_created   ON routine_plans(created_at DESC);

-- Row Level Security
ALTER TABLE routine_plans ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer un plan por su ID (para el link del paciente)
CREATE POLICY "public_read_by_id"
  ON routine_plans FOR SELECT USING (true);

-- Cualquiera puede crear planes (autenticación a futuro)
CREATE POLICY "anon_insert"
  ON routine_plans FOR INSERT WITH CHECK (true);

-- ============================================================
-- Verificación rápida
-- ============================================================
-- SELECT COUNT(*) FROM routine_plans;  -- debe retornar 0 (tabla vacía)
