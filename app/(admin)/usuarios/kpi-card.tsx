import type { ReactNode, SVGProps } from "react";
import { Card } from "@/components/ui";

function IconWrap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
      {...props}
    />
  );
}

const ICONS = {
  usuarios: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.8 14.2c2.3.3 4 1.9 4.4 4.3" />
    </IconWrap>
  ),
  mrr: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M14.5 9.3c0-1.1-1.1-1.8-2.5-1.8s-2.5.7-2.5 1.8 1.1 1.6 2.5 1.9c1.4.3 2.5.8 2.5 1.9s-1.1 1.8-2.5 1.8-2.5-.7-2.5-1.8" />
    </IconWrap>
  ),
  trial: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <path d="M7 3h10M7 21h10" />
      <path d="M7 3c0 5 3 6 3 9s-3 4-3 9M17 3c0 5-3 6-3 9s3 4 3 9" />
    </IconWrap>
  ),
  suspenso: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6.5 6.5 11 11" />
    </IconWrap>
  ),
} as const;

export function KpiCard({
  icon,
  label,
  value,
  hint,
  gold = false,
}: {
  icon: keyof typeof ICONS;
  label: string;
  value: ReactNode;
  hint?: string;
  gold?: boolean;
}) {
  const Icon = ICONS[icon];
  return (
    <Card className={gold ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : undefined}>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={gold ? "text-gold-light" : "text-text-muted"} />
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${gold ? "text-gold-light" : "text-text-primary"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </Card>
  );
}
