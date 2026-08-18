'use client';

import { useActionState, useState, useTransition } from 'react';
import Sheet from './Sheet';
import BudgetGauge from './BudgetGauge';
import { addFinancial, deleteFinancial, updateFinancial } from '@/app/actions';
import { MIN_PROFIT_PCT } from '@/lib/constants';
import { money, shortDate } from '@/lib/format';
import type { Financial } from '@/lib/types';

/** TAB 2 — El termómetro: cuánto entró, cuánto salió, cuánto queda. */
export default function FinancialTab({
  projectId, totalBudget, studioProfitPct, rows,
}: { projectId: string; totalBudget: number; studioProfitPct: number; rows: Financial[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'Egreso' | 'Ingreso'>('Egreso');
  const [editing, setEditing] = useState<Financial | null>(null);
  const [state, action, pending] = useActionState(addFinancial, null);
  const [editState, editAction, editPending] = useActionState(updateFinancial, null);
  const [, startTransition] = useTransition();

  const ingresos = rows.filter((r) => r.type === 'Ingreso').reduce((s, r) => s + Number(r.amount), 0);
  const egresos = rows.filter((r) => r.type === 'Egreso').reduce((s, r) => s + Number(r.amount), 0);

  // La ganancia siempre se calcula como % del presupuesto total, no como un
  // monto fijo: así se mantiene proporcional sin importar el tamaño de la obra.
  const studioProfit = totalBudget * (studioProfitPct / 100);
  const executionBudget = Math.max(totalBudget - studioProfit, 0);
  const remainingExecution = executionBudget - egresos;
  const underMinProfit = studioProfitPct < MIN_PROFIT_PCT;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-obra-line bg-obra-surface p-5">
        <BudgetGauge spent={egresos} total={executionBudget} />
      </section>

      {/* Desglose: de dónde sale el presupuesto de obra */}
      <section className="overflow-hidden rounded-xl border border-obra-line bg-obra-surface">
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm text-muted">Presupuesto Total</span>
          <span className="tabular text-sm font-semibold">{money(totalBudget)}</span>
        </div>
        <div className="flex justify-between border-t border-obra-line px-4 py-3">
          <span className="text-sm text-muted">Ganancia del Estudio</span>
          <span className="flex items-baseline gap-1.5">
            <span className={`tabular text-[11px] font-semibold ${underMinProfit ? 'text-mandarina' : 'text-celeste'}`}>
              {underMinProfit ? '⚠ ' : ''}{studioProfitPct.toFixed(1)}%
            </span>
            <span className="tabular text-sm font-semibold">{money(studioProfit)}</span>
          </span>
        </div>
        <div className="flex justify-between border-t border-obra-line px-4 py-3">
          <span className="text-sm text-muted">Presupuesto de Obra</span>
          <span className="tabular text-sm font-semibold">{money(executionBudget)}</span>
        </div>
        {underMinProfit && (
          <p className="border-t border-obra-line bg-bordo/40 px-4 py-2.5 text-xs font-medium text-mandarina">
            Por debajo del piso de {MIN_PROFIT_PCT}%. Revisá el presupuesto de este proyecto.
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-obra-line bg-obra-surface p-4">
          <p className="label mb-1">Consumido</p>
          <p className="tabular font-display text-xl font-semibold text-mandarina">{money(egresos)}</p>
        </div>
        <div className="rounded-xl border border-obra-line bg-obra-surface p-4">
          <p className="label mb-1">Disponible (Obra)</p>
          <p className={`tabular font-display text-xl font-semibold ${remainingExecution < 0 ? 'text-mandarina' : 'text-celeste'}`}>
            {money(remainingExecution)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-obra-line bg-obra-surface p-4">
        <p className="label mb-1">Cobrado</p>
        <p className="tabular font-display text-xl font-semibold text-celeste">{money(ingresos)}</p>
      </div>

      <section>
        <h2 className="label">Movimientos</h2>
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-obra-line p-6 text-center text-sm text-muted">
            Sin movimientos. Tocá el + para cargar el primero.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-obra-line bg-obra-surface">
            {rows.map((r, i) => {
              const income = r.type === 'Ingreso';
              const linked = !!r.linked_logistic_id;
              return (
                <li key={r.id} className={`flex items-center gap-3 px-4 py-3.5 ${i ? 'border-t border-obra-line' : ''}`}>
                  <span className={`h-8 w-1 shrink-0 rounded-full ${income ? 'bg-celeste' : 'bg-mandarina'}`} />
                  <button
                    type="button"
                    onClick={() => !linked && setEditing(r)}
                    disabled={linked}
                    className="min-w-0 flex-1 text-left disabled:cursor-default"
                  >
                    <p className="truncate text-sm font-medium">
                      {r.description}
                      {linked && <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wide text-muted">· Logística</span>}
                    </p>
                    <p className="tabular text-xs text-muted">{shortDate(r.date)}</p>
                  </button>
                  <span className={`tabular shrink-0 text-sm font-semibold ${income ? 'text-celeste' : 'text-ink'}`}>
                    {income ? '+' : '−'}{money(Number(r.amount))}
                  </span>
                  <button
                    onClick={() => {
                      if (linked) {
                        alert('Este movimiento viene de Logística: desmarcá el ítem para borrarlo.');
                        return;
                      }
                      if (confirm('¿Borrar este movimiento?')) {
                        startTransition(() => { deleteFinancial(r.id, projectId); });
                      }
                    }}
                    aria-label={`Borrar ${r.description}`}
                    className="shrink-0 px-2 text-muted"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* FAB: carga en menos de 10 segundos, parado en el mostrador */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 h-16 w-16 rounded-full bg-ink text-3xl font-light text-obra-bg shadow-lg shadow-black/40 active:bg-ink/80"
        aria-label="Agregar movimiento"
      >
        +
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Nuevo movimiento">
        <form action={action} className="space-y-4">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="type" value={type} />

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-obra-raised p-1">
            {(['Egreso', 'Ingreso'] as const).map((t) => (
              <button
                key={t} type="button" onClick={() => setType(t)}
                className={`rounded-lg py-3 text-sm font-semibold ${
                  type === t ? (t === 'Ingreso' ? 'bg-celeste text-obra-bg' : 'bg-mandarina text-obra-bg') : 'text-muted'
                }`}
              >
                {t === 'Egreso' ? 'Gasto' : 'Cobro'}
              </button>
            ))}
          </div>

          <div>
            <label className="label" htmlFor="f-amount">Monto</label>
            <input
              id="f-amount" name="amount" inputMode="decimal" autoFocus
              className="field tabular text-center font-display text-3xl" placeholder="0"
            />
          </div>
          <div>
            <label className="label" htmlFor="f-desc">Concepto</label>
            <input id="f-desc" name="description" className="field" placeholder="Látex interior · 20 L" />
          </div>
          <div>
            <label className="label" htmlFor="f-date">Fecha</label>
            <input
              id="f-date" name="date" type="date" className="field"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>

          {state && !state.ok && <p className="text-sm text-mandarina">{state.error}</p>}
          <button className="btn-primary" disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar movimiento'}
          </button>
        </form>
      </Sheet>

      {/* Edición */}
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title="Editar movimiento">
        {editing && (
          <form action={editAction} className="space-y-4">
            <input type="hidden" name="id" value={editing.id} />
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="type" value={editing.type} />

            <div>
              <label className="label" htmlFor="e-amount">Monto</label>
              <input
                id="e-amount" name="amount" inputMode="decimal" autoFocus
                className="field tabular text-center font-display text-3xl"
                defaultValue={editing.amount}
              />
            </div>
            <div>
              <label className="label" htmlFor="e-desc">Concepto</label>
              <input id="e-desc" name="description" className="field" defaultValue={editing.description} />
            </div>
            <div>
              <label className="label" htmlFor="e-date">Fecha</label>
              <input id="e-date" name="date" type="date" className="field" defaultValue={editing.date} />
            </div>

            {editState && !editState.ok && <p className="text-sm text-mandarina">{editState.error}</p>}
            <button className="btn-primary" disabled={editPending}>
              {editPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
