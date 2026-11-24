import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/layout/AuthShell";
import { ResetPasswordForm } from "@/features/auth/AuthForms";
import { getSessionUser } from "@/server/policies/authz";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("auth.reset.title"), robots: { index: false } };
}

export default async function ResetPasswordPage() {
  // Só chega aqui com a sessão temporária criada pelo link do e-mail.
  if (!(await getSessionUser())) redirect("/recuperar-senha");
  const t = await getT();
  return (
    <AuthShell title={t("auth.reset.title")} lead={t("auth.reset.lead")}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
