import {
  findCategory,
  findService,
  findServiceBySlug,
  missingOptions,
  relatedOf,
  servicesOfCategory,
  sortedCategories,
} from "./catalog-core";
import { getCatalog } from "./repository";
import type { CategorySlug, Service, ServiceCategory } from "./types";

export { getCatalog };

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
