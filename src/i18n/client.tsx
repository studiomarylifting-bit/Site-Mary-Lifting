"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { createT, type MessageTree, type TFunction } from "./translate";

interface Ctx {
  locale: Locale;
  t: TFunction;
}
const I18nContext = createContext<Ctx | null>(null);

/** Recebe do layout (servidor) o dicionário do idioma ativo (os tipos garantem as mesmas chaves nos quatro). */
export function I18nProvider({
  locale,
  messages,
  fallback,
  children,
}: {
  locale: Locale;
  messages: MessageTree;
  fallback?: MessageTree;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: createT(messages, fallback) }), [locale, messages, fallback]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de <I18nProvider>.");
  return ctx;
}
export const useT = () => useI18n().t;
export const useLocale = () => useI18n().locale;
