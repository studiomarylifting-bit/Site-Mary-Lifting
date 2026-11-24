import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { fieldControl } from "@/components/ui/Field";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBrazilPhone, onlyDigits } from "@/lib/format";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

const PAGE_SIZE = 25;

/** Escapa curingas do LIKE para a busca ser literal. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export default async function AdminClients({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string }>;
}) {
  const [sp, t] = await Promise.all([searchParams, getT()]);
  const q = (sp.q ?? "").trim().slice(0, 60);
  const page = Math.max(1, Number.parseInt(sp.p ?? "1", 10) || 1);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  let query = supabase.from("profiles").select("id, full_name, phone, created_at", { count: "exact" })
    .order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) {
    const digits = onlyDigits(q);
    query = digits.length >= 4 && digits.length === q.replace(/[\s()-]/g, "").length
      ? query.ilike("phone", `%${escapeLike(digits)}%`)
      : query.ilike("full_name", `%${escapeLike(q)}%`);
  }
  const { data, count } = await query;
  const { data: intakes } = await supabase.from("intake_forms").select("user_id");
  const withIntake = new Set((intakes ?? []).map((i) => i.user_id));
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl">{t("admin.clients.title")}</h1>
      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">{t("admin.clients.search")}</label>
        <input id="q" name="q" defaultValue={q} placeholder={t("admin.clients.search")} className={fieldControl} />
        <button className={buttonClass("primary", "px-6")}>{t("admin.clients.searchBtn")}</button>
      </form>
      {!data?.length ? <p className="text-cocoa">{t("admin.clients.none")}</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.15em] text-rose-deep"><tr><th className="py-3">{t("admin.clients.name")}</th><th>{t("admin.clients.phone")}</th><th>{t("admin.clients.intake")}</th><th>{t("admin.clients.since")}</th></tr></thead>
            <tbody className="divide-y divide-line border-y border-line">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-ivory">
                  <td className="py-3"><Link className="text-espresso underline underline-offset-4" href={`/admin/clientes/${c.id}`}>{c.full_name}</Link></td>
                  <td>{formatBrazilPhone(c.phone)}</td>
                  <td>{withIntake.has(c.id) ? t("admin.clients.received") : t("admin.clients.pending")}</td>
                  <td>{formatDate(c.created_at, t.locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <p className="flex items-center gap-4 text-sm">
          {page > 1 && <Link className="underline" href={`/admin/clientes?q=${encodeURIComponent(q)}&p=${page - 1}`}>{t("admin.clients.prev")}</Link>}
          <span>{t("admin.clients.page", { page, pages })}</span>
          {page < pages && <Link className="underline" href={`/admin/clientes?q=${encodeURIComponent(q)}&p=${page + 1}`}>{t("admin.clients.next")}</Link>}
        </p>
      )}
    </div>
  );
}
