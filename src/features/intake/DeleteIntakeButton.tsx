"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { sendJson } from "@/lib/client/post-json";

export function DeleteIntakeButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    const r = await sendJson("/api/intake", undefined, "DELETE");
    setBusy(false);
    if (r.ok) return router.refresh();
    setError(r.message ?? "Não foi possível excluir.");
  }

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {confirming ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={remove} disabled={busy} className={buttonClass("primary")}>{busy ? "Excluindo..." : "Confirmar exclusão"}</button>
          <button type="button" onClick={() => setConfirming(false)} className={buttonClass("outline")}>Cancelar</button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={buttonClass("outline")}>Excluir minha ficha</button>
      )}
    </div>
  );
}
