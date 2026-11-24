import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/features/catalog-admin/CatalogForms";
import { getAdminCatalog } from "@/features/catalog-admin/queries";
import { getT } from "@/i18n/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function NewServicePage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const [t, cat] = await Promise.all([getT(), getAdminCatalog()]);
  const category = cat.categories.find((c) => c.slug === categoria);
  if (!category) notFound();
  const next = Math.max(0, ...cat.services.filter((s) => s.category_slug === categoria).map((s) => s.position)) + 1;
  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/catalogo/${categoria}`} className="text-sm text-cocoa underline underline-offset-4">← {category.title}</Link>
        <h1 className="mt-3 text-4xl sm:text-5xl">{t("admin.catalog.newService")}</h1>
      </div>
      <ServiceForm
        mode="create"
        categories={cat.categories.map((c) => ({ value: c.slug, label: c.title }))}
        values={{ slug: "", category_slug: categoria, name: "", description: "", price: "", maintenance_price: "", maintenance_days: "", return_info: "", notes: "", position: next, active: true }}
      />
    </div>
  );
}
