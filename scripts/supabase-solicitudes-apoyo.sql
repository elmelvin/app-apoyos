alter table public.solicitudes
  add column if not exists apoyo_id uuid references public.apoyos(id) on delete set null,
  add column if not exists apoyo_nombre text;

create index if not exists solicitudes_apoyo_id_idx
  on public.solicitudes(apoyo_id);
