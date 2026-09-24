# Segurança — Diário de Trades XAU/USD

Este documento mapeia cada categoria do OWASP Top 10 (2021) ao controle real
implementado no código deste repositório, com o caminho do arquivo relevante.
Onde ainda há uma lacuna conhecida, ela é declarada explicitamente — este
documento descreve o estado real do sistema, não um objetivo aspiracional.

## A01:2021 — Broken Access Control

- **RLS em toda tabela de dado de usuário**, com policy de dono
  (`auth.uid() = user_id`) — `supabase/migrations/20260906000000_init_schema.sql`.
  Testado com Postgres real em `tests/db/rls-isolation.test.ts` (isolamento
  entre usuários em todas as tabelas, incluindo tentativa de inserir um trade
  em nome de outro usuário).
- **Paywall reforçado em duas camadas independentes**: no app
  (`lib/auth/access.ts`, revalidado a cada chamada de servidor) e no banco
  (`public.has_write_access()`, usada nas policies de insert/update de
  `trades` em `supabase/migrations/20260906000001_paywall_rls.sql`) — uma
  sessão válida chamando a API do Supabase direto, sem passar pelo app,
  ainda é bloqueada pela RLS se a assinatura não estiver vigente.
- **Papel de admin resolvido só no servidor**, via a função `is_admin()`
  (SECURITY DEFINER) — nunca por um campo enviado pelo cliente. Não-admin
  recebe um 403 de verdade (`forbidden()` do Next.js) em `lib/auth/admin.ts`.
- **Admin nunca lê o conteúdo de `trades`**: não existe policy de RLS que dê
  a um admin acesso a essa tabela — só policies de dono. Um teste automatizado
  (`tests/db/rls-isolation.test.ts`) verifica que `trades` tem exatamente as
  4 policies de dono, nenhuma outra, como guarda de regressão.
- **Escritas administrativas** (estender trial, conceder cortesia, suspender)
  só acontecem via funções de banco `SECURITY DEFINER` cuja permissão de
  execução foi revogada de `PUBLIC`/`authenticated` e concedida só a
  `service_role` — nem um admin autenticado consegue chamá-las direto pela
  API (`supabase/migrations/20260907000000_admin_write_functions.sql`).
- **Sem caminho de auto-promoção a admin**: `app_admins` não tem nenhuma
  policy de RLS e nenhum grant a `anon`/`authenticated` — só é gravável pelo
  bootstrap fora da aplicação (ver [`RUNBOOK.md`](../RUNBOOK.md)).

## A02:2021 — Cryptographic Failures

- TLS obrigatório de ponta a ponta (Vercel + Supabase); `Strict-Transport-Security`
  com `preload` em `next.config.ts`.
- **Dinheiro nunca é float**: `numeric` no Postgres; `Decimal` (decimal.js)
  em toda a aplicação (`lib/calc/money.ts`), com arredondamento explícito na
  fronteira com o transporte JSON do PostgREST.
- Hash de senha delegado ao Supabase Auth (não há implementação própria de
  hashing/sessão no código).
- Segredos (chave de serviço do Supabase, access token e webhook secret da
  Mercado Pago) só existem em variáveis de ambiente de servidor — nunca no
  código, nunca em algo importável por um Client Component
  (`lib/db/supabase-admin.ts` e `lib/payments/mercadopago.ts` usam o guard
  `import "server-only"`, que quebra o build se forem importados do lado do
  cliente).
- `.env.local`/`.env*` fora do controle de versão (`.gitignore`); só
  `.env.example` (sem valores reais) é versionado.

## A03:2021 — Injection

- Toda query ao banco passa pelo client do Supabase (parametrizado) — não há
  concatenação de SQL em nenhum ponto do código da aplicação.
- Validação de entrada com Zod em todo formulário e server action antes de
  qualquer escrita (`lib/validation/*`), incluindo rejeição de chaves
  desconhecidas no checklist (`.strict()` em `lib/validation/checklist.ts`).
- CSP (`next.config.ts`) restringe origens de script/estilo/conexão como
  mitigação adicional contra XSS.

## A04:2021 — Insecure Design

- Fórmulas de negócio (pips, R/R, risco %, disciplina, clusterização, janelas
  de tempo) centralizadas em `/lib/calc` como funções puras testadas — a UI e
  o servidor nunca recalculam a lógica de forma divergente.
- Limite de risco nunca bloqueia o registro — só avisa e exige confirmação
  explícita (`app/(app)/registrar/trade-form.tsx`), coerente com o objetivo
  do produto (medir disciplina, não impedir o trader).
- Webhook da Mercado Pago nunca decide o novo estado da assinatura só pelo
  corpo da notificação: busca o recurso fresco na API antes de aplicar
  qualquer mudança (`lib/payments/mercadopago.ts`).
- Idempotência de webhook por construção: `payment_events.id` é chave
  primária: um reenvio da mesma notificação é um no-op comprovado por teste
  (`tests/db/rls-isolation.test.ts`).

## A05:2021 — Security Misconfiguration

- Cabeçalhos de segurança aplicados globalmente em `next.config.ts`: CSP,
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- **Lacuna conhecida e documentada**: o CSP de produção permite
  `'unsafe-inline'` em `script-src` — é o que o próprio Next.js exige para
  entregar conteúdo com streaming/Suspense sem nonce (ver comentário em
  `next.config.ts`). Migrar para CSP com nonce por request exigiria tornar
  toda página dinâmica (perde cache estático da landing/telas de auth) — uma
  troca de performance ainda não decidida com o cliente.
