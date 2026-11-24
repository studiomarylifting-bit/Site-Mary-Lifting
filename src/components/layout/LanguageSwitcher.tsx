"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/i18n/actions";
import { LOCALES, localeMeta, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

/**
 * <select> nativo: acessível por teclado e leitor de tela e com o seletor do próprio
 * celular. A escolha vira cookie e a página é renderizada de novo no idioma novo.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const [pending, start] = useTransition();
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Languages size={16} aria-hidden className="pointer-events-none absolute left-3.5 text-cocoa" />
      <select
        aria-label={t("language.label")}
        value={locale}
        disabled={pending}
        onChange={(e) => start(() => void setLocaleAction(e.target.value as Locale))}
        className="select-control min-h-11 w-full cursor-pointer rounded-full border border-stroke bg-ivory py-2 pl-9 pr-9 text-sm text-espresso hover:border-taupe focus-visible:outline-2 disabled:opacity-60"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={localeMeta[l].htmlLang}>
            {localeMeta[l].label}
          </option>
        ))}
      </select>
    </div>
  );
}
