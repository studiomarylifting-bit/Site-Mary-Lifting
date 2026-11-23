import { categories as staticCategories, services as staticServices } from "./data";
import { deriveMaintenanceDays } from "./derive";
import type { CategorySlug, Service, ServiceCategory } from "./types";

/** Instantâneo do catálogo. `source` diz de onde veio (útil para o painel). */
export interface Catalog {
  categories: ServiceCategory[];
  services: Service[];
  source: "database" | "static";
}

/**
 * Catálogo estático (src/features/catalog/data.ts). É a fonte do seed e o
 * fallback quando o Supabase não está configurado ou indisponível. Quando o
 * banco responde, ele é a fonte da verdade.
 */
export function staticCatalog(): Catalog {
  return {
    source: "static",
    categories: [...staticCategories].sort((a, b) => a.position - b.position),
    services: staticServices.map((s) => ({
      ...s,
      maintenanceDays: deriveMaintenanceDays(s.returnInfo, s.maintenanceCents),
    })),
  };
}

export const sortedCategories = (c: Catalog) => [...c.categories].sort((a, b) => a.position - b.position);
export const findCategory = (c: Catalog, slug: string) => c.categories.find((x) => x.slug === slug);
export const servicesOfCategory = (c: Catalog, slug: CategorySlug) => c.services.filter((s) => s.categorySlug === slug);
export const findService = (c: Catalog, categorySlug: string, slug: string) =>
  c.services.find((s) => s.categorySlug === categorySlug && s.slug === slug);
export const findServiceBySlug = (c: Catalog, slug: string) => c.services.find((s) => s.slug === slug);
export const relatedOf = (c: Catalog, service: Service): Service[] =>
  (service.relatedSlugs ?? []).map((slug) => findServiceBySlug(c, slug)).filter((s): s is Service => Boolean(s));

/**
 * Opções declaradas pelo Studio que ainda não foram cadastradas (nunca inventa itens).
 */
export function missingOptions(c: Catalog, slug: CategorySlug): number {
  const category = findCategory(c, slug);
  if (!category) return 0;
  return Math.max(0, category.declaredOptionCount - servicesOfCategory(c, slug).length);
}
