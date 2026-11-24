import Link from "next/link";
import { formatBRL } from "@/lib/format";
import type { Service } from "@/features/catalog/types";
import type { TFunction } from "@/i18n/translate";
import { getT } from "@/i18n/server";
import { MediaSlot } from "./MediaSlot";

export function PriceLine({ service, t }: { service: Service; t: TFunction & { locale?: string } }) {
  const intl = (t as { locale?: string }).locale;
  const fmt = (c: number) => formatBRL(c, intl);
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.22em] text-rose-deep">
          {service.maintenanceCents !== undefined ? t("catalog.price.apply") : t("catalog.price.value")}
        </dt>
        <dd className="font-display text-3xl text-espresso">{fmt(service.priceCents)}</dd>
      </div>
      {service.maintenanceCents !== undefined && (
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.22em] text-rose-deep">{t("catalog.price.maintenance")}</dt>
          <dd className="font-display text-3xl text-espresso">{fmt(service.maintenanceCents)}</dd>
        </div>
      )}
    </dl>
  );
}

export async function ServiceCard({ service }: { service: Service }) {
  const t = await getT();
  return (
    <article className="group h-full rounded-media bg-ivory p-2.5 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={`/catalogo/${service.categorySlug}/${service.slug}`} className="flex h-full flex-col rounded-[1.25rem]" aria-label={t("catalog.details", { name: service.name })}>
        <MediaSlot src={service.imageUrl} alt={service.imageUrl ? service.name : t("catalog.placeholderAlt", { name: service.name })} caption={service.name} ratio="16/10" className="rounded-[1.25rem]" />
        <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-5">
          <h3 className="text-2xl md:text-3xl">{service.name}</h3>
          <p className="flex-1 text-sm leading-relaxed text-cocoa">{service.description}</p>
          <PriceLine service={service} t={t} />
          {service.returnInfo && <p className="text-xs text-cocoa/80">{service.returnInfo}</p>}
        </div>
      </Link>
    </article>
  );
}
