import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isRetryable, sendTextToStudio, type SendResult } from "@/server/integrations/uazapi/client";

const ENV = {
  UAZAPI_BASE_URL: "https://studio.uazapi.example/",
  UAZAPI_TOKEN: "token-de-teste-123",
  UAZAPI_STUDIO_PHONE: "5511999999999",
};

describe("isRetryable", () => {
  const http = (status: number): SendResult => ({ ok: false, reason: "http_error", status });
  it("reintenta falhas transitórias", () => {
    expect(isRetryable({ ok: false, reason: "timeout" })).toBe(true);
    expect(isRetryable({ ok: false, reason: "network" })).toBe(true);
    expect(isRetryable(http(429))).toBe(true);
    expect(isRetryable(http(503))).toBe(true);
  });
  it("não reintenta sucesso, 4xx ou não configurado", () => {
    expect(isRetryable({ ok: true, status: 200 })).toBe(false);
    expect(isRetryable(http(400))).toBe(false);
    expect(isRetryable(http(401))).toBe(false);
    expect(isRetryable({ ok: false, reason: "not_configured" })).toBe(false);
  });
});

describe("sendTextToStudio", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna not_configured sem variáveis e não chama a rede", async () => {
    vi.stubEnv("UAZAPI_BASE_URL", "");
    vi.stubEnv("UAZAPI_TOKEN", "");
    vi.stubEnv("UAZAPI_STUDIO_PHONE", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendTextToStudio("oi")).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia POST /send/text com header token, só ao número do Studio", async () => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const r = await sendTextToStudio("Mary Lifting · aviso");
    expect(r).toEqual({ ok: true, status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://studio.uazapi.example/send/text");
    expect(init.method).toBe("POST");
    expect(init.headers.token).toBe(ENV.UAZAPI_TOKEN);
    expect(JSON.parse(init.body)).toEqual({ number: "5511999999999", text: "Mary Lifting · aviso" });
  });

  it("não reintenta erro 4xx", async () => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendTextToStudio("x")).toEqual({ ok: false, reason: "http_error", status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reintenta uma vez em 5xx e depois desiste", async () => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 502 });
    vi.stubGlobal("fetch", fetchMock);
    const p = sendTextToStudio("x");
    await vi.runAllTimersAsync();
    expect(await p).toEqual({ ok: false, reason: "http_error", status: 502 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("não vaza token nem texto no resultado em caso de erro de rede", async () => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    const p = sendTextToStudio("conteúdo");
    await vi.runAllTimersAsync();
    const r = await p;
    expect(r).toEqual({ ok: false, reason: "network" });
    expect(JSON.stringify(r)).not.toContain(ENV.UAZAPI_TOKEN);
  });
});
