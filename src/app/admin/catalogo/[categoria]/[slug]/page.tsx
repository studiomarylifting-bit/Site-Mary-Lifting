import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveButton, ServiceForm, centsToInput } from "@/features/catalog-admin/CatalogForms";
import { getAdminCatalog } from "@/features/catalog-admin/queries";
import { getT } from "@/i18n/server";
import { StatusBadge } from "@/features/catalog-admin/StatusBadge";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditServicePage({ params }: { params: Promise<{ categoria: string; slug: string }> }) {
  const { categoria, slug } = await params;
  const [t, cat] = await Promise.all([getT(), getAdminCatalog()]);
  const service = cat.services.find((s) => s.slug === slug && s.category_slug === categoria);
  const category = cat.categories.find((c) => c.slug === categoria);
  if (!service || !category) notFound();
  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/catalogo/${categoria}`} className="text-sm text-cocoa underline underline-offset-4">← {category.title}</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl sm:text-5xl">{service.name}</h1>
          <StatusBadge active={service.active} label={service.active ? t("admin.catalog.active") : t("admin.catalog.archived")} />
        </div>
      </div>
      <ServiceForm
        mode="edit"
        categories={cat.categories.map((c) => ({ value: c.slug, label: c.title }))}
        values={{
          slug: service.slug, category_slug: service.category_slug, name: service.name, description: service.description,
          price: centsToInput(service.price_cents), maintenance_price: centsToInput(service.maintenance_cents),
          maintenance_days: service.maintenance_days ? String(service.maintenance_days) : "",
          return_info: service.return_info ?? "", notes: (service.notes ?? []).join("\n"),
          position: service.position, active: service.active,
        }}
      />
      <ArchiveButton kind="service" slug={service.slug} active={service.active} />
    </div>
  );
}
