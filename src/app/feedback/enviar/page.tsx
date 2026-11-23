import type { Metadata } from "next";
import { getServices } from "@/features/catalog/queries";
import { Container, PageHero } from "@/components/shared/PageHero";
import { FeedbackForm } from "@/features/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Enviar feedback",
  alternates: { canonical: "/feedback/enviar" },
};

export default async function SendFeedbackPage() {
  const services = await getServices();
  return (
    <>
      <PageHero eyebrow="Feedback" title="Conte como foi sua experiência" lead="Seu feedback é analisado pelo Studio antes de qualquer publicação." />
      <Container className="max-w-3xl py-16 md:py-24">
        <FeedbackForm procedures={services.map((s) => ({ slug: s.slug, name: s.name }))} />
      </Container>
    </>
  );
}
