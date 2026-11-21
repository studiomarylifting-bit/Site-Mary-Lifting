import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allowRequest, RULES } from "@/lib/security/rate-limit";
import { looksLikeSpam } from "@/lib/security/anti-spam";
import { privacyRequestSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";
import { notifyStudio } from "@/server/services/notifications";

/** Solicitações de titular (LGPD): acesso, correção, exclusão, revogação, exportação. */
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");
  const parsed = await parseJson(request, privacyRequestSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  if (looksLikeSpam({ honeypot: input.website, renderedAt: input.renderedAt, text: input.details })) {
    return jsonOk({}, 201);
  }
  if (!(await allowRequest(request.headers, RULES.privacy))) {
    return jsonError(429, "rate_limited", "Muitas solicitações. Tente novamente mais tarde.");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError(503, "unavailable", "Serviço indisponível no momento.");
  const user = await getSessionUser();

  const { data, error } = await admin
    .from("privacy_requests")
    .insert({
      user_id: user?.id ?? null,
      email: input.email,
      type: input.type,
      details: input.details || null,
    })
    .select("id")
    .single();
  if (error || !data) return jsonError(500, "db_error", "Não foi possível registrar agora.");

  await notifyStudio({ kind: "privacy_request_new", refTable: "privacy_requests", refId: data.id });
  return jsonOk({}, 201);
}
