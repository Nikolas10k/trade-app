import { beforeAll, describe, expect, it } from "vitest";
import {
  asAnon,
  asServiceRole,
  asUser,
  createTestUser,
  ensureSchema,
  withFixtureSetup,
} from "./harness";

beforeAll(async () => {
  await ensureSchema();
}, 30_000);

describe("isolamento de tenant", () => {
  it("profiles: dono lê e atualiza o próprio perfil, não vê o de outro", async () => {
    const alice = await createTestUser("alice@example.com");
    const bob = await createTestUser("bob@example.com");

    const aliceOwnRow = await asUser(alice, (c) =>
      c.query("select id from public.profiles where id = $1", [alice]),
    );
    expect(aliceOwnRow.rows).toHaveLength(1);

    const aliceSeesBob = await asUser(alice, (c) =>
      c.query("select id from public.profiles where id = $1", [bob]),
    );
    expect(aliceSeesBob.rows).toHaveLength(0);

    const update = await asUser(alice, (c) =>
      c.query("update public.profiles set display_name = 'Alice' where id = $1 returning display_name", [
        alice,
      ]),
    );
    expect(update.rows[0].display_name).toBe("Alice");
  });

  it("profiles: dono não consegue elevar is_suspended via update direto (grant de coluna)", async () => {
    const carol = await createTestUser("carol@example.com");
    await expect(
      asUser(carol, (c) =>
        c.query("update public.profiles set is_suspended = true where id = $1", [carol]),
      ),
    ).rejects.toThrow(/permission denied/i);
  });

  it("instruments: dono faz CRUD, não enxerga instrumentos de outro usuário", async () => {
    const alice = await createTestUser("alice-i@example.com");
    const bob = await createTestUser("bob-i@example.com");

    const own = await asUser(alice, (c) =>
      c.query("select symbol from public.instruments where user_id = $1", [alice]),
    );
    expect(own.rows.map((r) => r.symbol)).toContain("XAU/USD");

    const crossTenant = await asUser(alice, (c) =>
      c.query("select id from public.instruments where user_id = $1", [bob]),
    );
    expect(crossTenant.rows).toHaveLength(0);

    const update = await asUser(bob, (c) =>
      c.query(
        "update public.instruments set pip_value = 0.01 where user_id = $1 and symbol = 'XAU/USD' returning pip_value",
        [alice],
      ),
    );
    expect(update.rows).toHaveLength(0);
  });

  it("subscriptions: dono só lê a própria; escrita direta é negada mesmo na própria linha", async () => {
    const alice = await createTestUser("alice-s@example.com");
    const bob = await createTestUser("bob-s@example.com");

    const own = await asUser(alice, (c) =>
      c.query("select status from public.subscriptions where user_id = $1", [alice]),
    );
    expect(own.rows[0].status).toBe("trial");

    const crossTenant = await asUser(alice, (c) =>
      c.query("select id from public.subscriptions where user_id = $1", [bob]),
    );
    expect(crossTenant.rows).toHaveLength(0);

    await expect(
      asUser(alice, (c) =>
        c.query("update public.subscriptions set status = 'active' where user_id = $1", [alice]),
      ),
    ).rejects.toThrow(/permission denied/i);
  });

  it("trades: dono faz CRUD completo; outro usuário não lê, atualiza nem apaga", async () => {
    const alice = await createTestUser("alice-t@example.com");
    const bob = await createTestUser("bob-t@example.com");

    const insert = await asUser(alice, (c) =>
      c.query(
        `insert into public.trades
           (user_id, traded_at, account_balance, entry_price, stop_price, lot_size, exit_type, result_total, pip_value)
         values ($1, now(), 10000, 2345.60, 2343.10, 0.10, 'loss', -50, 0.10)
         returning id`,
        [alice],
      ),
    );
    const tradeId = insert.rows[0].id;

    const bobReadsAlice = await asUser(bob, (c) =>
      c.query("select id from public.trades where id = $1", [tradeId]),
    );
    expect(bobReadsAlice.rows).toHaveLength(0);

    const bobUpdatesAlice = await asUser(bob, (c) =>
      c.query("update public.trades set result_total = 999 where id = $1 returning id", [tradeId]),
    );
    expect(bobUpdatesAlice.rows).toHaveLength(0);

    const bobDeletesAlice = await asUser(bob, (c) =>
      c.query("delete from public.trades where id = $1 returning id", [tradeId]),
    );
    expect(bobDeletesAlice.rows).toHaveLength(0);

    // Tentar inserir um trade para outro usuário (spoofing de tenant) é bloqueado.
    await expect(
      asUser(bob, (c) =>
        c.query(
          `insert into public.trades
             (user_id, traded_at, account_balance, entry_price, stop_price, lot_size, exit_type, result_total, pip_value)
           values ($1, now(), 10000, 2345.60, 2343.10, 0.10, 'loss', -50, 0.10)`,
          [alice],
        ),
      ),
    ).rejects.toThrow(/row-level security/i);

    const ownRead = await asUser(alice, (c) =>
      c.query("select result_total from public.trades where id = $1", [tradeId]),
    );
    expect(Number(ownRead.rows[0].result_total)).toBe(-50);
  });

  it("screen_time_logs: isolado por dono", async () => {
    const alice = await createTestUser("alice-stl@example.com");
    const bob = await createTestUser("bob-stl@example.com");

    await asUser(alice, (c) =>
      c.query("insert into public.screen_time_logs (user_id, logged_date, hours) values ($1, current_date, 2)", [
        alice,
      ]),
    );

    const bobSeesAlice = await asUser(bob, (c) =>
      c.query("select id from public.screen_time_logs where user_id = $1", [alice]),
    );
    expect(bobSeesAlice.rows).toHaveLength(0);
  });

  it("anon: não acessa nenhuma tabela de usuário", async () => {
    await expect(asAnon((c) => c.query("select * from public.trades limit 1"))).rejects.toThrow(
      /permission denied/i,
    );
    await expect(asAnon((c) => c.query("select * from public.profiles limit 1"))).rejects.toThrow(
      /permission denied/i,
    );
  });

  it("app_admins e payment_events: authenticated não tem grant algum", async () => {
    const alice = await createTestUser("alice-admins@example.com");
    await expect(
      asUser(alice, (c) => c.query("select * from public.app_admins")),
    ).rejects.toThrow(/permission denied/i);
    await expect(
      asUser(alice, (c) => c.query("select * from public.payment_events")),
    ).rejects.toThrow(/permission denied/i);
  });
});

