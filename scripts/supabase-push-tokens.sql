create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

drop policy if exists "Usuarios pueden ver sus tokens push" on public.push_tokens;
create policy "Usuarios pueden ver sus tokens push"
on public.push_tokens
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden guardar sus tokens push" on public.push_tokens;
create policy "Usuarios pueden guardar sus tokens push"
on public.push_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Usuarios pueden actualizar sus tokens push" on public.push_tokens;
create policy "Usuarios pueden actualizar sus tokens push"
on public.push_tokens
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists push_tokens_user_id_idx
on public.push_tokens(user_id);
