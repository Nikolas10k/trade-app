# Diário de Trades XAU/USD

Diário de trades manual para operadores de Forex em XAU/USD (ouro), com checklist de
método, medidor de disciplina e zonas quentes — SaaS multi-tenant com painel de
administração para o dono da aplicação.

Stack: Next.js (App Router) + TypeScript + Tailwind · Supabase (Postgres + Auth + RLS) ·
Mercado Pago (assinaturas) · Vercel + Cloudflare.

## Como rodar localmente

```bash
pnpm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Supabase
pnpm dev
```

## Verificadores

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test` roda os testes de unidade e os testes de isolamento de tenant / RLS contra um
Postgres real (as políticas de RLS não são testáveis com mocks). Por padrão ele aponta
para `postgres://postgres:postgres@127.0.0.1:5432/trade_app_test` — configure
`TEST_DATABASE_URL` para apontar para outro Postgres local ou de CI. Os testes aplicam
`supabase/test/shim.sql` (uma reprodução mínima do schema `auth` e dos papéis
`anon`/`authenticated`/`service_role` que o Supabase já fornece de fábrica) seguido de
todas as migrations em `supabase/migrations/`, recriando o schema do zero a cada execução
— não rode contra um banco com dados que você queira preservar.

## Estrutura

Veja a Seção 0.5 do prompt de criação do projeto (arquitetura travada com o cliente) para
a convenção de pastas. Resumo: `/lib/calc` concentra toda a matemática do domínio como
funções puras testáveis; UI e rotas só orquestram.
