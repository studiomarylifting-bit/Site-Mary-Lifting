"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";


export function FeedbackModeration({ id, status, anonymize }: { id: string; status: string; anonymize: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(patch: { status: "approved" | "rejected" | "pending"; anonymize?: boolean }) {
    setBusy(true); setError(null);
    const r = await sendJson(`/api/admin/feedback/${id}`, patch, "PATCH");
    setBusy(false);
    if (r.ok) router.refresh(); else setError(translateMessage(r.message ?? "Erro ao atualizar.", locale));
  }

  return (
    <div className="space-y-3 border-t border-line pt-4">
      {error && <Alert tone="error">{error}</Alert>}
      <p className="text-xs uppercase tracking-[0.15em] text-cocoa">{t("admin.feedback.status")} <strong>{["pending", "approved", "rejected"].includes(status) ? t(`admin.feedback.${status}`) : status}</strong></p>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy || status === "approved"} onClick={() => update({ status: "approved" })} className={buttonClass("primary", "!px-4 !py-2")}>{t("admin.feedback.approve")}</button>
        <button disabled={busy || status === "rejected"} onClick={() => update({ status: "rejected" })} className={buttonClass("outline", "!px-4 !py-2")}>{t("admin.feedback.reject")}</button>
        <button disabled={busy || status === "pending"} onClick={() => update({ status: "pending" })} className={buttonClass("text")}>{t("admin.feedback.backPending")}</button>
        <button disabled={busy} onClick={() => update({ status, anonymize: !anonymize } as { status: "approved" | "rejected" | "pending"; anonymize: boolean })} className={buttonClass("text")}>
          {anonymize ? t("admin.feedback.showWithName") : t("admin.feedback.anonymize")}
        </button>
      </div>
    </div>
  );
}
