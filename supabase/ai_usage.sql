-- Durable, atomic daily quota for Code Orbit's AI endpoints.
-- Run this once in the Supabase SQL editor. The Express server calls these
-- functions with the service_role key; nothing here is reachable from the
-- browser (RLS is on with no policies, and execute is revoked from anon/authenticated).
--
-- Without this file the server still works — it falls back to in-memory
-- counters that reset whenever the process restarts.

create table if not exists public.ai_usage (
  key  text    not null,            -- 'gen:user:<uuid>' or 'chat:anon:<hashed-ip>'
  day  date    not null,            -- UTC day
  hits integer not null default 0,
  primary key (key, day)
);

alter table public.ai_usage enable row level security;
-- (intentionally no policies: only the service role can read or write)

-- Atomically claim one unit of quota. Returns allowed=false (and the current
-- count) once the limit is reached — the single UPDATE below is what makes it
-- safe under concurrent requests.
create or replace function public.consume_ai_usage(p_key text, p_day date, p_limit integer)
returns table (allowed boolean, used integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_hits integer;
begin
  insert into public.ai_usage (key, day, hits) values (p_key, p_day, 0)
  on conflict (key, day) do nothing;

  update public.ai_usage
     set hits = hits + 1
   where key = p_key and day = p_day and hits < p_limit
  returning hits into new_hits;

  if new_hits is null then
    select u.hits into new_hits from public.ai_usage u where u.key = p_key and u.day = p_day;
    return query select false, new_hits;
  end if;

  return query select true, new_hits;
end;
$$;

-- Give one unit back (used when the AI provider call fails).
create or replace function public.release_ai_usage(p_key text, p_day date)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_usage set hits = greatest(hits - 1, 0) where key = p_key and day = p_day;
$$;

revoke all on function public.consume_ai_usage(text, date, integer) from public, anon, authenticated;
revoke all on function public.release_ai_usage(text, date)          from public, anon, authenticated;
grant execute on function public.consume_ai_usage(text, date, integer) to service_role;
grant execute on function public.release_ai_usage(text, date)          to service_role;

-- Optional housekeeping (run occasionally, or schedule with pg_cron):
--   delete from public.ai_usage where day < current_date - 7;
