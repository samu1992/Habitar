import Link from 'next/link';
import { money } from '@/lib/format';
import { STATUS_CHIP } from '@/lib/constants';
import type { ProjectOverview } from '@/lib/types';

/**
 * Tarjeta de portada: la foto (o, si no hay, un tile con la inicial del
 * cliente en el color de su estado) es lo primero que se ve — el resto
 * de los datos del avance vive adentro de la ficha, no acá.
 */
export default function ProjectCard({
  p, showStatus = false, compact = false,
}: { p: ProjectOverview; showStatus?: boolean; compact?: boolean }) {
  const spent = Number(p.egresos ?? 0);
  const budget = Number(p.total_budget ?? 0);
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const over = budget > 0 && spent > budget;
  const initial = p.client_name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Link href={`/proyecto/${p.id}`} className="block active:opacity-80">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-obra-line bg-obra-surface">
        {p.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
            <span
              className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-obra-bg"
              style={{ background: STATUS_CHIP[p.status] }}
            />
          </>
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center font-display font-semibold text-obra-bg ${compact ? 'text-2xl' : 'text-4xl'}`}
            style={{ background: STATUS_CHIP[p.status] }}
          >
            {initial}
          </div>
        )}
      </div>

      <h3 className="mt-2 truncate text-sm font-semibold leading-tight">{p.client_name}</h3>

      {compact ? (
        showStatus && (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_CHIP[p.status] }} />
            {p.status}
          </p>
        )
      ) : (
        <>
          <p className="truncate text-xs text-muted">
            {p.service_type}{p.address ? ` · ${p.address}` : ''}
          </p>
          {showStatus && (
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_CHIP[p.status] }} />
              {p.status}
            </p>
          )}
          {budget > 0 && (
            <>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-obra-line">
                <div className={`h-full ${over ? 'bg-mandarina' : 'bg-ink'}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="tabular mt-1 text-[11px] text-muted">{money(spent)} / {money(budget)}</p>
            </>
          )}
        </>
      )}
    </Link>
  );
}
