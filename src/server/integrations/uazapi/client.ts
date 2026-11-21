import "server-only";
import { getUazapiEnv } from "@/lib/env";

/**
 * Cliente HTTP da Uazapi (uazapiGO).
 * Validado contra a documentação oficial (https://docs.uazapi.com/docs/getting-started):
 *   POST {BASE_URL}/send/text
 *   headers: Content-Type: application/json, token: <token da instância>
 *   body: { number: "5511999999999", text: "..." }
 * NÃO validado: formato da resposta/códigos de erro (a página consultada remete à
 * referência OpenAPI). Por isso o cliente depende apenas do status HTTP.
 *
 * Segurança: nunca loga `text`, `number` ou o token.
 */

export type SendResult =
  | { ok: true; status: number }
  | { ok: false; reason: "not_configured" | "timeout" | "network" | "http_error"; status?: number };

const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;
const BACKOFF_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Reintenta só falhas transitórias (rede, timeout, 429, 5xx). Nunca 4xx. */
export function isRetryable(r: SendResult): boolean {
  if (r.ok) return false;
  if (r.reason === "timeout" || r.reason === "network") return true;
  return r.reason === "http_error" && (r.status === 429 || (r.status ?? 0) >= 500);
}

async function attempt(url: string, token: string, number: string, text: string): Promise<SendResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify({ number, text }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.ok) return { ok: true, status: res.status };
    return { ok: false, reason: "http_error", status: res.status };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ok: false, reason: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}

/** Envia texto para o ÚNICO número do Studio configurado por ambiente. */
export async function sendTextToStudio(text: string): Promise<SendResult> {
  const env = getUazapiEnv();
  if (!env) return { ok: false, reason: "not_configured" };

  let result: SendResult = { ok: false, reason: "network" };
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    result = await attempt(`${env.baseUrl}/send/text`, env.token, env.studioPhone, text);
    if (!isRetryable(result)) break;
    if (i < MAX_ATTEMPTS) await sleep(BACKOFF_MS * i);
  }
  return result;
}
