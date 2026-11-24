import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/policies/authz";
import { Container } from "@/components/shared/PageHero";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.title"), robots: { index: false, follow: false } };
}

const links = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/clientes", key: "clients" },
  { href: "/admin/feedback", key: "feedback" },
  { href: "/admin/sac", key: "sac" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Autorização real no servidor, lida do banco. 404 (não 403) para não revelar a área.
  const admin = await requireAdmin();
  if (!admin) notFound();
  const t = await getT();

  return (
    <Container className="py-8 sm:py-10 md:py-14">
      <nav aria-label={t("admin.title")} className="mb-10 flex flex-wrap items-center gap-1 border-b border-line pb-4">
        <span className="mr-4 font-display text-2xl text-espresso">{t("admin.title")}</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm text-cocoa transition-colors hover:bg-nude/70 hover:text-espresso motion-reduce:transition-none">{t(`admin.nav.${l.key}`)}</Link>
        ))}
        <form action="/auth/signout" method="post" className="ml-auto">
          <button type="submit" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-rose-deep underline underline-offset-4 hover:bg-blush">{t("admin.nav.signOut")}</button>
        </form>
      </nav>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
