create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  recipient text not null,
  subject text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  triggered_by uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_logs_created_at_idx
  on public.email_logs (created_at desc);

alter table public.email_logs enable row level security;
alter table public.email_logs force row level security;

revoke all on table public.email_logs from public;
revoke all on table public.email_logs from anon;
revoke all on table public.email_logs from authenticated;
grant select, insert on table public.email_logs to authenticated;

drop policy if exists email_logs_admin_select on public.email_logs;
create policy email_logs_admin_select
  on public.email_logs
  for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists email_logs_insert_authenticated on public.email_logs;
create policy email_logs_insert_authenticated
  on public.email_logs
  for insert
  to authenticated
  with check (true);
