alter table public.solicitudes
  drop constraint if exists solicitudes_apoyo_id_fkey;

alter table public.solicitudes
  add constraint solicitudes_apoyo_id_fkey
  foreign key (apoyo_id)
  references public.apoyos(id)
  on delete set null;
