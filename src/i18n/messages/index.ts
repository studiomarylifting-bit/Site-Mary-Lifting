import type { Locale } from "../config";
import { LOCALES } from "../config";
import type { MessageTree } from "../translate";
import { common } from "./common";
import { account, intake } from "./account";
import { admin } from "./admin";
import { faq } from "./faq";
import { app, auth, consent, feedback, reviews, sac } from "./forms";
import { about, catalog, home, legalPage, payments, studioPage } from "./pages";

/**
 * Cada arquivo traz pt/en/es/it lado a lado. "common" fica na raiz (t("nav.catalog"));
 * os demais ficam sob o nome do namespace (t("home.title")). Registre novos aqui.
 */
const namespaces = { common, home, catalog, studio: studioPage, payments, about, faq, app, auth, sac, feedback, reviews, consent, account, intake, legal: legalPage, admin };

function build(locale: Locale): MessageTree {
  const { common: root, ...rest } = namespaces;
  return {
    ...(root[locale] as unknown as MessageTree),
    ...Object.fromEntries(Object.entries(rest).map(([name, ns]) => [name, ns[locale] as unknown as MessageTree])),
  };
}

export const dictionary = Object.fromEntries(LOCALES.map((l) => [l, build(l)])) as Record<Locale, MessageTree>;
