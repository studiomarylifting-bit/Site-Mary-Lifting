import type { MetadataRoute } from "next";
import { categories, services } from "@/features/catalog/data";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticPaths = ["", "/catalogo", "/studio", "/pagamentos", "/avaliacoes", "/feedback", "/sac", "/quem-sou", "/privacidade", "/termos"];
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${base}/catalogo/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...services.map((s) => ({ url: `${base}/catalogo/${s.categorySlug}/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
