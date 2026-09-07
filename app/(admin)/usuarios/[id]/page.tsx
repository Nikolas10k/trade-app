import { notFound } from "next/navigation";
import { Card, Input, Label } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { getUserForAdmin } from "@/lib/admin/users";
import { PLAN_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/subscriptions/labels";
import { extendTrialAction, grantCompAction, setSuspendedAction } from "./actions";

export const metadata = { title: "Detalhe do usuário — Admin" };

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "—";
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserForAdmin(id);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">{user.email ?? "(sem e-mail)"}</h1>
        <p className="text-sm text-text-muted">
          Conteúdo dos trades deste usuário não é acessível por aqui (Seção 10) — só conta,
          assinatura e auditoria.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-text-primary">Conta</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Cadastro</dt>
            <dd className="text-text-primary">{formatDate(user.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">E-mail verificado</dt>
            <dd className="text-text-primary">{user.emailConfirmed ? "Sim" : "Não"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Situação</dt>
            <dd className={user.isSuspended ? "text-danger" : "text-success"}>
              {user.isSuspended ? "Suspenso" : "Ativo"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-text-primary">Assinatura</h2>
        <dl className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Status</dt>
            <dd className="text-text-primary">{SUBSCRIPTION_STATUS_LABELS[user.status]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Plano</dt>
            <dd className="text-text-primary">{user.plan ? PLAN_LABELS[user.plan] : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Trial até</dt>
            <dd className="text-text-primary">{formatDate(user.trialEndsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Período pago até</dt>
            <dd className="text-text-primary">{formatDate(user.currentPeriodEnd)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Cortesia até</dt>
            <dd className="text-text-primary">{formatDate(user.compUntil)}</dd>
          </div>
        </dl>
        <p className="text-xs text-text-disabled">
          Estorno/cancelamento financeiro é feito no painel da Mercado Pago — este app só
          reflete o status quando ela notifica via webhook.
        </p>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-text-primary">Ações administrativas</h2>
        <div className="space-y-5">
          <form action={extendTrialAction.bind(null, user.id)} className="flex items-end gap-3">
            <div>
              <Label htmlFor="extend-days">Estender trial (dias)</Label>
              <Input id="extend-days" name="days" type="number" min={1} defaultValue={7} className="w-28" />
            </div>
            <ConfirmSubmitButton confirmMessage={`Estender o trial de ${user.email}?`}>
              Estender trial
            </ConfirmSubmitButton>
          </form>

          <form action={grantCompAction.bind(null, user.id)} className="flex items-end gap-3">
            <div>
              <Label htmlFor="comp-days">Conceder cortesia (dias)</Label>
              <Input id="comp-days" name="days" type="number" min={1} defaultValue={30} className="w-28" />
            </div>
            <ConfirmSubmitButton confirmMessage={`Conceder acesso cortesia a ${user.email}?`}>
              Conceder cortesia
            </ConfirmSubmitButton>
          </form>

          <form action={setSuspendedAction.bind(null, user.id, !user.isSuspended)}>
            <ConfirmSubmitButton
              variant={user.isSuspended ? "primary" : "danger"}
              confirmMessage={
                user.isSuspended
                  ? `Reativar o acesso de ${user.email}?`
                  : `Suspender o acesso de ${user.email}? A conta fica bloqueada mesmo com assinatura ativa.`
              }
            >
              {user.isSuspended ? "Reativar acesso" : "Suspender acesso"}
            </ConfirmSubmitButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
