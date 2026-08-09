'use client';

import { useActionState, useOptimistic, useState, useTransition } from 'react';
import Sheet from './Sheet';
import {
  addLogistics,
  cycleLogisticsStatus,
  deleteLogistics,
  setRealCost,
  toggleShoppingPurchased,
  updateLogistics,
} from '@/app/actions';
import { money, waLink } from '@/lib/format';
import type { Logistics, LogisticsCategory, LogisticsStatus, ServiceType } from '@/lib/types';

const NEXT: Record<LogisticsStatus, LogisticsStatus> = {
  'Pendiente': 'En Curso/Comprado',
  'En Curso/Comprado': 'Finalizado',
  'Finalizado': 'Pendiente',
};

type ToggleAction = { id: string; cat: LogisticsCategory };

/**
 * TAB 3 — El trabajo sucio.
 *
 * El checkbox es el control central: 44×44 px reales, ciclo de tres estados
 * en un toque (dos para la Lista de Compras), y respuesta instantánea vía
 * useOptimistic. El usuario ve el tilde antes de que salga el request; si el
 * server rechaza, React revierte solo al re-renderizar con los datos
 * verdaderos.
 *
 * Marcar/desmarcar un ítem crea o borra, del lado del servidor, el
 * movimiento financiero vinculado (ver syncLinkedFinancial en actions.ts):
 * acá no se toca el presupuesto directamente, solo se refleja lo que ya pasó.
 */
