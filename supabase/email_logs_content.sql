alter table public.email_logs add column if not exists html text;
alter table public.email_logs add column if not exists text_body text;
alter table public.email_logs add column if not exists provider_id text;

create unique index if not exists email_logs_provider_id_idx
  on public.email_logs (provider_id)
  where provider_id is not null;

grant update on table public.email_logs to authenticated;

drop policy if exists email_logs_admin_update on public.email_logs;
create policy email_logs_admin_update
  on public.email_logs
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
