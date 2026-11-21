import { allowRequest, RULES } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { intakeSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";
import { saveIntake } from "@/server/services/intake";

/** Cria ou atualiza a ficha da PRÓPRIA cliente autenticada. */
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthenticated", "Entre na sua conta para enviar a ficha.");

  if (!(await allowRequest(request.headers, RULES.intake, user.id))) {
    return jsonError(429, "rate_limited", "Muitas tentativas. Aguarde alguns minutos.");
  }
  const parsed = await parseJson(request, intakeSchema);
  if (!parsed.ok) return parsed.response;

  const result = await saveIntake(parsed.data, user.id);
  if (!result.ok) return jsonError(500, "save_failed", "Não foi possível salvar a ficha. Tente novamente.");
  return jsonOk({}, 201);
}

/** Exclusão da própria ficha (direito de eliminação). RLS garante o escopo. */
export async function DELETE(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthenticated", "Entre na sua conta.");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, "unavailable", "Serviço indisponível.");
  const { error } = await supabase.from("intake_forms").delete().eq("user_id", user.id);
  if (error) return jsonError(500, "delete_failed", "Não foi possível excluir a ficha.");
  return jsonOk();
}