export default function LogisticsTab({
  projectId, serviceType, rows,
}: { projectId: string; serviceType: ServiceType; rows: Logistics[] }) {
  const [optimistic, setOptimistic] = useOptimistic(
    rows,
    (state: Logistics[], action: ToggleAction): Logistics[] =>
      state.map((r) => {
        if (r.id !== action.id) return r;
        const status = action.cat === 'Shopping List'
          ? (r.status === 'Pendiente' ? 'Finalizado' : 'Pendiente')
          : NEXT[r.status];
        return { ...r, status };
      })
  );
  const [, startTransition] = useTransition();
  const [sheetFor, setSheetFor] = useState<LogisticsCategory | null>(null);
  const [costFor, setCostFor] = useState<Logistics | null>(null);
  const [editFor, setEditFor] = useState<Logistics | null>(null);
  const [addState, addAction, addPending] = useActionState(addLogistics, null);
  const [costState, costAction, costPending] = useActionState(setRealCost, null);
  const [editState, editAction, editPending] = useActionState(updateLogistics, null);

  const toggle = (id: string, cat: LogisticsCategory) => {
    startTransition(async () => {
      setOptimistic({ id, cat });
      if (cat === 'Shopping List') await toggleShoppingPurchased(id, projectId);
      else await cycleLogisticsStatus(id, projectId);
    });
  };

  const groups: { cat: LogisticsCategory; title: string; empty: string; addLabel: string }[] = [
    { cat: 'Material', title: 'Materiales', empty: 'Sin materiales cargados.', addLabel: '+ Agregar material' },
    { cat: 'Contratista', title: 'Tercerizados', empty: 'Sin contratistas cargados.', addLabel: '+ Agregar contratista' },
    ...(serviceType === 'Integral'
      ? [{ cat: 'Shopping List' as LogisticsCategory, title: 'Lista de Compras', empty: 'Sin ítems en la lista de compras.', addLabel: '+ Agregar producto' }]
      : []),
  ];

  return (
    <div className="space-y-8">
      {groups.map(({ cat, title, empty, addLabel }) => {
        const items = optimistic.filter((r) => r.category === cat);
        const done = items.filter((r) => r.status === 'Finalizado').length;
        const shopping = cat === 'Shopping List';

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
                      {/* Checkbox: tres estados (Material/Contratista) o dos (Lista de Compras) */}
                      <button
                        onClick={() => toggle(r.id, cat)}
                        aria-label={`${r.item_name}. Estado: ${r.status}. Tocar para ${shopping ? 'marcar' : 'avanzar'}.`}
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

                      <button
                        type="button"
                        onClick={() => setEditFor(r)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className={`truncate text-[15px] font-medium ${finished ? 'text-muted line-through' : ''}`}>
                          {r.item_name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {shopping ? (r.description || 'Sin detalle') : (r.supplier_or_worker_name || 'Sin proveedor')}
                          {' · '}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); setCostFor(r); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setCostFor(r); } }}
                            className="tabular underline decoration-dotted underline-offset-2"
                          >
                            {r.real_cost != null
                              ? money(Number(r.real_cost))
                              : `est. ${money(Number(r.expected_cost ?? 0))}`}
                          </span>
                        </p>
                      </button>

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
              {addLabel}
            </button>
          </section>
        );
      })}

      {/* Alta */}
      <Sheet
        open={sheetFor !== null}
        onClose={() => setSheetFor(null)}
        title={
          sheetFor === 'Contratista' ? 'Nuevo contratista'
          : sheetFor === 'Shopping List' ? 'Nuevo producto'
          : 'Nuevo material'
        }
      >
        <form action={addAction} className="space-y-4">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="category" value={sheetFor ?? 'Material'} />
          <div>
            <label className="label" htmlFor="l-item">
              {sheetFor === 'Contratista' ? 'Trabajo' : sheetFor === 'Shopping List' ? 'Producto' : 'Material'}
            </label>
            <input
              id="l-item" name="item_name" className="field" autoFocus
              placeholder={
                sheetFor === 'Contratista' ? 'Colocación de durlock'
                : sheetFor === 'Shopping List' ? 'Sofá 3 cuerpos'
                : 'Látex interior blanco · 20 L'
              }
            />
          </div>
          {sheetFor === 'Shopping List' ? (
            <div>
              <label className="label" htmlFor="l-description">Descripción / detalle</label>
              <textarea id="l-description" name="description" rows={2} className="field resize-none" placeholder="Color, medidas, link…" />
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="l-supplier">
                {sheetFor === 'Contratista' ? 'Nombre' : 'Proveedor'}
              </label>
              <input id="l-supplier" name="supplier_or_worker_name" className="field" placeholder="Pinturería del Centro" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="l-cost">
                {sheetFor === 'Shopping List' ? 'Precio estimado' : 'Costo estimado'}
              </label>
              <input id="l-cost" name="expected_cost" inputMode="decimal" className="field tabular" placeholder="0" />
            </div>
            {sheetFor !== 'Shopping List' && (
              <div>
                <label className="label" htmlFor="l-phone">WhatsApp</label>
                <input id="l-phone" name="contact_phone" type="tel" inputMode="tel" className="field" placeholder="11 …" />
              </div>
            )}
          </div>
          {addState && !addState.ok && <p className="text-sm text-alert">{addState.error}</p>}
          <button className="btn-primary" disabled={addPending}>
            {addPending ? 'Guardando…' : 'Agregar'}
          </button>
        </form>
      </Sheet>

      {/* Costo real */}
      <Sheet open={costFor !== null} onClose={() => setCostFor(null)} title={costFor?.category === 'Shopping List' ? 'Precio real' : 'Costo real'}>
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

      {/* Edición */}
      <Sheet
        open={editFor !== null}
        onClose={() => setEditFor(null)}
        title={editFor?.category === 'Shopping List' ? 'Editar producto' : editFor?.category === 'Contratista' ? 'Editar contratista' : 'Editar material'}
      >
        {editFor && (
          <form action={editAction} className="space-y-4">
            <input type="hidden" name="id" value={editFor.id} />
            <input type="hidden" name="project_id" value={projectId} />
            <div>
              <label className="label" htmlFor="edit-item">
                {editFor.category === 'Contratista' ? 'Trabajo' : editFor.category === 'Shopping List' ? 'Producto' : 'Material'}
              </label>
              <input id="edit-item" name="item_name" className="field" autoFocus defaultValue={editFor.item_name} />
            </div>
            {editFor.category === 'Shopping List' ? (
              <div>
                <label className="label" htmlFor="edit-description">Descripción / detalle</label>
                <textarea id="edit-description" name="description" rows={2} className="field resize-none" defaultValue={editFor.description ?? ''} />
              </div>
            ) : (
              <div>
                <label className="label" htmlFor="edit-supplier">
                  {editFor.category === 'Contratista' ? 'Nombre' : 'Proveedor'}
                </label>
                <input id="edit-supplier" name="supplier_or_worker_name" className="field" defaultValue={editFor.supplier_or_worker_name ?? ''} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="edit-expected">
                  {editFor.category === 'Shopping List' ? 'Precio estimado' : 'Costo estimado'}
                </label>
                <input id="edit-expected" name="expected_cost" inputMode="decimal" className="field tabular" defaultValue={editFor.expected_cost ?? 0} />
              </div>
              <div>
                <label className="label" htmlFor="edit-real">
                  {editFor.category === 'Shopping List' ? 'Precio real' : 'Costo real'}
                </label>
                <input id="edit-real" name="real_cost" inputMode="decimal" className="field tabular" defaultValue={editFor.real_cost ?? ''} placeholder="—" />
              </div>
            </div>
            {editFor.category !== 'Shopping List' && (
              <div>
                <label className="label" htmlFor="edit-phone">WhatsApp</label>
                <input id="edit-phone" name="contact_phone" type="tel" inputMode="tel" className="field" defaultValue={editFor.contact_phone ?? ''} />
              </div>
            )}
            {editState && !editState.ok && <p className="text-sm text-alert">{editState.error}</p>}
            <button className="btn-primary" disabled={editPending}>
              {editPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
