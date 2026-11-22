import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { intakeConsents } from "@/features/privacy/consents";
import { ConsentToggles } from "@/features/privacy/ConsentToggles";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = { title: "Autorizações" };

export default async function ConsentsPage() {
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
    text: c.text,
    granted: latest.get(c.kind)?.granted ?? false,
    at: latest.get(c.kind)?.at ?? null,
  }));
  const health = latest.get("health_data_processing");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">Minha conta</p>
        <h1 className="mt-3 text-5xl">Autorizações</h1>
      </header>
      <Alert tone="info" title="Uso dos dados de saúde">
        {health?.granted
          ? `Autorizado em ${new Date(health.at).toLocaleDateString("pt-BR")}. Para revogar esta autorização, solicite pela página de privacidade (isso pode implicar a exclusão da ficha).`
          : "Você ainda não autorizou o uso dos dados de saúde. Isso acontece ao enviar a ficha de atendimento."}
      </Alert>
      <ConsentToggles items={optional} />
    </div>
  );
}
