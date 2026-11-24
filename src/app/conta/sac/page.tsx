import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { ticketTypeLabels } from "@/lib/validation/schemas";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";
import { LinkButton } from "@/components/ui/Button";
import { TicketStatusBadge } from "@/features/sac/TicketStatusBadge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("account.tickets.title") };
}

export default async function MyTicketsPage() {
  const tr = await getT();
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
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">{tr("account.eyebrow")}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{tr("account.tickets.title")}</h1>
        </div>
        <LinkButton href="/sac" variant="outline">{tr("account.tickets.new")}</LinkButton>
      </header>

      {!tickets?.length ? (
        <p className="rounded-card border border-dashed border-stroke/60 p-10 text-center text-cocoa">{tr("account.tickets.empty")}</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => {
            const msgs = (t.sac_messages ?? []).filter((m) => !m.internal).sort((a, b) => a.created_at.localeCompare(b.created_at));
            return (
              <li key={t.id} className="space-y-4 rounded-card bg-ivory shadow-soft p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">{t.protocol} · {ticketTypeLabels[t.type as keyof typeof ticketTypeLabels] ? tr(`sac.types.${t.type}`) : t.type}</p>
                    <h2 className="mt-1 font-display text-2xl text-espresso">{t.subject}</h2>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </div>
                <p className="text-xs text-cocoa/85">{tr("account.tickets.opened", { date: formatDate(t.created_at, tr.locale, true) })}</p>
                {msgs.length > 0 && (
                  <ul className="space-y-3 border-t border-line pt-4">
                    {msgs.map((m) => (
                      <li key={m.id} className="text-sm">
                        <p className="text-xs uppercase tracking-[0.15em] text-rose-deep">{m.author_role === "admin" ? tr("account.tickets.studio") : tr("account.tickets.you")} · {formatDate(m.created_at, tr.locale, true)}</p>
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
