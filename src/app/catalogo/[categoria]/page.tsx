import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCategories, getCategory, getServicesByCategory } from "@/features/catalog/queries";
import { Container, PageHero } from "@/components/shared/PageHero";
import { ServiceCard } from "@/components/shared/ServiceCard";

type Params = { categoria: string };

export function generateStaticParams() {
  return getCategories().map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { categoria } = await params;
  const c = getCategory(categoria);
  if (!c) return {};
  return { title: c.title, description: c.tagline, alternates: { canonical: `/catalogo/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();
  const items = getServicesByCategory(category.slug);

  return (
    <>
      <PageHero eyebrow={`${category.index} — Procedimentos`} title={category.title} lead={category.tagline}>
        <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-cocoa underline-offset-4 hover:underline">
          <ChevronLeft size={16} aria-hidden /> Voltar ao catálogo
        </Link>
      </PageHero>
      <Container className="py-16 md:py-24">
        {items.length === 0 ? (
          <p className="text-cocoa">Em breve, novos procedimentos nesta categoria.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <li key={s.slug}><ServiceCard service={s} /></li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
