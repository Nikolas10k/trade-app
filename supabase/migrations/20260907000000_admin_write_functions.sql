-- Escritas administrativas (extensão de trial, cortesia, suspensão) como
-- funções atômicas: a mudança de estado e o registro em audit_log acontecem
-- na mesma transação implícita da função — nunca dois passos separados que
-- possam ficar inconsistentes entre si (S6 / 9.14: "grava auditoria
-- atomicamente"). Só o service_role pode chamar; nunca anon/authenticated.

create or replace function public.admin_extend_trial(target_user_id uuid, extend_days integer, actor_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  current_end timestamptz;
  new_end timestamptz;
begin
  select trial_ends_at into current_end from public.subscriptions where user_id = target_user_id;
  new_end := greatest(coalesce(current_end, now()), now()) + (extend_days || ' days')::interval;

  update public.subscriptions set trial_ends_at = new_end where user_id = target_user_id;

  insert into public.audit_log (actor_id, user_id, action, metadata)
  values (actor_id, target_user_id, 'admin_extend_trial', jsonb_build_object('days', extend_days));
end;
$$;

create or replace function public.admin_grant_comp(target_user_id uuid, comp_days integer, actor_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  current_comp timestamptz;
  new_comp timestamptz;
begin
  select comp_until into current_comp from public.subscriptions where user_id = target_user_id;
  new_comp := greatest(coalesce(current_comp, now()), now()) + (comp_days || ' days')::interval;

  update public.subscriptions set comp_until = new_comp where user_id = target_user_id;

  insert into public.audit_log (actor_id, user_id, action, metadata)
  values (actor_id, target_user_id, 'admin_grant_comp', jsonb_build_object('days', comp_days));
end;
$$;

create or replace function public.admin_set_suspended(target_user_id uuid, suspended boolean, actor_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set is_suspended = suspended where id = target_user_id;

  insert into public.audit_log (actor_id, user_id, action, metadata)
  values (
    actor_id,
    target_user_id,
    case when suspended then 'admin_suspend' else 'admin_reactivate' end,
    '{}'::jsonb
  );
end;
$$;

revoke all on function public.admin_extend_trial(uuid, integer, uuid) from public;
revoke all on function public.admin_grant_comp(uuid, integer, uuid) from public;
revoke all on function public.admin_set_suspended(uuid, boolean, uuid) from public;

grant execute on function public.admin_extend_trial(uuid, integer, uuid) to service_role;
grant execute on function public.admin_grant_comp(uuid, integer, uuid) to service_role;
grant execute on function public.admin_set_suspended(uuid, boolean, uuid) to service_role;
