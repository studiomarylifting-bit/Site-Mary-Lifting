import "server-only";
import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  const first = fwd?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip") || "unknown";
}

/** IP nunca é armazenado em claro: apenas hash salgado. */
export function hashIdentifier(value: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

export interface RateLimitRule {
  /** Nome do escopo, ex.: "sac" */
  scope: string;
  windowSeconds: number;
  max: number;
}

export const RULES = {
  sac: { scope: "sac", windowSeconds: 3600, max: 5 },
  feedback: { scope: "feedback", windowSeconds: 3600, max: 3 },
  privacy: { scope: "privacy", windowSeconds: 3600, max: 3 },
  intake: { scope: "intake", windowSeconds: 600, max: 10 },
} satisfies Record<string, RateLimitRule>;

/**
 * true = permitido. FAIL-CLOSED: se o backend de limites falhar, bloqueia
 * (preferimos negar um formulário a abrir a porta para abuso).
 */
export async function allowRequest(
  headers: Headers,
  rule: RateLimitRule,
  extraKey?: string,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;
  const id = hashIdentifier(extraKey ?? getClientIp(headers));
  const { data, error } = await admin.rpc("rate_limit_hit", {
    p_key: `${rule.scope}:${id}`,
    p_window_seconds: rule.windowSeconds,
    p_max: rule.max,
  });
  if (error) return false;
  return data === true;
}
