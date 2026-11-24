import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CreditCard, FileHeart, Instagram, LifeBuoy, LogIn,
  MapPin, MessageSquareQuote, Navigation, Quote, ShieldCheck, Sparkles, Star, UserPlus, UserRound,
} from "lucide-react";
import { sortedCategories } from "@/features/catalog/catalog-core";
import { getCatalog } from "@/features/catalog/queries";
import { LinkButton } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/shared/PageHero";
import { MediaSlot } from "@/components/shared/MediaSlot";
import { Faq } from "@/features/faq/Faq";
import { buildFaqItems, buildFaqJsonLd, serializeJsonLd } from "@/features/faq/data";
import { studio } from "@/lib/studio";
import { getT } from "@/i18n/server";

const access = [
  { href: "/studio", key: "studio", icon: Sparkles },
  { href: "/studio#endereco", key: "address", icon: MapPin },
  { href: "/pagamentos", key: "payments", icon: CreditCard },
  { href: "/avaliacoes", key: "reviews", icon: Star },
  { href: "/feedback", key: "feedback", icon: MessageSquareQuote },
  { href: "/quem-sou", key: "about", icon: UserRound },
  { href: studio.instagram.url, key: "instagram", icon: Instagram, external: true },
  { href: "/sac", key: "sac", icon: LifeBuoy },
  { href: "/privacidade", key: "privacy", icon: ShieldCheck },
  { href: "/catalogo", key: "catalog", icon: BadgeCheck },
  { href: "/entrar", key: "login", icon: LogIn },
  { href: "/cadastro", key: "signup", icon: UserPlus },
  { href: "/conta/ficha", key: "intake", icon: FileHeart, note: true },
] as const;

/** Superfícies dos cards de categoria: alternam tons da paleta, sem gradiente. */
const tiles = [
  { span: "md:col-span-4", tone: "bg-blush text-espresso", h: "text-espresso", sub: "text-cocoa", pill: "bg-ivory/80 text-rose-deep", dot: "bg-espresso text-ivory" },
  { span: "md:col-span-2", tone: "on-dark bg-espresso text-ivory", h: "text-ivory", sub: "text-nude", pill: "bg-ivory/10 text-nude", dot: "bg-ivory text-espresso" },
  { span: "md:col-span-2", tone: "bg-nude text-espresso", h: "text-espresso", sub: "text-cocoa", pill: "bg-ivory/70 text-rose-deep", dot: "bg-espresso text-ivory" },
  { span: "md:col-span-4", tone: "bg-ivory text-espresso shadow-soft", h: "text-espresso", sub: "text-cocoa", pill: "bg-blush text-rose-deep", dot: "bg-espresso text-ivory" },
] as const;

// Edições do catálogo no Supabase aparecem aqui em até 5 minutos.
export const revalidate = 300;

