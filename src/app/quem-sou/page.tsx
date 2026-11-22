import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { MediaSlot } from "@/components/shared/MediaSlot";
import { LinkButton } from "@/components/ui/Button";
import { studio } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Quem sou",
  alternates: { canonical: "/quem-sou" },
};

/**
 * CONTEÚDO PENDENTE: nenhum texto biográfico foi fornecido. Não inventamos
 * trajetória, formação ou certificações. Substitua o bloco abaixo quando o
 * Studio enviar o texto e a foto.
 */
export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Mary Lifting" title="Quem sou" />
      <Container className="grid items-start gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <MediaSlot alt="Espaço reservado para foto da profissional" caption="Foto — em breve" ratio="4/5" />
        </div>
        <div className="space-y-6 lg:col-span-7 lg:pt-6">
          <p className="font-display text-3xl italic text-cocoa md:text-4xl">Beleza que respeita sua essência.</p>
          <p className="text-cocoa">O texto de apresentação será publicado pelo Studio. Enquanto isso, conheça o trabalho no Instagram e os procedimentos no catálogo.</p>
          <div className="flex flex-wrap gap-4">
            <LinkButton href={studio.instagram.url} external arrow><Instagram size={16} aria-hidden /> {studio.instagram.handle}</LinkButton>
            <LinkButton href="/catalogo" variant="outline">Ver catálogo</LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
