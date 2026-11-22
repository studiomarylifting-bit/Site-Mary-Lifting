export interface ApiResult {
  ok: boolean;
  message?: string;
  fields?: Record<string, string>;
  [key: string]: unknown;
}

/** POST/PATCH JSON com tratamento uniforme de erro (sem vazar detalhes internos). */
export async function sendJson(
  url: string,
  body: unknown,
  method: "POST" | "PATCH" | "DELETE" = "POST",
): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => ({}))) as ApiResult;
    if (res.ok) return { ...data, ok: true };
    return { ...data, ok: false, message: data.message ?? "Não foi possível concluir. Tente novamente." };
  } catch {
    return { ok: false, message: "Falha de conexão. Verifique sua internet e tente novamente." };
  }
}
