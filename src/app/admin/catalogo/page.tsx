import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/features/catalog-admin/StatusBadge";
import { getAdminCatalog } from "@/features/catalog-admin/queries";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.catalog.title"), robots: { index: false, follow: false } };
}

export default async function AdminCatalogPage() {
  const [t, cat] = await Promise.all([getT(), getAdminCatalog()]);
  const count = (slug: string) => cat.services.filter((s) => s.category_slug === slug && s.active).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">{t("admin.catalog.title")}</h1>
          <p className="mt-3 max-w-2xl text-cocoa">{t("admin.catalog.lead")}</p>
        </div>
        {cat.ready && <LinkButton href="/admin/catalogo/nova">{t("admin.catalog.newCategory")}</LinkButton>}
      </header>

      {!cat.ready ? (
        <p className="rounded-card bg-ivory p-5 text-cocoa shadow-soft">{t("admin.catalog.notReady")}</p>
      ) : !cat.categories.length ? (
        <p className="text-cocoa">{t("admin.catalog.noCategories")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cat.categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/admin/catalogo/${c.slug}`} className="block h-full rounded-card bg-ivory p-5 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-rose-deep">{c.index_label}</p>
                  <StatusBadge active={c.active} label={c.active ? t("admin.catalog.active") : t("admin.catalog.archived")} />
                </div>
                <h2 className="mt-2 font-display text-3xl text-espresso">{c.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-cocoa">{c.tagline}</p>
                <p className="mt-4 text-sm text-espresso">{t("admin.catalog.procedureCount", { n: count(c.slug) })}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
