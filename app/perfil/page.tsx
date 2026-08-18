import Logo from '@/components/Logo';
import PrimaryNavBar from '@/components/PrimaryNavBar';
import { signOut } from '@/app/actions';

export default function Perfil() {
  return (
    <main className="min-h-dvh px-5 pb-28 pt-8">
      <Logo className="h-8 w-auto" />
      <h1 className="mt-4 font-display text-3xl font-semibold leading-none">Perfil</h1>
      <p className="mt-3 text-sm text-muted">Acceso compartido del estudio.</p>

      <form action={signOut} className="mt-8">
        <button className="w-full rounded-xl border border-obra-line bg-obra-surface py-3.5 text-sm font-semibold text-ink active:bg-obra-raised">
          Cerrar sesión
        </button>
      </form>

      <PrimaryNavBar />
    </main>
  );
}
