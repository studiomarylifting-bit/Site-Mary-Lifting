/**
 * Validação PURA do formulário de catálogo (sem rede, sem Zod): roda no servidor (fonte da verdade),
 * é testável e devolve CÓDIGOS de erro que a tela traduz. O banco confere de novo (CHECKs + RLS).
 */
export type FieldCode = "required" | "tooShort" | "tooLong" | "slug" | "money" | "number" | "days" | "lines";
export type Errors<K extends string> = Partial<Record<K, FieldCode>>;
export type Result<T, K extends string> = { ok: true; value: T } | { ok: false; errors: Errors<K> };

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Cílios Fio a Fio!" -> "cilios-fio-a-fio" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** "R$ 1.250,50" | "150" | "150,5" | "150.00" -> centavos inteiros; null se inválido. */
export function parseMoneyToCents(input: string): number | null {
  let s = input.replace(/R\$|\s/g, "");
  if (!s || !/^[0-9.,]+$/.test(s)) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [reais, cents = ""] = s.split(".");
  const value = Number(reais) * 100 + Number(cents.padEnd(2, "0"));
  return Number.isSafeInteger(value) && value <= 100_000_000 ? value : null;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
function text<K extends string>(errors: Errors<K>, key: K, raw: unknown, min: number, max: number): string {
  const v = str(raw);
  if (!v && min > 0) errors[key] = "required";
  else if (v.length < min) errors[key] = "tooShort";
  else if (v.length > max) errors[key] = "tooLong";
  return v;
}
function int<K extends string>(errors: Errors<K>, key: K, raw: unknown, min: number, max: number): number {
  const v = str(raw);
  const n = Number(v);
  if (!v) errors[key] = "required";
  else if (!/^\d+$/.test(v) || n < min || n > max) errors[key] = "number";
  return n;
}
const isOn = (v: unknown) => v === "on" || v === "true" || v === "1";

export interface CategoryInput {
  slug: string;
  title: string;
  tagline: string;
  index_label: string;
  position: number;
  declared_option_count: number;
  active: boolean;
}
type CatKey = keyof CategoryInput;

export function validateCategory(raw: Record<string, unknown>, opts: { creating: boolean }): Result<CategoryInput, CatKey> {
  const errors: Errors<CatKey> = {};
  const title = text(errors, "title", raw.title, 2, 80);
  const tagline = text(errors, "tagline", raw.tagline, 2, 300);
  const slugRaw = str(raw.slug) || (opts.creating ? slugify(title) : "");
  if (opts.creating && (!slugRaw || slugRaw.length < 2 || slugRaw.length > 60 || !SLUG_RE.test(slugRaw))) errors.slug = "slug";
  const index_label = text(errors, "index_label", raw.index_label, 1, 4);
  const position = int(errors, "position", raw.position, 1, 999);
  const declared_option_count = int(errors, "declared_option_count", raw.declared_option_count, 0, 999);
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { slug: slugRaw, title, tagline, index_label, position, declared_option_count, active: isOn(raw.active) } };
}

export interface ServiceInput {
  slug: string;
  category_slug: string;
  name: string;
  description: string;
  price_cents: number;
  maintenance_cents: number | null;
  maintenance_days: number | null;
  return_info: string | null;
  notes: string[];
  position: number;
  active: boolean;
}
type SvcKey = keyof ServiceInput;

export function validateService(raw: Record<string, unknown>, opts: { creating: boolean }): Result<ServiceInput, SvcKey> {
  const errors: Errors<SvcKey> = {};
  const name = text(errors, "name", raw.name, 2, 120);
  const description = text(errors, "description", raw.description, 2, 2000);
  const slugRaw = str(raw.slug) || (opts.creating ? slugify(name) : "");
  if (opts.creating && (!slugRaw || slugRaw.length < 2 || slugRaw.length > 60 || !SLUG_RE.test(slugRaw))) errors.slug = "slug";
  const category_slug = str(raw.category_slug);
  if (!category_slug || !SLUG_RE.test(category_slug)) errors.category_slug = "required";

  const priceRaw = str(raw.price);
  const price = priceRaw ? parseMoneyToCents(priceRaw) : null;
  if (price === null) errors.price_cents = priceRaw ? "money" : "required";

  const mRaw = str(raw.maintenance_price);
  let maintenance: number | null = null;
  if (mRaw) {
    maintenance = parseMoneyToCents(mRaw);
    if (maintenance === null) errors.maintenance_cents = "money";
  }
  const dRaw = str(raw.maintenance_days);
  let days: number | null = null;
  if (dRaw) {
    days = Number(dRaw);
    // O banco só aceita prazo junto com valor de manutenção.
    if (!/^\d+$/.test(dRaw) || days < 1 || days > 3650 || maintenance === null) errors.maintenance_days = "days";
  }
  const returnInfo = str(raw.return_info);
  if (returnInfo.length > 500) errors.return_info = "tooLong";

  const notes = str(raw.notes).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (notes.length > 10 || notes.some((n) => n.length > 300)) errors.notes = "lines";

  const position = int(errors, "position", raw.position, 1, 999);
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      slug: slugRaw, category_slug, name, description,
      price_cents: price as number, maintenance_cents: maintenance, maintenance_days: days,
      return_info: returnInfo || null, notes, position, active: isOn(raw.active),
    },
  };
}