describe("authz de admin", () => {
  async function promoteToAdmin(userId: string) {
    await asServiceRole((c) =>
      c.query("insert into public.app_admins (user_id) values ($1)", [userId]),
    );
  }

  it("não-admin não vê profiles/subscriptions/audit_log de outros usuários", async () => {
    const trader = await createTestUser("trader-authz@example.com");
    const other = await createTestUser("other-authz@example.com");

    const seesOtherProfile = await asUser(trader, (c) =>
      c.query("select id from public.profiles where id = $1", [other]),
    );
    expect(seesOtherProfile.rows).toHaveLength(0);

    const seesAudit = await asUser(trader, (c) => c.query("select * from public.audit_log"));
    expect(seesAudit.rows).toHaveLength(0);
  });

  it("admin lê profiles/subscriptions/audit_log de qualquer usuário, mas NUNCA trades", async () => {
    const admin = await createTestUser("admin-authz@example.com");
    const trader = await createTestUser("trader-authz-2@example.com");
    await promoteToAdmin(admin);

    await asUser(trader, (c) =>
      c.query(
        `insert into public.trades
           (user_id, traded_at, account_balance, entry_price, stop_price, lot_size, exit_type, result_total, pip_value)
         values ($1, now(), 10000, 2345.60, 2343.10, 0.10, 'loss', -50, 0.10)`,
        [trader],
      ),
    );
    await asServiceRole((c) =>
      c.query("insert into public.audit_log (actor_id, user_id, action) values ($1, $1, 'login')", [
        trader,
      ]),
    );

    const adminSeesProfile = await asUser(admin, (c) =>
      c.query("select id from public.profiles where id = $1", [trader]),
    );
    expect(adminSeesProfile.rows).toHaveLength(1);

    const adminSeesSubscription = await asUser(admin, (c) =>
      c.query("select user_id from public.subscriptions where user_id = $1", [trader]),
    );
    expect(adminSeesSubscription.rows).toHaveLength(1);

    const adminSeesAudit = await asUser(admin, (c) =>
      c.query("select id from public.audit_log where user_id = $1", [trader]),
    );
    expect(adminSeesAudit.rows).toHaveLength(1);

    const adminSeesTrades = await asUser(admin, (c) =>
      c.query("select id from public.trades where user_id = $1", [trader]),
    );
    expect(adminSeesTrades.rows).toHaveLength(0);
  });

  it("não existe caminho de auto-promoção a admin (authenticated não escreve em app_admins)", async () => {
    const trader = await createTestUser("self-promote@example.com");
    await expect(
      asUser(trader, (c) =>
        c.query("insert into public.app_admins (user_id) values ($1)", [trader]),
      ),
    ).rejects.toThrow(/permission denied/i);
  });

  it("public.trades tem só as 4 policies de dono — nenhuma policy admin", async () => {
    const rows = await withFixtureSetup((c) =>
      c.query("select policyname from pg_policies where schemaname = 'public' and tablename = 'trades'"),
    );
    const names = rows.rows.map((r) => r.policyname).sort();
    expect(names).toEqual([
      "trades_delete_own",
      "trades_insert_own",
      "trades_select_own",
      "trades_update_own",
    ]);
  });
});

