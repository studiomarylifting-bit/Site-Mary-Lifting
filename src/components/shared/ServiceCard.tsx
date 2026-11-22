import Link from "next/link";
import { formatBRL } from "@/lib/format";
import type { Service } from "@/features/catalog/types";
import { MediaSlot } from "./MediaSlot";
import { serviceImages } from "@/features/catalog/media";

export function PriceLine({ service }: { service: Service }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
      <div>
        <dt className="text-[0.65rem] uppercase tracking-[0.22em] text-rose-deep">
          {service.maintenanceCents !== undefined ? "Aplicação" : "Valor"}
        </dt>
        <dd className="font-display text-3xl text-espresso">{formatBRL(service.priceCents)}</dd>
      </div>
      {service.maintenanceCents !== undefined && (
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.22em] text-rose-deep">Manutenção</dt>
          <dd className="font-display text-3xl text-espresso">{formatBRL(service.maintenanceCents)}</dd>
        </div>
      )}
    </dl>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full flex-col border border-line bg-ivory transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(42,29,24,0.35)]">
      <Link href={`/catalogo/${service.categorySlug}/${service.slug}`} className="flex h-full flex-col" aria-label={`${service.name} — ver detalhes`}>
        <MediaSlot src={serviceImages[service.slug]} alt={`Espaço reservado: ${service.name}`} caption={service.name} ratio="16/10" />
        <div className="flex flex-1 flex-col gap-4 p-6">
          <h3 className="text-2xl md:text-3xl">{service.name}</h3>
          <p className="flex-1 text-sm leading-relaxed text-cocoa">{service.description}</p>
          <PriceLine service={service} />
          {service.returnInfo && <p className="text-xs text-cocoa/80">{service.returnInfo}</p>}
        </div>
      </Link>
    </article>
  );
}
