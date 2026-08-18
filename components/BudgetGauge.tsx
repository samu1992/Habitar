import { money } from '@/lib/format';

/**
 * EL TERMÓMETRO — el elemento firma de la app.
 *
 * Es una franja gruesa que se llena como un tarro de pintura: bronce mientras
 * hay margen, arcilla cuando se pasa. Las marcas cada 25% permiten leer el
 * estado de un vistazo, sin enfocar la vista, con el teléfono a un brazo.
 */
export default function BudgetGauge({ spent, total }: { spent: number; total: number }) {
  const pct = total > 0 ? (spent / total) * 100 : 0;
  const over = pct > 100;
  const width = Math.min(pct, 100);
  const remaining = total - spent;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Consumido
        </span>
        <span className={`tabular font-display text-2xl font-semibold ${over ? 'text-mandarina' : 'text-ink'}`}>
          {Math.round(pct)}%
        </span>
      </div>

      <div className="relative h-7 overflow-hidden rounded-lg bg-obra-raised" role="img"
           aria-label={`${Math.round(pct)} por ciento del presupuesto consumido`}>
        <div
          className={`h-full transition-[width] duration-500 ${over ? 'bg-mandarina' : 'bg-ink'}`}
          style={{ width: `${width}%` }}
        />
        {[25, 50, 75].map((t) => (
          <div key={t} className="absolute top-0 h-full w-px bg-obra-bg/50" style={{ left: `${t}%` }} />
        ))}
      </div>

      <div className="mt-3 flex justify-between text-sm">
        <span className="tabular text-muted">{money(spent)} de {money(total)}</span>
        <span className={`tabular font-medium ${over ? 'text-mandarina' : 'text-celeste'}`}>
          {over ? `${money(Math.abs(remaining))} de más` : `${money(remaining)} libres`}
        </span>
      </div>
    </div>
  );
}
