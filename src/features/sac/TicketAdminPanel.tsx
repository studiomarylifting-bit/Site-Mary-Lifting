"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { sendJson } from "@/lib/client/post-json";

const statuses = [
  ["open", "Aberto"], ["in_progress", "Em andamento"], ["answered", "Respondido"], ["closed", "Encerrado"],
] as const;

export function TicketAdminPanel({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function changeStatus(next: string) {
    setBusy(true); setMsg(null);
    const r = await sendJson(`/api/admin/sac/${id}`, { status: next }, "PATCH");
    setBusy(false);
    if (r.ok) router.refresh(); else setMsg({ tone: "error", text: r.message ?? "Erro ao atualizar." });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true); setMsg(null);
    const r = await sendJson(`/api/admin/sac/${id}`, { body: reply });
    setBusy(false);
    if (r.ok) { setReply(""); setMsg({ tone: "success", text: "Resposta registrada. A cliente a vê em Minha conta > SAC." }); router.refresh(); }
    else setMsg({ tone: "error", text: r.message ?? "Erro ao enviar." });
  }

  return (
    <section className="space-y-6 border-t border-line pt-8">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status" className="text-sm font-medium text-cocoa">Status</label>
        <select id="status" value={status} disabled={busy} onChange={(e) => changeStatus(e.target.value)} className="border border-line bg-ivory px-3 py-2">
          {statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <form onSubmit={send} className="space-y-3">
        <label htmlFor="reply" className="block text-sm font-medium text-cocoa">Responder</label>
        <textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} rows={5} maxLength={3000} className="w-full border border-line bg-ivory px-4 py-3" />
        <p className="text-xs text-cocoa/70">A resposta fica visível à cliente apenas se ela tiver conta vinculada ao ticket. Para clientes sem conta, responda também pelos contatos informados.</p>
        <button disabled={busy || !reply.trim()} className={buttonClass("primary")}>{busy ? "Enviando..." : "Enviar resposta"}</button>
      </form>
    </section>
  );
}
