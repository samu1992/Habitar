'use client';

import { useActionState } from 'react';
import { signIn } from '../actions';

export default function Acceso() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-dvh flex-col justify-center px-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brass-deep">un.studio</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Panel de obra</h1>
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
        {state && !state.ok && <p className="text-sm text-alert">{state.error}</p>}
        <button className="btn-primary" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
