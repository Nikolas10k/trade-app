import { Card } from "@/components/ui";

export const metadata = { title: "Configurações — Diário XAU/USD" };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Configurações</h1>
      <Card>
        <p className="text-text-secondary">
          Instrumento, preferências, segurança (2FA), assinatura e exportação/exclusão de
          dados (LGPD) chegam nas Fases 6 e 7.
        </p>
      </Card>
    </div>
  );
}
