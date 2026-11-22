import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getServicesByCategory } from "@/features/catalog/queries";
import { Container, PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = {
  title: "Catálogo de procedimentos",
  description: "Extensão de cílios, brow lamination, design de sobrancelhas, depilação facial, Hidra Gloss Color e Nano Lips.",
  alternates: { canonical: "/catalogo" },
};

export default function CatalogPage() {
  return (
    <>
      <PageHero
        eyebrow="Catálogo"
        title="Escolha o cuidado que combina com você"
        lead="Conheça os procedimentos, valores, retornos e informações importantes de cada atendimento."
      />
      <Container className="py-16 md:py-24">
        <ul className="grid gap-6 md:grid-cols-2">
          {getCategories().map((c) => (
            <li key={c.slug}>
              <Link href={`/catalogo/${c.slug}`} className="group flex h-full flex-col justify-between border border-line bg-ivory p-8 transition-colors hover:bg-nude/50 md:p-10">
                <div>
                  <span className="font-display text-5xl text-rose">{c.index}</span>
                  <h2 className="mt-4 text-3xl md:text-4xl">{c.title}</h2>
                  <p className="mt-3 text-cocoa">{c.tagline}</p>
                </div>
                <p className="mt-10 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-rose-deep">
                  <span>{getServicesByCategory(c.slug).length} procedimentos cadastrados</span>
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
