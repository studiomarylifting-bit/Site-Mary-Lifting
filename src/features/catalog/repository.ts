import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import { staticCatalog, type Catalog } from "./catalog-core";
import { CATEGORY_COLUMNS, SERVICE_COLUMNS, rowsToCatalog, type CategoryRow, type ServiceRow } from "./mapper";

/** Em produção, edições feitas no Supabase aparecem no site em até 5 minutos. */
export const CATALOG_REVALIDATE_SECONDS = 300;
/**
 * Em desenvolvimento NÃO usamos cache: o Next guarda respostas de fetch em .next/cache
 * (inclusive entre reinícios), e quem acabou de rodar o SQL de imagens continuaria vendo
 * o catálogo antigo (sem fotos) por até 5 minutos.
 */
const fetchRevalidate = process.env.NODE_ENV === "production" ? CATALOG_REVALIDATE_SECONDS : 0;

let warned = false;
function warnOnce(reason: "not_configured" | "query_error" | "empty" | "exception") {
  // Só um código fixo e dicas: nunca dados nem mensagens do banco.
  if (warned) return;
  warned = true;
  const hint =
    reason === "not_configured"
      ? "defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (e reinicie o servidor)"
      : reason === "query_error"
        ? "confira se as migrations foram aplicadas (docs/CATALOGO-IMAGENS.md)"
        : reason === "empty"
          ? "rode supabase/seed.sql"
          : "falha de rede ao consultar o Supabase";
  console.warn(`[catalog] usando o catálogo ESTÁTICO, sem fotos (${reason}): ${hint}.`);
}

/**
 * Lê o catálogo do Supabase com a chave ANON (pública) e sem sessão: quem manda
 * é a RLS (anon só enxerga linhas ativas). Sem Supabase configurado, ou se o
 * banco falhar/estiver vazio (migration/seed ainda não aplicados), cai para o
 * catálogo estático para o site nunca ficar fora do ar.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const env = getSupabasePublicEnv();
  if (!env) {
    warnOnce("not_configured");
    return staticCatalog();
  }
  try {
    const supabase = createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: fetchRevalidate } }) },
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
