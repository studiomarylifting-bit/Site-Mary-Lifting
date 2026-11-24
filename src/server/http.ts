import "server-only";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { getSiteUrl } from "@/lib/env";
import { getLocale } from "@/i18n/server";
import { translateMessage } from "@/i18n/server-messages";

export function jsonError(status: number, code: string, message: string, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, code, message, fields }, { status });
}

export function jsonOk<T extends object>(data: T = {} as T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/** CSRF: em métodos que alteram estado, Origin deve ser o próprio site. */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const expected = new URL(getSiteUrl()).host;
    const host = request.headers.get("host");
    const got = new URL(origin).host;
    return got === expected || got === host;
  } catch {
    return false;
  }
}

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 64_000) {
      return { ok: false, response: jsonError(413, "too_large", "Conteúdo muito grande.") };
    }
    raw = JSON.parse(text);
  } catch {
    return { ok: false, response: jsonError(400, "invalid_json", "Requisição inválida.") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const locale = await getLocale();
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      fields[key] ??= translateMessage(issue.message, locale);
    }
    return {
      ok: false,
      response: jsonError(422, "validation_error", translateMessage("Revise os campos destacados.", locale), fields),
    };
  }
  return { ok: true, data: parsed.data };
}
