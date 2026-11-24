import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/AuthForms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("auth.forgot.title"), robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const t = await getT();
  return (
    <AuthShell title={t("auth.forgot.title")} lead={t("auth.forgot.lead")}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
