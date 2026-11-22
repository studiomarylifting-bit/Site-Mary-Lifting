import { ExternalLink, PenLine } from "lucide-react";
import { getGoogleReviews, type GoogleReview } from "@/server/integrations/google/places";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/Button";
import { Stars } from "@/components/shared/Stars";

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function ReviewCard({ r }: { r: GoogleReview }) {
  const date = formatDate(r.publishTime) ?? r.relativeTime;
  return (
    <article className="flex h-full flex-col gap-4 border border-line bg-ivory p-6">
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
          {date && <p className="text-xs text-cocoa/70">{date}</p>}
        </div>
      </header>
      <Stars value={r.rating} />
      {r.text ? <p className="flex-1 text-sm leading-relaxed text-cocoa">{r.text}</p> : <p className="flex-1 text-sm italic text-cocoa/60">Avaliação sem comentário.</p>}
      {r.reviewUrl && (
        <a href={r.reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-rose-deep hover:underline">
          Ver no Google <ExternalLink size={12} aria-hidden />
        </a>
      )}
    </article>
  );
}

/** Server Component: chave e Place ID nunca chegam ao navegador. */
export async function GoogleReviews() {
  const result = await getGoogleReviews();

  if (result.status === "not_configured") {
    return (
      <Alert tone="info" title="Avaliações aguardando configuração">
        A integração com o Google está pronta, mas ainda depende da configuração do Studio no servidor.
        Nenhuma avaliação é exibida até lá: não mostramos dados de exemplo.
      </Alert>
    );
  }

  if (result.status === "error") {
    return (
      <Alert tone="error" title="Não foi possível carregar as avaliações agora">
        {result.reason === "rate_limited"
          ? "O limite de consultas ao Google foi atingido. Tente novamente em alguns minutos."
          : "Tente novamente em instantes."}
      </Alert>
    );
  }

  if (result.status === "empty") {
    return (
      <div className="space-y-6">
        <p className="text-cocoa">O Google ainda não retornou avaliações para o Studio.</p>
        <div className="flex flex-wrap gap-4">
          <LinkButton external href={result.writeReviewUrl}><PenLine size={16} aria-hidden /> Escrever uma avaliação</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {result.rating !== undefined && (
          <div className="flex items-center gap-4">
            <p className="font-display text-6xl text-espresso">{result.rating.toFixed(1).replace(".", ",")}</p>
            <div>
              <Stars value={result.rating} size={20} />
              {result.ratingCount !== undefined && <p className="mt-1 text-sm text-cocoa">{result.ratingCount} avaliações no Google</p>}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {result.mapsUrl && <LinkButton external href={result.mapsUrl} variant="outline" arrow>Ver todas no Google</LinkButton>}
          <LinkButton external href={result.writeReviewUrl}><PenLine size={16} aria-hidden /> Escrever avaliação</LinkButton>
        </div>
      </div>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {result.reviews.map((r, i) => <li key={`${r.authorName}-${i}`}><ReviewCard r={r} /></li>)}
      </ul>

      <p className="text-xs text-cocoa/70">
        Avaliações fornecidas pelo Google (exibimos as mais relevantes retornadas pela API; para ver todas, acesse o Google). Google e Google Maps são marcas da Google LLC.
      </p>
    </div>
  );
}
