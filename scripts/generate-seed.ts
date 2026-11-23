/**
 * Gera supabase/seed.sql a partir de src/features/catalog/data.ts.
 * Somente dados PÚBLICOS de serviços. Nenhum dado de cliente.
 * Uso: npm run seed:generate
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { categories, services } from "../src/features/catalog/data";
import { deriveMaintenanceDays } from "../src/features/catalog/derive";

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const n = (v?: number) => (v === undefined ? "null" : String(v));

const lines: string[] = [
  "-- GERADO por scripts/generate-seed.ts. Não edite à mão.",
  "-- Idempotente: pode ser executado mais de uma vez, sem duplicar.",
  "-- Pré-requisito: migrations 20261121000001 e 20261122000001 já aplicadas.",
  "--",
  "-- IMAGENS: este seed NUNCA escreve image_path. Linhas novas nascem com image_path",
  "-- NULL; em re-execuções o image_path que você já preencheu é PRESERVADO.",
  "-- ATENÇÃO: re-executar o seed restaura nome, descrição e PREÇOS para os valores",
  "-- de src/features/catalog/data.ts (sobrescreve edições feitas direto no banco).",
  "",
];

for (const c of categories) {
  lines.push(
    `insert into public.service_categories (slug, position, index_label, title, tagline, declared_option_count) values (${q(c.slug)}, ${c.position}, ${q(c.index)}, ${q(c.title)}, ${q(c.tagline)}, ${c.declaredOptionCount})` +
      ` on conflict (slug) do update set position = excluded.position, index_label = excluded.index_label, title = excluded.title, tagline = excluded.tagline, declared_option_count = excluded.declared_option_count;`,
  );
}
lines.push("");

services.forEach((s, i) => {
  const notes = s.notes?.length
    ? `array[${s.notes.map(q).join(", ")}]::text[]`
    : "'{}'::text[]";
  const related = s.relatedSlugs?.length
    ? `array[${s.relatedSlugs.map(q).join(", ")}]::text[]`
    : "'{}'::text[]";
  const days = deriveMaintenanceDays(s.returnInfo, s.maintenanceCents);
  lines.push(
    `insert into public.services (slug, category_slug, position, name, description, price_cents, maintenance_cents, maintenance_days, return_info, notes, related_slugs) values (${q(s.slug)}, ${q(s.categorySlug)}, ${i + 1}, ${q(s.name)}, ${q(s.description)}, ${s.priceCents}, ${n(s.maintenanceCents)}, ${n(days)}, ${s.returnInfo ? q(s.returnInfo) : "null"}, ${notes}, ${related})` +
      ` on conflict (slug) do update set category_slug = excluded.category_slug, position = excluded.position, name = excluded.name, description = excluded.description, price_cents = excluded.price_cents, maintenance_cents = excluded.maintenance_cents, maintenance_days = excluded.maintenance_days, return_info = excluded.return_info, notes = excluded.notes, related_slugs = excluded.related_slugs;`,
  );
});

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log(
  `seed.sql: ${categories.length} categorias, ${services.length} serviços`,
);
