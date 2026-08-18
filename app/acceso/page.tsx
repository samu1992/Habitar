'use client';

import { useActionState } from 'react';
import Logo from '@/components/Logo';
import { signIn } from '../actions';

export default function Acceso() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-dvh flex-col justify-center px-7">
      <Logo className="h-9 w-auto" />
      <h1 className="mt-4 font-display text-3xl font-semibold">Panel de obra</h1>
      <p className="mt-2 text-sm text-muted">Escribí el código del estudio. Queda guardado en este teléfono.</p>

      <form action={action} className="mt-8 space-y-3">
        <input
          name="code"
          type="password"
          autoComplete="current-password"
          placeholder="Código"
          className="field text-center tracking-[0.3em]"
          autoFocus
        />
        {state && !state.ok && <p className="text-sm text-mandarina">{state.error}</p>}
        <button className="btn-primary" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
