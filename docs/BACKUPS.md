# Backups — Diário de Trades XAU/USD

O único dado com estado que precisa de backup é o banco Postgres do Supabase
— a aplicação não guarda arquivos (sem upload de imagem/anexo) e o código
já está no Git.

## O que o Supabase já oferece

Depende do plano do projeto (confira em Project Settings → Add-ons no
painel do Supabase, o plano pode ter mudado desde que este documento foi
escrito):

- **Free**: sem backup automático administrado pelo Supabase.
- **Pro** (e acima): backups diários automáticos, com retenção de 7 dias por
  padrão. Point-in-Time Recovery (PITR) disponível como add-on pago —
  restaura pra qualquer segundo dentro da janela de retenção configurada,
  não só pro horário do backup diário.

Verifique o plano atual do projeto antes de assumir que existe backup
automático — no plano Free, a responsabilidade é 100% do backup manual
abaixo.

## Backup manual (necessário até confirmar Pro + PITR ativos)

Com a Supabase CLI instalada e logada:

```bash
supabase db dump --db-url "$DATABASE_URL" -f backup-$(date +%Y%m%d).sql
```

Ou, sem a CLI, `pg_dump` direto (a connection string fica em
Project Settings → Database → Connection string, modo "URI"):

```bash
pg_dump "$DATABASE_URL" -f backup-$(date +%Y%m%d).sql
```

Guarde o arquivo resultante fora da máquina que gerou (ex.: um bucket
privado separado, com controle de acesso — nunca no mesmo repositório Git,
mesmo privado: um dump contém dado real de usuário). Até haver rotina
automatizada, rode isso manualmente antes de qualquer migration arriscada
em produção e periodicamente (semanal é um ponto de partida razoável pro
volume de dados de um SaaS em estágio inicial — revise a cadência conforme
a base crescer).

## O que NÃO está coberto por backup de banco

- **Segredos de ambiente** (`SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`
  etc.) — vivem na Vercel, não no banco. Se forem perdidos, regeneram-se no
  painel do provedor (Supabase/Mercado Pago); não há "backup" propriamente,
  só a necessidade de documentar onde cada um é gerado (ver `RUNBOOK.md`).
- **Configuração de planos na Mercado Pago** (preapproval plans) — vive só
  lá, não no nosso banco. Anote os ids em algum lugar além de
  `MP_PREAPPROVAL_PLAN_*` na Vercel.

## Restauração

1. Backup automático (Pro+/PITR): pelo próprio painel do Supabase
   (Database → Backups), restaura para um novo projeto ou sobrescreve o
   atual — leia o aviso da UI com atenção, é uma operação destrutiva sobre
   o projeto de destino.
2. Backup manual (`pg_dump`): `psql "$DATABASE_URL" -f backup-XXXXXXXX.sql`
   contra um projeto novo (nunca restaure por cima de produção sem antes
   confirmar que é isso mesmo que se quer — prefira sempre restaurar num
   projeto/branch separado primeiro e validar).

**Teste a restauração pelo menos uma vez antes de precisar dela de
verdade** — um backup nunca verificado é uma suposição, não uma garantia.
