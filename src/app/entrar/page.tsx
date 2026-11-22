import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { SignInForm } from "@/features/auth/AuthForms";
import { safeNextPath } from "@/features/auth/safe-next";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthShell title="Entrar" lead="Acesse sua conta para preencher a ficha e acompanhar solicitações.">
      {sp.erro === "link" && <div className="mb-5"><Alert tone="error">Link inválido ou expirado. Tente novamente.</Alert></div>}
      {sp.erro === "config" && <div className="mb-5"><Alert tone="info">A autenticação ainda não foi configurada neste ambiente.</Alert></div>}
      <SignInForm next={safeNextPath(sp.next) ?? undefined} />
    </AuthShell>
  );
}
