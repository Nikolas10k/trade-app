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
  saldo: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <path d="M3 8.5 12 4l9 4.5M4 10v9M20 10v9M8 13v4M12 13v4M16 13v4M2.5 19h19" />
    </IconWrap>
  ),
  assertividade: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </IconWrap>
  ),
  tela: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconWrap>
  ),
  disciplina: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <path d="M12 3.5 19 6v5.2c0 4.3-2.9 7.4-7 8.8-4.1-1.4-7-4.5-7-8.8V6l7-2.5Z" />
      <path d="m9.2 12 1.9 1.9 3.7-3.9" />
    </IconWrap>
  ),
} as const;

export function MetricCard({
  label,
  value,
  hint,
  icon,
  gold = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: keyof typeof ICONS;
  gold?: boolean;
}) {
  const Icon = icon ? ICONS[icon] : null;

  return (
    <Card className={gold ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : undefined}>
      <div className="mb-1 flex items-center gap-1.5">
        {Icon ? <Icon className={gold ? "text-gold-light" : "text-text-muted"} /> : null}
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${gold ? "text-gold-light" : "text-text-primary"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </Card>
  );
}
