import { allowRequest, RULES } from "@/lib/security/rate-limit";
import { looksLikeSpam } from "@/lib/security/anti-spam";
import { sacSchema } from "@/lib/validation/schemas";
import { assertSameOrigin, jsonError, jsonOk, parseJson } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";
import { createSacTicket } from "@/server/services/sac";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError(403, "forbidden", "Origem inválida.");

  const parsed = await parseJson(request, sacSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  // Bots recebem sucesso silencioso: não revela a regra.
  if (looksLikeSpam({ honeypot: input.website, renderedAt: input.renderedAt, text: input.message })) {
    return jsonOk({ protocol: "SAC-PENDENTE" });
  }
  if (!(await allowRequest(request.headers, RULES.sac))) {
    return jsonError(429, "rate_limited", "Muitas solicitações. Tente novamente mais tarde.");
  }

  const user = await getSessionUser(); // opcional: associa à cliente logada
  const result = await createSacTicket(input, user?.id ?? null);
  if (!result.ok) {
    return jsonError(
      result.reason === "unavailable" ? 503 : 500,
      result.reason,
      "Não foi possível registrar agora. Tente novamente em instantes.",
    );
  }
  return jsonOk({ protocol: result.protocol }, 201);
}
