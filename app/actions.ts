'use server';

/**
 * =====================================================================
 * SERVER ACTIONS — un.studio Panel de Obra
 * =====================================================================
 *
 * CÓMO FUNCIONA EL TIEMPO REAL (los dos caminos son necesarios):
 *
 *   Teléfono A                          Teléfono B
 *   ──────────                          ──────────
 *   1. Toca el checkbox
 *   2. useOptimistic pinta el tilde     ·
 *      al instante (0 ms, sin red)      ·
 *   3. Server Action → Supabase         ·
 *   4. revalidatePath() → el HTML       ·
 *      del server queda al día          ·
 *   5. Postgres emite el cambio ────►   6. El canal de Realtime lo recibe
 *                                       7. router.refresh() vuelve a pedir
 *                                          el Server Component actualizado
 *
 * O sea: `revalidatePath` arregla al que tocó, y Realtime + `router.refresh()`
 * arregla al otro. Sin el paso 5-7, el segundo teléfono no se entera de nada
 * hasta que recargue a mano — que es justo lo que no se puede hacer arriba
 * de un andamio.
 *
 * CONVENCIÓN DE RETORNO
 * Todas devuelven `{ ok: true }` o `{ ok: false, error: string }` en vez de
 * lanzar excepciones, para que el formulario pueda mostrar el error sin
 * romper la pantalla. El texto del error es el que ve el usuario.
 *
 * VALIDACIÓN
 * Se valida acá, en el servidor, no en el input. Un `required` de HTML es
 * una sugerencia; esto es la garantía.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { logStamp } from '@/lib/format';
import type { LogisticsStatus, ProjectStatus } from '@/lib/types';

type Result = { ok: true } | { ok: false; error: string };

/** Refresca el dashboard y, si corresponde, la ficha del proyecto. */
function refresh(projectId?: string) {
  revalidatePath('/');
  if (projectId) revalidatePath(`/proyecto/${projectId}`);
}

