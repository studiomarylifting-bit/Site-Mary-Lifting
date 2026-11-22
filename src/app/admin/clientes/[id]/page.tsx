import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatBrazilPhone } from "@/lib/format";
import { requireAdmin } from "@/server/policies/authz";

const labels: Record<string, string> = {
  allergies: "Alergias", medications: "Medicamentos/tratamentos", health_conditions: "Condições de saúde",
  pregnancy_breastfeeding: "Gestação/amamentação", skin_sensitivity: "Pele", eye_sensitivity: "Olhos",
  contact_lenses: "Lentes de contato", recent_procedures: "Cirurgias/procedimentos recentes",
  previous_reactions: "Reação anterior", goals_preferences: "Objetivo e preferências", other_information: "Outras informações",
};
const consentLabels: Record<string, string> = {
  health_data_processing: "Dados de saúde", whatsapp_followup: "WhatsApp acompanhamento", whatsapp_marketing: "WhatsApp marketing",
  ranking_name: "Ranking", image_use: "Uso de imagem", instagram_mention: "Menção Instagram", terms_privacy: "Termos e privacidade", sac_contact: "Contato SAC",
};

export default async function AdminClientDetail({ params }: { params: Promise<{ id: string }> }) {
  // Dados de saúde: reforço explícito além do layout e da RLS.
  if (!(await requireAdmin())) notFound();
  const { id } = await params;
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
      <Link href="/admin/clientes" className="text-sm underline underline-offset-4">← Clientes</Link>
      <header>
        <h1 className="text-5xl">{profile.full_name}</h1>
        <p className="mt-2 text-cocoa">{formatBrazilPhone(profile.phone)}{email ? ` · ${email}` : ""}</p>
        <p className="text-sm text-cocoa/70">Cadastro em {new Date(profile.created_at).toLocaleDateString("pt-BR")}</p>
      </header>

      <section aria-labelledby="ficha">
        <h2 id="ficha" className="text-3xl">Ficha de atendimento</h2>
        {!intake ? <p className="mt-3 text-cocoa">Ficha ainda não enviada.</p> : (
          <dl className="mt-5 grid gap-5 md:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">Nascimento</dt><dd>{new Date(`${intake.birth_date}T00:00:00`).toLocaleDateString("pt-BR")}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">Instagram</dt><dd>{intake.no_instagram ? "Não possui" : intake.instagram ? `@${intake.instagram}` : "—"}</dd></div>
            {Object.entries(labels).map(([key, label]) => (
              <div key={key}><dt className="text-xs uppercase tracking-[0.15em] text-rose-deep">{label}</dt><dd className="whitespace-pre-wrap text-cocoa">{String((intake as Record<string, unknown>)[key] ?? "")}</dd></div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="consentimentos">
        <h2 id="consentimentos" className="text-3xl">Consentimentos (histórico)</h2>
        {!consents?.length ? <p className="mt-3 text-cocoa">Nenhum registro.</p> : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.15em] text-rose-deep"><tr><th className="py-2">Autorização</th><th>Estado</th><th>Quando</th><th>Contexto</th><th>Versão</th></tr></thead>
              <tbody className="divide-y divide-line border-y border-line">
                {consents.map((c) => (
                  <tr key={c.id}><td className="py-2">{consentLabels[c.kind] ?? c.kind}</td><td>{c.granted ? "Concedida" : "Revogada"}</td><td>{new Date(c.created_at).toLocaleString("pt-BR")}</td><td>{c.context}</td><td>{c.text_version}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
