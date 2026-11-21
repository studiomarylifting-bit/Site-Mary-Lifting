import { allowRequest, RULES } from "@/lib/security/rate-limit";
import { looksLikeSpam } from "@/lib/security/anti-spam";
import { feedbackSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";
import { createFeedback } from "@/server/services/feedback";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");

  const parsed = await parseJson(request, feedbackSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  if (looksLikeSpam({ honeypot: input.website, renderedAt: input.renderedAt, text: input.comment })) {
    return jsonOk({}, 201);
  }
  if (!(await allowRequest(request.headers, RULES.feedback))) {
    return jsonError(429, "rate_limited", "Muitos envios. Tente novamente mais tarde.");
  }

  const user = await getSessionUser();
  const result = await createFeedback(input, user?.id ?? null);
  if (!result.ok) {
    return jsonError(500, "db_error", "Não foi possível enviar agora. Tente novamente.");
  }
  return jsonOk({}, 201);
}
