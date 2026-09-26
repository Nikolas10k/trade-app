import Image from "next/image";

/**
 * Vídeo de fundo do painel lateral da tela de login (substitui o
 * AmbientBackground estático). Vídeo vertical (9:16), então cobre bem a
 * coluna alta e estreita do painel com object-cover.
 */
export function LoginVideoBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Image
        src="/videos/login-bg-poster.jpg"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <video
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/login-bg-poster.jpg"
      >
        <source src="/videos/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="login-video-overlay absolute inset-0" />
    </div>
  );
}
