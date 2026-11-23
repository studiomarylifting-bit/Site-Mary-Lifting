import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findServiceBySlug } from "@/features/catalog/catalog-core";
import { getCatalog } from "@/features/catalog/queries";
import { Container, PageHero } from "@/components/shared/PageHero";
import { Stars } from "@/components/shared/Stars";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Feedback das clientes",
  description: "Feedbacks de clientes do Studio, publicados com autorização e após moderação.",
  alternates: { canonical: "/feedback" },
};

export const revalidate = 300;

interface PublicFeedback {
  id: string; rating: number; comment: string; procedure_slug: string | null; author: string; created_at: string;
}

async function loadFeedback(): Promise<{ items: PublicFeedback[]; unavailable: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], unavailable: true };
  // View public_feedback: só aprovados + com consentimento; sem user_id.
  const { data, error } = await supabase
    .from("public_feedback").select("*").order("created_at", { ascending: false }).limit(60);
  if (error) return { items: [], unavailable: true };
  return { items: (data ?? []) as PublicFeedback[], unavailable: false };
}

export default async function FeedbackPage() {
  const catalog = await getCatalog();
  const { items, unavailable } = await loadFeedback();

  return (
    <>
      <PageHero eyebrow="Clientes" title="Feedback das clientes" lead="Relatos enviados ao Studio e publicados com autorização. Este módulo é independente das avaliações do Google.">
        <LinkButton href="/feedback/enviar" arrow>Enviar meu feedback</LinkButton>
      </PageHero>
      <Container className="py-16 md:py-24">
        {unavailable ? (
          <Alert tone="info" title="Feedbacks indisponíveis no momento">O módulo depende da configuração do banco de dados. Tente novamente mais tarde.</Alert>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <MessageSquareQuote size={36} strokeWidth={1.1} className="text-rose" aria-hidden />
            <p className="font-display text-3xl text-espresso">Ainda não há feedbacks publicados</p>
            <p className="max-w-md text-cocoa">Seja a primeira a compartilhar sua experiência.</p>
          </div>
        ) : (
          <ul className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid">
            {items.map((f) => (
              <li key={f.id}>
                <figure className="space-y-4 rounded-card bg-ivory shadow-soft p-6">
                  <Stars value={f.rating} />
                  <blockquote className="text-cocoa leading-relaxed">{f.comment}</blockquote>
                  <figcaption className="text-xs uppercase tracking-[0.18em] text-rose-deep">
                    {f.author}
                    {f.procedure_slug && findServiceBySlug(catalog, f.procedure_slug) ? ` · ${findServiceBySlug(catalog, f.procedure_slug)?.name}` : ""}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
