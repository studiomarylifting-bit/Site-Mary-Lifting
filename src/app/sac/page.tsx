import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/shared/PageHero";
import { SacForm } from "@/features/sac/SacForm";
import { getSessionUser } from "@/server/policies/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBrazilPhone } from "@/lib/format";
import { ticketTypes } from "@/lib/validation/schemas";

export const metadata: Metadata = {
  title: "SAC — Atendimento ao cliente",
  description: "Envie dúvidas, solicitações, sugestões ou reclamações ao Studio Mary Lifting.",
  alternates: { canonical: "/sac" },
};

export default async function SacPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string; tipo?: string }>;
}) {
  const sp = await searchParams;
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
      <PageHero eyebrow="Atendimento" title="SAC" lead="Envie sua solicitação e receba um número de protocolo para acompanhar o atendimento." />
      <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7"><SacForm defaults={defaults} signedIn={Boolean(user)} /></div>
        <aside className="space-y-4 text-sm text-cocoa lg:col-span-4 lg:col-start-9">
          <h2 className="text-3xl">Como funciona</h2>
          <p>Cada solicitação gera um protocolo. O Studio é avisado e responde pelos contatos informados.</p>
          {user ? (
            <p><Link className="underline underline-offset-4" href="/conta/sac">Ver meu histórico de SAC</Link></p>
          ) : (
            <p><Link className="underline underline-offset-4" href="/entrar?next=/sac">Entre</Link> ou <Link className="underline underline-offset-4" href="/cadastro">crie sua conta</Link> para acompanhar seu histórico.</p>
          )}
          <p>Para pedidos sobre seus dados pessoais, use a <Link className="underline underline-offset-4" href="/privacidade#direitos">página de privacidade</Link>.</p>
        </aside>
      </Container>
    </>
  );
}
