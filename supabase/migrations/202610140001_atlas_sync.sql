-- Run once in a Supabase project. Clients can only write through the CAS RPC.
create table public.atlas_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null check (revision > 0),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.atlas_snapshot_versions (
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null,
  payload jsonb not null,
  updated_at timestamptz not null,
  primary key(user_id, revision)
);
alter table public.atlas_snapshots enable row level security;
alter table public.atlas_snapshot_versions enable row level security;
create policy own_snapshot on public.atlas_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy own_snapshot_versions on public.atlas_snapshot_versions for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.atlas_snapshots, public.atlas_snapshot_versions from anon, authenticated;
grant select on public.atlas_snapshots, public.atlas_snapshot_versions to authenticated;

create function public.save_atlas_snapshot(expected_user uuid, expected_revision bigint, next_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  saved public.atlas_snapshots;
begin
  if owner_id is null or expected_user is null or owner_id <> expected_user then raise exception 'Account changed or unauthenticated' using errcode = '42501'; end if;
  if expected_revision < 0 or expected_revision is null then raise exception 'Invalid revision'; end if;
  if next_payload is null or next_payload->>'app' is distinct from 'atlas'
     or next_payload->>'version' is distinct from '3'
     or octet_length(next_payload::text) > 600000 then raise exception 'Invalid or oversized snapshot'; end if;
  if expected_revision = 0 then
    insert into public.atlas_snapshots(user_id, revision, payload) values(owner_id, 1, next_payload)
    on conflict (user_id) do nothing returning * into saved;
  else
    update public.atlas_snapshots set revision = revision + 1, payload = next_payload, updated_at = now()
    where user_id = owner_id and revision = expected_revision returning * into saved;
  end if;
  if saved.user_id is null then return jsonb_build_object('conflict', true); end if;
  insert into public.atlas_snapshot_versions values(saved.user_id, saved.revision, saved.payload, saved.updated_at);
  delete from public.atlas_snapshot_versions where user_id = owner_id and revision <= saved.revision - 20;
  return jsonb_build_object('conflict', false, 'row', jsonb_build_object('revision', saved.revision, 'payload', saved.payload, 'updated_at', saved.updated_at));
end;
$$;
revoke all on function public.save_atlas_snapshot(uuid, bigint, jsonb) from public, anon;
grant execute on function public.save_atlas_snapshot(uuid, bigint, jsonb) to authenticated;
