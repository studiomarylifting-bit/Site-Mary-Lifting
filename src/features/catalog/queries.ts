import type { Catalog } from "./catalog-core";
import {
  findCategory,
  findService,
  findServiceBySlug,
  missingOptions,
  relatedOf,
  servicesOfCategory,
  sortedCategories,
} from "./catalog-core";
import { getCatalog as getBaseCatalog } from "./repository";
import { localizeCatalog } from "./translations";
import { getLocale } from "@/i18n/server";
import type { CategorySlug, Service, ServiceCategory } from "./types";

/** Catálogo já no idioma da requisição (textos editados no banco não são sobrescritos). */
export async function getCatalog(): Promise<Catalog> {
  return localizeCatalog(await getBaseCatalog(), await getLocale());
}

/** Slugs para generateStaticParams: roda no build, sem requisição (nada de cookies). */
export async function getStaticParamsCatalog(): Promise<Catalog> {
  return getBaseCatalog();
}

export async function getCategories(): Promise<ServiceCategory[]> {
  return sortedCategories(await getCatalog());
}
export async function getServices(): Promise<Service[]> {
  return (await getCatalog()).services;
}
export async function getCategory(slug: string): Promise<ServiceCategory | undefined> {
  return findCategory(await getCatalog(), slug);
}
export async function getServicesByCategory(slug: CategorySlug): Promise<Service[]> {
  return servicesOfCategory(await getCatalog(), slug);
}
export async function getService(categorySlug: string, slug: string): Promise<Service | undefined> {
  return findService(await getCatalog(), categorySlug, slug);
}
export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return findServiceBySlug(await getCatalog(), slug);
}
export async function getRelatedServices(service: Service): Promise<Service[]> {
  return relatedOf(await getCatalog(), service);
}
export async function getMissingOptionCount(slug: CategorySlug): Promise<number> {
  return missingOptions(await getCatalog(), slug);
}
