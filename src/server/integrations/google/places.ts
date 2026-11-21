import "server-only";
import { getGoogleEnv } from "@/lib/env";

/**
 * Google Places API (New) — Place Details.
 * GET https://places.googleapis.com/v1/places/{PLACE_ID}
 *   X-Goog-Api-Key, X-Goog-FieldMask  (chave somente no servidor)
 * A API retorna no máximo 5 avaliações "mais relevantes" por lugar: não é a
 * lista completa; a página direciona para o Google para ver todas.
 *
 * Cache: revalidação a cada 6h (Next data cache) para reduzir custo e respeitar
 * limites. Não persistimos o conteúdo das avaliações em banco próprio.
 * Atribuição: exibimos "Google" e link do autor/da avaliação conforme exigido.
 */

export interface GoogleReview {
  authorName: string;
  authorUrl?: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  publishTime?: string;
  reviewUrl?: string;
}

export type GoogleReviewsResult =
  | { status: "not_configured" }
  | { status: "error"; reason: "rate_limited" | "unauthorized" | "not_found" | "upstream" | "network" }
  | { status: "empty"; mapsUrl?: string; writeReviewUrl: string }
  | {
      status: "ok";
      rating?: number;
      ratingCount?: number;
      mapsUrl?: string;
      writeReviewUrl: string;
      reviews: GoogleReview[];
    };

const REVALIDATE_SECONDS = 6 * 60 * 60;
const FIELD_MASK = "id,displayName,rating,userRatingCount,googleMapsUri,reviews";

interface PlacesApiReview {
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  publishTime?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}
interface PlacesApiResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesApiReview[];
}

export function writeReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

export function mapPlacesResponse(data: PlacesApiResponse, placeId: string): GoogleReviewsResult {
  const reviews: GoogleReview[] = (data.reviews ?? [])
    .map((r) => ({
      authorName: r.authorAttribution?.displayName ?? "Usuário do Google",
      authorUrl: r.authorAttribution?.uri,
      authorPhotoUrl: r.authorAttribution?.photoUri,
      rating: r.rating ?? 0,
      text: r.text?.text ?? r.originalText?.text ?? "",
      relativeTime: r.relativePublishTimeDescription,
      publishTime: r.publishTime,
      reviewUrl: r.googleMapsUri,
    }))
    .filter((r) => r.rating >= 1 && r.rating <= 5);

  if (reviews.length === 0) {
    return { status: "empty", mapsUrl: data.googleMapsUri, writeReviewUrl: writeReviewUrl(placeId) };
  }
  return {
    status: "ok",
    rating: data.rating,
    ratingCount: data.userRatingCount,
    mapsUrl: data.googleMapsUri,
    writeReviewUrl: writeReviewUrl(placeId),
    reviews,
  };
}

export async function getGoogleReviews(): Promise<GoogleReviewsResult> {
  const env = getGoogleEnv();
  if (!env) return { status: "not_configured" };

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(env.placeId)}?languageCode=pt-BR`;
    const res = await fetch(url, {
      headers: { "X-Goog-Api-Key": env.apiKey, "X-Goog-FieldMask": FIELD_MASK },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 429) return { status: "error", reason: "rate_limited" };
    if (res.status === 401 || res.status === 403) return { status: "error", reason: "unauthorized" };
    if (res.status === 404) return { status: "error", reason: "not_found" };
    if (!res.ok) return { status: "error", reason: "upstream" };
    return mapPlacesResponse((await res.json()) as PlacesApiResponse, env.placeId);
  } catch {
    return { status: "error", reason: "network" };
  }
}
