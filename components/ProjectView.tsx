'use client';

import { useState } from 'react';
import Link from 'next/link';
import BottomTabBar, { type TabKey } from './BottomTabBar';
import SummaryTab from './SummaryTab';
import FinancialTab from './FinancialTab';
import LogisticsTab from './LogisticsTab';
import StatusSheet from './StatusSheet';
import type { Financial, Logistics, Project } from '@/lib/types';

/**
 * Contenedor de la ficha. El estado de la pestaña vive acá y no en la URL:
 * cambiar de tab no navega, así que no se pierde nada de lo que se estaba
 * tipeando ni se dispara un fetch nuevo.
 */
export default function ProjectView({
  project, financials, logistics,
}: { project: Project; financials: Financial[]; logistics: Logistics[] }) {
  const [tab, setTab] = useState<TabKey>('resumen');
  const pendientes = logistics.filter((l) => l.status !== 'Finalizado').length;

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-20 border-b border-obra-line bg-obra-bg/95 px-5 pb-4 pt-5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver a la lista"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-muted active:bg-obra-raised"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path d="M15 5l-7 7 7 7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold leading-tight">{project.client_name}</h1>
            <p className="truncate text-xs text-muted">
              {project.service_type}{project.address ? ` · ${project.address}` : ''}
            </p>
          </div>
          <StatusSheet projectId={project.id} current={project.status} />
        </div>
      </header>

      <div className="px-5 pt-6">
        {tab === 'resumen' && <SummaryTab project={project} />}
        {tab === 'finanzas' && (
          <FinancialTab projectId={project.id} totalBudget={Number(project.total_budget)} rows={financials} />
        )}
        {tab === 'logistica' && <LogisticsTab projectId={project.id} rows={logistics} />}
      </div>

      <BottomTabBar active={tab} onChange={setTab} badge={{ logistica: pendientes }} />
    </div>
  );
}
