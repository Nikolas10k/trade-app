-- Diário de Trades XAU/USD — schema inicial, RLS e provisionamento de conta.
-- Convenções: uuid para ids, numeric para dinheiro/preço, timestamptz (UTC) para tempo.
-- Toda tabela de dado de usuário tem RLS ligada com policy de dono (Seção 9.4 / S2).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  timezone       text        not null default 'America/Sao_Paulo',
  language       text        not null default 'pt-BR',
  risk_limit_pct numeric(5,2) not null default 1.50,
  is_suspended   boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.instruments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  symbol     text not null,
  pip_value  numeric(10,5) not null default 0.10,
  created_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create table public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  status             text not null default 'trial'
                       check (status in ('trial', 'active', 'past_due', 'canceled')),
  plan               text check (plan in ('mensal', 'trimestral', 'anual')),
  trial_ends_at      timestamptz,
  current_period_end timestamptz,
  comp_until         timestamptz,
  mp_preapproval_id  text,
  mp_payer_id        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index subscriptions_mp_preapproval_id_idx
  on public.subscriptions (mp_preapproval_id)
  where mp_preapproval_id is not null;

create table public.trades (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  traded_at        timestamptz  not null,
  symbol           text         not null default 'XAU/USD',
  account_balance  numeric(14,2) not null,
  entry_price      numeric(14,5) not null,
  stop_price       numeric(14,5) not null,
  ref_channel_pips integer,
  lot_size         numeric(10,2) not null,
  target_pct       numeric(5,2),
  exit_type        text         not null check (exit_type in ('parcial', '0x0', 'cheio', 'loss')),
  result_total     numeric(14,2) not null,
  pip_value        numeric(10,5) not null,
  checklist        jsonb        not null default '{}'::jsonb,
  discipline_score numeric(5,2),
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now(),
  constraint trades_target_pct_required check (exit_type = 'loss' or target_pct is not null)
);
create index trades_user_traded_idx on public.trades (user_id, traded_at desc);

create table public.screen_time_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  logged_date date not null,
  hours       numeric(5,2) not null check (hours >= 0),
  created_at  timestamptz not null default now()
);
create index screen_time_user_date_idx on public.screen_time_logs (user_id, logged_date desc);

create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users(id) on delete set null,
  user_id    uuid references auth.users(id) on delete set null,
  action     text not null,
  metadata   jsonb,
  ip         inet,
  created_at timestamptz not null default now()
);

create table public.app_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Idempotência de webhooks de pagamento (Mercado Pago): cada notificação processada
-- fica registrada aqui antes de qualquer efeito colateral em `subscriptions`, para que
-- um reenvio do mesmo evento (comum na prática do provedor) seja um no-op.
create table public.payment_events (
  id              text primary key,
  event_type      text not null,
  preapproval_id  text,
  received_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger trades_set_updated_at before update on public.trades
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.instruments      enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.trades           enable row level security;
alter table public.screen_time_logs enable row level security;
alter table public.audit_log        enable row level security;
alter table public.app_admins       enable row level security;  -- sem policy: só service role
alter table public.payment_events   enable row level security;  -- sem policy: só service role

-- profiles: dono lê e atualiza (colunas restritas via GRANT abaixo — is_suspended
-- é controlado só por endpoints admin com service role).
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- instruments: dono faz tudo.
create policy instruments_all_own on public.instruments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- subscriptions: dono só lê; toda escrita é feita pelo webhook/admin via service role.
create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);

-- trades: dono faz tudo. Nenhuma policy admin é criada aqui — o dono da aplicação
-- não tem acesso ao conteúdo dos trades (Seção 10 / 0.2).
create policy trades_select_own on public.trades
  for select using (auth.uid() = user_id);
create policy trades_insert_own on public.trades
  for insert with check (auth.uid() = user_id);
create policy trades_update_own on public.trades
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy trades_delete_own on public.trades
  for delete using (auth.uid() = user_id);

-- screen_time_logs: dono faz tudo.
create policy stl_all_own on public.screen_time_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- audit_log: usuário comum não lê nem escreve (só service role e, para leitura, admin).

-- ---------------------------------------------------------------------------
-- Papel de admin (S6)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.app_admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

-- Leitura admin: apenas conta / assinatura / auditoria. Nunca trades.
-- Policies permissivas combinam por OR com as de dono já criadas acima.
create policy profiles_select_admin      on public.profiles      for select using (public.is_admin());
create policy subscriptions_select_admin on public.subscriptions for select using (public.is_admin());
create policy audit_select_admin         on public.audit_log     for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants (mínimo privilégio; explícitos para não depender de defaults da plataforma)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name, timezone, language, risk_limit_pct) on public.profiles to authenticated;

grant select, insert, update, delete on public.instruments to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.trades to authenticated;
grant select, insert, update, delete on public.screen_time_logs to authenticated;
grant select on public.audit_log to authenticated;

grant all on public.profiles, public.instruments, public.subscriptions, public.trades,
  public.screen_time_logs, public.audit_log, public.app_admins, public.payment_events
  to service_role;

-- ---------------------------------------------------------------------------
-- Provisionamento no cadastro (S5)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  insert into public.subscriptions (user_id, status, trial_ends_at)
    values (new.id, 'trial', now() + interval '3 days');
  insert into public.instruments (user_id, symbol, pip_value)
    values (new.id, 'XAU/USD', 0.10);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
