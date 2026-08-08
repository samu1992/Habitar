'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import NewProjectSheet from './NewProjectSheet';
import { STATUSES, STATUS_CHIP } from '@/lib/constants';
import { money } from '@/lib/format';
import type { ProjectOverview, ProjectStatus } from '@/lib/types';

/**
 * EL KANBAN DE BOLSILLO
 *
 * Las columnas horizontales de un kanban clásico obligan a desplazarse en dos
 * ejes en una pantalla vertical. Acá cada estado es un acordeón apilado: se
 * recorre con un solo pulgar, siempre hacia abajo.
 *
 * Producción arranca abierto porque es donde está la obra que se está
 * ejecutando hoy; el resto arranca cerrado para que la primera pantalla
 * entre completa sin scrollear.
 */
export default function Dashboard({ projects }: { projects: ProjectOverview[] }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Onboarding': false,
    'Pre-Producción': true,
    'Producción': true,
    'Entrega': false,
  });

  const toggle = (s: ProjectStatus) => setOpenGroups((g) => ({ ...g, [s]: !g[s] }));
  const grouped = (s: ProjectStatus) => projects.filter((p) => p.status === s);

  const activos = projects.filter((p) => p.status !== 'Entrega');
  const enCalle = activos.reduce((sum, p) => sum + Number(p.total_budget ?? 0), 0);

  return (
    <main className="min-h-dvh px-5 pb-28 pt-8">
      <header className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brass-deep">un.studio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-none">Obra</h1>
        <p className="mt-3 text-sm text-muted">
          {activos.length === 0
            ? 'Sin proyectos activos.'
            : <>
                {activos.length} {activos.length === 1 ? 'proyecto activo' : 'proyectos activos'} ·{' '}
                <span className="tabular">{money(enCalle)}</span> comprometidos
              </>}
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-obra-line p-8 text-center">
          <p className="font-display text-lg">Todavía no hay proyectos</p>
          <p className="mt-2 text-sm text-muted">Tocá el + para cargar el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {STATUSES.map((status) => {
            const items = grouped(status);
            const isOpen = openGroups[status];
            return (
              <section key={status} className="overflow-hidden rounded-xl border border-obra-line bg-obra-surface">
                <button
                  onClick={() => toggle(status)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-obra-raised"
                >
                  <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: STATUS_CHIP[status] }} />
                  <span className="font-display text-base font-semibold">{status}</span>
                  <span className="tabular ml-auto text-sm text-muted">{items.length}</span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" aria-hidden
                    className={`shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="space-y-3 border-t border-obra-line bg-obra-bg/40 p-3">
                    {items.length === 0
                      ? <p className="py-3 text-center text-sm text-muted">Nada acá.</p>
                      : items.map((p) => <ProjectCard key={p.id} p={p} />)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <NewProjectSheet />
    </main>
  );
}
