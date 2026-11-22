import Link from "next/link";
import {
  ArrowRight, BadgeCheck, CreditCard, FileHeart, Instagram, LifeBuoy, LogIn,
  MapPin, MessageSquareQuote, ShieldCheck, Sparkles, Star, UserPlus, UserRound,
} from "lucide-react";
import { getCategories } from "@/features/catalog/queries";
import { LinkButton } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/shared/PageHero";
import { MediaSlot } from "@/components/shared/MediaSlot";
import { categoryImages } from "@/features/catalog/media";
import { studio } from "@/lib/studio";

const access = [
  { href: "/studio", label: "Conheça o Studio", icon: Sparkles },
  { href: "/studio#endereco", label: "Endereço e GPS", icon: MapPin },
  { href: "/pagamentos", label: "Formas de pagamento", icon: CreditCard },
  { href: "/avaliacoes", label: "Avaliações reais do Google", icon: Star },
  { href: "/feedback", label: "Feedback das clientes", icon: MessageSquareQuote },
  { href: "/quem-sou", label: "Quem sou", icon: UserRound },
  { href: studio.instagram.url, label: "Instagram", icon: Instagram, external: true },
  { href: "/sac", label: "SAC", icon: LifeBuoy },
  { href: "/privacidade", label: "Política de privacidade", icon: ShieldCheck },
  { href: "/catalogo", label: "Acesso ao catálogo", icon: BadgeCheck },
  { href: "/entrar", label: "Login", icon: LogIn },
  { href: "/cadastro", label: "Criar conta", icon: UserPlus },
  { href: "/conta/ficha", label: "Ficha de atendimento", icon: FileHeart, note: "Para clientes autenticadas" },
] as const;

export default function HomePage() {
  const categories = getCategories();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line bg-ivory">
        <Container className="grid items-center gap-12 py-16 md:py-28 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="rise text-[0.7rem] font-medium uppercase tracking-[0.38em] text-rose-deep">
              {studio.brandLine}
            </p>
            <h1 className="rise rise-2 mt-8 text-[3.1rem] leading-[0.98] sm:text-7xl lg:text-[6.4rem]">
              Beleza que respeita <em className="font-normal text-rose-deep">sua essência</em>
            </h1>
            <p className="rise rise-3 mt-8 max-w-xl font-display text-2xl italic text-cocoa md:text-3xl">
              {studio.subheadline}
            </p>
            <p className="rise rise-3 mt-4 max-w-lg text-cocoa/85">
              Explore nossos procedimentos e encontre o cuidado que combina com você.
            </p>
            <div className="rise rise-3 mt-10 flex flex-wrap gap-4">
              <LinkButton href="/catalogo" arrow>Ver catálogo</LinkButton>
              <LinkButton href="/sac" variant="outline">Falar com o Studio</LinkButton>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <MediaSlot alt="Espaço reservado para foto do Studio" caption="Foto do Studio" ratio="3/4" priority className="lg:ml-auto lg:max-w-md" />
            <div aria-hidden className="absolute -bottom-5 -left-5 hidden h-40 w-40 border border-rose lg:block" />
          </div>
        </Container>
      </section>

      {/* CUIDADOS */}
      <section aria-labelledby="cuidados" className="py-20 md:py-32">
        <Container>
          <Eyebrow>Procedimentos</Eyebrow>
          <h2 id="cuidados" className="mt-4 max-w-3xl text-4xl md:text-6xl">
            Escolha o cuidado que você quer conhecer.
          </h2>
          <ol className="mt-14 divide-y divide-line border-y border-line">
            {categories.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  className="group grid items-center gap-6 py-8 transition-colors hover:bg-ivory md:grid-cols-12 md:gap-10 md:px-6 md:py-10"
                >
                  <span className="font-display text-5xl text-rose md:col-span-1 md:text-6xl">{c.index}</span>
                  <div className={`md:col-span-6 ${i % 2 ? "md:col-start-2" : ""}`}>
                    <h3 className="text-3xl md:text-5xl">{c.title}</h3>
                    <p className="mt-2 text-cocoa">{c.tagline}</p>
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-rose-deep md:col-span-3">
                    {c.declaredOptionCount} opções para conhecer.
                  </p>
                  <span className="hidden justify-self-end md:col-span-1 md:block">
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-2" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <MediaSlot key={c.slug} src={categoryImages[c.slug]} alt={`Espaço reservado: ${c.title}`} caption={c.title} ratio="4/5" className="hidden lg:block" />
            ))}
          </div>
        </Container>
      </section>

      {/* ACESSOS */}
      <section aria-labelledby="acessos" className="border-y border-line bg-ivory py-20 md:py-28">
        <Container>
          <Eyebrow>Tudo em um só lugar</Eyebrow>
          <h2 id="acessos" className="mt-4 text-4xl md:text-5xl">O Studio, perto de você</h2>
          <ul className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {access.map((a) => {
              const Icon = a.icon;
              const inner = (
                <>
                  <Icon size={22} strokeWidth={1.4} className="shrink-0 text-rose-deep" aria-hidden />
                  <span>
                    <span className="block text-lg text-espresso">{a.label}</span>
                    {"note" in a && <span className="block text-xs text-cocoa/70">{a.note}</span>}
                  </span>
                </>
              );
              const cls = "flex items-center gap-4 bg-ivory px-6 py-6 transition-colors hover:bg-nude/60";
              return (
                <li key={a.label} className="bg-ivory">
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
      <section className="bg-espresso py-20 text-center md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl text-4xl text-ivory md:text-6xl">Não sabe por onde começar?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-nude">
            Converse com o Studio para entender qual cuidado combina com você.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/sac" variant="light" arrow>Saber mais / agendar</LinkButton>
            <LinkButton href={studio.instagram.url} variant="outline" external className="border-nude text-nude hover:bg-nude hover:text-espresso">
              Instagram
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
