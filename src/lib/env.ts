import { z } from "zod";

/**
 * Validação de ambiente com degradação segura: cada integração é validada
 * isoladamente e retorna `null` quando não configurada. Assim, páginas que não
 * dependem dela continuam funcionando.
 */

const publicSupabase = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const adminSupabase = publicSupabase.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

const uazapi = z.object({
  UAZAPI_BASE_URL: z.string().url(),
  UAZAPI_TOKEN: z.string().min(8),
  UAZAPI_STUDIO_PHONE: z.string().regex(/^55\d{10,11}$/, "formato 55DDDNUMERO"),
});

const google = z.object({
  GOOGLE_PLACES_API_KEY: z.string().min(10),
  GOOGLE_PLACE_ID: z.string().min(10),
});

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}
export interface SupabaseAdminEnv extends SupabasePublicEnv {
  serviceRoleKey: string;
}
export interface UazapiEnv {
  baseUrl: string;
  token: string;
  studioPhone: string;
}
export interface GoogleEnv {
  apiKey: string;
  placeId: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const r = publicSupabase.safeParse(process.env);
  return r.success
    ? {
        url: r.data.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: r.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    : null;
}

/** Somente servidor. */
export function getSupabaseAdminEnv(): SupabaseAdminEnv | null {
  const r = adminSupabase.safeParse(process.env);
  return r.success
    ? {
        url: r.data.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: r.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: r.data.SUPABASE_SERVICE_ROLE_KEY,
      }
    : null;
}

export function getUazapiEnv(): UazapiEnv | null {
  const r = uazapi.safeParse(process.env);
  return r.success
    ? {
        baseUrl: r.data.UAZAPI_BASE_URL.replace(/\/+$/, ""),
        token: r.data.UAZAPI_TOKEN,
        studioPhone: r.data.UAZAPI_STUDIO_PHONE,
      }
    : null;
}

export function getGoogleEnv(): GoogleEnv | null {
  const r = google.safeParse(process.env);
  return r.success
    ? { apiKey: r.data.GOOGLE_PLACES_API_KEY, placeId: r.data.GOOGLE_PLACE_ID }
    : null;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}