const num = (v: FormDataEntryValue | null): number => {
  // Acepta "1.250,50" y "1250.5" — en obra se tipea como sale.
  const raw = String(v ?? '').trim().replace(/\s/g, '');
  if (!raw) return 0;
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const str = (v: FormDataEntryValue | null): string => String(v ?? '').trim();

/* ===================================================================
 * PROYECTOS
 * =================================================================== */

/** Alta de proyecto. Al terminar, entra directo a su ficha. */
export async function createProject(_prev: Result | null, fd: FormData): Promise<Result> {
  const client_name = str(fd.get('client_name'));
  if (!client_name) return { ok: false, error: 'Falta el nombre del cliente.' };

  const { data, error } = await supabaseServer()
    .from('projects')
    .insert({
      client_name,
      phone_number: str(fd.get('phone_number')) || null,
      address: str(fd.get('address')) || null,
      service_type: str(fd.get('service_type')) || 'Integral',
      status: 'Onboarding',
      total_budget: num(fd.get('total_budget')),
      studio_profit_pct: num(fd.get('studio_profit_pct')),
      start_date: str(fd.get('start_date')) || null,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };
  refresh();
  redirect(`/proyecto/${data.id}`);
}

/**
 * Cambio de estado desde el dashboard (un toque, sin abrir el proyecto).
 * Es la acción que más se usa y la que más se ve reflejada en el otro teléfono.
 */
export async function updateProjectStatus(projectId: string, status: ProjectStatus): Promise<Result> {
  const { error } = await supabaseServer().from('projects').update({ status }).eq('id', projectId);
  if (error) return { ok: false, error: error.message };
  refresh(projectId);
  return { ok: true };
}

export async function updateProject(_prev: Result | null, fd: FormData): Promise<Result> {
  const id = str(fd.get('id'));
  const client_name = str(fd.get('client_name'));
  if (!id) return { ok: false, error: 'Proyecto no encontrado.' };
  if (!client_name) return { ok: false, error: 'Falta el nombre del cliente.' };

  const total_budget = num(fd.get('total_budget'));
  const studio_profit_pct = num(fd.get('studio_profit_pct'));
  if (studio_profit_pct < 0 || studio_profit_pct > 100) {
    return { ok: false, error: 'La ganancia tiene que ser un porcentaje entre 0 y 100.' };
  }

  const { error } = await supabaseServer()
    .from('projects')
    .update({
      client_name,
      phone_number: str(fd.get('phone_number')) || null,
      address: str(fd.get('address')) || null,
      service_type: str(fd.get('service_type')),
      total_budget,
      studio_profit_pct,
      start_date: str(fd.get('start_date')) || null,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  refresh(id);
  return { ok: true };
}

/**
 * Bitácora de obra: append, nunca sobreescritura.
 * Se antepone la entrada nueva para que lo último quede arriba, y se le pone
 * marca de tiempo automática — nadie va a escribir la fecha a mano con guantes.
 */
export async function appendNote(_prev: Result | null, fd: FormData): Promise<Result> {
  const id = str(fd.get('project_id'));
  const text = str(fd.get('note'));
  if (!text) return { ok: false, error: 'La nota está vacía.' };

  const db = supabaseServer();
  const { data, error: readErr } = await db.from('projects').select('notes').eq('id', id).single();
  if (readErr) return { ok: false, error: readErr.message };

  const entry = `${logStamp()} ${text}`;
  const notes = data?.notes ? `${entry}\n${data.notes}` : entry;

  const { error } = await db.from('projects').update({ notes }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refresh(id);
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<Result> {
  // Los movimientos y la logística caen solos por ON DELETE CASCADE.
  const { error } = await supabaseServer().from('projects').delete().eq('id', projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/');
  redirect('/');
}

/* ===================================================================
 * FINANZAS
 * =================================================================== */

/** Carga rápida de un gasto — pensada para usarse parado en la ferretería. */
export async function addFinancial(_prev: Result | null, fd: FormData): Promise<Result> {
  const project_id = str(fd.get('project_id'));
  const description = str(fd.get('description'));
  const amount = num(fd.get('amount'));

  if (!description) return { ok: false, error: 'Poné una descripción.' };
  if (amount <= 0) return { ok: false, error: 'El monto tiene que ser mayor a cero.' };

  const { error } = await supabaseServer().from('financials').insert({
    project_id,
    type: str(fd.get('type')) || 'Egreso',
    amount,
    description,
    date: str(fd.get('date')) || new Date().toISOString().slice(0, 10),
  });

  if (error) return { ok: false, error: error.message };
  refresh(project_id);
  return { ok: true };
}

/**
 * Edición de un movimiento cargado a mano. Los movimientos que vienen de
 * Logística (linked_logistic_id) no se tocan acá: se editan cambiando el
 * ítem de logística que los generó, para que el vínculo no se desincronice.
 */
export async function updateFinancial(_prev: Result | null, fd: FormData): Promise<Result> {
  const id = str(fd.get('id'));
  const project_id = str(fd.get('project_id'));
  const description = str(fd.get('description'));
  const amount = num(fd.get('amount'));

  if (!id) return { ok: false, error: 'Movimiento no encontrado.' };
  if (!description) return { ok: false, error: 'Poné una descripción.' };
  if (amount <= 0) return { ok: false, error: 'El monto tiene que ser mayor a cero.' };

  const db = supabaseServer();
  const { data: current, error: readErr } = await db
    .from('financials')
    .select('linked_logistic_id')
    .eq('id', id)
    .single();
  if (readErr) return { ok: false, error: readErr.message };
  if (current.linked_logistic_id) {
    return { ok: false, error: 'Este movimiento viene de Logística: editalo desde ahí.' };
  }

  const { error } = await db
    .from('financials')
    .update({
      type: str(fd.get('type')) || 'Egreso',
      amount,
      description,
      date: str(fd.get('date')) || new Date().toISOString().slice(0, 10),
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  refresh(project_id);
  return { ok: true };
}

export async function deleteFinancial(id: string, projectId: string): Promise<Result> {
  const db = supabaseServer();
  const { data: current, error: readErr } = await db
    .from('financials')
    .select('linked_logistic_id')
    .eq('id', id)
    .single();
  if (readErr) return { ok: false, error: readErr.message };
  if (current.linked_logistic_id) {
    return { ok: false, error: 'Este movimiento viene de Logística: desmarcá el ítem para borrarlo.' };
  }

  const { error } = await db.from('financials').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  refresh(projectId);
  return { ok: true };
}

/* ===================================================================
 * LOGÍSTICA
 * =================================================================== */

/**
 * Mantiene el movimiento financiero de un ítem de logística al día con su
 * estado y su costo:
 *  - Si el ítem está comprado/finalizado (status !== 'Pendiente') y tiene
 *    costo > 0, crea o actualiza el movimiento vinculado (Egreso).
 *  - Si se desmarca (vuelve a 'Pendiente') o queda sin costo, borra el
 *    movimiento vinculado — el presupuesto se libera solo.
 * La llaman todas las acciones que tocan status/real_cost/expected_cost.
 */
async function syncLinkedFinancial(
  db: ReturnType<typeof supabaseServer>,
  logisticsId: string,
  projectId: string
): Promise<void> {
  const { data: item } = await db
    .from('logistics')
    .select('category, item_name, status, expected_cost, real_cost')
    .eq('id', logisticsId)
    .single();
  if (!item) return;

  const purchased = item.status !== 'Pendiente';
  const amount = Number(item.real_cost ?? item.expected_cost ?? 0);

  if (purchased && amount > 0) {
    const label = item.category === 'Shopping List' ? 'Lista de compras' : item.category;
    const description = `${label}: ${item.item_name}`;

    const { data: existing } = await db
      .from('financials')
      .select('id')
      .eq('linked_logistic_id', logisticsId)
      .maybeSingle();

    if (existing) {
      await db.from('financials').update({ amount, description }).eq('id', existing.id);
    } else {
      await db.from('financials').insert({
        project_id: projectId,
        type: 'Egreso',
        amount,
        description,
        linked_logistic_id: logisticsId,
      });
    }
  } else {
    await db.from('financials').delete().eq('linked_logistic_id', logisticsId);
  }
}

export async function addLogistics(_prev: Result | null, fd: FormData): Promise<Result> {
  const project_id = str(fd.get('project_id'));
  const item_name = str(fd.get('item_name'));
  if (!item_name) return { ok: false, error: 'Falta el nombre del ítem.' };

  const { error } = await supabaseServer().from('logistics').insert({
    project_id,
    category: str(fd.get('category')) || 'Material',
    item_name,
    supplier_or_worker_name: str(fd.get('supplier_or_worker_name')) || null,
    description: str(fd.get('description')) || null,
    expected_cost: num(fd.get('expected_cost')),
    contact_phone: str(fd.get('contact_phone')) || null,
    status: 'Pendiente',
  });

  if (error) return { ok: false, error: error.message };
  refresh(project_id);
  return { ok: true };
}

/** Edición completa de un ítem de logística (material, contratista o compra). */
export async function updateLogistics(_prev: Result | null, fd: FormData): Promise<Result> {
  const id = str(fd.get('id'));
  const project_id = str(fd.get('project_id'));
  const item_name = str(fd.get('item_name'));
  if (!id) return { ok: false, error: 'Ítem no encontrado.' };
  if (!item_name) return { ok: false, error: 'Falta el nombre del ítem.' };

  const realCostRaw = str(fd.get('real_cost'));

  const db = supabaseServer();
  const { error } = await db
    .from('logistics')
    .update({
      item_name,
      supplier_or_worker_name: str(fd.get('supplier_or_worker_name')) || null,
      description: str(fd.get('description')) || null,
      expected_cost: num(fd.get('expected_cost')),
      real_cost: realCostRaw ? num(fd.get('real_cost')) : null,
      contact_phone: str(fd.get('contact_phone')) || null,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  await syncLinkedFinancial(db, id, project_id);
  refresh(project_id);
  return { ok: true };
}

/**
 * EL TILDE. La acción más importante de la app.
 *
 * Recorre el ciclo con cada toque: Pendiente → En Curso/Comprado → Finalizado
 * → Pendiente. Un solo control para los tres estados, porque en obra no hay
 * dedo libre para abrir un menú.
 *
 * Al pasar a Finalizado sin costo real cargado, copia el estimado: así el
 * termómetro de finanzas no se queda corto por un dato que nadie completó.
 */
export async function cycleLogisticsStatus(id: string, projectId: string): Promise<Result> {
  const db = supabaseServer();
  const { data, error: readErr } = await db
    .from('logistics')
    .select('status, expected_cost, real_cost')
    .eq('id', id)
    .single();
  if (readErr) return { ok: false, error: readErr.message };

  const next: Record<LogisticsStatus, LogisticsStatus> = {
    'Pendiente': 'En Curso/Comprado',
    'En Curso/Comprado': 'Finalizado',
    'Finalizado': 'Pendiente',
  };
  const status = next[data.status as LogisticsStatus];

  const patch: Record<string, unknown> = { status };
  if (status === 'Finalizado' && data.real_cost == null) patch.real_cost = data.expected_cost ?? 0;

  const { error } = await db.from('logistics').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await syncLinkedFinancial(db, id, projectId);
  refresh(projectId);
  return { ok: true };
}

/**
 * El checkbox de la Lista de Compras (Shopping List): a diferencia del ciclo
 * de tres estados de Materiales/Contratistas, acá es un simple comprado/no
 * comprado.
 */
export async function toggleShoppingPurchased(id: string, projectId: string): Promise<Result> {
  const db = supabaseServer();
  const { data, error: readErr } = await db
    .from('logistics')
    .select('status, expected_cost, real_cost')
    .eq('id', id)
    .single();
  if (readErr) return { ok: false, error: readErr.message };

  const status: LogisticsStatus = data.status === 'Pendiente' ? 'Finalizado' : 'Pendiente';
  const patch: Record<string, unknown> = { status };
  if (status === 'Finalizado' && data.real_cost == null) patch.real_cost = data.expected_cost ?? 0;

  const { error } = await db.from('logistics').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await syncLinkedFinancial(db, id, projectId);
  refresh(projectId);
  return { ok: true };
}

/** Carga el costo real cuando llega la factura y difiere del estimado. */
export async function setRealCost(_prev: Result | null, fd: FormData): Promise<Result> {
  const id = str(fd.get('id'));
  const projectId = str(fd.get('project_id'));
  const db = supabaseServer();
  const { error } = await db
    .from('logistics')
    .update({ real_cost: num(fd.get('real_cost')) })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await syncLinkedFinancial(db, id, projectId);
  refresh(projectId);
  return { ok: true };
}

export async function deleteLogistics(id: string, projectId: string): Promise<Result> {
  const { error } = await supabaseServer().from('logistics').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  refresh(projectId);
  return { ok: true };
}

/* ===================================================================
 * ACCESO
 * =================================================================== */

export async function signIn(_prev: Result | null, fd: FormData): Promise<Result> {
  const { cookies } = await import('next/headers');
  if (str(fd.get('code')) !== (process.env.ACCESS_CODE ?? 'unstudio')) {
    return { ok: false, error: 'Código incorrecto.' };
  }
  (await cookies()).set('un_acceso', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 180, // 6 meses: se escribe una vez por teléfono
    path: '/',
  });
  redirect('/');
}
