import { categories, services } from "./data";
import type { CategorySlug, Service, ServiceCategory } from "./types";

export function getCategories(): ServiceCategory[] {
  return [...categories].sort((a, b) => a.position - b.position);
}

export function getCategory(slug: string): ServiceCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getServicesByCategory(slug: CategorySlug): Service[] {
  return services.filter((s) => s.categorySlug === slug);
}

export function getService(
  categorySlug: string,
  slug: string,
): Service | undefined {
  return services.find(
    (s) => s.categorySlug === categorySlug && s.slug === slug,
  );
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getRelatedServices(service: Service): Service[] {
  return (service.relatedSlugs ?? [])
    .map((slug) => getServiceBySlug(slug))
    .filter((s): s is Service => Boolean(s));
}

/**
 * Compara a quantidade informada pelo Studio com a cadastrada.
 * Usado na UI/admin para sinalizar opções ainda não fornecidas
 * (ex.: cílios 15 declaradas, 14 cadastradas) sem inventar itens.
 */
export function getMissingOptionCount(slug: CategorySlug): number {
  const category = getCategory(slug);
  if (!category) return 0;
  return Math.max(
    0,
    category.declaredOptionCount - getServicesByCategory(slug).length,
  );
}
