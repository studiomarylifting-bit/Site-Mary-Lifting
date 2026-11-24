import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/shared/PageHero";
import { SacForm } from "@/features/sac/SacForm";
import { getSessionUser } from "@/server/policies/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBrazilPhone } from "@/lib/format";
import { ticketTypes } from "@/lib/validation/schemas";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("sac.meta.title"), description: t("sac.meta.description"), alternates: { canonical: "/sac" } };
}

export default async function SacPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string; tipo?: string }>;
}) {
  const [sp, t] = await Promise.all([searchParams, getT()]);
  const user = await getSessionUser();
  let defaults: { name?: string; email?: string; phone?: string; subject?: string; type?: string } = {};

  if (user) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase?.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle() ?? { data: null };
    defaults = { name: data?.full_name, phone: data?.phone ? formatBrazilPhone(data.phone) : undefined, email: user.email };
  }
  if (sp.assunto) defaults.subject = sp.assunto.slice(0, 140);
  if ((ticketTypes as readonly string[]).includes(sp.tipo ?? "")) defaults.type = sp.tipo;

  return (
    <>
      <PageHero eyebrow={t("sac.eyebrow")} title={t("sac.title")} lead={t("sac.lead")} />
      <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7"><SacForm defaults={defaults} signedIn={Boolean(user)} /></div>
        <aside className="space-y-4 text-sm text-cocoa lg:col-span-4 lg:col-start-9">
          <h2 className="text-3xl">{t("sac.how")}</h2>
          <p>{t("sac.howText")}</p>
          {user ? (
            <p><Link className="underline underline-offset-4" href="/conta/sac">{t("sac.history")}</Link></p>
          ) : (
            <p><Link className="underline underline-offset-4" href="/entrar?next=/sac">{t("sac.signInLink")}</Link>{t("sac.or")}<Link className="underline underline-offset-4" href="/cadastro">{t("sac.createLink")}</Link>{t("sac.followHistory")}</p>
          )}
          <p>{t("sac.privacyPre")}<Link className="underline underline-offset-4" href="/privacidade#direitos">{t("sac.privacyLink")}</Link>.</p>
        </aside>
      </Container>
    </>
  );
}
