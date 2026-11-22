"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, UserRound } from "lucide-react";

const nav = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/studio", label: "O Studio" },
  { href: "/pagamentos", label: "Pagamentos" },
  { href: "/avaliacoes", label: "Avaliações" },
  { href: "/feedback", label: "Feedback" },
  { href: "/sac", label: "SAC" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-cream/85 backdrop-blur-md transition-shadow duration-300 ${
        scrolled || open ? "shadow-soft" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" className="rounded-md leading-none" aria-label="Mary Lifting — página inicial">
          <span className="block font-display text-2xl tracking-wide text-espresso md:text-3xl">
            Mary Lifting
          </span>
          <span className="block pt-1 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-rose-deep">
            Lash e Estética
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm tracking-wide transition-colors ${
                  active ? "bg-nude/80 text-espresso" : "text-cocoa hover:bg-nude/50 hover:text-espresso"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {/* /conta redireciona para /entrar quando não há sessão (middleware). */}
          <Link
            href="/conta"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-espresso px-5 text-sm text-ivory transition-colors hover:bg-cocoa"
          >
            <UserRound size={16} aria-hidden /> Minha conta
          </Link>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex h-12 w-12 items-center justify-center rounded-full text-espresso transition-colors hover:bg-nude/60 lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} aria-hidden /> : <Menu size={26} aria-hidden />}
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain rounded-t-[2rem] bg-cream px-6 pb-10 pt-4 lg:hidden">
          <nav aria-label="Menu móvel" className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
                className="flex min-h-14 items-center justify-between rounded-card px-3 font-display text-3xl text-espresso transition-colors hover:bg-nude/50 aria-[current=page]:text-rose-deep"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Link href="/conta" className="inline-flex min-h-12 items-center justify-center rounded-full bg-espresso px-5 py-3 text-ivory">
              Minha conta
            </Link>
            <Link href="/entrar" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cocoa/35 px-5 py-3 text-espresso">
              Entrar
            </Link>
            <Link href="/cadastro" className="inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-cocoa underline underline-offset-4">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
