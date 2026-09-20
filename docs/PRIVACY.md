# Política de Privacidade — Diário de Trades XAU/USD

> **Rascunho técnico, pendente de revisão jurídica.** Este documento foi
> escrito para refletir com precisão o que a aplicação realmente coleta e
> faz com os dados (Lei 13.709/2018 — LGPD), mas não substitui a revisão de
> um advogado antes da publicação em produção. Preencha os campos entre
> colchetes antes de publicar.

**Controlador dos dados:** [Razão social da empresa], CNPJ [00.000.000/0000-00],
responsável pelo Diário de Trades XAU/USD ("nós", "aplicação").

**Encarregado de dados (DPO):** [Nome do encarregado] — [e-mail de contato].

## 1. Que dados coletamos

| Categoria | Exemplos | Por quê |
|---|---|---|
| Conta | E-mail, senha (com hash), nome de exibição | Autenticação e identificação do usuário |
| Uso do produto | Trades registrados (preços, resultado, checklist), horas de tela, preferências (fuso, limite de risco) | É a função central do produto: o diário de trades e o medidor de disciplina |
| Assinatura | Status do plano, datas de vigência, identificador da assinatura na Mercado Pago | Controle de acesso (paywall) e suporte |
| Técnico | Endereço IP em registros de auditoria de ações sensíveis | Segurança e investigação de incidentes |

**O que não coletamos:** dado de cartão de crédito ou qualquer dado de
pagamento sensível — o processamento de pagamento é feito inteiramente pela
Mercado Pago; recebemos só o identificador da assinatura e o status.

## 2. Base legal e finalidade

- **Execução de contrato**: criar e manter sua conta, processar sua
  assinatura, fornecer as funcionalidades do diário de trades.
- **Consentimento**: você aceita esta política e os Termos de Uso no
  cadastro, por meio de uma caixa de seleção não marcada previamente.
- **Legítimo interesse**: prevenção a fraude e abuso, segurança da
  aplicação (ex.: rate limiting, registro de tentativas de login).

Não usamos seus dados para publicidade nem os vendemos a terceiros.

## 3. Com quem compartilhamos dados

- **Supabase** (infraestrutura de banco de dados e autenticação) — processa
  os dados em nosso nome, sob contrato de processamento de dados.
- **Mercado Pago** (processamento de pagamento) — recebe apenas o e-mail e o
  identificador necessário para criar a assinatura; nunca recebe o conteúdo
  dos seus trades.
- **Vercel** (hospedagem da aplicação).

Não compartilhamos o conteúdo dos seus trades com ninguém além de você —
nem mesmo o administrador da aplicação tem acesso ao conteúdo do seu
diário; ele só vê dados agregados de conta e assinatura (ver Seção 6).

## 4. Onde seus dados ficam armazenados

Nossa infraestrutura de banco de dados está hospedada [na região X do
Supabase — preencher com a região real do projeto]. Se essa região estiver
fora do Brasil, isso caracteriza transferência internacional de dados nos
termos do Art. 33 da LGPD; a base legal para essa transferência é [preencher
— tipicamente cláusulas contratuais padrão do fornecedor de infraestrutura].

## 5. Por quanto tempo guardamos seus dados

Enquanto sua conta estiver ativa. Se você excluir sua conta (Seção 7),
apagamos seus dados de forma real e definitiva, exceto os registros de
auditoria de ações administrativas, que são mantidos de forma desvinculada
da sua identidade (o vínculo com sua conta é removido automaticamente pelo
banco de dados no momento da exclusão).

## 6. Fronteira de acesso do administrador

O responsável pela aplicação administra contas e assinaturas (conceder
período de teste, suspender acesso por inadimplência, etc.), mas **não tem
acesso ao conteúdo dos seus trades por padrão** — nem em texto, nem
agregado. O que o administrador vê é: e-mail, data de cadastro, status e
plano da assinatura, e o log de ações administrativas. Qualquer acesso de
suporte ao conteúdo individual de um usuário exigiria uma base legal e um
consentimento específico, e está fora do funcionamento normal da aplicação.

## 7. Seus direitos como titular dos dados (Art. 18 da LGPD)

Você pode, a qualquer momento, pela tela de Configurações da aplicação:

- **Confirmar e acessar** os dados que temos sobre você.
- **Exportar** seus dados em formato JSON e CSV (portabilidade).
- **Corrigir** dados incorretos (nome, preferências) diretamente na tela de
  Configurações.
- **Excluir sua conta de forma real e definitiva**, com dupla confirmação.

Para solicitações que a interface não cobre (ex.: correção de um dado que
não é editável na tela), entre em contato com o encarregado de dados
indicado no topo deste documento.

## 8. Segurança

Descrevemos as medidas técnicas de segurança em detalhe em `SECURITY.md` —
RLS em todo dado de usuário, TLS obrigatório, segredos nunca expostos ao
cliente, senha com hash pelo Supabase Auth, e outras. Note que 2FA
(autenticação em duas etapas) ainda não está disponível na aplicação — é
uma pendência conhecida antes do lançamento público.

## 9. Resposta a incidentes

Em caso de incidente de segurança que envolva risco a seus dados,
notificaremos a Autoridade Nacional de Proteção de Dados (ANPD) e os
titulares afetados dentro do prazo exigido pela LGPD, com uma descrição da
natureza do incidente, dos dados afetados e das medidas tomadas.

## 10. Alterações a esta política

Podemos atualizar esta política. Mudanças relevantes serão comunicadas por
e-mail ou aviso dentro da aplicação antes de entrarem em vigor.

## 11. Contato

Dúvidas sobre esta política ou sobre o tratamento dos seus dados: [e-mail
de contato do encarregado de dados].

_Última atualização: [preencher na publicação]._
