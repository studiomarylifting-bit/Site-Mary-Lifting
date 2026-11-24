import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isAdminUser } from "@/server/policies/authz";
import { Container } from "@/components/shared/PageHero";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("account.eyebrow"), robots: { index: false, follow: false } };
}

const links = [
  { href: "/conta", key: "overview" },
  { href: "/conta/ficha", key: "intake" },
  { href: "/conta/sac", key: "tickets" },
  { href: "/conta/feedbacks", key: "feedbacks" },
  { href: "/conta/autorizacoes", key: "consents" },
  { href: "/conta/perfil", key: "profile" },
] as const;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Segunda barreira (o middleware é a primeira): a página nunca depende só dele.
  const user = await getSessionUser();
  if (!user) redirect("/entrar?next=/conta");
  // A administradora tem ambiente próprio (/admin); /conta é só da cliente.
  if (await isAdminUser(user.id)) redirect("/admin");
  const t = await getT();

  return (
    <Container className="grid gap-8 py-8 sm:py-10 md:py-16 lg:grid-cols-12 lg:gap-10">
      <aside className="lg:col-span-3">
        <nav aria-label={t("account.eyebrow")} className="flex gap-1 overflow-x-auto pb-3 lg:flex-col lg:pb-0">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm text-cocoa transition-colors hover:bg-nude/70 hover:text-espresso motion-reduce:transition-none">
              {t(`account.nav.${l.key}`)}
            </Link>
          ))}
          <form action="/auth/signout" method="post" className="lg:mt-6">
            <button type="submit" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-rose-deep underline underline-offset-4 hover:bg-blush">{t("account.nav.signOut")}</button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </Container>
  );
}
