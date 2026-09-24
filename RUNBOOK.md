# Runbook — Diário de Trades XAU/USD

Guia operacional para quem administra a aplicação em produção (não é
documentação de como usar o produto — isso é o próprio app). Complementa
`docs/SECURITY.md` (controles) e `docs/PRIVACY.md`/`docs/TERMS.md` (jurídico).

## Onde tudo mora

| Peça | Onde |
|---|---|
| Código-fonte | GitHub |
| Deploy / hosting | Vercel (deploy automático a cada push nas branches configuradas) |
| Banco de dados / Auth | Supabase (Postgres + Auth + RLS) |
| Pagamentos/assinaturas | Mercado Pago (preapproval + webhook) |
| CI (verificadores, SAST, SCA, secrets) | GitHub Actions — `.github/workflows/ci.yml` |
| Rastreamento de erro | Sentry, se `SENTRY_DSN` estiver configurado (ver `docs/SECURITY.md`) |

## Promover o primeiro admin

`app_admins` não tem nenhuma policy de RLS nem grant a `anon`/`authenticated`
— de propósito, pra não existir nenhum caminho de auto-promoção dentro da
aplicação. A única forma de criar um admin é rodar, fora da aplicação, com a
service role key:

```bash
pnpm bootstrap-admin email@exemplo.com
```

Ou, para promover vários de uma vez, defina `ADMIN_BOOTSTRAP_EMAILS`
(separado por vírgula) em `.env.local` e rode sem argumento:

```bash
pnpm bootstrap-admin
```

O e-mail precisa já ter uma conta cadastrada no app (o script só liga um
`user_id` existente a `app_admins`, não cria conta). Depois disso, o login
normal em `/login` já entra como admin em `/usuarios`.

## Variáveis de ambiente

Ver `.env.example` para a lista completa. Em produção, configure-as no
painel do projeto na Vercel (Settings → Environment Variables), nunca
commitadas. Os itens sensíveis:

- `SUPABASE_SERVICE_ROLE_KEY` — bypassa RLS. Só em variáveis de servidor.
- `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET` — credenciais da Mercado Pago.
- `MP_PREAPPROVAL_PLAN_MENSAL`/`TRIMESTRAL`/`ANUAL` — ids dos planos
  configurados no painel da Mercado Pago (não os preços — isso é lá).

Se qualquer uma delas vazar, rotacione no painel do provedor (Supabase ou
Mercado Pago) e atualize o valor na Vercel imediatamente — a rotação por si
só já invalida a chave antiga.

## Deploy

Push numa branch configurada na Vercel → deploy automático. Cada push
também dispara a CI no GitHub Actions (typecheck/lint/test/build + SCA +
SAST + secrets scanning) — um deploy não espera a CI passar por padrão
nessas duas plataformas serem independentes, então trate um push que quebra
a CI como incidente mesmo que o deploy na Vercel tenha "funcionado".

Rollback: no painel da Vercel, a lista de deployments permite promover
qualquer deployment anterior de volta para produção instantaneamente (não
precisa de revert + novo deploy).

## Migrations do banco

Hoje aplicadas manualmente: copie o conteúdo de cada arquivo novo em
`supabase/migrations/` (em ordem, pelo prefixo de data no nome do arquivo)
no SQL Editor do painel do Supabase do projeto real. Os mesmos arquivos são
aplicados automaticamente contra um Postgres efêmero no CI (via
`supabase/test/shim.sql` + as migrations) para os testes de RLS — isso
valida que rodam sem erro, mas não substitui aplicar no projeto real.

## Logs e monitoramento

- **Vercel**: aba "Logs" do projeto — erros de runtime, build.
- **Supabase**: aba "Logs" do projeto — queries, erros de Auth, RLS.
- **Sentry**: se `SENTRY_DSN` estiver configurado, erros client+server
  aparecem lá automaticamente (ver `docs/SECURITY.md`).
- **`audit_log`** (tabela): login, troca de senha, toda ação administrativa,
  mudança de plano — visível em `/auditoria` no painel admin.

## Backups

Ver `docs/BACKUPS.md`.

## Limitações conhecidas (declaradas, não escondidas)

- **2FA implementado mas opcional** — cada usuário/admin ativa por conta
  própria em Configurações; ainda não é obrigatório para nenhum papel.
  Reavaliar exigir obrigatório para admin antes de escalar essa base.
- **CSP permite `'unsafe-inline'` em `script-src`** — documentado e
  justificado em `docs/SECURITY.md`.
- **Assinatura de webhook da Mercado Pago**: implementação reconstruída a
  partir da documentação pública; validar num evento real do sandbox da MP
  antes de depender dela em produção (é o último passo do go-live).
