'use client';

import { useState, useTransition } from 'react';
import Sheet from './Sheet';
import { STATUSES, STATUS_CHIP } from '@/lib/constants';
import { updateProjectStatus } from '@/app/actions';
import type { ProjectStatus } from '@/lib/types';

/**
 * Cambio de estado en dos toques.
 *
 * Por qué no drag & drop: arrastrar una tarjeta entre acordeones en una
 * pantalla de 6" exige precisión, dos manos y una superficie que no se mueve
 * — tres cosas que no hay arriba de una escalera. Este control abre la lista
 * completa con áreas de 56 px y se resuelve con el pulgar. Si más adelante
 * el drag se vuelve necesario, se agrega arriba de esta misma Server Action.
 */
export default function StatusSheet({
  projectId, current, label,
}: { projectId: string; current: ProjectStatus; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const pick = (status: ProjectStatus) => {
    setOpen(false);
    startTransition(() => { updateProjectStatus(projectId, status); });
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        aria-label={`Cambiar estado. Actual: ${current}`}
        className={`flex shrink-0 items-center gap-2 rounded-full border border-obra-line px-3 py-2 text-xs font-medium ${pending ? 'opacity-50' : ''}`}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_CHIP[current] }} />
        {label ?? current}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Mover a">
        <div className="space-y-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => pick(s)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left
                ${s === current ? 'border-brass bg-obra-raised' : 'border-obra-line'}`}
            >
              <span className="h-4 w-4 rounded-sm" style={{ background: STATUS_CHIP[s] }} />
              <span className="font-medium">{s}</span>
              {s === current && <span className="ml-auto text-xs text-brass">Actual</span>}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
