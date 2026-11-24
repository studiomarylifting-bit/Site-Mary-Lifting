"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { setLocaleAction } from "@/i18n/actions";
import { LOCALES, localeMeta, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { Flag } from "./Flags";

/**
 * Botão com a bandeira do idioma atual e lista de opções (cada uma com bandeira e nome).
 * Teclado: Enter/Espaço/↓ abre, ↑↓ navega, Esc fecha. A escolha vira cookie e a página
 * é renderizada de novo no idioma novo.
 */
export function LanguageSwitcher({ className = "", up = false }: { className?: string; up?: boolean }) {
  const { locale, t } = useI18n();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function openList() {
    setActive(Math.max(0, LOCALES.indexOf(locale)));
    setOpen(true);
  }
  function choose(l: Locale) {
    setOpen(false);
    button.current?.focus();
    if (l !== locale) start(() => void setLocaleAction(l));
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // não fecha o menu móvel junto
      setOpen(false);
      button.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % LOCALES.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + LOCALES.length) % LOCALES.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(LOCALES.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(LOCALES[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={root} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-label={`${t("language.label")}: ${localeMeta[locale].label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={pending}
        onClick={() => (open ? setOpen(false) : openList())}
        className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-full border border-stroke bg-ivory px-3.5 text-sm text-espresso transition-colors hover:border-taupe disabled:opacity-60"
      >
        <Flag locale={locale} />
        <span className="sr-only sm:not-sr-only xl:sr-only 2xl:not-sr-only">{localeMeta[locale].label}</span>
        <ChevronDown size={14} aria-hidden className={`text-cocoa transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language.label")}
          aria-activedescendant={`${listId}-${LOCALES[active]}`}
          tabIndex={-1}
          ref={(el) => el?.focus()}
          className={`absolute right-0 z-[60] ${up ? "bottom-full mb-2" : "mt-2"} w-max min-w-full overflow-hidden rounded-2xl border border-line bg-ivory py-1 shadow-soft outline-none`}
        >
          {LOCALES.map((l, i) => (
            <li
              key={l}
              id={`${listId}-${l}`}
              role="option"
              lang={localeMeta[l].htmlLang}
              aria-selected={l === locale}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(l)}
              className={`flex min-h-11 cursor-pointer items-center gap-3 px-4 text-sm text-espresso ${i === active ? "bg-nude" : ""}`}
            >
              <Flag locale={l} />
              <span className="flex-1">{localeMeta[l].label}</span>
              {l === locale && <Check size={14} aria-hidden className="text-rose-deep" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
