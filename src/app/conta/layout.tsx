import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/policies/authz";
import { Container } from "@/components/shared/PageHero";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false, follow: false } };

const links = [
  { href: "/conta", label: "Visão geral" },
  { href: "/conta/ficha", label: "Ficha de atendimento" },
  { href: "/conta/sac", label: "Meus SAC" },
  { href: "/conta/feedbacks", label: "Meus feedbacks" },
  { href: "/conta/autorizacoes", label: "Autorizações" },
  { href: "/conta/perfil", label: "Perfil e dados" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Segunda barreira (o middleware é a primeira): a página nunca depende só dele.
  const user = await getSessionUser();
  if (!user) redirect("/entrar?next=/conta");

  return (
    <Container className="grid gap-10 py-10 md:py-16 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <nav aria-label="Minha conta" className="flex gap-1 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:border-0 lg:pb-0">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap px-3 py-2 text-sm text-cocoa transition-colors hover:bg-nude/60 hover:text-espresso">
              {l.label}
            </Link>
          ))}
          <form action="/auth/signout" method="post" className="lg:mt-6">
            <button type="submit" className="px-3 py-2 text-sm text-rose-deep underline underline-offset-4">Sair</button>
          </form>
        </nav>
      </aside>
      <div className="lg:col-span-9">{children}</div>
    </Container>
  );
}
