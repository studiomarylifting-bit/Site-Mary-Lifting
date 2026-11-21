import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consentUpdateSchema } from "@/lib/validation/schemas";
import { CONSENT_TEXT_VERSION, getConsentDefinition } from "@/features/privacy/consents";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";

/**
 * Concessão/revogação de consentimentos OPCIONAIS. Grava um novo evento
 * (append-only). O consentimento de saúde não é revogável aqui: a revogação dele
 * implica exclusão/limitação da ficha, tratada em solicitação de privacidade.
 */
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthenticated", "Entre na sua conta.");
  const parsed = await parseJson(request, consentUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const def = getConsentDefinition(parsed.data.kind);
  const supabase = await createSupabaseServerClient();
  if (!def || !supabase) return jsonError(503, "unavailable", "Serviço indisponível.");

  const { error } = await supabase.from("intake_consents").insert({
    user_id: user.id,
    kind: def.kind,
    granted: parsed.data.granted,
    text_version: CONSENT_TEXT_VERSION,
    consent_text: def.text,
    context: "account_settings",
  });
  if (error) return jsonError(500, "save_failed", "Não foi possível salvar.");
  return jsonOk();
}
