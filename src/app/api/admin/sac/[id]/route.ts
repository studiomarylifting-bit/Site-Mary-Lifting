import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ticketReplySchema, ticketStatusSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAdmin } from "@/server/policies/authz";

const UUID = /^[0-9a-f-]{36}$/i;

/** Atualiza o status do ticket. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  if (!(await requireAdmin())) return jsonError(403, "forbidden", "Acesso negado.");
  const { id } = await params;
  if (!UUID.test(id)) return jsonError(400, "bad_id", "Identificador inválido.");
  const parsed = await parseJson(request, ticketStatusSchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, "unavailable", "Serviço indisponível.");
  const { error } = await supabase.from("sac_tickets").update({ status: parsed.data.status }).eq("id", id);
  if (error) return jsonError(500, "save_failed", "Não foi possível atualizar.");
  return jsonOk();
}

/** Responde ao ticket (mensagem visível à cliente) e marca como respondido. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const admin = await requireAdmin();
  if (!admin) return jsonError(403, "forbidden", "Acesso negado.");
  const { id } = await params;
  if (!UUID.test(id)) return jsonError(400, "bad_id", "Identificador inválido.");
  const parsed = await parseJson(request, ticketReplySchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, "unavailable", "Serviço indisponível.");
  const { error } = await supabase.from("sac_messages").insert({
    ticket_id: id,
    author_id: admin.id,
    author_role: "admin",
    body: parsed.data.body,
    internal: false,
  });
  if (error) return jsonError(500, "save_failed", "Não foi possível enviar a resposta.");
  await supabase.from("sac_tickets").update({ status: "answered" }).eq("id", id);
  return jsonOk({}, 201);
}
