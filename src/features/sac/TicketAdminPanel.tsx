"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { fieldControl } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";

const statuses = ["open", "in_progress", "answered", "closed"] as const;

export function TicketAdminPanel({ id, status }: { id: string; status: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function changeStatus(next: string) {
    setBusy(true); setMsg(null);
    const r = await sendJson(`/api/admin/sac/${id}`, { status: next }, "PATCH");
    setBusy(false);
    if (r.ok) router.refresh(); else setMsg({ tone: "error", text: translateMessage(r.message ?? "Erro ao atualizar.", locale) });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true); setMsg(null);
    const r = await sendJson(`/api/admin/sac/${id}`, { body: reply });
    setBusy(false);
    if (r.ok) { setReply(""); setMsg({ tone: "success", text: t("admin.sac.replySaved") }); router.refresh(); }
    else setMsg({ tone: "error", text: translateMessage(r.message ?? "Erro ao enviar.", locale) });
  }

  return (
    <section className="space-y-6 border-t border-line pt-8">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status" className="text-sm font-medium text-cocoa">{t("admin.sac.status")}</label>
        <select id="status" value={status} disabled={busy} onChange={(e) => changeStatus(e.target.value)} className={`${fieldControl} select-control w-auto py-2.5`}>
          {statuses.map((v) => <option key={v} value={v}>{t(`account.status.${v}`)}</option>)}
        </select>
      </div>
      <form onSubmit={send} className="space-y-3">
        <label htmlFor="reply" className="block text-sm font-medium text-cocoa">{t("admin.sac.reply")}</label>
        <textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} rows={5} maxLength={3000} className={fieldControl} />
        <p className="text-xs text-cocoa/85">{t("admin.sac.replyNote")}</p>
        <button disabled={busy || !reply.trim()} className={buttonClass("primary")}>{busy ? t("admin.sac.sending") : t("admin.sac.send")}</button>
      </form>
    </section>
  );
}
