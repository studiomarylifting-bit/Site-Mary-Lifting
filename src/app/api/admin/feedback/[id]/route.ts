import { createSupabaseServerClient } from "@/lib/supabase/server";
import { feedbackModerationSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAdmin } from "@/server/policies/authz";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const admin = await requireAdmin();
  if (!admin) return jsonError(403, "forbidden", "Acesso negado.");

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return jsonError(400, "bad_id", "Identificador inválido.");
  const parsed = await parseJson(request, feedbackModerationSchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, "unavailable", "Serviço indisponível.");
  const patch: Record<string, unknown> = {
    status: parsed.data.status,
    moderated_by: admin.id,
    moderated_at: new Date().toISOString(),
  };
  if (parsed.data.anonymize !== undefined) patch.anonymize = parsed.data.anonymize;

  // A RLS (feedback_admin_update) é a segunda barreira.
  const { error } = await supabase.from("feedback").update(patch).eq("id", id);
  if (error) return jsonError(500, "save_failed", "Não foi possível atualizar.");
  return jsonOk();
}
