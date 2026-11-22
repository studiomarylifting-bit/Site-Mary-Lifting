import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ticketTypeLabels } from "@/lib/validation/schemas";
import { TicketStatusBadge } from "@/features/sac/TicketStatusBadge";

async function count(table: string, filter?: [string, string]) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return 0;
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count: c } = await q;
  return c ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const [clients, intakes, pendingFeedback, openTickets, privacy] = await Promise.all([
    count("profiles"), count("intake_forms"), count("feedback", ["status", "pending"]),
    count("sac_tickets", ["status", "open"]), count("privacy_requests", ["status", "received"]),
  ]);
  const { data: recent } = (await supabase?.from("sac_tickets")
    .select("id, protocol, subject, type, status, created_at").order("created_at", { ascending: false }).limit(6)) ?? { data: [] };

  const stats = [
    { label: "Clientes cadastradas", value: clients, href: "/admin/clientes" },
    { label: "Fichas recebidas", value: intakes, href: "/admin/clientes" },
    { label: "Feedbacks pendentes", value: pendingFeedback, href: "/admin/feedback" },
    { label: "SAC em aberto", value: openTickets, href: "/admin/sac" },
    { label: "Pedidos de privacidade", value: privacy, href: "/admin" },
  ];

  return (
    <div className="space-y-12">
      <h1 className="text-5xl">Painel</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block h-full border border-line bg-ivory p-5 transition-colors hover:bg-nude/50">
              <p className="font-display text-5xl text-espresso">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-rose-deep">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="recentes">
        <h2 id="recentes" className="text-3xl">Solicitações recentes</h2>
        {!recent?.length ? <p className="mt-4 text-cocoa">Nenhuma solicitação ainda.</p> : (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {recent.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/sac/${t.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-ivory">
                  <span><span className="text-xs uppercase tracking-[0.15em] text-rose-deep">{t.protocol} · {ticketTypeLabels[t.type as keyof typeof ticketTypeLabels]}</span><span className="block text-espresso">{t.subject}</span></span>
                  <TicketStatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
