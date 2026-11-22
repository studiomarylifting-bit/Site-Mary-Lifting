import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/policies/authz";
import { Container } from "@/components/shared/PageHero";

export const metadata: Metadata = { title: "Administração", robots: { index: false, follow: false } };

const links = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/sac", label: "SAC" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Autorização real no servidor, lida do banco. 404 (não 403) para não revelar a área.
  const admin = await requireAdmin();
  if (!admin) notFound();

  return (
    <Container className="py-10 md:py-14">
      <nav aria-label="Administração" className="mb-10 flex flex-wrap items-center gap-1 border-b border-line pb-4">
        <span className="mr-4 font-display text-2xl text-espresso">Administração</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm text-cocoa transition-colors hover:bg-nude/70 hover:text-espresso motion-reduce:transition-none">{l.label}</Link>
        ))}
        <form action="/auth/signout" method="post" className="ml-auto">
          <button type="submit" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-rose-deep underline underline-offset-4 hover:bg-blush">Sair</button>
        </form>
      </nav>
      {children}
    </Container>
  );
}
