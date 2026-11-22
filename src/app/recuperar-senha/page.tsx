import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/AuthForms";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Recuperar senha" lead="Informe seu e-mail para receber o link de redefinição.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
