-- Rutinas enviadas a pacientes. Cada terapeuta ve/crea solo las suyas; el paciente abre la suya por el id del link
-- mediante una función (no hay lectura pública de la tabla: nadie puede listar rutinas ajenas).
create table if not exists public.routine_plans (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  patient_id    uuid references public.patients(id) on delete set null,
  patient_name  text not null,
  patient_phone text,
  diagnosis     text,
  plan_json     jsonb not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '180 days'
);
create index if not exists idx_routine_plans_therapist on public.routine_plans(therapist_id, created_at desc);
alter table public.routine_plans enable row level security;
drop policy if exists "Therapist manages own routines" on public.routine_plans;
create policy "Therapist manages own routines" on public.routine_plans
  for all to authenticated using (therapist_id = (select auth.uid())) with check (therapist_id = (select auth.uid()));

-- lectura para el paciente: solo con el id exacto, sin teléfono ni ids internos
create or replace function public.get_routine_plan(plan_id uuid)
returns table (id uuid, patient_name text, diagnosis text, plan_json jsonb, created_at timestamptz, expires_at timestamptz)
language sql security definer set search_path = public stable as $$
  select r.id, r.patient_name, r.diagnosis, r.plan_json, r.created_at, r.expires_at
  from public.routine_plans r where r.id = plan_id and r.expires_at > now();
$$;
revoke all on function public.get_routine_plan(uuid) from public;
grant execute on function public.get_routine_plan(uuid) to anon, authenticated;

-- los pacientes los crea el terapeuta autenticado: doctor_id por defecto = él mismo
alter table public.patients alter column doctor_id set default auth.uid();
