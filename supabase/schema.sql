-- United Aluminum customer accounts
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

-- Admin inventory (allowlist is enforced in RLS + the Next.js app)
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'enrique@hackinghr.io';
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_admin() from anon;
grant execute on function private.is_admin() to authenticated;
grant usage on schema private to authenticated;

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text,
  name text not null,
  category text,
  item_type text,
  description text,
  price numeric,
  quantity numeric,
  taxable boolean,
  as_of text,
  attributes jsonb not null default '{}'::jsonb,
  source_row integer,
  import_batch_id uuid not null,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_sku_idx on public.inventory_items (sku);
create index if not exists inventory_items_category_idx on public.inventory_items (category);
create index if not exists inventory_items_name_idx on public.inventory_items (name);
create index if not exists inventory_items_batch_idx on public.inventory_items (import_batch_id);

alter table public.inventory_items enable row level security;
alter table public.inventory_items force row level security;

revoke all on table public.inventory_items from public;
revoke all on table public.inventory_items from anon;
revoke all on table public.inventory_items from authenticated;
grant select, insert, update, delete on table public.inventory_items to authenticated;

drop policy if exists inventory_items_select_authenticated on public.inventory_items;
create policy inventory_items_select_authenticated
  on public.inventory_items
  for select
  to authenticated
  using (true);

drop policy if exists inventory_items_admin_insert on public.inventory_items;
create policy inventory_items_admin_insert
  on public.inventory_items
  for insert
  to authenticated
  with check ((select private.is_admin()));

drop policy if exists inventory_items_admin_update on public.inventory_items;
create policy inventory_items_admin_update
  on public.inventory_items
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists inventory_items_admin_delete on public.inventory_items;
create policy inventory_items_admin_delete
  on public.inventory_items
  for delete
  to authenticated
  using ((select private.is_admin()));

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
  before update on public.inventory_items
  for each row
  execute function private.set_updated_at();

create table if not exists public.inventory_uploads (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  row_count integer not null,
  import_batch_id uuid not null,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_uploads_created_at_idx
  on public.inventory_uploads (created_at desc);

alter table public.inventory_uploads enable row level security;
alter table public.inventory_uploads force row level security;

revoke all on table public.inventory_uploads from public;
revoke all on table public.inventory_uploads from anon;
revoke all on table public.inventory_uploads from authenticated;
grant select, insert on table public.inventory_uploads to authenticated;

drop policy if exists inventory_uploads_admin_select on public.inventory_uploads;
create policy inventory_uploads_admin_select
  on public.inventory_uploads
  for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists inventory_uploads_admin_insert on public.inventory_uploads;
create policy inventory_uploads_admin_insert
  on public.inventory_uploads
  for insert
  to authenticated
  with check ((select private.is_admin()));
