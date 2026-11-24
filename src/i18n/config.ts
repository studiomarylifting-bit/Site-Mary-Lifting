/** Idiomas suportados. O português do Brasil é o idioma-fonte e o padrão. */
export const LOCALES = ["pt", "en", "es", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "ml-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeMeta: Record<Locale, { label: string; htmlLang: string; intl: string; og: string }> = {
  pt: { label: "Português", htmlLang: "pt-BR", intl: "pt-BR", og: "pt_BR" },
  en: { label: "English", htmlLang: "en", intl: "en-US", og: "en_US" },
  es: { label: "Español", htmlLang: "es", intl: "es-ES", og: "es_ES" },
  it: { label: "Italiano", htmlLang: "it", intl: "it-IT", og: "it_IT" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Escolhe o idioma a partir do cabeçalho Accept-Language (primeira visita, sem cookie).
 * Ex.: "es-AR,es;q=0.9,en;q=0.8" -> "es". Sem correspondência -> português.
 */
export function pickFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.trim().slice(2) ?? "1");
      return { base: tag.trim().toLowerCase().split("-")[0] ?? "", q: Number.isFinite(q) ? q : 0 };
    })
    .filter((x) => x.base && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { base } of ranked) if (isLocale(base)) return base;
  return DEFAULT_LOCALE;
}
