'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * La mitad "del otro teléfono" del tiempo real.
 *
 * Escucha los cambios de Postgres y, ante cualquiera, pide de nuevo el Server
 * Component con router.refresh(). No reemplaza datos a mano en el cliente:
 * deja que el servidor sea siempre la fuente de verdad. Es un pedido chico y
 * evita todo un tipo de bug de estado desincronizado.
 *
 * `scope` limita el canal a un proyecto cuando estamos dentro de su ficha,
 * así el dashboard no se refresca por cambios que no está mostrando.
 */
export default function RealtimeRefresher({ projectId }: { projectId?: string }) {
  const router = useRouter();

  useEffect(() => {
    const db = supabaseBrowser();
    const filter = projectId ? `project_id=eq.${projectId}` : undefined;

    const channel = db
      .channel(projectId ? `obra:${projectId}` : 'obra:dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financials', filter }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics', filter }, () => router.refresh())
      .subscribe();

    // Volver a la app después de tenerla en segundo plano: resincronizar.
    const onVisible = () => document.visibilityState === 'visible' && router.refresh();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      db.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router, projectId]);

  return null;
}
