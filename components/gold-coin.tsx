/** Moeda de ouro 3D girando, em CSS puro — motivo visual do XAU/USD para heros. */
function CoinFace({ showEmblem }: { showEmblem: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <defs>
        <radialGradient id={`coinFace-${showEmblem ? "front" : "back"}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="var(--color-gold-light)" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </radialGradient>
        <linearGradient id={`coinRim-${showEmblem ? "front" : "back"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="100%" stopColor="#8a6a1a" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#coinRim-${showEmblem ? "front" : "back"})`} />
      <circle cx="100" cy="100" r="84" fill={`url(#coinFace-${showEmblem ? "front" : "back"})`} />
      <circle cx="100" cy="100" r="84" fill="none" stroke="#8a6a1a" strokeWidth="2" opacity="0.4" />
      <circle
        cx="100"
        cy="100"
        r="68"
        fill="none"
        stroke="#8a6a1a"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="2 4"
      />
      {showEmblem ? (
        <text x="100" y="118" textAnchor="middle" fontSize="52" fontWeight="700" fill="#7a5c14">
          Au
        </text>
      ) : (
        <path
          d="M100 58 108 88 138 88 114 106 123 136 100 118 77 136 86 106 62 88 92 88Z"
          fill="#7a5c14"
          opacity="0.85"
        />
      )}
    </svg>
  );
}

export function GoldCoin({ className = "" }: { className?: string }) {
  return (
    <div className={`gold-coin-stage ${className}`} aria-hidden>
      <div className="gold-coin-orbit">
        <div className="gold-coin">
          <div className="gold-coin-face gold-coin-face-front">
            <CoinFace showEmblem />
          </div>
          <div className="gold-coin-face gold-coin-face-back">
            <CoinFace showEmblem={false} />
          </div>
        </div>
      </div>
      <div className="gold-coin-shadow" />
    </div>
  );
}
