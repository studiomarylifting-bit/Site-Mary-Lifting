import { localeMeta, type Locale } from "./config";

/** Datas no idioma ativo (puro). Entrada inválida devolve texto vazio em vez de "Invalid Date". */
export function formatDate(iso: string | Date | null | undefined, locale: Locale, withTime = false): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return withTime
    ? d.toLocaleString(localeMeta[locale].intl, { dateStyle: "short", timeStyle: "short" })
    : d.toLocaleDateString(localeMeta[locale].intl);
}
