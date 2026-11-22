import type { Metadata } from "next";
import { services } from "@/features/catalog/data";
import { Container, PageHero } from "@/components/shared/PageHero";
import { FeedbackForm } from "@/features/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Enviar feedback",
  alternates: { canonical: "/feedback/enviar" },
};

export default function SendFeedbackPage() {
  return (
    <>
      <PageHero eyebrow="Feedback" title="Conte como foi sua experiência" lead="Seu feedback é analisado pelo Studio antes de qualquer publicação." />
      <Container className="max-w-3xl py-16 md:py-24">
        <FeedbackForm procedures={services.map((s) => ({ slug: s.slug, name: s.name }))} />
      </Container>
    </>
  );
}
