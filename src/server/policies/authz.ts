import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string | undefined;
}

/** Usuário autenticado validado no servidor do Supabase (não confia em cookie cru). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}

/**
 * Papel admin consultado no banco (user_roles) via RLS do próprio usuário.
 * Nunca derivado de metadata, cookie ou claim controlável pelo cliente.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return data?.role === "admin";
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return (await isAdminUser(user.id)) ? user : null;
}

/** Destino padrão após entrar: admin cai no painel, cliente na própria conta. */
export async function defaultLandingPath(userId: string): Promise<"/admin" | "/conta"> {
  return (await isAdminUser(userId)) ? "/admin" : "/conta";
}
