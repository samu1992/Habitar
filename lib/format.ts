/** Pesos sin centavos: en obra nadie lee decimales a un brazo de distancia. */
export function money(n: number | null | undefined): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(d);
}

/**
 * Arma el link de WhatsApp. Acepta cualquier formato que se haya tipeado
 * apurado (con 15, con guiones, con +) y lo normaliza a 549XXXXXXXXXX.
 */
export function waLink(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('0')) d = d.slice(1);
  if (!d.startsWith('54')) d = `54${d}`;
  if (d.startsWith('54') && !d.startsWith('549')) d = `549${d.slice(2)}`;
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${d}${q}`;
}

/** Marca de tiempo para la bitácora: [08/03 14:05] */
export function logStamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `[${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}]`;
}
