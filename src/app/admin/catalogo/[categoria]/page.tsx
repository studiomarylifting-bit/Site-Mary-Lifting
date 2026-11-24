import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { ArchiveButton, CategoryForm } from "@/features/catalog-admin/CatalogForms";
import { getAdminCatalog } from "@/features/catalog-admin/queries";
import { getT } from "@/i18n/server";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "@/features/catalog-admin/StatusBadge";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminCategoryPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const [t, cat] = await Promise.all([getT(), getAdminCatalog()]);
  const category = cat.categories.find((c) => c.slug === categoria);
  if (!category) notFound();
  const services = cat.services.filter((s) => s.category_slug === categoria);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/catalogo" className="text-sm text-cocoa underline underline-offset-4">{t("admin.catalog.back")}</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl sm:text-5xl">{category.title}</h1>
          <StatusBadge active={category.active} label={category.active ? t("admin.catalog.active") : t("admin.catalog.archived")} />
        </div>
      </div>

      <section aria-labelledby="procs" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="procs" className="text-3xl">{t("admin.catalog.procedures")}</h2>
          <LinkButton href={`/admin/catalogo/${category.slug}/novo`}>{t("admin.catalog.newService")}</LinkButton>
        </div>
        {!services.length ? <p className="text-cocoa">{t("admin.catalog.noServices")}</p> : (
          <ul className="divide-y divide-line border-y border-line">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/admin/catalogo/${category.slug}/${s.slug}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-ivory">
                  <span className="min-w-0">
                    <span className="block text-espresso">{s.name}</span>
                    <span className="block text-sm text-cocoa">{formatBRL(s.price_cents, t.locale)}</span>
                  </span>
                  <StatusBadge active={s.active} label={s.active ? t("admin.catalog.active") : t("admin.catalog.archived")} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-taupe">{t("admin.catalog.photosNote")} <Link href="/admin/imagens" className="underline underline-offset-4">{t("admin.nav.images")}</Link>.</p>
      </section>

      <section aria-labelledby="edit-cat" className="space-y-5">
        <h2 id="edit-cat" className="text-3xl">{t("admin.catalog.editCategory")}</h2>
        <CategoryForm mode="edit" values={{ ...category }} />
        <ArchiveButton kind="category" slug={category.slug} active={category.active} />
      </section>
    </div>
  );
}
