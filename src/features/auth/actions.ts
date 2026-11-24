"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";
import { allowRequest } from "@/lib/security/rate-limit";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/schemas";
import { CONSENT_TEXT_VERSION, signupConsent } from "@/features/privacy/consents";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import { translateMessage } from "@/i18n/server-messages";
import { defaultLandingPath } from "@/server/policies/authz";
import { safeNextPath } from "./safe-next";

/** Mensagem no idioma da requisição (cookie de idioma). */
async function tr(message: string): Promise<string> {
  return translateMessage(message, await getLocale());
}

export interface FormState {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
}

function fieldErrors(issues: { path: (string | number)[]; message: string }[], locale: Locale = "pt") {
  const fields: Record<string, string> = {};
  for (const i of issues) fields[i.path.join(".") || "_"] ??= translateMessage(i.message, locale);
  return fields;
}

const AUTH_RULE = { scope: "auth", windowSeconds: 600, max: 20 };

async function authAllowed(): Promise<boolean> {
  return allowRequest(await headers(), AUTH_RULE);
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fields: fieldErrors(parsed.error.issues, await getLocale()) };
  if (!(await authAllowed())) return { message: await tr("Muitas tentativas. Aguarde alguns minutos.") };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { message: await tr("Autenticação indisponível no momento.") };

  const { data: signedIn, error } = await supabase.auth.signInWithPassword(parsed.data);
  // Mensagem genérica: não revela se o e-mail existe.
  if (error) return { message: await tr("E-mail ou senha incorretos, ou e-mail ainda não confirmado.") };

  // Sem destino pedido: admin -> /admin, cliente -> /conta (papel lido do banco, nunca do cliente).
  const explicit = safeNextPath(String(formData.get("next") ?? ""));
  redirect(explicit ?? (signedIn.user ? await defaultLandingPath(signedIn.user.id) : "/conta"));
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) return { fields: fieldErrors(parsed.error.issues, await getLocale()) };
  if (!(await authAllowed())) return { message: await tr("Muitas tentativas. Aguarde alguns minutos.") };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { message: await tr("Cadastro indisponível no momento.") };

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Apenas dados de perfil. Papéis NUNCA são definidos aqui.
      data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/conta`,
    },
  });
  if (error) return { message: await tr("Não foi possível concluir o cadastro. Verifique os dados e tente novamente.") };

  // Registra o aceite de termos/política (versão + texto) com timestamp.
  const userId = data.user?.id;
  const admin = createSupabaseAdminClient();
  if (userId && admin) {
    await admin.from("intake_consents").insert({
      user_id: userId,
      kind: signupConsent.kind,
      granted: true,
      text_version: CONSENT_TEXT_VERSION,
      consent_text: signupConsent.text,
      context: "signup",
    });
  }

  return {
    ok: true,
    message: await tr(
      "Cadastro realizado. Se a confirmação de e-mail estiver ativa, enviamos um link para confirmar sua conta."),
  };
}

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fields: fieldErrors(parsed.error.issues, await getLocale()) };
  if (!(await authAllowed())) return { message: await tr("Muitas tentativas. Aguarde alguns minutos.") };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { message: await tr("Serviço indisponível no momento.") };
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/redefinir-senha`,
  });
  // Resposta idêntica exista ou não a conta (evita enumeração de usuários).
  return { ok: true, message: await tr("Se houver uma conta com esse e-mail, enviaremos as instruções.") };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fields: fieldErrors(parsed.error.issues, await getLocale()) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { message: await tr("Serviço indisponível no momento.") };
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { message: await tr("Link expirado. Solicite uma nova recuperação de senha.") };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: await tr("Não foi possível atualizar a senha. Tente novamente.") };
  redirect("/conta");
}
