"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, UserRound } from "lucide-react";
import { useT } from "@/i18n/client";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/catalogo", key: "catalog" },
  { href: "/studio", key: "studio" },
  { href: "/pagamentos", key: "payments" },
  { href: "/avaliacoes", key: "reviews" },
  { href: "/feedback", key: "feedback" },
  { href: "/sac", key: "sac" },
] as const;

const FOCUSABLE = 'a[href],button:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Menu aberto: trava a rolagem do fundo, Esc fecha, Tab fica preso no menu, foco vai ao 1º link.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return; // Esc já tratado (ex.: lista de idiomas aberta)
      if (e.key === "Escape") return close(true);
      if (e.key !== "Tab") return;
      const items = [toggleRef.current, ...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
        (el): el is HTMLElement => !!el,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Ao passar para a barra completa (rotação do aparelho, janela maior), o menu móvel some.
    const mq = matchMedia("(min-width: 1280px)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    // O desfoque fica numa camada irmã (não no <header>): backdrop-filter cria um bloco de
    // contenção e prenderia o menu "fixed" dentro da altura do cabeçalho.
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled || open ? "shadow-soft" : ""}`}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-cream/90 backdrop-blur-md" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-5 md:h-20 md:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-md leading-none sm:gap-3" aria-label={t("brand.homeAria")}>
          <BrandMark />
          <span className="min-w-0">
            <span className="block truncate font-display text-2xl tracking-wide text-espresso md:text-3xl">{t("brand.name")}</span>
            <span className="block truncate pt-1 text-[0.58rem] font-medium uppercase tracking-[0.28em] text-rose-deep sm:text-[0.62rem] sm:tracking-[0.32em]">
              {t("brand.tagline")}
            </span>
          </span>
        </Link>

        <nav aria-label={t("nav.main")} className="hidden items-center gap-0.5 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm tracking-wide transition-colors ${
                isActive(item.href) ? "bg-nude/80 text-espresso" : "text-cocoa hover:bg-nude/50 hover:text-espresso"
              }`}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {/* /conta redireciona para /entrar quando não há sessão (middleware). */}
          <Link
            href="/conta"
            className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-espresso px-5 text-sm text-ivory transition-colors hover:bg-cocoa"
          >
            <UserRound size={16} aria-hidden /> {t("nav.account")}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 xl:hidden">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-espresso transition-colors hover:bg-nude/60"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={26} aria-hidden /> : <Menu size={26} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="menu-mobile"
          ref={panelRef}
          className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain bg-cream px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 md:top-20 md:px-10 xl:hidden"
        >
          <nav aria-label={t("nav.mobile")} className="mx-auto flex max-w-xl flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex min-h-14 items-center rounded-card px-3 font-display text-3xl text-espresso transition-colors hover:bg-nude/50 aria-[current=page]:text-rose-deep"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
          <div className="mx-auto mt-8 grid max-w-xl gap-3">
            <Link href="/conta" className="inline-flex min-h-12 items-center justify-center rounded-full bg-espresso px-5 py-3 text-ivory">
              {t("nav.account")}
            </Link>
            <Link href="/entrar" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cocoa/35 px-5 py-3 text-espresso">
              {t("nav.signIn")}
            </Link>
            <Link href="/cadastro" className="inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-cocoa underline underline-offset-4">
              {t("nav.signUp")}
            </Link>
            <LanguageSwitcher up className="mt-4" />
          </div>
        </div>
      )}
    </header>
  );
}
