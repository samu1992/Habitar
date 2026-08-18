'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectListRow from './ProjectListRow';
import AddProjectTile from './AddProjectTile';
import AddProjectRow from './AddProjectRow';
import NewProjectSheet from './NewProjectSheet';
import Logo from './Logo';
import PrimaryNavBar from './PrimaryNavBar';
import { STATUSES, STATUS_CHIP } from '@/lib/constants';
import type { ProjectOverview, ProjectStatus } from '@/lib/types';

type View = 'todos' | 'etapa';

/**
 * EL KANBAN DE BOLSILLO
 *
 * Dos formas de ver lo mismo: "Todos" es una grilla plana (una sola tarjeta
 * de alta, arriba de todo) con la etapa como dato chico en cada tarjeta —
 * el estado se sigue viendo en el landing, pero se cambia adentro de la
 * ficha del proyecto (StatusSheet), no desde acá. "Por etapa" es el
 * acordeón clásico para cuando lo que hace falta es organizar, no repasar.
 *
 * Las 4 secciones arrancan cerradas en la vista por etapa — cada carga de
 * página (o refresh) vuelve a este mismo estado, no recuerda lo que había
 * quedado abierto.
 */
export default function Dashboard({ projects }: { projects: ProjectOverview[] }) {
  const [view, setView] = useState<View>('todos');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Onboarding': false,
    'Pre-Producción': false,
    'Producción': false,
    'Entrega': false,
  });
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const toggle = (s: ProjectStatus) => setOpenGroups((g) => ({ ...g, [s]: !g[s] }));
  const grouped = (s: ProjectStatus) => projects.filter((p) => p.status === s);

  return (
    <main className="min-h-dvh px-5 pb-28 pt-8">
      <header className="mb-7 flex items-center justify-between">
        <Logo className="h-7 w-auto" />
        <button
          onClick={() => setNewProjectOpen(true)}
          aria-label="Nuevo proyecto"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-obra-line text-2xl font-light active:bg-obra-raised"
        >
          +
        </button>
      </header>

      <div className="mb-4 flex gap-2 rounded-xl bg-obra-raised p-1">
        {([['todos', 'Todos'], ['etapa', 'Por etapa']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${view === key ? 'bg-ink text-obra-bg' : 'text-muted'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'todos' ? (
        <div className="grid grid-cols-3 gap-3">
          <AddProjectTile onClick={() => setNewProjectOpen(true)} compact />
          {projects.map((p) => <ProjectCard key={p.id} p={p} showStatus compact />)}
        </div>
      ) : (
        <div className="space-y-3">
          {STATUSES.map((status) => {
            const items = grouped(status);
            const isOpen = openGroups[status];
            const isOnboarding = status === 'Onboarding';
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
                    {isOnboarding && <AddProjectRow onClick={() => setNewProjectOpen(true)} />}
                    {items.length === 0 && !isOnboarding
                      ? <p className="py-3 text-center text-sm text-muted">Nada acá.</p>
                      : items.map((p) => <ProjectListRow key={p.id} p={p} />)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <NewProjectSheet trigger="external" open={newProjectOpen} onOpenChange={setNewProjectOpen} />
      <PrimaryNavBar />
    </main>
  );
}
