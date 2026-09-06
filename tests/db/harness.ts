import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const ROOT = join(__dirname, "..", "..");
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres:postgres@127.0.0.1:5432/trade_app_test";

export function isTestDatabaseConfigured() {
  return Boolean(process.env.TEST_DATABASE_URL) || true;
}

async function resetDatabase(client: Client) {
  await client.query("drop schema if exists public cascade");
  await client.query("drop schema if exists auth cascade");
  await client.query("create schema public");
  await client.query("grant all on schema public to postgres");

  const shim = readFileSync(join(ROOT, "supabase/test/shim.sql"), "utf8");
  await client.query(shim);

  const migrationsDir = join(ROOT, "supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await client.query(sql);
  }
}

let setupPromise: Promise<void> | null = null;

/** Aplica shim + migrations uma única vez por processo de teste. */
export async function ensureSchema() {
  if (!setupPromise) {
    setupPromise = (async () => {
      const client = new Client({ connectionString: TEST_DATABASE_URL });
      await client.connect();
      try {
        await resetDatabase(client);
      } finally {
        await client.end();
      }
    })();
  }
  return setupPromise;
}

async function withRole<T>(
  role: "anon" | "authenticated" | "service_role",
  jwtSub: string | null,
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  try {
    await client.query("begin");
    await client.query(`set local role ${role}`);
    if (jwtSub) {
      await client.query("select set_config('request.jwt.claim.sub', $1, true)", [jwtSub]);
    }
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    await client.end();
  }
}

/** Executa `fn` como um usuário autenticado específico (auth.uid() = userId). */
export function asUser<T>(userId: string, fn: (client: Client) => Promise<T>) {
  return withRole("authenticated", userId, fn);
}

/** Executa `fn` como visitante não autenticado (sem sessão). */
export function asAnon<T>(fn: (client: Client) => Promise<T>) {
  return withRole("anon", null, fn);
}

/** Executa `fn` com privilégio de service role (bypassa RLS, como o backend). */
export function asServiceRole<T>(fn: (client: Client) => Promise<T>) {
  return withRole("service_role", null, fn);
}

/** Conexão de superusuário para preparar fixtures (fora do escopo de RLS). */
export async function withFixtureSetup<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function createTestUser(email: string): Promise<string> {
  return withFixtureSetup(async (client) => {
    const result = await client.query<{ id: string }>(
      "insert into auth.users (email) values ($1) returning id",
      [email],
    );
    return result.rows[0].id;
  });
}
