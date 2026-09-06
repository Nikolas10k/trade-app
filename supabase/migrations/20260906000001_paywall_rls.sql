-- Reforço de defesa em profundidade para o paywall (Fase 6): o guard
-- server-side (getAccessState / saveTradeAction) já bloqueia a escrita no
-- app, mas isso sozinho não impede alguém com uma sessão válida de escrever
-- em `trades` chamando a API do Supabase diretamente, sem passar pelo
-- Next.js. Esta policy faz o mesmo bloqueio valer no banco.
--
-- IMPORTANTE: a regra abaixo espelha lib/auth/access.ts (computeAccessState).
-- Qualquer mudança na regra de acesso precisa ser replicada nos dois lugares.

create or replace function public.has_write_access(check_user_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select
    not coalesce((select is_suspended from public.profiles where id = check_user_id), true)
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = check_user_id
        and (
          (s.status = 'trial' and s.trial_ends_at is not null and now() <= s.trial_ends_at)
          or (s.status = 'active' and s.current_period_end is not null and now() <= s.current_period_end)
          or (s.comp_until is not null and now() <= s.comp_until)
        )
    );
$$;

grant execute on function public.has_write_access(uuid) to authenticated;

drop policy trades_insert_own on public.trades;
create policy trades_insert_own on public.trades
  for insert with check (auth.uid() = user_id and public.has_write_access(user_id));

drop policy trades_update_own on public.trades;
create policy trades_update_own on public.trades
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id and public.has_write_access(user_id));
