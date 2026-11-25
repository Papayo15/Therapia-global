-- Paridad con Wibbi + expediente editable (México: NOM-004-SSA3-2012 → el expediente se conserva; "borrar" = papelera).

-- ── Pacientes y notas: edición con fecha y borrado lógico ──
alter table public.patients   add column if not exists notes text;
alter table public.patients   add column if not exists updated_at timestamptz;
alter table public.patients   add column if not exists deleted_at timestamptz;
alter table public.soap_notes add column if not exists updated_at timestamptz;
alter table public.soap_notes add column if not exists deleted_at timestamptz;

-- historial de cambios de cada nota (versión anterior guardada al editar o borrar)
create table if not exists public.soap_note_history (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references public.soap_notes(id) on delete cascade,
  changed_at  timestamptz not null default now(),
  changed_by  uuid default auth.uid(),
  action      text not null,               -- 'update' | 'delete' | 'restore'
  previous    jsonb not null
);
alter table public.soap_note_history enable row level security;
drop policy if exists "Doctor sees own note history" on public.soap_note_history;
create policy "Doctor sees own note history" on public.soap_note_history for select to authenticated
  using (note_id in (select n.id from public.soap_notes n join public.patients p on p.id = n.patient_id where p.doctor_id = (select auth.uid())));

create or replace function public.soap_note_audit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.soap_note_history(note_id, action, previous)
  values (old.id,
          case when new.deleted_at is not null and old.deleted_at is null then 'delete'
               when new.deleted_at is null and old.deleted_at is not null then 'restore'
               else 'update' end,
          to_jsonb(old));
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists trg_soap_note_audit on public.soap_notes;
create trigger trg_soap_note_audit before update on public.soap_notes
  for each row when (old.* is distinct from new.*) execute function public.soap_note_audit();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists trg_patients_touch on public.patients;
create trigger trg_patients_touch before update on public.patients for each row execute function public.touch_updated_at();

-- ── Rutinas: ligadas al paciente, editables ──
alter table public.routine_plans add column if not exists title text;
alter table public.routine_plans add column if not exists updated_at timestamptz;
drop trigger if exists trg_routines_touch on public.routine_plans;
create trigger trg_routines_touch before update on public.routine_plans for each row execute function public.touch_updated_at();
create index if not exists idx_routine_plans_patient on public.routine_plans(patient_id, created_at desc);

-- ── Seguimiento: cada vez que el paciente completa su rutina (y cómo se sintió) ──
create table if not exists public.routine_sessions (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid not null references public.routine_plans(id) on delete cascade,
  completed_at    timestamptz not null default now(),
  exercises_done  int not null,
  exercises_total int not null,
  pain            int check (pain between 0 and 10),
  difficulty      int check (difficulty between 1 and 5),
  comment         text check (char_length(comment) <= 1000)
);
create index if not exists idx_routine_sessions_plan on public.routine_sessions(plan_id, completed_at desc);
alter table public.routine_sessions enable row level security;
drop policy if exists "Therapist reads own sessions" on public.routine_sessions;
create policy "Therapist reads own sessions" on public.routine_sessions for select to authenticated
  using (plan_id in (select id from public.routine_plans where therapist_id = (select auth.uid())));

-- el paciente (sin cuenta) registra su sesión solo con el id de su rutina vigente
create or replace function public.log_routine_session(plan_id uuid, done int, total int, pain int default null,
                                                      difficulty int default null, comment text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if not exists (select 1 from public.routine_plans r where r.id = plan_id and r.expires_at > now()) then
    raise exception 'plan not found';
  end if;
  -- máximo 20 registros por rutina y día (evita abuso)
  if (select count(*) from public.routine_sessions s where s.plan_id = log_routine_session.plan_id
        and s.completed_at > now() - interval '1 day') >= 20 then
    raise exception 'too many sessions';
  end if;
  insert into public.routine_sessions(plan_id, exercises_done, exercises_total, pain, difficulty, comment)
  values (plan_id, greatest(0, least(done, 200)), greatest(1, least(total, 200)), pain, difficulty, nullif(trim(comment), ''))
  returning id into sid;
  return sid;
end $$;
revoke all on function public.log_routine_session(uuid, int, int, int, int, text) from public;
grant execute on function public.log_routine_session(uuid, int, int, int, int, text) to anon, authenticated;

-- ── Plantillas de rutina en la nube (por terapeuta) ──
create table if not exists public.routine_templates (
  id           uuid primary key default gen_random_uuid(),
  therapist_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name         text not null,
  exercises    jsonb not null,
  created_at   timestamptz not null default now()
);
alter table public.routine_templates enable row level security;
drop policy if exists "Therapist manages own templates" on public.routine_templates;
create policy "Therapist manages own templates" on public.routine_templates for all to authenticated
  using (therapist_id = (select auth.uid())) with check (therapist_id = (select auth.uid()));

-- ── Políticas existentes: solo usuarios autenticados y con WITH CHECK explícito ──
drop policy if exists "Doctors see own patients" on public.patients;
create policy "Doctors see own patients" on public.patients for all to authenticated
  using (doctor_id = (select auth.uid())) with check (doctor_id = (select auth.uid()));
drop policy if exists "Doctor sees own notes" on public.soap_notes;
create policy "Doctor sees own notes" on public.soap_notes for all to authenticated
  using (patient_id in (select id from public.patients where doctor_id = (select auth.uid())))
  with check (patient_id in (select id from public.patients where doctor_id = (select auth.uid())));
