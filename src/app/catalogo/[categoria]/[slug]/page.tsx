import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Info, RotateCcw } from "lucide-react";
import { getCategory, getRelatedServices, getService } from "@/features/catalog/queries";
import { getServices } from "@/features/catalog/queries";
import { Container, Eyebrow } from "@/components/shared/PageHero";
import { MediaSlot } from "@/components/shared/MediaSlot";
import { PriceLine } from "@/components/shared/ServiceCard";
import { LinkButton } from "@/components/ui/Button";
import { studio } from "@/lib/studio";

type Params = { categoria: string; slug: string };

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ categoria: s.categorySlug, slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { categoria, slug } = await params;
  const s = await getService(categoria, slug);
  if (!s) return {};
  return { title: s.name, description: s.description, alternates: { canonical: `/catalogo/${categoria}/${slug}` } };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { categoria, slug } = await params;
  const service = await getService(categoria, slug);
  const category = await getCategory(categoria);
  if (!service || !category) notFound();
  const related = await getRelatedServices(service);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "BeautySalon", name: studio.fullName, address: studio.address.display },
    offers: { "@type": "Offer", priceCurrency: "BRL", price: (service.priceCents / 100).toFixed(2) },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container className="py-10 md:py-16">
        <nav aria-label="Navegação estrutural" className="mb-10 flex flex-wrap items-center gap-2 text-sm text-cocoa">
          <Link href="/catalogo" className="hover:underline">Catálogo</Link> /
          <Link href={`/catalogo/${category.slug}`} className="hover:underline">{category.title}</Link>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <MediaSlot src={service.imageUrl} alt={service.imageUrl ? service.name : `Espaço reservado: ${service.name}`} caption={service.imageUrl ? service.name : `${service.name} — foto em breve`} ratio="4/5" priority />
          </div>

          <div className="lg:col-span-6 lg:pt-6">
            <Eyebrow>{category.title}</Eyebrow>
            <h1 className="mt-4 text-5xl md:text-7xl">{service.name}</h1>
            <p className="mt-6 text-lg leading-relaxed text-cocoa">{service.description}</p>

            <div className="mt-10 border-y border-line py-8"><PriceLine service={service} /></div>

            <ul className="mt-8 space-y-4 text-sm text-cocoa">
              {service.returnInfo && (
                <li className="flex gap-3"><RotateCcw size={18} className="mt-0.5 shrink-0 text-rose-deep" aria-hidden /><span><strong className="font-medium text-espresso">Retorno.</strong> {service.returnInfo}</span></li>
              )}
              {service.notes?.map((n) => (
                <li key={n} className="flex gap-3"><Info size={18} className="mt-0.5 shrink-0 text-rose-deep" aria-hidden /><span><strong className="font-medium text-espresso">Importante.</strong> {n}</span></li>
              ))}            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <LinkButton href={`/sac?assunto=${encodeURIComponent(service.name)}&tipo=agendamento`} arrow>Solicitar atendimento</LinkButton>
              <LinkButton href="/conta/ficha" variant="outline">Ficha de atendimento</LinkButton>
            </div>
            <Link href={`/catalogo/${category.slug}`} className="mt-8 inline-flex items-center gap-1 text-sm text-cocoa hover:underline">
              <ChevronLeft size={16} aria-hidden /> Voltar para {category.title}
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="relacionados" className="mt-20 border-t border-line pt-12">
            <h2 id="relacionados" className="text-3xl">Veja também</h2>
            <ul className="mt-6 flex flex-wrap gap-4">
              {related.map((r) => (
                <li key={r.slug}><LinkButton href={`/catalogo/${r.categorySlug}/${r.slug}`} variant="outline">{r.name}</LinkButton></li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </article>
  );
}
