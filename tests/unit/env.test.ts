import { describe, expect, it, vi } from "vitest";
import { getGoogleEnv, getSiteUrl, getSupabaseAdminEnv, getSupabasePublicEnv, getUazapiEnv } from "@/lib/env";

const clear = (keys: string[]) => keys.forEach((k) => vi.stubEnv(k, ""));

describe("validação de ambiente com degradação segura", () => {
  it("retorna null quando a integração não está configurada", () => {
    clear([
      "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
      "UAZAPI_BASE_URL", "UAZAPI_TOKEN", "UAZAPI_STUDIO_PHONE",
      "GOOGLE_PLACES_API_KEY", "GOOGLE_PLACE_ID",
    ]);
    expect(getSupabasePublicEnv()).toBeNull();
    expect(getSupabaseAdminEnv()).toBeNull();
    expect(getUazapiEnv()).toBeNull();
    expect(getGoogleEnv()).toBeNull();
  });

  it("service role é exigida só no env admin", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a".repeat(30));
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(getSupabasePublicEnv()).not.toBeNull();
    expect(getSupabaseAdminEnv()).toBeNull();
  });

  it("rejeita telefone do Studio em formato inválido e normaliza a URL", () => {
    vi.stubEnv("UAZAPI_BASE_URL", "https://x.uazapi.example///");
    vi.stubEnv("UAZAPI_TOKEN", "token-123456");
    vi.stubEnv("UAZAPI_STUDIO_PHONE", "(11) 99999-9999");
    expect(getUazapiEnv()).toBeNull();
    vi.stubEnv("UAZAPI_STUDIO_PHONE", "5511999999999");
    expect(getUazapiEnv()?.baseUrl).toBe("https://x.uazapi.example");
  });

  it("getSiteUrl remove barra final e tem padrão local", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://site.example/");
    expect(getSiteUrl()).toBe("https://site.example");
  });
});
