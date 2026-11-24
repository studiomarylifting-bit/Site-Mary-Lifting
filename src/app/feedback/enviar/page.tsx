import type { Metadata } from "next";
import { getServices } from "@/features/catalog/queries";
import { Container, PageHero } from "@/components/shared/PageHero";
import { FeedbackForm } from "@/features/feedback/FeedbackForm";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("feedback.meta.sendTitle"), alternates: { canonical: "/feedback/enviar" } };
}

export default async function SendFeedbackPage() {
  const [services, t] = await Promise.all([getServices(), getT()]);
  return (
    <>
      <PageHero eyebrow={t("feedback.sendEyebrow")} title={t("feedback.sendTitle")} lead={t("feedback.sendLead")} />
      <Container className="max-w-3xl py-16 md:py-24">
        <FeedbackForm procedures={services.map((s) => ({ slug: s.slug, name: s.name }))} />
      </Container>
    </>
  );
}
