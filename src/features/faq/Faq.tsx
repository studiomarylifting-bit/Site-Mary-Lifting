"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import type { FaqItem } from "./data";

/**
 * Acordeão acessível (padrão WAI-ARIA "Accordion"):
 *  - cada pergunta é um <button> com aria-expanded/aria-controls;
 *  - o painel é role="region" e fica `inert` quando fechado (não recebe foco
 *    nem é lido por leitores de tela);
 *  - setas, Home e End navegam entre as perguntas;
 *  - a animação usa grid-template-rows (sem medir altura em JS) e respeita
 *    prefers-reduced-motion.
 * Funciona com vários itens abertos ao mesmo tempo.
 */
export function Faq({ items, defaultOpenId }: { items: FaqItem[]; defaultOpenId?: string }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpenId ? [defaultOpenId] : []));
  const uid = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = items.length - 1;
    let target: number | null = null;
    if (e.key === "ArrowDown") target = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp") target = index === 0 ? last : index - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;
    if (target !== null) {
      e.preventDefault();
      buttons.current[target]?.focus();
    }
  };

  return (
    <ul className="space-y-2.5" data-testid="faq-list">
      {items.map((item, index) => {
        const isOpen = open.has(item.id);
        const qId = `${uid}-q-${item.id}`;
        const aId = `${uid}-a-${item.id}`;
        return (
          <li
            key={item.id}
            data-open={isOpen}
            className="rounded-card transition-colors duration-300 data-[open=false]:hover:bg-ivory/70 data-[open=true]:bg-ivory data-[open=true]:shadow-soft motion-reduce:transition-none"
          >
            <h3 className="font-sans text-base font-normal leading-normal tracking-normal">
              <button
                ref={(el) => {
                  buttons.current[index] = el;
                }}
                type="button"
                id={qId}
                aria-expanded={isOpen}
                aria-controls={aId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className="flex w-full items-center justify-between gap-5 rounded-card px-5 py-5 text-left md:px-7 md:py-6"
              >
                <span className="font-display text-[1.45rem] leading-snug text-espresso md:text-[1.7rem]">{item.question}</span>
                <span
                  aria-hidden
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition duration-300 motion-reduce:transition-none ${
                    isOpen ? "rotate-45 bg-espresso text-ivory" : "bg-nude/80 text-espresso"
                  }`}
                >
                  <Plus size={18} strokeWidth={1.6} />
                </span>
              </button>
            </h3>
            <div
              id={aId}
              role="region"
              aria-labelledby={qId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="space-y-3 px-5 pb-6 text-cocoa md:px-7 md:pb-7 md:pr-20">
                  {item.answer.map((p, i) => (
                    <p key={i} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {item.bullets && (
                    <ul className="space-y-2 pl-1">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex gap-3 leading-relaxed">
                          <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.links && (
                    <p className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                      {item.links.map((l) =>
                        l.external ? (
                          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-espresso underline decoration-rose underline-offset-[6px] hover:text-rose-deep">
                            {l.label} <ArrowUpRight size={14} aria-hidden />
                          </a>
                        ) : (
                          <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-espresso underline decoration-rose underline-offset-[6px] hover:text-rose-deep">
                            {l.label}
                          </Link>
                        )
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
