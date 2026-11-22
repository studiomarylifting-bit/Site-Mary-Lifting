import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { GoogleReviews } from "@/features/reviews/GoogleReviews";

export const metadata: Metadata = {
  title: "Avaliações do Google",
  description: "O que dizem sobre o Studio Mary Lifting no Google.",
  alternates: { canonical: "/avaliacoes" },
};

// Dados do Google são cacheados pelo fetch (revalidate 6h); a página é regenerada junto.
export const revalidate = 21600;

function ReviewsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando avaliações">
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-56" />)}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <PageHero eyebrow="Google" title="Avaliações do Google" lead="O que dizem sobre o Studio." />
      <Container className="py-16 md:py-24">
        <Suspense fallback={<ReviewsSkeleton />}>
          <GoogleReviews />
        </Suspense>
      </Container>
    </>
  );
}
