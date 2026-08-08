'use client';

import { useEffect } from 'react';

/**
 * Hoja inferior. Todo lo que en escritorio sería un modal centrado, acá sube
 * desde abajo: es donde llega el pulgar.
 */
export default function Sheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 animate-fade bg-black/70"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[88dvh] animate-rise overflow-y-auto rounded-t-2xl border-t border-obra-line bg-obra-surface px-5 pb-8 pt-3"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-obra-line" />
        <h2 className="mb-5 font-display text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
