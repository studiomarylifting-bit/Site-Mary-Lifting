import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminCategory {
  slug: string; position: number; index_label: string; title: string; tagline: string;
  declared_option_count: number; active: boolean;
}
export interface AdminService {
  slug: string; category_slug: string; position: number; name: string; description: string;
  price_cents: number; maintenance_cents: number | null; maintenance_days: number | null;
  return_info: string | null; notes: string[] | null; active: boolean;
}

const CAT = "slug, position, index_label, title, tagline, declared_option_count, active";
const SVC = "slug, category_slug, position, name, description, price_cents, maintenance_cents, maintenance_days, return_info, notes, active";

/**
 * Catálogo para o painel: lido com a SESSÃO da admin (RLS), então inclui os arquivados.
 * `ready=false` = migrations do catálogo ainda não aplicadas (ou Supabase indisponível).
 */
export async function getAdminCatalog(): Promise<{ ready: boolean; categories: AdminCategory[]; services: AdminService[] }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ready: false, categories: [], services: [] };
  const [c, s] = await Promise.all([
    supabase.from("service_categories").select(CAT).order("position"),
    supabase.from("services").select(SVC).order("position"),
  ]);
  if (c.error || s.error) return { ready: false, categories: [], services: [] };
  return { ready: true, categories: (c.data ?? []) as AdminCategory[], services: (s.data ?? []) as AdminService[] };
}
