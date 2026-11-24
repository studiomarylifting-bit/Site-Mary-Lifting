"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";


export function DeleteIntakeButton() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    const r = await sendJson("/api/intake", undefined, "DELETE");
    setBusy(false);
    if (r.ok) return router.refresh();
    setError(translateMessage(r.message ?? "Não foi possível excluir.", locale));
  }

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {confirming ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={remove} disabled={busy} className={buttonClass("primary")}>{busy ? t("account.intake.deleting") : t("account.intake.confirm")}</button>
          <button type="button" onClick={() => setConfirming(false)} className={buttonClass("outline")}>{t("account.intake.cancel")}</button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={buttonClass("outline")}>{t("account.intake.delete")}</button>
      )}
    </div>
  );
}
