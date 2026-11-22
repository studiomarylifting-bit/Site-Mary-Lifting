import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { formatBrazilPhone } from "@/lib/format";
import { ProfileForm } from "@/features/profile/ProfileForm";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Perfil e dados" };

export default async function ProfilePage() {
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;
  const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">Minha conta</p>
        <h1 className="mt-3 text-5xl">Perfil e dados</h1>
      </header>
      <section className="max-w-xl space-y-4">
        <p className="text-sm text-cocoa">E-mail da conta: <strong className="font-medium text-espresso">{user.email}</strong></p>
        <ProfileForm initial={{ fullName: data?.full_name ?? "", phone: data?.phone ? formatBrazilPhone(data.phone) : "" }} />
      </section>
      <section className="max-w-xl space-y-4 border-t border-line pt-8">
        <h2 className="text-3xl">Seus dados</h2>
        <p className="text-sm text-cocoa">Você pode baixar uma cópia dos seus dados ou solicitar correção, exclusão da conta e revogação de consentimentos.</p>
        <div className="flex flex-wrap gap-3">
          <a href="/api/account/export" className={buttonClass("outline")}><Download size={16} aria-hidden /> Baixar meus dados</a>
          <Link href="/privacidade#direitos" className={buttonClass("outline")}>Solicitações de privacidade</Link>
        </div>
      </section>
    </div>
  );
}
