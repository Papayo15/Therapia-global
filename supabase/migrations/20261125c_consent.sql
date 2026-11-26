-- Consentimiento informado del paciente para el tratamiento de sus datos de salud (LFPDPPP, datos sensibles).
alter table public.patients add column if not exists consent_at timestamptz;
