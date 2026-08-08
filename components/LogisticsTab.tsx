'use client';

import { useActionState, useOptimistic, useState, useTransition } from 'react';
import Sheet from './Sheet';
import { addLogistics, cycleLogisticsStatus, deleteLogistics, setRealCost } from '@/app/actions';
import { money, waLink } from '@/lib/format';
import type { Logistics, LogisticsCategory, LogisticsStatus } from '@/lib/types';

const NEXT: Record<LogisticsStatus, LogisticsStatus> = {
  'Pendiente': 'En Curso/Comprado',
  'En Curso/Comprado': 'Finalizado',
  'Finalizado': 'Pendiente',
};

/**
 * TAB 3 — El trabajo sucio.
 *
 * El checkbox es el control central: 44×44 px reales, ciclo de tres estados
 * en un toque, y respuesta instantánea vía useOptimistic. El usuario ve el
 * tilde antes de que salga el request; si el server rechaza, React revierte
 * solo al re-renderizar con los datos verdaderos.
 */
export default function LogisticsTab({
  projectId, rows,
}: { projectId: string; rows: Logistics[] }) {
  const [optimistic, setOptimistic] = useOptimistic(
    rows,
    (state: Logistics[], id: string): Logistics[] =>
      state.map((r) => (r.id === id ? { ...r, status: NEXT[r.status] } : r))
  );
  const [, startTransition] = useTransition();
  const [sheetFor, setSheetFor] = useState<LogisticsCategory | null>(null);
  const [costFor, setCostFor] = useState<Logistics | null>(null);
  const [addState, addAction, addPending] = useActionState(addLogistics, null);
  const [costState, costAction, costPending] = useActionState(setRealCost, null);

  const toggle = (id: string) => {
    startTransition(async () => {
      setOptimistic(id);              // 1. pinta el cambio ya
      await cycleLogisticsStatus(id, projectId); // 2. lo persiste y avisa al otro teléfono
    });
  };

  const groups: { cat: LogisticsCategory; title: string; empty: string }[] = [
    { cat: 'Material', title: 'Materiales', empty: 'Sin materiales cargados.' },
    { cat: 'Contratista', title: 'Tercerizados', empty: 'Sin contratistas cargados.' },
  ];

  return (
    <div className="space-y-8">
      {groups.map(({ cat, title, empty }) => {
        const items = optimistic.filter((r) => r.category === cat);
        const done = items.filter((r) => r.status === 'Finalizado').length;

        return (
          <section key={cat}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">{title}</h2>
              <span className="tabular text-sm text-muted">
                {items.length > 0 ? `${done}/${items.length}` : ''}
              </span>
            </div>

            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-obra-line p-6 text-center text-sm text-muted">
                {empty}
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((r) => {
                  const finished = r.status === 'Finalizado';
                  const inProgress = r.status === 'En Curso/Comprado';
                  const wa = waLink(
                    r.contact_phone,
                    `Hola! Te escribo de un.studio por ${r.item_name}.`
                  );

                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-3 rounded-xl border border-obra-line bg-obra-surface p-3"
                    >
                      {/* Checkbox de tres estados */}
                      <button
                        onClick={() => toggle(r.id)}
                        aria-label={`${r.item_name}. Estado: ${r.status}. Tocar para avanzar.`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 transition-colors
                          ${finished ? 'border-sage bg-sage' : inProgress ? 'border-brass bg-brass/20' : 'border-obra-line'}`}
                      >
                        {finished && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M5 13l4 4L19 7" stroke="#121110" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {inProgress && <span className="h-2.5 w-2.5 rounded-full bg-brass" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[15px] font-medium ${finished ? 'text-muted line-through' : ''}`}>
                          {r.item_name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {r.supplier_or_worker_name || 'Sin proveedor'}
                          {' · '}
                          <button
                            onClick={() => setCostFor(r)}
                            className="tabular underline decoration-dotted underline-offset-2"
                          >
                            {r.real_cost != null
                              ? money(Number(r.real_cost))
                              : `est. ${money(Number(r.expected_cost ?? 0))}`}
                          </button>
                        </p>
                      </div>

                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener"
                          aria-label={`WhatsApp a ${r.supplier_or_worker_name ?? 'contacto'}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sage/15 text-sage active:bg-sage/30"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.6 1.1 1.4 1.8 1 .8 1.7 1.1 2 1.2.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.7-.1 1.3z" />
                          </svg>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`¿Borrar "${r.item_name}"?`)) {
                            startTransition(() => { deleteLogistics(r.id, projectId); });
                          }
                        }}
                        aria-label={`Borrar ${r.item_name}`}
                        className="shrink-0 px-1 text-muted"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button onClick={() => setSheetFor(cat)} className="btn-ghost mt-3 w-full">
              + Agregar {cat === 'Material' ? 'material' : 'contratista'}
            </button>
          </section>
        );
      })}

      {/* Alta */}
      <Sheet
        open={sheetFor !== null}
        onClose={() => setSheetFor(null)}
        title={sheetFor === 'Contratista' ? 'Nuevo contratista' : 'Nuevo material'}
      >
        <form action={addAction} className="space-y-4">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="category" value={sheetFor ?? 'Material'} />
          <div>
            <label className="label" htmlFor="l-item">
              {sheetFor === 'Contratista' ? 'Trabajo' : 'Material'}
            </label>
            <input
              id="l-item" name="item_name" className="field" autoFocus
              placeholder={sheetFor === 'Contratista' ? 'Colocación de durlock' : 'Látex interior blanco · 20 L'}
            />
          </div>
          <div>
            <label className="label" htmlFor="l-supplier">
              {sheetFor === 'Contratista' ? 'Nombre' : 'Proveedor'}
            </label>
            <input id="l-supplier" name="supplier_or_worker_name" className="field" placeholder="Pinturería del Centro" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="l-cost">Costo estimado</label>
              <input id="l-cost" name="expected_cost" inputMode="decimal" className="field tabular" placeholder="0" />
            </div>
            <div>
              <label className="label" htmlFor="l-phone">WhatsApp</label>
              <input id="l-phone" name="contact_phone" type="tel" inputMode="tel" className="field" placeholder="11 …" />
            </div>
          </div>
          {addState && !addState.ok && <p className="text-sm text-alert">{addState.error}</p>}
          <button className="btn-primary" disabled={addPending}>
            {addPending ? 'Guardando…' : 'Agregar'}
          </button>
        </form>
      </Sheet>

      {/* Costo real */}
      <Sheet open={costFor !== null} onClose={() => setCostFor(null)} title="Costo real">
        {costFor && (
          <form action={costAction} className="space-y-4">
            <input type="hidden" name="id" value={costFor.id} />
            <input type="hidden" name="project_id" value={projectId} />
            <p className="text-sm text-muted">
              {costFor.item_name} · estimado {money(Number(costFor.expected_cost ?? 0))}
            </p>
            <input
              name="real_cost" inputMode="decimal" autoFocus
              className="field tabular text-center font-display text-3xl"
              defaultValue={costFor.real_cost ?? costFor.expected_cost ?? 0}
            />
            {costState && !costState.ok && <p className="text-sm text-alert">{costState.error}</p>}
            <button className="btn-primary" disabled={costPending}>
              {costPending ? 'Guardando…' : 'Guardar costo'}
            </button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
