import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { ticketTypeLabels } from "@/lib/validation/schemas";
import { LinkButton } from "@/components/ui/Button";
import { TicketStatusBadge } from "@/features/sac/TicketStatusBadge";

export const metadata: Metadata = { title: "Meus SAC" };

export default async function MyTicketsPage() {
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;

  // RLS: só tickets do próprio usuário; mensagens internas nunca são retornadas.
  const { data: tickets } = await supabase
    .from("sac_tickets")
    .select("id, protocol, subject, type, status, created_at, sac_messages(id, author_role, body, created_at, internal)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">Minha conta</p>
          <h1 className="mt-3 text-5xl">Meus SAC</h1>
        </div>
        <LinkButton href="/sac" variant="outline">Nova solicitação</LinkButton>
      </header>

      {!tickets?.length ? (
        <p className="border border-dashed border-line p-10 text-center text-cocoa">Você ainda não abriu nenhuma solicitação.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => {
            const msgs = (t.sac_messages ?? []).filter((m) => !m.internal).sort((a, b) => a.created_at.localeCompare(b.created_at));
            return (
              <li key={t.id} className="space-y-4 border border-line bg-ivory p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">{t.protocol} · {ticketTypeLabels[t.type as keyof typeof ticketTypeLabels]}</p>
                    <h2 className="mt-1 font-display text-2xl text-espresso">{t.subject}</h2>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </div>
                <p className="text-xs text-cocoa/70">Aberta em {new Date(t.created_at).toLocaleString("pt-BR")}</p>
                {msgs.length > 0 && (
                  <ul className="space-y-3 border-t border-line pt-4">
                    {msgs.map((m) => (
                      <li key={m.id} className="text-sm">
                        <p className="text-xs uppercase tracking-[0.15em] text-rose-deep">{m.author_role === "admin" ? "Studio" : "Você"} · {new Date(m.created_at).toLocaleString("pt-BR")}</p>
                        <p className="mt-1 whitespace-pre-wrap text-cocoa">{m.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
