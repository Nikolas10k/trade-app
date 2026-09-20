import Image from "next/image";

/**
 * Vídeo de fundo do hero da landing page (gráficos de candles, sem áudio,
 * licença Pexels). Cai para a imagem estática (poster) em `prefers-reduced-motion`.
 * O elemento pai precisa de `relative overflow-hidden`.
 */
export function HeroVideoBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Image
        src="/videos/hero-trading-poster.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <video
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-trading-poster.jpg"
      >
        <source src="/videos/hero-trading.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-overlay absolute inset-0" />
    </div>
  );
}
