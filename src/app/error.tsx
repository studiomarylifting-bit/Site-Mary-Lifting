"use client";

import { Container } from "@/components/shared/PageHero";
import { buttonClass } from "@/components/ui/Button";

/** Nunca exibe error.message/stack: só um identificador (digest) para suporte. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-20">
      <h1 className="text-5xl">Algo não saiu como esperado</h1>
      <p className="max-w-md text-cocoa">Tente novamente. Se o problema continuar, fale com o Studio pelo SAC.</p>
      {error.digest && <p className="text-xs text-cocoa/60">Código: {error.digest}</p>}
      <button onClick={reset} className={buttonClass("primary")}>Tentar novamente</button>
    </Container>
  );
}