export default async function HomePage() {
  const [catalog, t] = await Promise.all([getCatalog(), getT()]);
  const categories = sortedCategories(catalog);
  const faqItems = buildFaqItems(catalog.services, t);

  return (
    <>
      {/* HERO — composição editorial: texto à esquerda, arco e círculo de imagem à direita */}
      <section className="relative overflow-x-clip">
        <Container className="grid items-center gap-14 pb-16 pt-10 md:pb-28 md:pt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="rise inline-flex rounded-full bg-blush px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.26em] text-rose-deep">
              {t("brand.line")}
            </p>
            <h1 className="rise rise-2 mt-8 text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-[6.6rem]">
              {t("home.hero.title1")} <em className="font-normal text-rose-deep">{t("home.hero.titleEm")}</em>
            </h1>
            <p className="rise rise-3 mt-8 max-w-xl font-display text-2xl italic leading-snug text-cocoa md:text-3xl">
              {t("brand.sub")}
            </p>
            <p className="rise rise-3 mt-4 max-w-lg text-lg text-cocoa/90">
              {t("home.hero.lead")}
            </p>
            <div className="rise rise-3 mt-10 flex flex-wrap gap-3 sm:gap-4">
              <LinkButton href="/catalogo" arrow>{t("home.hero.ctaCatalog")}</LinkButton>
              <LinkButton href="/sac" variant="outline">{t("home.hero.ctaTalk")}</LinkButton>
            </div>

            <nav aria-label={t("home.hero.shortcuts")} className="rise rise-3 mt-12">
              <ul className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/catalogo/${c.slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ivory px-4 text-sm text-espresso shadow-soft transition hover:bg-nude motion-reduce:transition-none"
                    >
                      <span className="font-display text-base text-rose-deep">{c.index}</span>
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div aria-hidden className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-blush md:h-80 md:w-80" />
           <MediaSlot
              src="https://res.cloudinary.com/izm2j4iu/image/upload/v1795401027/Studio_Mary_Lifting_Balloon-Decorated_Salon.png"
              alt={t("home.hero.photoAlt")}
              caption={t("home.hero.photoCaption")}
              ratio="3/4"
              shape="arch"
              priority
              className="relative lg:ml-auto lg:max-w-md"
            />
             <div className="absolute -bottom-8 -left-2 w-32 rounded-full ring-8 ring-cream md:w-44 lg:-left-10">
              <MediaSlot src="https://res.cloudinary.com/izm2j4iu/image/upload/v1795401027/Studio_Mary_Lifting_Balloon-Decorated_Salon.png" alt={t("home.hero.detailAlt")} caption={t("home.hero.detailCaption")} ratio="1/1" shape="circle" />
            </div>
            <p className="absolute -right-1 bottom-10 flex items-center gap-2 rounded-full bg-ivory px-4 py-2.5 text-sm text-espresso shadow-lift md:right-2 lg:-right-2">
              <MapPin size={16} className="text-rose-deep" aria-hidden />
              {studio.address.city} · {studio.address.state}
            </p>
          </div>
        </Container>
      </section>

      {/* CUIDADOS — grade editorial (bento), cada categoria é um link inteiro */}
      <section aria-labelledby="cuidados" className="py-16 md:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{t("home.care.eyebrow")}</Eyebrow>
              <h2 id="cuidados" className="mt-4 max-w-3xl text-4xl md:text-6xl">
                {t("home.care.title")}
              </h2>
            </div>
            <div className="hidden md:block"><LinkButton href="/catalogo" variant="text" arrow>{t("home.care.all")}</LinkButton></div>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-6 md:gap-5">
            {categories.map((c, i) => {
              const tile = tiles[i % tiles.length]!;
              return (
                <li key={c.slug} className={tile.span}>
                  <Link
                    href={`/catalogo/${c.slug}`}
                    className={`group relative flex h-full min-h-[17rem] flex-col justify-between overflow-hidden rounded-media p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:min-h-[21rem] md:p-9 ${tile.tone}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-display text-6xl leading-none opacity-90 md:text-7xl">{c.index}</span>
                      <span className={`grid h-12 w-12 place-items-center rounded-full transition duration-300 group-hover:rotate-45 motion-reduce:transition-none ${tile.dot}`}>
                        <ArrowUpRight size={20} aria-hidden />
                      </span>
                    </div>
                    <div className="mt-10">
                      {c.imageUrl && (
                        // Foto da categoria (image_path no Supabase). Sem foto, o card fica só tipográfico.
                        <MediaSlot src={c.imageUrl} alt={c.title} ratio="16/10" className="mb-6" />
                      )}
                      <h3 className={`max-w-md text-3xl md:text-[2.6rem] md:leading-[1.02] ${tile.h}`}>{c.title}</h3>
                      <p className={`mt-3 ${tile.sub}`}>{c.tagline}</p>
                      <p className={`mt-5 inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] ${tile.pill}`}>
                        {t("home.care.options", { n: c.declaredOptionCount })}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* O STUDIO + LOCALIZAÇÃO */}
      <section aria-labelledby="studio" className="mx-3 rounded-panel bg-ivory py-16 shadow-soft md:mx-6 md:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow>{t("home.studio.eyebrow")}</Eyebrow>
            <h2 id="studio" className="mt-4 text-4xl md:text-6xl">{t("home.studio.title")}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cocoa">
              {t("home.studio.text")}
            </p>
            <address className="mt-8 flex gap-4 text-lg not-italic text-espresso">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-rose-deep">
                <MapPin size={20} aria-hidden />
              </span>
              <span className="pt-0.5">
                {studio.address.street}<br />
                <span className="text-cocoa">{studio.address.district}, {studio.address.city} — {studio.address.state}</span>
              </span>
            </address>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <LinkButton href={studio.maps.gps} external arrow><Navigation size={16} aria-hidden /> {t("home.studio.gps")}</LinkButton>
              <LinkButton href="/studio" variant="outline">{t("home.studio.meet")}</LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-5 items-end gap-4 lg:col-span-6">
            <MediaSlot src="https://res.cloudinary.com/izm2j4iu/image/upload/v1795401027/Studio_Mary_Lifting_Balloon-Decorated_Salon.png" alt={t("home.studio.ambienceAlt")} caption={t("home.studio.ambienceCaption")} ratio="4/5" className="col-span-3" />
            <MediaSlot src="https://res.cloudinary.com/izm2j4iu/image/upload/v1795401027/Studio_Mary_Lifting_Balloon-Decorated_Salon.png" alt={t("home.studio.detailAlt")} caption={t("home.studio.detailCaption")} ratio="3/4" shape="arch" className="col-span-2" />
          </div>
        </Container>
      </section>

      {/* AVALIAÇÕES + INSTAGRAM — sem dados inventados: levam às fontes reais */}
      <section aria-label={t("home.reviews.aria")} className="py-16 md:py-24">
        <Container className="grid gap-4 md:grid-cols-2 md:gap-6">
          <article className="flex flex-col justify-between rounded-media bg-blush p-8 md:p-10">
            <div>
              <Quote size={30} strokeWidth={1.3} className="text-rose-deep" aria-hidden />
              <h2 className="mt-6 text-3xl md:text-4xl">{t("home.reviews.title")}</h2>
              <p className="mt-4 max-w-md text-cocoa">
                {t("home.reviews.text")}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/avaliacoes" arrow>{t("home.reviews.see")}</LinkButton>
              <LinkButton href="/feedback" variant="light">{t("home.reviews.feedback")}</LinkButton>
            </div>
          </article>
          <article className="on-dark flex flex-col justify-between rounded-media bg-espresso p-8 text-ivory md:p-10">
            <div>
              <Instagram size={30} strokeWidth={1.3} className="text-rose" aria-hidden />
              <h2 className="mt-6 text-3xl text-ivory md:text-4xl">{studio.instagram.handle}</h2>
              <p className="mt-4 max-w-md text-nude">{t("home.reviews.instaText")}</p>
            </div>
            <div className="mt-8">
              <LinkButton href={studio.instagram.url} external variant="light" arrow>{t("home.reviews.instaOpen")}</LinkButton>
            </div>
          </article>
        </Container>
      </section>

      {/* FAQ */}
      <section id="duvidas" aria-labelledby="faq-titulo" className="pb-16 md:pb-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Eyebrow>{t("home.faq.eyebrow")}</Eyebrow>
              <h2 id="faq-titulo" className="mt-4 text-4xl md:text-6xl">{t("home.faq.title")}</h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-cocoa">
                {t("home.faq.text")}
              </p>
              <div className="mt-8">
                <LinkButton href="/sac" variant="soft" arrow>{t("home.faq.cta")}</LinkButton>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Faq items={faqItems} defaultOpenId={faqItems[0]?.id} />
          </div>
        </Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(faqItems)) }}
        />
      </section>

      {/* ACESSOS — todos os atalhos originais, agora como lista leve */}
      <section aria-labelledby="acessos" className="rounded-panel bg-blush/60 py-16 md:mx-6 md:py-24">
        <Container>
          <Eyebrow>{t("home.access.eyebrow")}</Eyebrow>
          <h2 id="acessos" className="mt-4 text-4xl md:text-5xl">{t("home.access.title")}</h2>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {access.map((a) => {
              const Icon = a.icon;
              const inner = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-rose-deep">
                    <Icon size={20} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg leading-tight text-espresso">{t(`home.access.${a.key}`)}</span>
                    {"note" in a && <span className="mt-0.5 block text-xs text-cocoa">{t("home.access.intakeNote")}</span>}
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-taupe transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </>
              );
              const cls = "group flex min-h-[4.5rem] items-center gap-4 rounded-card bg-ivory px-5 py-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0";
              return (
                <li key={a.key}>
                  {"external" in a && a.external ? (
                    <a className={cls} href={a.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : (
                    <Link className={cls} href={a.href}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* CTA */}
      <section className="on-dark mx-3 mt-16 rounded-panel bg-espresso py-20 text-center md:mx-6 md:mt-24 md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl text-4xl text-ivory md:text-6xl">{t("home.cta.title")}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-nude">
            {t("home.cta.text")}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <LinkButton href="/sac" variant="light" arrow>{t("home.cta.main")}</LinkButton>
            <LinkButton href={studio.instagram.url} variant="outline" external className="border-nude/50 text-nude hover:border-nude hover:bg-nude hover:text-espresso">
              {t("home.cta.insta")}
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
