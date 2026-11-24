"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
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
  const others = LOCALES.filter((l) => l !== locale);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function openList() {
    setActive(0);
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
      setActive((i) => (i + 1) % others.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + others.length) % others.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(others.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      {
        const next = others[active];
        if (next) choose(next);
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={root} className={`relative inline-flex ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-label={`${t("language.label")}: ${localeMeta[locale].label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={pending}
        onClick={() => (open ? setOpen(false) : openList())}
        className="inline-flex size-11 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-60"
      >
        <Flag locale={locale} className="h-5 w-[1.875rem]" />
      </button>
      {open && (
        <ul
          id={listId}
          role="menu"
          aria-label={t("language.label")}
          tabIndex={-1}
          ref={(el) => el?.focus()}
          className={`absolute left-1/2 z-[60] ${up ? "bottom-full mb-1" : "top-full mt-1"} flex -translate-x-1/2 flex-col items-center gap-1 rounded-full border border-line bg-ivory p-1 shadow-soft outline-none`}
        >
          {others.map((l, i) => (
            <li key={l} role="none">
              <button
                type="button"
                role="menuitem"
                lang={localeMeta[l].htmlLang}
                aria-label={localeMeta[l].label}
                title={localeMeta[l].label}
                onClick={() => choose(l)}
                onPointerEnter={() => setActive(i)}
                className={`inline-flex size-11 items-center justify-center rounded-full ${i === active ? "bg-nude" : ""}`}
              >
                <Flag locale={l} className="h-5 w-[1.875rem]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
