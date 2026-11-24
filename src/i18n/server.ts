import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, pickFromAcceptLanguage, type Locale } from "./config";
import { dictionary } from "./messages";
import { createT } from "./translate";

/** Idioma da requisição: cookie escolhido pela pessoa > Accept-Language > português. */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return pickFromAcceptLanguage((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return Object.assign(createT(dictionary[locale], dictionary[DEFAULT_LOCALE]), { locale });
}
