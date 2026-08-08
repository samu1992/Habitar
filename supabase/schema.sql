-- =====================================================================
-- un.studio — Panel de Obra
-- Esquema completo para Supabase (PostgreSQL)
-- Ejecutar tal cual en: Supabase Dashboard → SQL Editor → New query
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TIPOS (enums)
--    Usamos enums en vez de text + CHECK para que el tipado de
--    TypeScript generado por Supabase salga exacto.
-- ---------------------------------------------------------------------
do $$ begin
  create type service_type as enum ('Integral', 'Pintura', 'Consultoría');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('Onboarding', 'Pre-Producción', 'Producción', 'Entrega');
exception when duplicate_object then null; end $$;

do $$ begin
  create type financial_type as enum ('Ingreso', 'Egreso');
exception when duplicate_object then null; end $$;

do $$ begin
  create type logistics_category as enum ('Material', 'Contratista');
exception when duplicate_object then null; end $$;

do $$ begin
  create type logistics_status as enum ('Pendiente', 'En Curso/Comprado', 'Finalizado');
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------
-- 2. TABLA: projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null,
  phone_number  text,                       -- guardar en formato internacional: 5491122334455
  service_type  service_type   not null default 'Integral',
  status        project_status not null default 'Onboarding',
  total_budget  numeric(14,2)  not null default 0 check (total_budget >= 0),
  start_date    date,
  notes         text default '',            -- bitácora de obra (append-only desde la app)
  address       text,                       -- dirección de la obra (útil para el mapa/llegada)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.projects.notes is
  'Bitácora de obra. La app agrega entradas al inicio con formato [dd/mm HH:mm] texto, separadas por salto de línea.';


-- ---------------------------------------------------------------------
-- 3. TABLA: financials
-- ---------------------------------------------------------------------
create table if not exists public.financials (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  type        financial_type not null,
  amount      numeric(14,2) not null check (amount > 0),
  description text not null,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists financials_project_id_idx on public.financials (project_id, date desc);


-- ---------------------------------------------------------------------
-- 4. TABLA: logistics
-- ---------------------------------------------------------------------
create table if not exists public.logistics (
  id                     uuid primary key default gen_random_uuid(),
  project_id             uuid not null references public.projects(id) on delete cascade,
  category               logistics_category not null,
  item_name              text not null,
  supplier_or_worker_name text,
  expected_cost          numeric(14,2) default 0 check (expected_cost >= 0),
  real_cost              numeric(14,2) check (real_cost >= 0),
  status                 logistics_status not null default 'Pendiente',
  contact_phone          text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists logistics_project_id_idx on public.logistics (project_id, category, created_at);


-- ---------------------------------------------------------------------
-- 5. TRIGGER: updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists logistics_touch on public.logistics;
create trigger logistics_touch before update on public.logistics
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
-- 6. VISTA: project_overview
--    Precalcula lo que el Dashboard necesita para no hacer N+1 queries
--    desde el teléfono con mala señal.
-- ---------------------------------------------------------------------
create or replace view public.project_overview as
select
  p.id,
  p.client_name,
  p.phone_number,
  p.service_type,
  p.status,
  p.total_budget,
  p.start_date,
  p.address,
  coalesce(f.ingresos, 0)   as ingresos,
  coalesce(f.egresos, 0)    as egresos,
  coalesce(l.total_items, 0) as total_items,
  coalesce(l.done_items, 0)  as done_items
from public.projects p
left join lateral (
  select
    sum(amount) filter (where type = 'Ingreso') as ingresos,
    sum(amount) filter (where type = 'Egreso')  as egresos
  from public.financials where project_id = p.id
) f on true
left join lateral (
  select
    count(*)                                       as total_items,
    count(*) filter (where status = 'Finalizado')  as done_items
  from public.logistics where project_id = p.id
) l on true;


-- ---------------------------------------------------------------------
-- 7. REALTIME
--    Habilita el broadcast de cambios para que el segundo teléfono
--    vea el tilde sin recargar.
-- ---------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.financials;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.logistics;
exception when duplicate_object then null; end $$;

-- Necesario para que el payload de UPDATE incluya la fila completa.
alter table public.projects   replica identity full;
alter table public.financials replica identity full;
alter table public.logistics  replica identity full;


-- ---------------------------------------------------------------------
-- 8. RLS (Row Level Security)
--
--    IMPORTANTE — leé esto antes de desplegar.
--
--    Esta app es interna y de dos usuarios. El control de acceso está
--    en la capa de la app (middleware + código de acceso en cookie),
--    así que las policies de abajo abren la base al rol `anon`.
--    Eso alcanza para arrancar, PERO cualquiera con tu URL y tu
--    NEXT_PUBLIC_SUPABASE_ANON_KEY puede leer/escribir.
--
--    Cuando quieras cerrarlo de verdad (recomendado antes de cargar
--    datos reales de clientes): activá Supabase Auth, creá los dos
--    usuarios a mano, y reemplazá `to anon, authenticated`
--    por `to authenticated` en las tres policies.
-- ---------------------------------------------------------------------
alter table public.projects   enable row level security;
alter table public.financials enable row level security;
alter table public.logistics  enable row level security;

drop policy if exists projects_all on public.projects;
create policy projects_all on public.projects
  for all to anon, authenticated using (true) with check (true);

drop policy if exists financials_all on public.financials;
create policy financials_all on public.financials
  for all to anon, authenticated using (true) with check (true);

drop policy if exists logistics_all on public.logistics;
create policy logistics_all on public.logistics
  for all to anon, authenticated using (true) with check (true);


-- ---------------------------------------------------------------------
-- 9. SEED de prueba (borrable)
--    Comentá este bloque si no querés datos de ejemplo.
-- ---------------------------------------------------------------------
insert into public.projects (client_name, phone_number, service_type, status, total_budget, start_date, address, notes)
values
  ('Familia Rivas',  '5491122334455', 'Integral',    'Producción',    4800000, current_date - 12, 'Olivos', '[12/03 09:20] Arrancó el lijado del living.'),
  ('Depto Belgrano', '5491133445566', 'Pintura',     'Pre-Producción', 1250000, current_date + 5,  'Belgrano', ''),
  ('Estudio Paz',    '5491144556677', 'Consultoría', 'Onboarding',      380000, null,              'Palermo', '')
on conflict do nothing;
