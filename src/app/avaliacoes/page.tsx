import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { GoogleReviews } from "@/features/reviews/GoogleReviews";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("reviews.meta.title"), description: t("reviews.meta.description"), alternates: { canonical: "/avaliacoes" } };
}

// Dados do Google são cacheados pelo fetch (revalidate 6h); a página é regenerada junto.
export const revalidate = 21600;

async function ReviewsSkeleton() {
  const t = await getT();
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label={t("reviews.loading")}>
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-56" />)}
    </div>
  );
}

export default async function ReviewsPage() {
  const t = await getT();
  return (
    <>
      <PageHero eyebrow={t("reviews.eyebrow")} title={t("reviews.title")} lead={t("reviews.lead")} />
      <Container className="py-16 md:py-24">
        <Suspense fallback={<ReviewsSkeleton />}>
          <GoogleReviews />
        </Suspense>
      </Container>
    </>
  );
}
