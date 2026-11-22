import { Container } from "@/components/shared/PageHero";

export default function Loading() {
  return (
    <Container className="space-y-6 py-20" aria-busy="true">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-16 w-full max-w-2xl" />
      <div className="skeleton h-5 w-full max-w-xl" />
      <span className="sr-only" role="status">Carregando...</span>
    </Container>
  );
}
