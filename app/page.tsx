import Dashboard from '@/components/Dashboard';
import RealtimeRefresher from '@/components/RealtimeRefresher';
import { supabaseServer } from '@/lib/supabase/server';
import type { ProjectOverview } from '@/lib/types';

// Siempre fresco: dos personas escribiendo a la vez no toleran caché.
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Una sola consulta a la vista: los totales ya vienen calculados en Postgres.
  const { data, error } = await supabaseServer()
    .from('project_overview')
    .select('*')
    .order('start_date', { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <h1 className="font-display text-xl font-semibold">No se pudo leer la base</h1>
        <p className="mt-2 text-sm text-muted">{error.message}</p>
        <p className="mt-4 text-xs text-muted">
          Revisá las variables de entorno y que el schema.sql esté ejecutado.
        </p>
      </main>
    );
  }

  return (
    <>
      <RealtimeRefresher />
      <Dashboard projects={(data ?? []) as ProjectOverview[]} />
    </>
  );
}
