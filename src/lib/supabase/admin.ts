import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminEnv } from "@/lib/env";

/**
 * Cliente com service_role: IGNORA RLS. Uso restrito a código de servidor que já
 * validou a entrada (Zod), aplicou rate limit e verificou autorização.
 * Jamais importar em Client Components (o pacote "server-only" quebra o build).
 */
export function createSupabaseAdminClient() {
  const env = getSupabaseAdminEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
