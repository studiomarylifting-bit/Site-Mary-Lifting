"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useT } from "@/i18n/client";

export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "ml-theme";
const order: ThemeChoice[] = ["system", "light", "dark"];

function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
  const dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#16100d" : "#faf6f0");
}

function readStored(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/** Alterna Automático -> Claro -> Escuro. A escolha fica só neste navegador (localStorage). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useT();
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(readStored());
    setReady(true);
  }, []);

  const next = order[(order.indexOf(choice) + 1) % order.length]!;
  const Icon = choice === "dark" ? Moon : choice === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => {
        try {
          if (next === "system") localStorage.removeItem(THEME_KEY);
          else localStorage.setItem(THEME_KEY, next);
        } catch {
          /* navegação privada: vale só nesta página */
        }
        setChoice(next);
        apply(next);
      }}
      aria-label={t("theme.current", { name: t(`theme.${choice}`), next: t(`theme.${next}`) })}
      title={t(`theme.${choice}`)}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-stroke bg-ivory text-espresso transition-colors hover:border-taupe motion-reduce:transition-none ${className}`}
    >
      <Icon size={18} aria-hidden className={ready ? "" : "opacity-0"} />
    </button>
  );
}
