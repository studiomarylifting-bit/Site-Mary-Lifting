"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" className="leading-none" aria-label="Mary Lifting — página inicial">
          <span className="block font-display text-2xl tracking-wide text-espresso md:text-3xl">
            Mary Lifting
          </span>
          <span className="block pt-1 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-rose-deep">
            Lash e Estética
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm tracking-wide transition-colors hover:text-rose-deep ${
                  active ? "text-rose-deep" : "text-cocoa"
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
            className="inline-flex items-center gap-2 border border-espresso px-4 py-2 text-sm text-espresso transition-colors hover:bg-espresso hover:text-ivory"
          >
            <UserRound size={16} aria-hidden /> Minha conta
          </Link>
        </div>

        <button
          type="button"
          className="p-2 text-espresso lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} aria-hidden /> : <Menu size={26} aria-hidden />}
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-cream px-5 pb-10 pt-6 lg:hidden">
          <nav aria-label="Menu móvel" className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-4 font-display text-3xl text-espresso"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Link href="/conta" className="bg-espresso px-5 py-3 text-center text-ivory">
              Minha conta
            </Link>
            <Link href="/entrar" className="border border-espresso px-5 py-3 text-center text-espresso">
              Entrar
            </Link>
            <Link href="/cadastro" className="px-5 py-3 text-center text-cocoa underline underline-offset-4">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
