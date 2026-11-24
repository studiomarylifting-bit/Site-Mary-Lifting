import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { SignInForm } from "@/features/auth/AuthForms";
import { safeNextPath } from "@/features/auth/safe-next";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("auth.signIn.title"), robots: { index: false } };
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const [sp, t] = await Promise.all([searchParams, getT()]);
  return (
    <AuthShell title={t("auth.signIn.title")} lead={t("auth.signIn.lead")}>
      {sp.erro === "link" && <div className="mb-5"><Alert tone="error">{t("auth.signIn.linkError")}</Alert></div>}
      {sp.erro === "config" && <div className="mb-5"><Alert tone="info">{t("auth.signIn.configError")}</Alert></div>}
      <SignInForm next={safeNextPath(sp.next) ?? undefined} />
    </AuthShell>
  );
}
