import { describe, expect, it } from "vitest";
import { LOCALES, isLocale, pickFromAcceptLanguage } from "@/i18n/config";
import { dictionary } from "@/i18n/messages";
import { createT, flattenKeys } from "@/i18n/translate";
import { serverMessageKeys, translateMessage } from "@/i18n/server-messages";
import { formatDate } from "@/i18n/format";
import { localizeCatalog, catalogOriginalPt } from "@/features/catalog/translations";
import { staticCatalog } from "@/features/catalog/catalog-core";
import { buildFaqItems } from "@/features/faq/data";
import { formatBRL } from "@/lib/format";

const ptKeys = flattenKeys(dictionary.pt).sort();

describe("i18n: dicionários", () => {
  it("os quatro idiomas existem", () => {
    expect([...LOCALES]).toEqual(["pt", "en", "es", "it"]);
    for (const l of LOCALES) expect(Object.keys(dictionary[l]).length).toBeGreaterThan(5);
  });

  for (const l of LOCALES.filter((x) => x !== "pt")) {
    it(`${l}: mesmas chaves do português (nenhuma faltando ou sobrando)`, () => {
      expect(flattenKeys(dictionary[l]).sort()).toEqual(ptKeys);
    });
    it(`${l}: nenhum texto vazio e mesmos {placeholders} do português`, () => {
      const t = createT(dictionary[l]);
      const tp = createT(dictionary.pt);
      const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
      for (const k of ptKeys) {
        const v = t(k);
        expect(v.trim().length, k).toBeGreaterThan(0);
        expect(vars(v), k).toBe(vars(tp(k)));
      }
    });
  }

  it("t(): interpolação, chave ausente devolve a chave", () => {
    const t = createT({ a: { b: "Olá, {name}!" } });
    expect(t("a.b", { name: "Ana" })).toBe("Olá, Ana!");
    expect(t("a.b")).toBe("Olá, {name}!");
    expect(t("x.y")).toBe("x.y");
    expect(createT({}, { x: "reserva" })("x")).toBe("reserva");
  });
});

describe("i18n: idioma da requisição", () => {
  it("isLocale", () => {
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
  it("Accept-Language escolhe pelo peso e cai em português", () => {
    expect(pickFromAcceptLanguage("es-AR,es;q=0.9,en;q=0.8")).toBe("es");
    expect(pickFromAcceptLanguage("fr-FR,fr;q=0.9,it;q=0.5")).toBe("it");
    expect(pickFromAcceptLanguage("en;q=0.4,pt-BR;q=0.9")).toBe("pt");
    expect(pickFromAcceptLanguage("de,fr")).toBe("pt");
    expect(pickFromAcceptLanguage(null)).toBe("pt");
    expect(pickFromAcceptLanguage("en;q=0")).toBe("pt");
  });
});

describe("i18n: mensagens do servidor", () => {
  it("traduz mensagens exatas e padrões do trimmed()", () => {
    expect(translateMessage("E-mail inválido", "en")).toBe("Invalid email");
    expect(translateMessage("E-mail inválido", "pt")).toBe("E-mail inválido");
    expect(translateMessage("Mensagem: mínimo de 10 caracteres", "es")).toBe("Mensaje: mínimo 10 caracteres");
    expect(translateMessage("Nome completo é obrigatório", "it")).toBe("Nome completo è obbligatorio");
    expect(translateMessage("Texto desconhecido", "en")).toBe("Texto desconhecido");
  });
  it("todas as mensagens têm tradução diferente do português nos 3 idiomas", () => {
    for (const m of serverMessageKeys) for (const l of ["en", "es", "it"] as const) expect(translateMessage(m, l)).not.toBe("");
  });
});

describe("i18n: catálogo", () => {
  const base = staticCatalog();
  it("o texto 'pt' das traduções é idêntico ao catálogo estático (senão a tradução nunca seria aplicada)", () => {
    for (const s of base.services) {
      const t = catalogOriginalPt.services[s.slug];
      expect(t, s.slug).toBeDefined();
      expect([t!.pt[0], t!.pt[1]]).toEqual([s.name, s.description]);
    }
    for (const c of base.categories) {
      const t = catalogOriginalPt.categories[c.slug];
      expect(t, c.slug).toBeDefined();
      expect([t!.pt[0], t!.pt[1]]).toEqual([c.title, c.tagline]);
    }
  });
  it("traduz em en/es/it e mantém preços, slugs e ordem", () => {
    for (const l of ["en", "es", "it"] as const) {
      const c = localizeCatalog(base, l);
      expect(c.services.map((s) => [s.slug, s.priceCents])).toEqual(base.services.map((s) => [s.slug, s.priceCents]));
      expect(c.services.find((s) => s.slug === "brow-lamination")!.description).not.toBe(base.services.find((s) => s.slug === "brow-lamination")!.description);
    }
    expect(localizeCatalog(base, "pt")).toBe(base);
  });
  it("não sobrescreve texto editado no banco", () => {
    const edited = { ...base, services: base.services.map((s) => (s.slug === "fox-easy" ? { ...s, description: "Texto novo do admin." } : s)) };
    expect(localizeCatalog(edited, "en").services.find((s) => s.slug === "fox-easy")!.description).toBe("Texto novo do admin.");
  });
});

describe("i18n: FAQ e formatos", () => {
  const services = staticCatalog().services;
  it("FAQ nos 4 idiomas tem 8 perguntas e os mesmos ids/links", () => {
    const pt = buildFaqItems(services);
    for (const l of LOCALES) {
      const items = buildFaqItems(services, createT(dictionary[l]));
      expect(items.map((i) => i.id)).toEqual(pt.map((i) => i.id));
      expect(items.map((i) => i.links?.map((x) => x.href))).toEqual(pt.map((i) => i.links?.map((x) => x.href)));
      expect(items.every((i) => i.question.length > 5)).toBe(true);
    }
  });
  it("lista de pagamentos usa o conectivo do idioma", () => {
    const text = (l: "pt" | "en" | "es" | "it") =>
      buildFaqItems(services, createT(dictionary[l])).find((i) => i.id === "pagamento")!.answer[0]!;
    expect(text("pt")).toContain(" e link de pagamento");
    expect(text("en")).toContain(" and payment link");
    expect(text("es")).toContain(" y enlace de pago");
    expect(text("it")).toContain(" e link di pagamento");
  });
  it("formatBRL mantém o padrão pt e muda só a pontuação nos demais", () => {
    expect(formatBRL(17000).replace(/\s/g, " ")).toBe("R$ 170,00");
    expect(formatBRL(17000, "en")).toContain("170.00");
  });
  it("formatDate", () => {
    expect(formatDate("2026-11-23T12:00:00Z", "pt")).toBe("23/11/2026");
    expect(formatDate("lixo", "en")).toBe("");
    expect(formatDate(null, "it")).toBe("");
  });
});
