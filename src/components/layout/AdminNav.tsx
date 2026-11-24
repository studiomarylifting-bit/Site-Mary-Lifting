"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

export interface AdminLink {
  href: string;
  label: string;
  exact?: boolean;
}

/** Navegação do painel: barra rolável no celular, coluna lateral no desktop. Marca a página atual. */
export function AdminNav({ links, label, siteLabel, signOutLabel }: { links: AdminLink[]; label: string; siteLabel: string; signOutLabel: string }) {
  const pathname = usePathname();
  const active = (l: AdminLink) => (l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`));
  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l) ? "page" : undefined}
          className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm text-cocoa transition-colors hover:bg-nude/70 hover:text-espresso aria-[current=page]:bg-nude aria-[current=page]:text-espresso motion-reduce:transition-none"
        >
          {l.label}
        </Link>
      ))}
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm text-cocoa transition-colors hover:bg-nude/70 hover:text-espresso lg:mt-6">
        {siteLabel} <ExternalLink size={14} aria-hidden />
      </Link>
      <form action="/auth/signout" method="post">
        <button type="submit" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm text-rose-deep underline underline-offset-4 hover:bg-blush">{signOutLabel}</button>
      </form>
    </nav>
  );
}
