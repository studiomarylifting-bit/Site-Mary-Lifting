import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";
import { getCategories } from "@/features/catalog/queries";
import { studio } from "@/lib/studio";
import { getT } from "@/i18n/server";

export async function SiteFooter() {
  const [categories, t] = await Promise.all([getCategories(), getT()]);
  return (
    <footer className="on-dark mt-24 rounded-t-[2rem] bg-espresso text-nude md:rounded-t-[3.5rem]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 md:px-10 md:py-20 lg:grid-cols-4 lg:gap-12">
        <div className="md:col-span-1">
          <p className="font-display text-3xl text-ivory">{t("brand.name")}</p>
          <p className="pt-1 text-xs uppercase tracking-[0.24em] text-rose">{t("brand.tagline")}</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-sand">
            {t("brand.slogan")}
          </p>
        </div>

        <nav aria-label={t("footer.procedures")}>
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-rose">{t("footer.procedures")}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href={`/catalogo/${c.slug}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("footer.studio")}>
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-rose">{t("footer.studio")}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/studio">{t("footer.meet")}</Link></li>
            <li><Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/quem-sou">{t("footer.about")}</Link></li>
            <li><Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/pagamentos">{t("footer.paymentMethods")}</Link></li>
            <li><Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/avaliacoes">{t("footer.googleReviews")}</Link></li>
            <li><Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/feedback">{t("footer.clientFeedback")}</Link></li>
            <li><Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/sac">{t("nav.sac")}</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-rose">{t("footer.contact")}</h2>
          <address className="mt-5 space-y-3 text-sm not-italic">
            <p className="flex gap-2"><MapPin size={16} className="mt-1 shrink-0" aria-hidden />{studio.address.display}</p>
            <p>
              <a className="inline-flex items-center gap-2 hover:text-ivory" href={studio.instagram.url} target="_blank" rel="noopener noreferrer">
                <Instagram size={16} aria-hidden /> {studio.instagram.handle}
              </a>
            </p>
            <p>
              <a className="underline underline-offset-4 hover:text-ivory" href={studio.maps.gps} target="_blank" rel="noopener noreferrer">
                {t("footer.openGps")}
              </a>
            </p>
          </address>
          <div className="mt-6 flex gap-4 text-sm">
            <Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/entrar">{t("nav.signIn")}</Link>
            <Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/cadastro">{t("nav.signUp")}</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-sand md:flex-row md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} {t("brand.name")} · {t("brand.tagline")}. {t("footer.rights")}</p>
          <p className="flex flex-wrap gap-x-6 gap-y-1">
            <Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/privacidade">{t("footer.privacy")}</Link>
            <Link className="inline-block rounded-md py-1 transition-colors hover:text-ivory" href="/termos">{t("footer.terms")}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
