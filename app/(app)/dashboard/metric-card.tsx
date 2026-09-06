import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export function MetricCard({
  label,
  value,
  hint,
  gold = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  gold?: boolean;
}) {
  return (
    <Card className={gold ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : undefined}>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`text-2xl font-bold ${gold ? "text-gold-light" : "text-text-primary"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </Card>
  );
}
