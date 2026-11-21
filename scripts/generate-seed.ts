/**
 * Gera supabase/seed.sql a partir de src/features/catalog/data.ts.
 * Somente dados PÚBLICOS de serviços. Nenhum dado de cliente.
 * Uso: npm run seed:generate
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { categories, services } from "../src/features/catalog/data";

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const n = (v?: number) => (v === undefined ? "null" : String(v));

const lines: string[] = [
  "-- GERADO por scripts/generate-seed.ts. Não edite à mão.",
  "-- Idempotente: pode ser executado mais de uma vez.",
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
  lines.push(
    `insert into public.services (slug, category_slug, position, name, description, price_cents, maintenance_cents, return_info, notes) values (${q(s.slug)}, ${q(s.categorySlug)}, ${i + 1}, ${q(s.name)}, ${q(s.description)}, ${s.priceCents}, ${n(s.maintenanceCents)}, ${s.returnInfo ? q(s.returnInfo) : "null"}, ${notes})` +
      ` on conflict (slug) do update set category_slug = excluded.category_slug, position = excluded.position, name = excluded.name, description = excluded.description, price_cents = excluded.price_cents, maintenance_cents = excluded.maintenance_cents, return_info = excluded.return_info, notes = excluded.notes;`,
  );
});

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log(
  `seed.sql: ${categories.length} categorias, ${services.length} serviços`,
);
