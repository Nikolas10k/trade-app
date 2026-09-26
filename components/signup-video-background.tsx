import Image from "next/image";

/**
 * Vídeo de fundo da tela de criar conta — fixed (não absolute) porque o
 * AuthLayout centraliza o conteúdo num container estreito (max-w-sm); fixed
 * escapa dessa largura e cobre a viewport inteira sem precisar mexer no
 * layout compartilhado com as outras telas de auth (que continuam só com o
 * ambient-grid).
 */
export function SignupVideoBackground() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <Image
        src="/videos/signup-bg-poster.jpg"
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
        poster="/videos/signup-bg-poster.jpg"
      >
        <source src="/videos/signup-bg.mp4" type="video/mp4" />
      </video>
      <div className="signup-video-overlay absolute inset-0" />
    </div>
  );
}
