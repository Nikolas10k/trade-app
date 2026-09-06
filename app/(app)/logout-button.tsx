import { logOutAction } from "../(auth)/actions";

export function LogoutButton() {
  return (
    <form action={logOutAction}>
      <button type="submit" className="text-sm text-text-muted hover:text-text-primary">
        Sair
      </button>
    </form>
  );
}
