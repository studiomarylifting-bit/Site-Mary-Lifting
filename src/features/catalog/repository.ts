import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import { staticCatalog, type Catalog } from "./catalog-core";
import { CATEGORY_COLUMNS, SERVICE_COLUMNS, rowsToCatalog, type CategoryRow, type ServiceRow } from "./mapper";

/** Edições feitas no Supabase aparecem no site em até 5 minutos. */
export const CATALOG_REVALIDATE_SECONDS = 300;

let warned = false;
function warnOnce(reason: "query_error" | "empty" | "exception") {
  // Só um código fixo: nunca dados nem mensagens do banco.
  if (warned) return;
  warned = true;
  console.warn(`[catalog] Supabase indisponível ou sem dados (${reason}); usando o catálogo estático.`);
}

/**
 * Lê o catálogo do Supabase com a chave ANON (pública) e sem sessão: quem manda
 * é a RLS (anon só enxerga linhas ativas). Sem Supabase configurado, ou se o
 * banco falhar/estiver vazio (migration/seed ainda não aplicados), cai para o
 * catálogo estático para o site nunca ficar fora do ar.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const env = getSupabasePublicEnv();
  if (!env) return staticCatalog();
  try {
    const supabase = createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: CATALOG_REVALIDATE_SECONDS } }) },
    });
    const [cats, svcs] = await Promise.all([
      supabase.from("service_categories").select(CATEGORY_COLUMNS).order("position"),
      supabase.from("services").select(SERVICE_COLUMNS).order("position"),
    ]);
    if (cats.error || svcs.error) {
      warnOnce("query_error");
      return staticCatalog();
    }
    const catalog = rowsToCatalog(cats.data as unknown as CategoryRow[], svcs.data as unknown as ServiceRow[], env.url);
    if (catalog.categories.length === 0 || catalog.services.length === 0) {
      warnOnce("empty");
      return staticCatalog();
    }
    return catalog;
  } catch {
    warnOnce("exception");
    return staticCatalog();
  }
});
