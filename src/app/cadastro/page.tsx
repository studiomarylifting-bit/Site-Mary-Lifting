import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { SignUpForm } from "@/features/auth/AuthForms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("auth.signUp.title"), robots: { index: false } };
}

export default async function SignUpPage() {
  const t = await getT();
  return (
    <AuthShell title={t("auth.signUp.title")} lead={t("auth.signUp.lead")}>
      <SignUpForm />
    </AuthShell>
  );
}
