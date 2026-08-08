'use client';

import { useActionState, useState } from 'react';
import Sheet from './Sheet';
import { createProject } from '@/app/actions';
import { SERVICES } from '@/lib/constants';

export default function NewProjectSheet() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createProject, null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-40 h-16 w-16 rounded-full bg-brass text-3xl font-light text-obra-bg shadow-lg shadow-black/40 active:bg-brass-deep"
        aria-label="Nuevo proyecto"
      >
        +
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Nuevo proyecto">
        <form action={action} className="space-y-4">
          <div>
            <label className="label" htmlFor="np-name">Cliente</label>
            <input id="np-name" name="client_name" className="field" placeholder="Familia Rivas" autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="np-phone">WhatsApp</label>
            <input id="np-phone" name="phone_number" type="tel" inputMode="tel" className="field" placeholder="11 2233 4455" />
          </div>
          <div>
            <label className="label" htmlFor="np-address">Zona u obra</label>
            <input id="np-address" name="address" className="field" placeholder="Olivos" />
          </div>
          <div>
            <label className="label" htmlFor="np-service">Servicio</label>
            <select id="np-service" name="service_type" className="field" defaultValue="Integral">
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="np-budget">Presupuesto</label>
              <input id="np-budget" name="total_budget" inputMode="decimal" className="field tabular" placeholder="0" />
            </div>
            <div>
              <label className="label" htmlFor="np-date">Inicio</label>
              <input id="np-date" name="start_date" type="date" className="field" />
            </div>
          </div>

          {state && !state.ok && <p className="text-sm text-alert">{state.error}</p>}
          <button className="btn-primary" disabled={pending}>
            {pending ? 'Creando…' : 'Crear proyecto'}
          </button>
        </form>
      </Sheet>
    </>
  );
}
