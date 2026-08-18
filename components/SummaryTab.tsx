'use client';

import { useActionState, useRef, useState } from 'react';
import Sheet from './Sheet';
import CoverPicker from './CoverPicker';
import { appendNote, updateProject, deleteProject } from '@/app/actions';
import { SERVICES } from '@/lib/constants';
import { money, shortDate, waLink } from '@/lib/format';
import type { Project } from '@/lib/types';

/** TAB 1 — Comando central: quién es, cómo lo llamo, qué pasó hoy. */
export default function SummaryTab({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [noteState, noteAction, notePending] = useActionState(appendNote, null);
  const [editState, editAction, editPending] = useActionState(updateProject, null);
  const noteRef = useRef<HTMLFormElement>(null);

  const wa = waLink(project.phone_number, `Hola ${project.client_name.split(' ')[0]}! Te escribo de un.studio.`);
  const entries = (project.notes ?? '').split('\n').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Botón gigante de WhatsApp: el contacto es la acción más frecuente */}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-3 rounded-2xl bg-celeste py-6 text-lg font-semibold text-obra-bg active:brightness-90"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.6 1.1 1.4 1.8 1 .8 1.7 1.1 2 1.2.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.7-.1 1.3z" />
          </svg>
          Abrir WhatsApp
        </a>
      ) : (
        <p className="rounded-xl border border-dashed border-obra-line p-4 text-center text-sm text-muted">
          Sin teléfono cargado. Editá el proyecto para agregarlo.
        </p>
      )}

      {/* Ficha */}
      <section className="rounded-xl border border-obra-line bg-obra-surface">
        {[
          ['Servicio', project.service_type],
          ['Presupuesto', money(project.total_budget)],
          ['Inicio', shortDate(project.start_date)],
          ['Zona', project.address || '—'],
          ['Teléfono', project.phone_number || '—'],
        ].map(([k, v], i) => (
          <div key={k} className={`flex justify-between px-4 py-3.5 ${i ? 'border-t border-obra-line' : ''}`}>
            <span className="text-sm text-muted">{k}</span>
            <span className="tabular text-sm font-medium">{v}</span>
          </div>
        ))}
        <button
          onClick={() => setEditing(true)}
          className="w-full border-t border-obra-line py-3.5 text-sm font-medium text-ink active:bg-obra-raised"
        >
          Editar datos
        </button>
      </section>

      {/* Bitácora */}
      <section>
        <h2 className="label">Bitácora de obra</h2>
        <form
          ref={noteRef}
          action={(fd) => { noteAction(fd); noteRef.current?.reset(); }}
          className="space-y-2"
        >
          <input type="hidden" name="project_id" value={project.id} />
          <textarea
            name="note"
            rows={2}
            className="field resize-none"
            placeholder="Qué pasó hoy en la obra…"
          />
          {noteState && !noteState.ok && <p className="text-sm text-mandarina">{noteState.error}</p>}
          <button className="btn-primary" disabled={notePending}>
            {notePending ? 'Guardando…' : 'Agregar nota'}
          </button>
        </form>

        {entries.length > 0 && (
          <ul className="mt-4 space-y-2">
            {entries.map((line, i) => {
              const m = line.match(/^(\[[^\]]+\])\s*(.*)$/);
              return (
                <li key={i} className="rounded-xl border border-obra-line bg-obra-surface px-4 py-3">
                  {m ? (
                    <>
                      <span className="tabular block text-[11px] font-semibold tracking-wide text-muted">
                        {m[1].replace(/[[\]]/g, '')}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed">{m[2]}</span>
                    </>
                  ) : (
                    <span className="text-sm leading-relaxed">{line}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Edición */}
      <Sheet open={editing} onClose={() => setEditing(false)} title="Editar proyecto">
        <form action={editAction} className="space-y-4">
          <input type="hidden" name="id" value={project.id} />
          <CoverPicker currentUrl={project.cover_image_url} />
          <div>
            <label className="label" htmlFor="e-name">Cliente</label>
            <input id="e-name" name="client_name" className="field" defaultValue={project.client_name} />
          </div>
          <div>
            <label className="label" htmlFor="e-phone">WhatsApp</label>
            <input id="e-phone" name="phone_number" type="tel" inputMode="tel" className="field" defaultValue={project.phone_number ?? ''} />
          </div>
          <div>
            <label className="label" htmlFor="e-address">Zona u obra</label>
            <input id="e-address" name="address" className="field" defaultValue={project.address ?? ''} />
          </div>
          <div>
            <label className="label" htmlFor="e-service">Servicio</label>
            <select id="e-service" name="service_type" className="field" defaultValue={project.service_type}>
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="e-budget">Presupuesto total</label>
              <input id="e-budget" name="total_budget" inputMode="decimal" className="field tabular" defaultValue={project.total_budget} />
            </div>
            <div>
              <label className="label" htmlFor="e-profit">Ganancia del estudio (%)</label>
              <input id="e-profit" name="studio_profit_pct" inputMode="decimal" className="field tabular" defaultValue={project.studio_profit_pct} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="e-date">Inicio</label>
            <input id="e-date" name="start_date" type="date" className="field" defaultValue={project.start_date ?? ''} />
          </div>
          {editState && !editState.ok && <p className="text-sm text-mandarina">{editState.error}</p>}
          <button className="btn-primary" disabled={editPending}>
            {editPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`¿Borrar "${project.client_name}" y todo su historial? No se puede deshacer.`)) {
                deleteProject(project.id);
              }
            }}
            className="w-full py-3 text-sm text-mandarina"
          >
            Borrar proyecto
          </button>
        </form>
      </Sheet>
    </div>
  );
}
