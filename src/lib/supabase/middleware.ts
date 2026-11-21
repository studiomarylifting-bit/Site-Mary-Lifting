import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env";

const CLIENT_PREFIX = "/conta";
const ADMIN_PREFIX = "/admin";

/**
 * Renova a sessão e aplica a barreira de rota (UX + defesa em profundidade).
 * A autorização REAL é refeita nos layouts/handlers e pelas policies RLS:
 * o middleware sozinho nunca é tratado como controle de acesso suficiente.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();
  const path = request.nextUrl.pathname;
  const isProtected =
    path === CLIENT_PREFIX ||
    path.startsWith(`${CLIENT_PREFIX}/`) ||
    path === ADMIN_PREFIX ||
    path.startsWith(`${ADMIN_PREFIX}/`);

  if (!env) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("erro", "config");
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() valida o JWT no servidor do Supabase (getSession não valida).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return response;
}
