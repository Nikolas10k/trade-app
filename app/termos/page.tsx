import type { ReactNode } from "react";

export const metadata = { title: "Termos de Uso — Diário XAU/USD" };

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-8 text-lg font-semibold text-text-primary">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mb-3 leading-relaxed">{children}</p>;
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-text-secondary">
      <p className="mb-6 rounded-lg bg-gold/10 px-4 py-3 text-sm text-gold-light">
        Rascunho técnico, pendente de revisão jurídica. Alguns campos (razão social, CNPJ,
        foro) ainda precisam ser preenchidos pela empresa antes da publicação.
      </p>

      <h1 className="mb-4 text-2xl font-semibold text-text-primary">Termos de Uso</h1>
      <P>
        Ao criar uma conta e usar o Diário de Trades XAU/USD, você concorda com estes Termos de
        Uso. Se não concordar, não use a aplicação.
      </P>

      <H2>1. O que é a aplicação</H2>
      <P>
        Uma ferramenta de registro manual de trades em XAU/USD (ouro), com checklist de método
        e métricas de disciplina. Ela <strong>não</strong> oferece consultoria de investimento,
        recomendação financeira ou sinal de entrada/saída, <strong>não</strong> se conecta à
        sua corretora nem executa ordens, e <strong>não</strong> garante resultado financeiro de
        nenhum tipo. Decisões de trading e seus resultados são de sua exclusiva
        responsabilidade.
      </P>

      <H2>2. Conta</H2>
      <P>
        Você precisa ter pelo menos 18 anos e fornecer um e-mail válido. Você é responsável por
        manter sua senha em sigilo e por toda atividade realizada com sua conta.
      </P>

      <H2>3. Período de teste e assinatura</H2>
      <P>
        Novas contas têm 3 dias de teste gratuito, sem cartão de crédito. Depois, o acesso
        completo exige assinatura paga: Mensal (R$ 14,99), Trimestral (R$ 39,00) ou Anual (R$
        129,00). O pagamento é processado inteiramente pela Mercado Pago — não temos acesso aos
        dados do seu cartão. Assinaturas renovam automaticamente ao fim de cada ciclo, salvo
        cancelamento prévio pelo portal da Mercado Pago. Após o cancelamento ou uma falha de
        pagamento não regularizada, sua conta passa para o modo somente leitura: seus dados
        continuam lá, mas novos registros ficam bloqueados até uma nova assinatura.
      </P>

      <H2>4. Uso aceitável</H2>
      <P>
        Você concorda em não tentar acessar dados de outro usuário, usar a aplicação para fins
        ilegais, tentar contornar o controle de acesso ou a cobrança da assinatura, nem fazer
        engenharia reversa da aplicação além do permitido por lei.
      </P>

      <H2>5. Seus dados</H2>
      <P>
        O tratamento dos seus dados pessoais é descrito na nossa Política de Privacidade. Você
        mantém a titularidade sobre o conteúdo que registra na aplicação.
      </P>

      <H2>6. Isenção de garantias</H2>
      <P>
        A aplicação é fornecida &ldquo;como está&rdquo;. Na máxima extensão permitida por lei, não nos
        responsabilizamos por perdas financeiras decorrentes de decisões de trading tomadas com
        base no uso da aplicação, nem por indisponibilidade temporária do serviço.
      </P>

      <H2>7. Encerramento de conta</H2>
      <P>
        Você pode excluir sua conta a qualquer momento pela tela de Configurações — a exclusão
        é real e definitiva. Podemos suspender ou encerrar contas que violem estes Termos.
      </P>

      <H2>8. Lei aplicável</H2>
      <P>
        Estes Termos são regidos pelas leis da República Federativa do Brasil.
      </P>

      <H2>9. Contato</H2>
      <P>Dúvidas sobre estes Termos: canal de contato indicado no rodapé desta página, quando publicado.</P>
    </div>
  );
}
