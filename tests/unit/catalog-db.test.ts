import { describe, expect, it } from "vitest";
import { findServiceBySlug, relatedOf, servicesOfCategory, staticCatalog } from "@/features/catalog/catalog-core";
import { deriveMaintenanceDays } from "@/features/catalog/derive";
import { rowsToCatalog, type CategoryRow, type ServiceRow } from "@/features/catalog/mapper";
import { CATALOG_BUCKET, isValidImagePath, publicImageUrl } from "@/features/catalog/storage";
import { buildFaqItems, faqAnswerText } from "@/features/faq/data";

const URL = "https://abc123.supabase.co";

const cat = (over: Partial<CategoryRow> = {}): CategoryRow => ({
  slug: "cilios", position: 1, index_label: "01", title: "Extensão de cílios", tagline: "Métodos.",
  declared_option_count: 15, image_path: null, ...over,
});
const svc = (over: Partial<ServiceRow> = {}): ServiceRow => ({
  slug: "volume-egipcio", category_slug: "cilios", position: 1, name: "Volume egípcio", description: "d",
  price_cents: 16000, maintenance_cents: 12000, maintenance_days: 30, return_info: "Retorno em até 30 dias.",
  notes: null, related_slugs: null, image_path: null, ...over,
});

describe("image_path / URL pública do Storage", () => {
  it.each([
    "servicos/volume-egipcio.webp",
    "servicos/cilios/a-b_c.JPG",
    "categorias/cilios.avif",
    "studio/fachada.png",
    "home/hero.jpeg",
  ])("aceita %s", (p) => expect(isValidImagePath(p)).toBe(true));

  it.each([
    "", "volume.webp", "https://evil.com/a.jpg", "//evil.com/a.jpg", "/servicos/a.webp", "servicos/../x.png",
    "servicos/a.svg", "servicos/a.gif", "servicos/.hidden.png", "outra/a.webp", "servicos/a b.webp",
    "servicos/a.webp?x=1", "servicos/a.webp#frag",
  ])("rejeita %j", (p) => expect(isValidImagePath(p)).toBe(false));

  it("rejeita não-string e caminho gigante", () => {
    expect(isValidImagePath(null)).toBe(false);
    expect(isValidImagePath(undefined)).toBe(false);
    expect(isValidImagePath(42)).toBe(false);
    expect(isValidImagePath("servicos/" + "a".repeat(300) + ".webp")).toBe(false);
  });

  it("monta a URL pública do bucket e remove barra final da base", () => {
    expect(publicImageUrl("servicos/volume-egipcio.webp", URL)).toBe(
      `${URL}/storage/v1/object/public/${CATALOG_BUCKET}/servicos/volume-egipcio.webp`,
    );
    expect(publicImageUrl("servicos/a.webp", URL + "///")).toBe(`${URL}/storage/v1/object/public/site-media/servicos/a.webp`);
  });

  it("sem caminho, sem base ou caminho inválido => undefined (placeholder)", () => {
    expect(publicImageUrl(null, URL)).toBeUndefined();
    expect(publicImageUrl("servicos/a.webp", null)).toBeUndefined();
    expect(publicImageUrl("servicos/a.webp", "")).toBeUndefined();
    expect(publicImageUrl("https://evil.com/a.jpg", URL)).toBeUndefined();
  });
});

