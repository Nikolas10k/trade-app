-- Shim de teste local — NÃO é executado contra o Supabase real.
--
-- Reproduz o mínimo que o Supabase já fornece de fábrica (schema `auth`,
-- roles `anon`/`authenticated`/`service_role`, função `auth.uid()`) para que
-- as migrations de produção em /supabase/migrations rodem sem alteração
-- num Postgres comum e permitam testar RLS/isolamento de tenant sem Docker.

create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

-- No Supabase real, auth.uid() lê o claim "sub" do JWT da requisição via a
-- GUC "request.jwt.claim.sub". Reproduzimos o mesmo contrato aqui; os testes
-- simulam um usuário autenticado com `set local request.jwt.claim.sub = '...'`.
create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

-- No Supabase real, quem apaga de auth.users é o serviço de autenticação
-- (GoTrue) via sua própria credencial interna, não a role "service_role" do
-- PostgREST. Aqui simplificamos: service_role também representa esse
-- back-end privilegiado, só para testar que os ON DELETE CASCADE/SET NULL
-- do nosso schema funcionam quando um usuário deixa de existir.
grant usage on schema auth to service_role;
grant select, insert, update, delete on auth.users to service_role;
