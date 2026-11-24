import Link from "next/link";
import { getCatalog } from "@/features/catalog/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ticketTypeLabels } from "@/lib/validation/schemas";
import { TicketStatusBadge } from "@/features/sac/TicketStatusBadge";
import { getAdminCatalog } from "@/features/catalog-admin/queries";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

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
  const [catalog, t, adminCatalog] = await Promise.all([getCatalog(), getT(), getAdminCatalog()]);
  const [clients, intakes, pendingFeedback, openTickets, privacy] = await Promise.all([
    count("profiles"), count("intake_forms"), count("feedback", ["status", "pending"]),
    count("sac_tickets", ["status", "open"]), count("privacy_requests", ["status", "received"]),
  ]);
  const { data: recent } = (await supabase?.from("sac_tickets")
    .select("id, protocol, subject, type, status, created_at").order("created_at", { ascending: false }).limit(6)) ?? { data: [] };

  const stats = [
    { label: t("admin.dash.clients"), value: clients, href: "/admin/clientes" },
    { label: t("admin.dash.intakes"), value: intakes, href: "/admin/clientes" },
    { label: t("admin.dash.pendingFeedback"), value: pendingFeedback, href: "/admin/feedback" },
    { label: t("admin.dash.openTickets"), value: openTickets, href: "/admin/sac" },
    { label: t("admin.dash.privacy"), value: privacy, href: "/admin" },
  ];

  return (
    <div className="space-y-12">
      <h1 className="text-4xl sm:text-5xl">{t("admin.dash.title")}</h1>
      <p className="-mt-6 text-sm text-cocoa">
        {t("admin.dash.catalog", { services: catalog.services.length, categories: catalog.categories.length })}
        {catalog.source === "database" ? t("admin.dash.fromDb") : t("admin.dash.fromStatic")}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block h-full rounded-card bg-ivory shadow-soft p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <p className="font-display text-5xl text-espresso">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-rose-deep">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="gerenciar" className="space-y-6">
        <div>
          <h2 id="gerenciar" className="text-3xl">{t("admin.dash.manage")}</h2>
          <p className="mt-1 text-sm text-cocoa">{t("admin.dash.manageLead")}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/admin/catalogo", title: t("admin.dash.catalogCard"), text: t("admin.dash.catalogCardText") },
            { href: "/admin/catalogo/nova", title: t("admin.dash.newCatalog"), text: t("admin.dash.newCatalogText") },
            { href: "/admin/imagens", title: t("admin.dash.imagesCard"), text: t("admin.dash.imagesCardText") },
          ].map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="block h-full rounded-card bg-ivory p-5 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <p className="font-display text-2xl text-espresso">{c.title}</p>
                <p className="mt-2 text-sm text-cocoa">{c.text}</p>
              </Link>
            </li>
          ))}
        </ul>
        {adminCatalog.ready && adminCatalog.categories.length > 0 && (
          <div>
            <h3 className="text-xl text-espresso">{t("admin.dash.catalogs")}</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {adminCatalog.categories.map((c) => (
                <li key={c.slug} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
                  <span className="min-w-0">
                    <span className="text-espresso">{c.title}</span>
                    {!c.active && <span className="ml-2 rounded-full bg-blush px-2.5 py-0.5 text-xs text-rose-deep">{t("admin.dash.archivedTag")}</span>}
                    <span className="block text-sm text-cocoa">{t("admin.dash.procedures", { n: adminCatalog.services.filter((s) => s.category_slug === c.slug && s.active).length })}</span>
                  </span>
                  <span className="flex flex-wrap gap-2 text-sm">
                    <Link href={`/admin/catalogo/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-stroke px-4 text-espresso hover:bg-nude/60">{t("admin.dash.manageProcedures")}</Link>
                    <Link href={`/admin/catalogo/${c.slug}/novo`} className="inline-flex min-h-11 items-center rounded-full bg-espresso px-4 text-ivory hover:bg-cocoa">{t("admin.dash.addProcedure")}</Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section aria-labelledby="recentes">
        <h2 id="recentes" className="text-3xl">{t("admin.dash.recent")}</h2>
        {!recent?.length ? <p className="mt-4 text-cocoa">{t("admin.dash.noRecent")}</p> : (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {recent.map((tk) => (
              <li key={tk.id}>
                <Link href={`/admin/sac/${tk.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-ivory">
                  <span><span className="text-xs uppercase tracking-[0.15em] text-rose-deep">{tk.protocol} · {ticketTypeLabels[tk.type as keyof typeof ticketTypeLabels] ? t(`sac.types.${tk.type}`) : tk.type}</span><span className="block text-espresso">{tk.subject}</span></span>
                  <TicketStatusBadge status={tk.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