- Grants de banco no nível mínimo necessário: `profiles.is_suspended` só é
  gravável pelo `service_role` (a coluna foi explicitamente revogada de
  `authenticated`, mesmo o dono da linha) — só as colunas realmente editáveis
  pelo usuário têm grant de update.
- Ambientes separados: desenvolvimento local (Postgres próprio para testes,
  nunca aponta para o Supabase real) vs. produção (Vercel + Supabase).

## A06:2021 — Vulnerable and Outdated Components

- `pnpm audit` roda no CI a cada push/PR (ver `.github/workflows/ci.yml`).
- Lockfile (`pnpm-lock.yaml`) versionado — builds reprodutíveis.
- Dependências mantidas no mínimo necessário (sem framework de UI extra,
  sem ORM — o client oficial do Supabase é a única camada de acesso a dados).

## A07:2021 — Identification and Authentication Failures

- Autenticação delegada ao Supabase Auth: verificação de e-mail obrigatória
  antes de acessar a área do trader (`lib/auth/session.ts`), rate limiting e
  bloqueio por tentativa nativos da plataforma.
- Sessão via cookies `httpOnly` geridos pelo `@supabase/ssr`; `proxy.ts`
  atualiza o token a cada request. `getUser()` (que revalida o JWT contra o
  servidor de auth) é usado para toda decisão de autorização — nunca
  `getSession()` isolado, que confiaria só no cookie local.
- Mensagens de erro genéricas em login, cadastro e recuperação de senha —
  nunca revelam se um e-mail existe, está certo ou não foi verificado
  (`app/(auth)/actions.ts`), para não permitir enumeração de contas.
- Logout invalida a sessão no servidor (`supabase.auth.signOut()`, escopo
  padrão `global`).
- **2FA/TOTP implementado** para trader e admin (opcional para ambos, por
  ora — ver `RUNBOOK.md`): enroll/challenge/unenroll via a API nativa de MFA
  do Supabase Auth (`lib/auth/mfa.ts`, `app/(app)/configuracoes/two-factor-*`),
  QR code gerado pelo próprio Supabase (sem serviço de terceiro, sem
  dependência nova). Os guards (`requireUser`/`requireAdmin`) exigem `aal2`
  de quem tem um fator TOTP verificado antes de liberar qualquer rota
  protegida (`lib/auth/mfa.ts:requireAal2`) — uma sessão que só passou pela
  senha (`aal1`) é redirecionada para `/verificar-2fa`, nunca alcança
  `/dashboard` nem `/usuarios` sem completar o 2º fator. O evento `login` no
  `audit_log` só é gravado depois do 2º fator, quando ele existe — uma
  sessão parcial não fica registrada como login bem-sucedido.
  Recuperação de acesso (perda do autenticador): admin pode desativar o 2FA
  de outra conta (`admin_disable_two_factor`, via Admin Auth API,
  `lib/admin/account-actions.ts`).
  **Lacuna conhecida**: não é obrigatório para nenhum papel ainda (fica a
  critério de cada usuário/admin ativar) — exigir 2FA obrigatório pra admin
  é uma melhoria natural antes de escalar a base de admins.

## A08:2021 — Software and Data Integrity Failures

- Webhook da Mercado Pago validado por assinatura HMAC-SHA256
  (`x-signature`/`x-request-id`) antes de qualquer efeito colateral —
  requisição sem assinatura válida é descartada com 401
  (`lib/payments/webhook-signature.ts`, testado com hash calculado de forma
  independente em `webhook-signature.test.ts`).
- CI com scanning de segredos (gitleaks) e SAST (CodeQL) — ver
  `.github/workflows/ci.yml`.

## A09:2021 — Security Logging and Monitoring Failures

- `audit_log` registra: login, troca de senha, toda ação administrativa
  (estender trial, conceder cortesia, suspender/reativar) e mudança de plano
  vinda do webhook da Mercado Pago. Escritas administrativas gravam o estado
  e o log de auditoria na mesma transação implícita (funções de banco em
  `20260907000000_admin_write_functions.sql`) — nunca dois passos separados
  que possam ficar inconsistentes entre si.
- `audit_log` nunca guarda payload de pagamento nem dado de cartão — só
  identificadores e o novo estado.
- **Rastreamento de erro (Sentry)**: `instrumentation.ts` +
  `sentry.server.config.ts`/`sentry.edge.config.ts` inicializam o Sentry no
  servidor (server actions, route handlers, o `proxy.ts` no runtime edge)
  automaticamente quando `SENTRY_DSN` está definido — sem DSN, é um no-op
  completo (nenhuma chamada de rede). `sendDefaultPii: false` — nenhum
  payload de trade/checklist é enviado, só stack trace e contexto de
  request. **Lacuna conhecida**: captura de erro no navegador (client-side)
  não está incluída nesta rodada — exigiria expor o DSN publicamente
  (`NEXT_PUBLIC_SENTRY_DSN`), decisão que fica para quando o Sentry
  realmente for conectado (ver `RUNBOOK.md`).

## A10:2021 — Server-Side Request Forgery (SSRF)

- O único destino de requisição HTTP feita pelo servidor para fora da
  infraestrutura própria é a API da Mercado Pago, com URL fixa no código
  (`lib/payments/mercadopago.ts`) — nenhuma URL fornecida por usuário é
  buscada pelo servidor em lugar nenhum da aplicação.

## Como testar os controles acima

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

`pnpm test` inclui os testes de isolamento de tenant e de authz de admin
contra um Postgres real (não mockado) — ver `README.md` para como apontar
`TEST_DATABASE_URL` para o seu ambiente.