describe("idempotência de webhook (nível de dado)", () => {
  it("payment_events rejeita o mesmo id de evento duas vezes (chave primária)", async () => {
    const secondAttempt = await asServiceRole(async (c) => {
      await c.query("insert into public.payment_events (id, event_type) values ('evt_1', 'payment')");
      return c.query(
        "insert into public.payment_events (id, event_type) values ('evt_1', 'payment') on conflict (id) do nothing returning id",
      );
    });
    expect(secondAttempt.rows).toHaveLength(0);
  });
});

describe("paywall — reforçado a nível de banco (defesa em profundidade)", () => {
  const insertTradeSql = `
    insert into public.trades
      (user_id, traded_at, account_balance, entry_price, stop_price, lot_size, exit_type, result_total, pip_value)
    values ($1, now(), 10000, 2345.60, 2343.10, 0.10, 'loss', -50, 0.10)
    returning id`;

  it("usuário em trial vigente (padrão do trigger de cadastro) consegue inserir", async () => {
    const trader = await createTestUser("trial-ok@example.com");
    const result = await asUser(trader, (c) => c.query(insertTradeSql, [trader]));
    expect(result.rows).toHaveLength(1);
  });

  it("trial expirado bloqueia o insert mesmo com sessão válida e RLS de dono satisfeita", async () => {
    const trader = await createTestUser("trial-expired@example.com");
    await asServiceRole((c) =>
      c.query("update public.subscriptions set trial_ends_at = now() - interval '1 day' where user_id = $1", [
        trader,
      ]),
    );

    await expect(asUser(trader, (c) => c.query(insertTradeSql, [trader]))).rejects.toThrow(
      /row-level security/i,
    );
  });

  it("assinatura ativa vigente permite inserir mesmo com o trial já expirado", async () => {
    const trader = await createTestUser("active-ok@example.com");
    await asServiceRole((c) =>
      c.query(
        `update public.subscriptions
         set trial_ends_at = now() - interval '1 day', status = 'active', current_period_end = now() + interval '10 days'
         where user_id = $1`,
        [trader],
      ),
    );

    const result = await asUser(trader, (c) => c.query(insertTradeSql, [trader]));
    expect(result.rows).toHaveLength(1);
  });

  it("cortesia (comp_until) vigente permite inserir mesmo com assinatura cancelada", async () => {
    const trader = await createTestUser("comp-ok@example.com");
    await asServiceRole((c) =>
      c.query(
        `update public.subscriptions
         set trial_ends_at = now() - interval '1 day', status = 'canceled', comp_until = now() + interval '5 days'
         where user_id = $1`,
        [trader],
      ),
    );

    const result = await asUser(trader, (c) => c.query(insertTradeSql, [trader]));
    expect(result.rows).toHaveLength(1);
  });

  it("conta suspensa bloqueia o insert mesmo com assinatura ativa vigente", async () => {
    const trader = await createTestUser("suspended@example.com");
    await asServiceRole(async (c) => {
      await c.query(
        `update public.subscriptions set status = 'active', current_period_end = now() + interval '10 days' where user_id = $1`,
        [trader],
      );
      await c.query("update public.profiles set is_suspended = true where id = $1", [trader]);
    });

    await expect(asUser(trader, (c) => c.query(insertTradeSql, [trader]))).rejects.toThrow(
      /row-level security/i,
    );
  });

  it("trial expirado também bloqueia UPDATE de um trade já existente", async () => {
    const trader = await createTestUser("update-blocked@example.com");
    const insert = await asUser(trader, (c) => c.query(insertTradeSql, [trader]));
    const tradeId = insert.rows[0].id;

    await asServiceRole((c) =>
      c.query("update public.subscriptions set trial_ends_at = now() - interval '1 day' where user_id = $1", [
        trader,
      ]),
    );

    await expect(
      asUser(trader, (c) =>
        c.query("update public.trades set result_total = 1 where id = $1", [tradeId]),
      ),
    ).rejects.toThrow(/row-level security/i);
  });
});
