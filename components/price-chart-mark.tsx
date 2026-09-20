/** Marca ilustrativa de candles + linha de preço, usada em heros da marca. */
export function PriceChartMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={className} fill="none" aria-hidden>
      <path
        d="M2 45 L2 30 M2 37 L8 37 M8 42 L8 20 M8 31 L14 31 M14 38 L14 22 M14 30 L20 30 M20 25 L20 10 M20 17 L26 17 M26 22 L26 5 M26 13 L32 13"
        stroke="var(--color-danger)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        className="ambient-chart-line"
        d="M2 40 C 30 38, 45 20, 70 24 S 110 8, 140 14 S 175 4, 198 6"
        stroke="var(--color-gold-light)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
