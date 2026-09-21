/**
 * Promove um ou mais usuários existentes a admin (insere em public.app_admins).
 *
 * app_admins não tem nenhuma policy de RLS nem grant a anon/authenticated —
 * de propósito (ver docs/SECURITY.md, "sem caminho de auto-promoção a
 * admin"). A única forma de criar o primeiro admin é isto: um script rodado
 * fora da aplicação, com a service role key, por alguém que já tem acesso a
 * essa chave. Não existe nenhum código de runtime que leia
 * ADMIN_BOOTSTRAP_EMAILS — de propósito, pra não virar uma superfície de
 * ataque dentro da aplicação em produção.
 *
 * Uso:
 *   pnpm bootstrap-admin email@exemplo.com            # um e-mail via argumento
 *   pnpm bootstrap-admin                               # todos em ADMIN_BOOTSTRAP_EMAILS (.env.local, separado por vírgula)
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY — lidos do
 * ambiente ou, se ausentes, de .env.local na raiz do projeto.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável de ambiente obrigatória ausente: ${name} (defina no ambiente ou em .env.local).`);
    process.exit(1);
  }
  return value;
}

async function main() {
  loadEnvLocal();

  const emails = process.argv[2]
    ? [process.argv[2]]
    : (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

  if (emails.length === 0) {
    console.error(
      "Nenhum e-mail informado. Uso: pnpm bootstrap-admin <email>, ou defina ADMIN_BOOTSTRAP_EMAILS em .env.local (separado por vírgula) e rode sem argumento.",
    );
    process.exit(1);
  }

  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // A Admin Auth API não tem "getUserByEmail" — lista e filtra. perPage alto o
  // bastante pro estágio atual do produto; se a base crescer muito, paginar
  // (page: N) até achar ou esgotar as páginas.
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    console.error("Falha ao listar usuários:", error.message);
    process.exit(1);
  }

  let hadError = false;
  for (const email of emails) {
    const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      console.error(
        `✗ ${email}: nenhum usuário encontrado. A conta precisa existir (cadastro feito) antes de virar admin.`,
      );
      hadError = true;
      continue;
    }

    const { error: insertError } = await admin.from("app_admins").upsert({ user_id: user.id });
    if (insertError) {
      console.error(`✗ ${email}: falha ao inserir em app_admins — ${insertError.message}`);
      hadError = true;
      continue;
    }

    console.log(`✓ ${email} (${user.id}) agora é admin.`);
  }

  if (hadError) process.exit(1);
}

main();
