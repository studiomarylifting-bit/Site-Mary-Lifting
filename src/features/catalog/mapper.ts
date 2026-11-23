import type { Catalog } from "./catalog-core";
import { isValidImagePath, publicImageUrl } from "./storage";
import type { Service, ServiceCategory } from "./types";

/** Linhas como vêm do Supabase (colunas selecionadas explicitamente, sem `select *`). */
export interface CategoryRow {
  slug: string;
  position: number;
  index_label: string;
  title: string;
  tagline: string;
  declared_option_count: number;
  image_path: string | null;
}
export interface ServiceRow {
  slug: string;
  category_slug: string;
  position: number;
  name: string;
  description: string;
  price_cents: number;
  maintenance_cents: number | null;
  maintenance_days: number | null;
  return_info: string | null;
  notes: string[] | null;
  related_slugs: string[] | null;
  image_path: string | null;
}

export const CATEGORY_COLUMNS =
  "slug, position, index_label, title, tagline, declared_option_count, image_path";
export const SERVICE_COLUMNS =
  "slug, category_slug, position, name, description, price_cents, maintenance_cents, maintenance_days, return_info, notes, related_slugs, image_path";

const isMoney = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

/**
 * Converte linhas do banco em Catalog. Defensivo: descarta linha malformada
 * (preço inválido, categoria inexistente) em vez de exibir dado errado, e só
 * resolve imagem quando o caminho é válido (senão o site mostra o placeholder).
 */
export function rowsToCatalog(
  categoryRows: CategoryRow[],
  serviceRows: ServiceRow[],
  supabaseUrl?: string | null,
): Catalog {
  const categories: ServiceCategory[] = categoryRows
    .map((r) => ({
      slug: r.slug,
      position: r.position,
      index: r.index_label,
      title: r.title,
      tagline: r.tagline,
      declaredOptionCount: r.declared_option_count,
      imagePath: isValidImagePath(r.image_path) ? r.image_path : undefined,
      imageUrl: publicImageUrl(r.image_path, supabaseUrl),
    }))
    .sort((a, b) => a.position - b.position);

  const known = new Set(categories.map((c) => c.slug));
  const slugs = new Set(serviceRows.map((r) => r.slug));

  const services: Service[] = serviceRows
    .filter((r) => known.has(r.category_slug) && isMoney(r.price_cents) && (r.maintenance_cents === null || isMoney(r.maintenance_cents)))
    .sort((a, b) => a.position - b.position)
    .map((r) => ({
      slug: r.slug,
      categorySlug: r.category_slug,
      name: r.name,
      description: r.description,
      priceCents: r.price_cents,
      maintenanceCents: r.maintenance_cents ?? undefined,
      maintenanceDays: r.maintenance_cents !== null ? (r.maintenance_days ?? undefined) : undefined,
      returnInfo: r.return_info ?? undefined,
      notes: r.notes?.length ? r.notes : undefined,
      relatedSlugs: r.related_slugs?.filter((s) => slugs.has(s)),
      imagePath: isValidImagePath(r.image_path) ? r.image_path : undefined,
      imageUrl: publicImageUrl(r.image_path, supabaseUrl),
    }));

  return { source: "database", categories, services };
}
