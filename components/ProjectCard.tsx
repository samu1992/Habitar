import Link from 'next/link';
import { money } from '@/lib/format';
import { STATUSES, STATUS_CHIP } from '@/lib/constants';
import StatusSheet from './StatusSheet';
import type { ProjectOverview } from '@/lib/types';

/**
 * El avance se muestra en dos capas, porque son dos preguntas distintas:
 *  · la escalerita de 4 tramos = en qué etapa del proceso está la obra
 *  · la línea fina de abajo    = cuánto presupuesto se consumió
 * Nunca se promedian en un solo número: un 60% mezclado no significa nada.
 */
export default function ProjectCard({ p }: { p: ProjectOverview }) {
  const stage = STATUSES.indexOf(p.status);
  const spent = Number(p.egresos ?? 0);
  const budget = Number(p.total_budget ?? 0);
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const over = budget > 0 && spent > budget;

  return (
    <Link
      href={`/proyecto/${p.id}`}
      className="block rounded-xl border border-obra-line bg-obra-surface p-4 active:bg-obra-raised"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold leading-tight">{p.client_name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {p.service_type}
            {p.address ? ` · ${p.address}` : ''}
          </p>
        </div>
        <StatusSheet projectId={p.id} current={p.status} label="Mover" />
      </div>

      {/* Escalerita de etapa */}
      <div className="mt-4 flex gap-1" aria-label={`Etapa ${stage + 1} de 4: ${p.status}`}>
        {STATUSES.map((s, i) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: i <= stage ? STATUS_CHIP[p.status] : '#322E29' }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="tabular text-muted">
          {money(spent)} <span className="opacity-50">/ {money(budget)}</span>
        </span>
        {p.total_items > 0 && (
          <span className="tabular text-muted">
            {p.done_items}/{p.total_items} ítems
          </span>
        )}
      </div>

      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-obra-line">
        <div className={`h-full ${over ? 'bg-clay' : 'bg-brass'}`} style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
