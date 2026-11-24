"use client";

import { Container } from "@/components/shared/PageHero";
import { buttonClass } from "@/components/ui/Button";
import { useT } from "@/i18n/client";

/** Nunca exibe error.message/stack: só um identificador (digest) para suporte. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <Container className="flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-20">
      <h1 className="text-4xl sm:text-5xl">{t("app.error.title")}</h1>
      <p className="max-w-md text-cocoa">{t("app.error.text")}</p>
      {error.digest && <p className="text-xs text-cocoa/85">{t("app.error.code", { code: error.digest })}</p>}
      <button onClick={reset} className={buttonClass("primary")}>{t("app.error.retry")}</button>
    </Container>
  );
}
