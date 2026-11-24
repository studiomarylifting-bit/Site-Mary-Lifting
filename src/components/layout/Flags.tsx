import type { Locale } from "@/i18n/config";

/** Bandeiras em SVG (emoji de bandeira não aparece no Windows). Decorativas: o nome do idioma vai no texto. */
export function Flag({ locale, className = "h-4 w-6" }: { locale: Locale; className?: string }) {
  const common = { viewBox: "0 0 24 16", "aria-hidden": true, className: `${className} shrink-0 rounded-[3px] ring-1 ring-black/15`, focusable: false } as const;
  switch (locale) {
    case "pt":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#009b3a" />
          <path d="M12 2.2 21.4 8 12 13.8 2.6 8z" fill="#fedf00" />
          <circle cx="12" cy="8" r="3.4" fill="#002776" />
          <path d="M8.8 7.2c2.2-.5 4.6-.2 6.5 1" stroke="#fff" strokeWidth=".6" fill="none" />
        </svg>
      );
    case "en":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2" />
          <path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" strokeWidth="1.1" />
          <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
          <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="3" />
        </svg>
      );
    case "es":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#aa151b" />
          <rect y="4" width="24" height="8" fill="#f1bf00" />
        </svg>
      );
    case "it":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#fff" />
          <rect width="8" height="16" fill="#009246" />
          <rect x="16" width="8" height="16" fill="#ce2b37" />
        </svg>
      );
  }
}
