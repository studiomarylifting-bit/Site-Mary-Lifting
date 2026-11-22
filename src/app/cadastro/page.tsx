import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { SignUpForm } from "@/features/auth/AuthForms";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell title="Criar conta" lead="Seu cadastro permite preencher a ficha de atendimento e acompanhar suas solicitações.">
      <SignUpForm />
    </AuthShell>
  );
}
