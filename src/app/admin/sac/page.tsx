import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ticketStatuses, ticketTypeLabels } from "@/lib/validation/schemas";
import { TicketStatusBadge } from "@/features/sac/TicketStatusBadge";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

export default async function AdminSac({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [sp, tr] = await Promise.all([searchParams, getT()]);
  const status = (ticketStatuses as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  let q = supabase.from("sac_tickets").select("id, protocol, subject, type, status, name, created_at")
    .order("created_at", { ascending: false }).limit(100);
  if (status) q = q.eq("status", status as (typeof ticketStatuses)[number]);
  const { data } = await q;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl">{tr("admin.sac.title")}</h1>
      <nav aria-label={tr("admin.sac.filter")} className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/sac" className={`px-3 py-1 ${!status ? "bg-espresso text-ivory" : "border border-line"}`}>{tr("admin.sac.all")}</Link>
        {ticketStatuses.map((s) => (
          <Link key={s} href={`/admin/sac?status=${s}`} className={`px-3 py-1 ${status === s ? "bg-espresso text-ivory" : "border border-line"}`}>{tr(`account.status.${s}`)}</Link>
        ))}
      </nav>
      {!data?.length ? <p className="text-cocoa">{tr("admin.sac.none")}</p> : (
        <ul className="divide-y divide-line border-y border-line">
          {data.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/sac/${t.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-ivory">
                <span>
                  <span className="text-xs uppercase tracking-[0.15em] text-rose-deep">{t.protocol} · {ticketTypeLabels[t.type as keyof typeof ticketTypeLabels] ? tr(`sac.types.${t.type}`) : t.type} · {formatDate(t.created_at, tr.locale)}</span>
                  <span className="block text-espresso">{t.subject}</span>
                  <span className="block text-sm text-cocoa/80">{t.name}</span>
                </span>
                <TicketStatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
