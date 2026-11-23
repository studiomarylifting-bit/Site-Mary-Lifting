import { describe, expect, it } from "vitest";
import { categories, services } from "@/features/catalog/data";
import {
  findService,
  missingOptions,
  servicesOfCategory,
  sortedCategories,
  staticCatalog,
} from "@/features/catalog/catalog-core";

const catalog = staticCatalog();

/** Valores informados pelo Studio (em centavos): [aplicação, manutenção?]. */
const expected: Record<string, [number, number?]> = {
  "6D Volume Glamour": [17000, 13000],
  "Efeito rímel Jade Picon": [14000, 12000],
  "Fio a fio clássico": [13000, 11000],
  "Fox Easy": [16000, 13000],
  "Jade Picon no castanho": [16000, 14000],
  "Kim Kardashian": [16000, 13000],
  "Mega brasileiro": [16000, 12000],
  "Mega volume": [19000, 13000],
  "Remoção de extensão": [4000],
  "Volume brasileiro": [14000, 10000],
  "Volume brasileiro no castanho": [16000, 12000],
  "Volume egípcio": [16000, 12000],
  "Volume egípcio no castanho": [18000, 14000],
  "Volume híbrido": [16000, 12000],
  "Volume moderado": [16000, 11000],
  "Brow lamination": [8000],
  "Design com henna": [6000],
  "Design de sobrancelhas com cera": [3000],
  "Henna nas sobrancelhas": [3000],
  "Buço com cera fria": [1000],
  "Depilação facial completa com navalha": [3000],
  "Hidra Gloss Color": [7000],
  "Nano Lips Gloss": [15000],
};

describe("catálogo", () => {
  it("preserva exatamente os preços informados pelo Studio", () => {
    for (const [name, [price, maintenance]] of Object.entries(expected)) {
      const s = services.find((x) => x.name === name);
      expect(s, `serviço ausente: ${name}`).toBeDefined();
      expect(s!.priceCents, `preço de ${name}`).toBe(price);
      expect(s!.maintenanceCents, `manutenção de ${name}`).toBe(maintenance);
    }
  });

  it("não inventa serviços além dos informados", () => {
    expect(services).toHaveLength(Object.keys(expected).length);
  });

  it("tem as 15 entradas de cílios informadas (14 técnicas + remoção)", () => {
    expect(servicesOfCategory(catalog, "cilios")).toHaveLength(15);
    expect(missingOptions(catalog, "cilios")).toBe(0);
    expect(missingOptions(catalog, "sobrancelhas")).toBe(0);
    expect(missingOptions(catalog, "depilacao")).toBe(0);
    expect(missingOptions(catalog, "labios")).toBe(0);
  });

  it("usa slugs únicos e categorias válidas", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const cats = new Set(categories.map((c) => c.slug));
    for (const s of services) expect(cats.has(s.categorySlug)).toBe(true);
  });

  it("usa valores inteiros em centavos", () => {
    for (const s of services) {
      expect(Number.isInteger(s.priceCents)).toBe(true);
      if (s.maintenanceCents !== undefined) {
        expect(Number.isInteger(s.maintenanceCents)).toBe(true);
      }
    }
  });

  it("relatedSlugs apontam para serviços existentes", () => {
    for (const s of services) {
      for (const r of s.relatedSlugs ?? []) {
        expect(services.some((x) => x.slug === r), `${s.slug} -> ${r}`).toBe(true);
      }
    }
  });

  it("ordena categorias por posição e resolve serviço por categoria+slug", () => {
    expect(sortedCategories(catalog).map((c) => c.index)).toEqual(["01", "02", "03", "04"]);
    const first = services[0];
    expect(findService(catalog, first.categorySlug, first.slug)?.slug).toBe(first.slug);
    expect(findService(catalog, "labios", first.slug)).toBeUndefined();
  });
});
