import type { Metadata } from "next";
import { getCatalog } from "@/features/catalog/repository";
import { getSiteImageStates } from "@/features/site-images/queries";
import { SITE_IMAGE_SLOTS } from "@/features/site-images/slots";
import { CatalogGrid, SlotGrid, type SlotView } from "@/features/site-images/ImageManager";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.images.title"), robots: { index: false, follow: false } };
}

export default async function AdminImagesPage() {
  const [t, states, catalog] = await Promise.all([getT(), getSiteImageStates(), getCatalog()]);
  const view = (group: "brand" | "home"): SlotView[] =>
    SITE_IMAGE_SLOTS.filter((s) => s.group === group).map((s) => ({
      key: s.key, group: s.group, surface: s.surface, ratio: s.ratio, transparent: s.transparent,
      url: states[s.key].url, custom: states[s.key].path !== null,
    }));
  const fromDb = catalog.source === "database";
  const items = [
    ...catalog.categories.map((c) => ({ kind: "category" as const, slug: c.slug, title: c.title, url: c.imageUrl })),
    ...catalog.services.map((s) => ({ kind: "service" as const, slug: s.slug, title: s.name, url: s.imageUrl })),
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl sm:text-5xl">{t("admin.images.title")}</h1>
        <p className="mt-3 max-w-2xl text-cocoa">{t("admin.images.lead")}</p>
        <p className="mt-2 max-w-2xl text-sm text-taupe">{t("admin.images.cacheNote")}</p>
      </header>

      <section aria-labelledby="img-brand" className="space-y-5">
        <h2 id="img-brand" className="text-3xl">{t("admin.images.groups.brand")}</h2>
        <SlotGrid slots={view("brand")} />
      </section>

      <section aria-labelledby="img-home" className="space-y-5">
        <h2 id="img-home" className="text-3xl">{t("admin.images.groups.home")}</h2>
        <SlotGrid slots={view("home")} />
      </section>

      <section aria-labelledby="img-catalog" className="space-y-5">
        <h2 id="img-catalog" className="text-3xl">{t("admin.images.groups.catalog")}</h2>
        <p className="text-sm text-cocoa">{fromDb ? t("admin.images.catalogNote") : t("admin.images.catalogOff")}</p>
        {fromDb && <CatalogGrid items={items} />}
      </section>
    </div>
  );
}
