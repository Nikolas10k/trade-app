/**
 * Fundo decorativo (orbs com glow + grade sutil) reutilizado no hero da landing
 * page e no painel da tela de login. O elemento pai precisa de `relative
 * overflow-hidden` para conter as camadas absolutas.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-bg absolute inset-0" aria-hidden>
      <div className="ambient-orb ambient-orb-gold" />
      <div className="ambient-orb ambient-orb-blue" />
      <div className="ambient-grid" />
    </div>
  );
}
