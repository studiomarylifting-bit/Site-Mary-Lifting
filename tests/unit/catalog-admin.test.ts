import { describe, expect, it } from "vitest";
import { parseMoneyToCents, slugify, validateCategory, validateService } from "@/features/catalog-admin/validate";

describe("catalog-admin: slug e dinheiro", () => {
  it("slugify tira acento e símbolos", () => {
    expect(slugify("Cílios Fio a Fio!")).toBe("cilios-fio-a-fio");
    expect(slugify("  Design de Sobrancelhas  ")).toBe("design-de-sobrancelhas");
    expect(slugify("../etc/passwd")).toBe("etc-passwd");
    expect(slugify("!!!")).toBe("");
  });
  it("parseMoneyToCents aceita formatos brasileiros e recusa lixo", () => {
    expect(parseMoneyToCents("150")).toBe(15000);
    expect(parseMoneyToCents("R$ 150,5")).toBe(15050);
    expect(parseMoneyToCents("1.250,00")).toBe(125000);
    expect(parseMoneyToCents("150.00")).toBe(15000);
    expect(parseMoneyToCents("1.250")).toBe(125000);
    expect(parseMoneyToCents("0")).toBe(0);
    expect(parseMoneyToCents("")).toBeNull();
    expect(parseMoneyToCents("abc")).toBeNull();
    expect(parseMoneyToCents("-10")).toBeNull();
    expect(parseMoneyToCents("10,999")).toBeNull();
    expect(parseMoneyToCents("99999999")).toBeNull();
  });
});

describe("catalog-admin: categoria", () => {
  const ok = { title: "Unhas", tagline: "Cuidado e design", index_label: "05", position: "5", declared_option_count: "0", active: "on" };
  it("cria com slug gerado do título", () => {
    const r = validateCategory(ok, { creating: true });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.value.slug).toBe("unhas"); expect(r.value.position).toBe(5); expect(r.value.active).toBe(true); }
  });
  it("ao editar não exige slug e inativa sem checkbox", () => {
    const r = validateCategory({ ...ok, active: undefined }, { creating: false });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.active).toBe(false);
  });
  it("devolve códigos de erro por campo", () => {
    const r = validateCategory({ title: "", tagline: "x".repeat(301), index_label: "12345", position: "0", declared_option_count: "-1" }, { creating: true });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.title).toBe("required");
      expect(r.errors.tagline).toBe("tooLong");
      expect(r.errors.index_label).toBe("tooLong");
      expect(r.errors.position).toBe("number");
      expect(r.errors.declared_option_count).toBe("number");
      expect(r.errors.slug).toBe("slug");
    }
  });
  it("slug informado inválido é recusado", () => {
    const r = validateCategory({ ...ok, slug: "Com Espaço" }, { creating: true });
    expect(r.ok).toBe(false);
  });
});

describe("catalog-admin: procedimento", () => {
  const ok = { name: "Volume Russo", description: "Técnica volume", category_slug: "cilios", price: "250,00", position: "3", active: "on" };
  it("converte preço em centavos e notas por linha", () => {
    const r = validateService({ ...ok, maintenance_price: "120", maintenance_days: "21", notes: "Evitar água 24h\n\n  Sem rímel ", return_info: "Retorno em 21 dias" }, { creating: true });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.slug).toBe("volume-russo");
      expect(r.value.price_cents).toBe(25000);
      expect(r.value.maintenance_cents).toBe(12000);
      expect(r.value.maintenance_days).toBe(21);
      expect(r.value.notes.length).toBe(2);
    }
  });
  it("prazo de manutenção exige valor de manutenção (regra do banco)", () => {
    const r = validateService({ ...ok, maintenance_days: "21" }, { creating: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.maintenance_days).toBe("days");
  });
  it("preço obrigatório e válido", () => {
    const a = validateService({ ...ok, price: "" }, { creating: true });
    const b = validateService({ ...ok, price: "dez" }, { creating: true });
    expect(!a.ok && a.errors.price_cents).toBe("required");
    expect(!b.ok && b.errors.price_cents).toBe("money");
  });
  it("limita notas (10 linhas, 300 caracteres)", () => {
    const many = validateService({ ...ok, notes: Array.from({ length: 11 }, (_, i) => `n${i}`).join("\n") }, { creating: true });
    const long = validateService({ ...ok, notes: "x".repeat(301) }, { creating: true });
    expect(many.ok).toBe(false);
    expect(long.ok).toBe(false);
  });
  it("categoria obrigatória", () => {
    const r = validateService({ ...ok, category_slug: "" }, { creating: true });
    expect(!r.ok && r.errors.category_slug).toBe("required");
  });
});
