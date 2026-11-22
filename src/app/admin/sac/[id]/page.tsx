import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBrazilPhone } from "@/lib/format";
import { ticketTypeLabels } from "@/lib/validation/schemas";
import { TicketAdminPanel } from "@/features/sac/TicketAdminPanel";
import { TicketStatusBadge } from "@/features/sac/TicketStatusBadge";

export default async function AdminTicket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: t } = await supabase.from("sac_tickets")
    .select("*, sac_messages(id, author_role, body, internal, created_at)").eq("id", id).maybeSingle();
  if (!t) notFound();
  const msgs = [...(t.sac_messages ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="space-y-8">
      <Link href="/admin/sac" className="text-sm underline underline-offset-4">← SAC</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">{t.protocol} · {ticketTypeLabels[t.type as keyof typeof ticketTypeLabels]}</p>
          <h1 className="mt-2 text-4xl md:text-5xl">{t.subject}</h1>
        </div>
        <TicketStatusBadge status={t.status} />
      </header>
      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">Nome</dt><dd>{t.name}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">E-mail</dt><dd>{t.email}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">Celular</dt><dd>{formatBrazilPhone(t.phone)}</dd></div>
      </dl>
      <section className="border border-line bg-ivory p-6">
        <p className="text-xs text-cocoa/70">{new Date(t.created_at).toLocaleString("pt-BR")}</p>
        <p className="mt-3 whitespace-pre-wrap text-cocoa">{t.message}</p>
      </section>
      {msgs.length > 0 && (
        <ul className="space-y-3">
          {msgs.map((m) => (
            <li key={m.id} className={`border p-5 text-sm ${m.author_role === "admin" ? "border-cocoa/30 bg-nude/50" : "border-line bg-ivory"}`}>
              <p className="text-xs uppercase tracking-[0.15em] text-rose-deep">{m.author_role === "admin" ? "Studio" : "Cliente"} · {new Date(m.created_at).toLocaleString("pt-BR")}</p>
              <p className="mt-2 whitespace-pre-wrap text-cocoa">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
      <TicketAdminPanel id={t.id} status={t.status} />
    </div>
  );
}
