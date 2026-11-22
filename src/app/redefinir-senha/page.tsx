import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/layout/AuthShell";
import { ResetPasswordForm } from "@/features/auth/AuthForms";
import { getSessionUser } from "@/server/policies/authz";

export const metadata: Metadata = { title: "Redefinir senha", robots: { index: false } };

export default async function ResetPasswordPage() {
  // Só chega aqui com a sessão temporária criada pelo link do e-mail.
  if (!(await getSessionUser())) redirect("/recuperar-senha");
  return (
    <AuthShell title="Nova senha" lead="Defina uma nova senha para sua conta.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
