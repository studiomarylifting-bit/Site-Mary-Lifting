import { Container } from "@/components/shared/PageHero";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-20">
      <p className="font-display text-8xl text-rose">404</p>
      <h1 className="text-5xl">Página não encontrada</h1>
      <p className="max-w-md text-cocoa">O endereço pode ter mudado ou não existe. Volte ao início ou explore o catálogo.</p>
      <div className="flex gap-4"><LinkButton href="/">Início</LinkButton><LinkButton href="/catalogo" variant="outline">Catálogo</LinkButton></div>
    </Container>
  );
}
