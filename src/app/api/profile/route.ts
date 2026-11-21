import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";

export async function PATCH(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthenticated", "Entre na sua conta.");
  const parsed = await parseJson(request, profileUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, "unavailable", "Serviço indisponível.");
  // Somente campos permitidos; papel não existe nesta tabela.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", user.id);
  if (error) return jsonError(500, "save_failed", "Não foi possível salvar.");
  return jsonOk();
}