describe("rowsToCatalog (banco -> site)", () => {
  it("converte linhas e marca a origem como database", () => {
    const c = rowsToCatalog([cat()], [svc()], URL);
    expect(c.source).toBe("database");
    expect(c.categories).toHaveLength(1);
    expect(c.services[0]!.priceCents).toBe(16000);
    expect(c.services[0]!.maintenanceCents).toBe(12000);
    expect(c.services[0]!.maintenanceDays).toBe(30);
    expect(c.categories[0]!.declaredOptionCount).toBe(15);
  });

  it("image_path NULL => sem imagem (placeholder), nunca URL inventada", () => {
    const c = rowsToCatalog([cat()], [svc()], URL);
    expect(c.services[0]!.imagePath).toBeUndefined();
    expect(c.services[0]!.imageUrl).toBeUndefined();
    expect(c.categories[0]!.imageUrl).toBeUndefined();
  });

  it("image_path preenchido => URL pública do bucket", () => {
    const c = rowsToCatalog([cat({ image_path: "categorias/cilios.webp" })], [svc({ image_path: "servicos/volume-egipcio.webp" })], URL);
    expect(c.services[0]!.imageUrl).toBe(`${URL}/storage/v1/object/public/site-media/servicos/volume-egipcio.webp`);
    expect(c.categories[0]!.imageUrl).toContain("/categorias/cilios.webp");
  });

  it("image_path malicioso no banco é ignorado", () => {
    const c = rowsToCatalog([cat()], [svc({ image_path: "https://evil.com/x.jpg" })], URL);
    expect(c.services[0]!.imagePath).toBeUndefined();
    expect(c.services[0]!.imageUrl).toBeUndefined();
  });

  it("remoção: sem manutenção não herda prazo nem valor", () => {
    const c = rowsToCatalog([cat()], [svc({ slug: "remocao", name: "Remoção", price_cents: 4000, maintenance_cents: null, maintenance_days: 30, return_info: null })], URL);
    expect(c.services[0]!.maintenanceCents).toBeUndefined();
    expect(c.services[0]!.maintenanceDays).toBeUndefined();
  });

  it("descarta serviço de categoria inexistente e preço inválido", () => {
    const c = rowsToCatalog(
      [cat()],
      [svc(), svc({ slug: "orfao", category_slug: "nao-existe" }), svc({ slug: "neg", price_cents: -1 }), svc({ slug: "frac", price_cents: 10.5 })],
      URL,
    );
    expect(c.services.map((s) => s.slug)).toEqual(["volume-egipcio"]);
  });

  it("ordena por position e filtra related_slugs inexistentes", () => {
    const c = rowsToCatalog(
      [cat({ slug: "b", position: 2 }), cat({ slug: "cilios", position: 1 })],
      [
        svc({ slug: "z", position: 2, related_slugs: ["a", "fantasma"] }),
        svc({ slug: "a", position: 1, related_slugs: null }),
      ],
      URL,
    );
    expect(c.categories.map((x) => x.slug)).toEqual(["cilios", "b"]);
    expect(c.services.map((s) => s.slug)).toEqual(["a", "z"]);
    expect(findServiceBySlug(c, "z")!.relatedSlugs).toEqual(["a"]);
    expect(relatedOf(c, findServiceBySlug(c, "z")!).map((s) => s.slug)).toEqual(["a"]);
  });
});

describe("catálogo estático (fallback e fonte do seed)", () => {
  const c = staticCatalog();
  it("marca origem static e deriva prazo só com manutenção", () => {
    expect(c.source).toBe("static");
    for (const s of c.services) {
      if (s.maintenanceCents === undefined) expect(s.maintenanceDays).toBeUndefined();
      else expect(s.maintenanceDays).toBe(30);
    }
    expect(findServiceBySlug(c, "remocao-de-extensao")!.maintenanceDays).toBeUndefined();
  });
  it("nenhum serviço estático traz imagem", () => {
    for (const s of c.services) {
      expect(s.imagePath).toBeUndefined();
      expect(s.imageUrl).toBeUndefined();
    }
  });
  it("mantém o vínculo das variações no castanho", () => {
    expect(servicesOfCategory(c, "cilios").filter((s) => s.relatedSlugs?.length).length).toBeGreaterThan(0);
  });
});

describe("deriveMaintenanceDays", () => {
  it("extrai dias do texto de retorno", () => {
    expect(deriveMaintenanceDays("Retorno em até 30 dias.", 100)).toBe(30);
    expect(deriveMaintenanceDays("Retorno em até 30 dias, consulte as condições.", 100)).toBe(30);
  });
  it("sem manutenção ou sem texto => undefined", () => {
    expect(deriveMaintenanceDays("Retorno em até 30 dias.", undefined)).toBeUndefined();
    expect(deriveMaintenanceDays(undefined, 100)).toBeUndefined();
    expect(deriveMaintenanceDays("sem prazo", 100)).toBeUndefined();
  });
});

describe("FAQ reflete o catálogo recebido", () => {
  it("usa o preço da remoção do catálogo informado (ex.: vindo do banco)", () => {
    const c = staticCatalog();
    const alt = c.services.map((s) => (s.slug === "remocao-de-extensao" ? { ...s, priceCents: 5500 } : s));
    const item = buildFaqItems(alt).find((i) => i.id === "manutencao-outra-profissional")!;
    expect(faqAnswerText(item).replace(/\s/g, " ")).toContain("R$ 55,00");
  });
});
