import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatBrazilPhone } from "@/lib/format";
import { requireAdmin } from "@/server/policies/authz";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

const fieldKeys = ["allergies", "medications", "health_conditions", "pregnancy_breastfeeding", "skin_sensitivity", "eye_sensitivity", "contact_lenses", "recent_procedures", "previous_reactions", "goals_preferences", "other_information"] as const;
const consentKeys = ["health_data_processing", "whatsapp_followup", "whatsapp_marketing", "ranking_name", "image_use", "instagram_mention", "terms_privacy", "sac_contact"];

export default async function AdminClientDetail({ params }: { params: Promise<{ id: string }> }) {
  // Dados de saúde: reforço explícito além do layout e da RLS.
  if (!(await requireAdmin())) notFound();
  const [{ id }, t] = await Promise.all([params, getT()]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();
  const [{ data: profile }, { data: intake }, { data: consents }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("intake_forms").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("intake_consents").select("*").eq("user_id", id).order("created_at", { ascending: false }),
  ]);
  if (!profile) notFound();

  // E-mail está em auth.users (inacessível via RLS): consulta server-side, após autorização.
  const admin = createSupabaseAdminClient();
  const email = admin ? (await admin.auth.admin.getUserById(id)).data.user?.email : undefined;

  return (
    <div className="space-y-10">
      <Link href="/admin/clientes" className="text-sm underline underline-offset-4">{t("admin.client.back")}</Link>
      <header>
        <h1 className="text-4xl sm:text-5xl">{profile.full_name}</h1>
        <p className="mt-2 text-cocoa">{formatBrazilPhone(profile.phone)}{email ? ` · ${email}` : ""}</p>
        <p className="text-sm text-cocoa/85">{t("admin.client.since", { date: formatDate(profile.created_at, t.locale) })}</p>
      </header>

      <section aria-labelledby="ficha">
        <h2 id="ficha" className="text-3xl">{t("admin.client.intake")}</h2>
        {!intake ? <p className="mt-3 text-cocoa">{t("admin.client.noIntake")}</p> : (
          <dl className="mt-5 grid gap-5 md:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">{t("admin.client.birth")}</dt><dd>{formatDate(new Date(`${intake.birth_date}T00:00:00`), t.locale)}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">{t("admin.client.instagram")}</dt><dd>{intake.no_instagram ? t("admin.client.noInstagram") : intake.instagram ? `@${intake.instagram}` : "—"}</dd></div>
            {fieldKeys.map((key) => (
              <div key={key}><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">{t(`admin.intakeFields.${key}`)}</dt><dd className="whitespace-pre-wrap text-cocoa">{String((intake as Record<string, unknown>)[key] ?? "")}</dd></div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="consentimentos">
        <h2 id="consentimentos" className="text-3xl">{t("admin.client.consents")}</h2>
        {!consents?.length ? <p className="mt-3 text-cocoa">{t("admin.client.noConsents")}</p> : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.15em] text-rose-deep"><tr><th className="py-2">{t("admin.client.authorization")}</th><th>{t("admin.client.state")}</th><th>{t("admin.client.when")}</th><th>{t("admin.client.context")}</th><th>{t("admin.client.version")}</th></tr></thead>
              <tbody className="divide-y divide-line border-y border-line">
                {consents.map((c) => (
                  <tr key={c.id}><td className="py-2">{consentKeys.includes(c.kind) ? t(`admin.consentKinds.${c.kind}`) : c.kind}</td><td>{c.granted ? t("admin.client.granted") : t("admin.client.revoked")}</td><td>{formatDate(c.created_at, t.locale, true)}</td><td>{c.context}</td><td>{c.text_version}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
