import type { Metadata } from "next";
import Link from "next/link";
import { CategoryForm } from "@/features/catalog-admin/CatalogForms";
import { getAdminCatalog } from "@/features/catalog-admin/queries";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.catalog.newCategory"), robots: { index: false, follow: false } };
}

export default async function NewCategoryPage() {
  const [t, cat] = await Promise.all([getT(), getAdminCatalog()]);
  const next = Math.max(0, ...cat.categories.map((c) => c.position)) + 1;
  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/catalogo" className="text-sm text-cocoa underline underline-offset-4">{t("admin.catalog.back")}</Link>
        <h1 className="mt-3 text-4xl sm:text-5xl">{t("admin.catalog.newCategory")}</h1>
      </div>
      {cat.ready ? (
        <CategoryForm
          mode="create"
          values={{ slug: "", title: "", tagline: "", index_label: String(next).padStart(2, "0"), position: next, declared_option_count: 0, active: true }}
        />
      ) : <p className="text-cocoa">{t("admin.catalog.notReady")}</p>}
    </div>
  );
}
