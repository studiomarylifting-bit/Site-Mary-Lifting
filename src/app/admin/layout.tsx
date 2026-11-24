import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/policies/authz";
import { Container } from "@/components/shared/PageHero";
import { AdminNav } from "@/components/layout/AdminNav";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.title"), robots: { index: false, follow: false } };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Autorização real no servidor, lida do banco. 404 (não 403) para não revelar a área.
  const admin = await requireAdmin();
  if (!admin) notFound();
  const t = await getT();

  return (
    <Container className="grid gap-8 py-8 sm:py-10 md:py-14 lg:grid-cols-12 lg:gap-10">
      <aside className="lg:col-span-3 xl:col-span-2">
        <div className="mb-4 hidden items-center gap-2 lg:flex">
          <span className="rounded-full bg-espresso px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-ivory">{t("admin.title")}</span>
        </div>
        <AdminNav
          label={t("admin.title")}
          links={[
            { href: "/admin", label: t("admin.nav.dashboard"), exact: true },
            { href: "/admin/clientes", label: t("admin.nav.clients") },
            { href: "/admin/sac", label: t("admin.nav.sac") },
            { href: "/admin/feedback", label: t("admin.nav.feedback") },
            { href: "/admin/catalogo", label: t("admin.nav.catalog") },
            { href: "/admin/imagens", label: t("admin.nav.images") },
          ]}
          siteLabel={t("admin.nav.site")}
          signOutLabel={t("admin.nav.signOut")}
        />
      </aside>
      <div className="min-w-0 lg:col-span-9 xl:col-span-10">{children}</div>
    </Container>
  );
}
