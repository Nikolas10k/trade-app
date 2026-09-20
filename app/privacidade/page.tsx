import type { ReactNode } from "react";

export const metadata = { title: "Política de Privacidade — Diário XAU/USD" };

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-8 text-lg font-semibold text-text-primary">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mb-3 leading-relaxed">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-text-secondary">
      <p className="mb-6 rounded-lg bg-gold/10 px-4 py-3 text-sm text-gold-light">
        Rascunho técnico, pendente de revisão jurídica. Alguns campos (razão social, CNPJ,
        contato do encarregado de dados) ainda precisam ser preenchidos pela empresa antes da
        publicação.
      </p>

      <h1 className="mb-4 text-2xl font-semibold text-text-primary">Política de Privacidade</h1>
      <P>
        Esta política descreve como o Diário de Trades XAU/USD (&ldquo;nós&rdquo;,
        &ldquo;aplicação&rdquo;) trata os dados pessoais dos seus usuários, em conformidade com
        a Lei 13.709/2018 (LGPD).
      </P>

      <H2>1. Que dados coletamos</H2>
      <P>
        <strong>Conta:</strong> e-mail, senha (com hash) e nome de exibição. <strong>Uso do
        produto:</strong> trades registrados (preços, resultado, checklist), horas de tela e
        preferências (fuso horário, limite de risco). <strong>Assinatura:</strong> status do
        plano, datas de vigência e identificador da assinatura na Mercado Pago.
        <strong> Não coletamos</strong> dado de cartão de crédito nem qualquer dado de
        pagamento sensível — isso é processado inteiramente pela Mercado Pago.
      </P>

      <H2>2. Base legal e finalidade</H2>
      <P>
        Tratamos seus dados para executar o contrato de prestação do serviço (criar sua conta,
        processar sua assinatura, fornecer as funcionalidades do diário), com base no
        consentimento que você dá no cadastro, e por legítimo interesse em segurança e
        prevenção a fraude. Não usamos seus dados para publicidade nem os vendemos a
        terceiros.
      </P>

      <H2>3. Com quem compartilhamos dados</H2>
      <P>
        Supabase (infraestrutura de banco de dados e autenticação), Mercado Pago (processamento
        de pagamento — recebe só e-mail e o identificador da assinatura, nunca o conteúdo dos
        seus trades) e Vercel (hospedagem). Não compartilhamos o conteúdo dos seus trades com
        ninguém além de você.
      </P>

      <H2>4. Fronteira de acesso do administrador</H2>
      <P>
        O responsável pela aplicação administra contas e assinaturas, mas{" "}
        <strong>não tem acesso ao conteúdo dos seus trades por padrão</strong> — nem em texto,
        nem agregado. O que ele vê é: e-mail, data de cadastro, status e plano da assinatura, e
        o log de ações administrativas.
      </P>

      <H2>5. Por quanto tempo guardamos seus dados</H2>
      <P>
        Enquanto sua conta estiver ativa. Se você excluir sua conta, apagamos seus dados de
        forma real e definitiva, exceto os registros de auditoria de ações administrativas, que
        são mantidos desvinculados da sua identidade.
      </P>

      <H2>6. Seus direitos como titular dos dados</H2>
      <P>
        Pela tela de Configurações, você pode a qualquer momento: confirmar e acessar seus
        dados, exportá-los em JSON e CSV (portabilidade), corrigir dados incorretos e excluir
        sua conta de forma real e definitiva, com dupla confirmação.
      </P>

      <H2>7. Segurança</H2>
      <P>
        Detalhamos as medidas técnicas de segurança no nosso documento público de segurança.
        2FA (autenticação em duas etapas) ainda não está disponível na aplicação — é uma
        pendência conhecida antes do lançamento público.
      </P>

      <H2>8. Resposta a incidentes</H2>
      <P>
        Em caso de incidente de segurança que envolva risco a seus dados, notificaremos a
        Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados dentro do prazo
        exigido pela LGPD.
      </P>

      <H2>9. Contato</H2>
      <P>
        Dúvidas sobre esta política ou sobre o tratamento dos seus dados: entre em contato com
        o encarregado de dados pelo canal indicado no rodapé desta página, quando publicado.
      </P>
    </div>
  );
}
