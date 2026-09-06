export function BalanceChart({ balances }: { balances: number[] }) {
  if (balances.length < 2) {
    return (
      <p className="flex h-40 items-center justify-center text-sm text-text-muted">
        Registre pelo menos 2 trades para ver o saldo evolutivo.
      </p>
    );
  }

  const width = 600;
  const height = 160;
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const range = max - min || 1;

  const points = balances.map((balance, i) => {
    const x = (i / (balances.length - 1)) * width;
    const y = height - ((balance - min) / range) * height;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="balanceLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary-light)" />
          <stop offset="100%" stopColor="var(--color-secondary-light)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#balanceGradient)" />
      <path d={linePath} fill="none" stroke="url(#balanceLine)" strokeWidth={2} />
    </svg>
  );
}
