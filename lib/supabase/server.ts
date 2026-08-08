import { createClient } from '@supabase/supabase-js';

/**
 * Cliente para Server Components y Server Actions.
 * Se crea por request (no se cachea) para que cada lectura sea fresca.
 */
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
