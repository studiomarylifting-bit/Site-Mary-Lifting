import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { MediaSlot } from "@/components/shared/MediaSlot";
import { LinkButton } from "@/components/ui/Button";
import { studio } from "@/lib/studio";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("about.title"), alternates: { canonical: "/quem-sou" } };
}

/**
 * CONTEÚDO PENDENTE: nenhum texto biográfico foi fornecido. Não inventamos
 * trajetória, formação ou certificações. Substitua o bloco abaixo quando o
 * Studio enviar o texto e a foto.
 */
export default async function AboutPage() {
  const t = await getT();
  return (
    <>
      <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} />
      <Container className="grid items-start gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <MediaSlot alt={t("about.photoAlt")} caption={t("about.photoCaption")} ratio="4/5" />
        </div>
        <div className="space-y-6 lg:col-span-7 lg:pt-6">
          <p className="font-display text-3xl italic text-cocoa md:text-4xl">{t("brand.slogan")}</p>
          <p className="text-cocoa">{t("about.pending")}</p>
          <div className="flex flex-wrap gap-4">
            <LinkButton href={studio.instagram.url} external arrow><Instagram size={16} aria-hidden /> {studio.instagram.handle}</LinkButton>
            <LinkButton href="/catalogo" variant="outline">{t("about.seeCatalog")}</LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
