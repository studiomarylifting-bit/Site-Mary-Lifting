import { ExternalLink, PenLine } from "lucide-react";
import { getGoogleReviews, type GoogleReview } from "@/server/integrations/google/places";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/Button";
import { Stars } from "@/components/shared/Stars";
import { getT } from "@/i18n/server";
import type { TFunction } from "@/i18n/translate";
import { localeMeta, type Locale } from "@/i18n/config";

function formatDate(iso: string | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(localeMeta[locale].intl, { month: "long", year: "numeric" });
}

function ReviewCard({ r, t, locale }: { r: GoogleReview; t: TFunction; locale: Locale }) {
  const date = formatDate(r.publishTime, locale) ?? r.relativeTime;
  return (
    <article className="flex h-full flex-col gap-4 rounded-media bg-ivory p-6 shadow-soft">
      <header className="flex items-center gap-3">
        {/* Foto do autor é servida pelo Google (googleusercontent): exibida como <img> sem otimização local. */}
        {r.authorPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.authorPhotoUrl} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
        )}
        <div>
          {r.authorUrl ? (
            <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-espresso hover:underline">{r.authorName}</a>
          ) : (
            <p className="font-medium text-espresso">{r.authorName}</p>
          )}
          {date && <p className="text-xs text-cocoa/85">{date}</p>}
        </div>
      </header>
      <Stars value={r.rating} />
      {r.text ? <p className="flex-1 text-sm leading-relaxed text-cocoa">{r.text}</p> : <p className="flex-1 text-sm italic text-cocoa/85">{t("reviews.noComment")}</p>}
      {r.reviewUrl && (
        <a href={r.reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-rose-deep hover:underline">
          {t("reviews.viewOnGoogle")} <ExternalLink size={12} aria-hidden />
        </a>
      )}
    </article>
  );
}

/** Server Component: chave e Place ID nunca chegam ao navegador. */
export async function GoogleReviews() {
  const t = await getT();
  const result = await getGoogleReviews(localeMeta[t.locale].htmlLang as "pt-BR" | "en" | "es" | "it");

  if (result.status === "not_configured") {
    return (
      <Alert tone="info" title={t("reviews.notConfiguredTitle")}>
        {t("reviews.notConfiguredText")}
      </Alert>
    );
  }

  if (result.status === "error") {
    return (
      <Alert tone="error" title={t("reviews.errorTitle")}>
        {result.reason === "rate_limited" ? t("reviews.rateLimited") : t("reviews.retry")}
      </Alert>
    );
  }

  if (result.status === "empty") {
    return (
      <div className="space-y-6">
        <p className="text-cocoa">{t("reviews.empty")}</p>
        <div className="flex flex-wrap gap-4">
          <LinkButton external href={result.writeReviewUrl}><PenLine size={16} aria-hidden /> {t("reviews.writeLong")}</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {result.rating !== undefined && (
          <div className="flex items-center gap-4">
            <p className="font-display text-6xl text-espresso">{result.rating.toLocaleString(localeMeta[t.locale].intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
            <div>
              <Stars value={result.rating} size={20} />
              {result.ratingCount !== undefined && <p className="mt-1 text-sm text-cocoa">{t("reviews.count", { n: result.ratingCount })}</p>}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {result.mapsUrl && <LinkButton external href={result.mapsUrl} variant="outline" arrow>{t("reviews.seeAll")}</LinkButton>}
          <LinkButton external href={result.writeReviewUrl}><PenLine size={16} aria-hidden /> {t("reviews.write")}</LinkButton>
        </div>
      </div>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {result.reviews.map((r, i) => <li key={`${r.authorName}-${i}`}><ReviewCard r={r} t={t} locale={t.locale} /></li>)}
      </ul>

      <p className="text-xs text-cocoa/85">
        {t("reviews.disclaimer")}
      </p>
    </div>
  );
}
