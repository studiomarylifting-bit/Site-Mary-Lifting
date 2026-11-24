import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { intakeConsents } from "@/features/privacy/consents";
import { ConsentToggles } from "@/features/privacy/ConsentToggles";
import { Alert } from "@/components/ui/Alert";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("account.consents.title") };
}

export default async function ConsentsPage() {
  const t = await getT();
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;

  const { data } = await supabase
    .from("intake_consents").select("kind, granted, created_at, text_version")
    .eq("user_id", user.id).order("created_at", { ascending: false });

  // Estado atual = evento mais recente de cada tipo (log append-only).
  const latest = new Map<string, { granted: boolean; at: string; version: string }>();
  for (const row of data ?? []) {
    if (!latest.has(row.kind)) latest.set(row.kind, { granted: row.granted, at: row.created_at, version: row.text_version });
  }

  const optional = intakeConsents.filter((c) => !c.required).map((c) => ({
    kind: c.kind as "whatsapp_followup" | "whatsapp_marketing" | "ranking_name" | "image_use" | "instagram_mention",
    text: t(`consent.${c.kind}`),
    granted: latest.get(c.kind)?.granted ?? false,
    at: latest.get(c.kind)?.at ?? null,
  }));
  const health = latest.get("health_data_processing");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">{t("account.eyebrow")}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{t("account.consents.title")}</h1>
      </header>
      <Alert tone="info" title={t("account.consents.healthTitle")}>
        {health?.granted
          ? t("account.consents.healthGranted", { date: formatDate(health.at, t.locale) })
          : t("account.consents.healthNone")}
      </Alert>
      <ConsentToggles items={optional} />
    </div>
  );
}
