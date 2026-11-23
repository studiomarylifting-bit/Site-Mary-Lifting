-- STUB DE TESTE: imita só o que o Supabase fornece (auth, storage, roles).
-- Use SOMENTE em um PostgreSQL descartável e vazio. NUNCA no projeto Supabase real.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
create schema storage;
create table storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language plpgsql as $$ declare _parts text[]; begin select string_to_array(name,'/') into _parts; return _parts[1:array_length(_parts,1)-1]; end $$;
grant usage on schema storage to anon, authenticated, service_role;
grant select, insert, update, delete on storage.objects to authenticated;   -- como no Supabase
grant select on storage.buckets to authenticated, anon;
grant usage on schema public to anon, authenticated, service_role;
-- default privileges do Supabase: novas tabelas em public ficam abertas (a migration inicial revoga)
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
