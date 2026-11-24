import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { servicesOfCategory, sortedCategories } from "@/features/catalog/catalog-core";
import { getCatalog } from "@/features/catalog/queries";
import { Container, PageHero } from "@/components/shared/PageHero";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("catalog.meta.title"), description: t("catalog.meta.description"), alternates: { canonical: "/catalogo" } };
}

export const revalidate = 300;

export default async function CatalogPage() {
  const [catalog, t] = await Promise.all([getCatalog(), getT()]);
  return (
    <>
      <PageHero
        eyebrow={t("catalog.eyebrow")}
        title={t("catalog.title")}
        lead={t("catalog.lead")}
      />
      <Container className="py-16 md:py-24">
        <ul className="grid gap-6 md:grid-cols-2">
          {sortedCategories(catalog).map((c) => (
            <li key={c.slug}>
              <Link href={`/catalogo/${c.slug}`} className="group flex h-full flex-col justify-between rounded-media bg-ivory p-8 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-10">
                <div>
                  <span className="font-display text-5xl text-rose">{c.index}</span>
                  <h2 className="mt-4 text-3xl md:text-4xl">{c.title}</h2>
                  <p className="mt-3 text-cocoa">{c.tagline}</p>
                </div>
                <p className="mt-10 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-rose-deep">
                  <span>{t("catalog.registered", { n: servicesOfCategory(catalog, c.slug).length })}</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-2" aria-hidden />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
