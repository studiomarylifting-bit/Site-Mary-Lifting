import type { Metadata } from "next";
import { Instagram, MapPin, Navigation, Video } from "lucide-react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { MediaSlot } from "@/components/shared/MediaSlot";
import { LinkButton } from "@/components/ui/Button";
import { studio } from "@/lib/studio";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("home.studio.title"),
    description: t("studio.metaDescription", { address: studio.address.display }),
    alternates: { canonical: "/studio" },
  };
}

export default async function StudioPage() {
  const t = await getT();
  return (
    <>
      <PageHero
        eyebrow={t("home.studio.eyebrow")}
        title={t("home.studio.title")}
        lead={t("home.studio.text")}
      />

      <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <section id="endereco" aria-labelledby="endereco-titulo" className="lg:col-span-5">
          <h2 id="endereco-titulo" className="text-4xl">{t("studio.address")}</h2>
          <address className="mt-6 flex gap-3 text-lg not-italic text-cocoa">
            <MapPin className="mt-1 shrink-0 text-rose-deep" aria-hidden />
            <span>{studio.address.street}<br />{studio.address.district}, {studio.address.city} — {studio.address.state}</span>
          </address>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href={studio.maps.gps} external arrow><Navigation size={16} aria-hidden /> {t("home.studio.gps")}</LinkButton>
            <LinkButton href={studio.instagram.url} external variant="outline"><Instagram size={16} aria-hidden /> {studio.instagram.handle}</LinkButton>
          </div>
        </section>

        <div className="lg:col-span-7">
          <iframe
            title={t("studio.mapTitle", { address: studio.address.display })}
            src={studio.maps.embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full rounded-media border-0 bg-nude shadow-soft"
          />
        </div>
      </Container>

      <section aria-labelledby="experiencia" className="mx-3 rounded-panel bg-ivory py-16 shadow-soft md:mx-6 md:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 id="experiencia" className="text-4xl md:text-5xl">{t("studio.experience")}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cocoa">
              {t("studio.talkText")}
            </p>
            <p className="mt-4 max-w-xl text-sm text-cocoa/85">
              {t("studio.photosNote")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaSlot alt={t("studio.envAlt")} caption={t("studio.envCaption")} ratio="4/5" />
            <div role="img" aria-label={t("studio.videoAlt")} className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-espresso text-nude">
              <Video strokeWidth={1.2} aria-hidden />
              <span className="text-xs uppercase tracking-[0.2em]">{t("studio.videoSoon")}</span>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16 text-center md:py-24">
        <h2 className="text-4xl md:text-5xl">{t("studio.contactTitle")}</h2>
        <p className="mx-auto mt-4 max-w-lg text-cocoa">{t("studio.contactText")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton href="/sac" arrow>{t("studio.openSac")}</LinkButton>
          <LinkButton href="/catalogo" variant="outline">{t("studio.seeCatalog")}</LinkButton>
        </div>
      </Container>
    </>
  );
}
