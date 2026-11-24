import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { formatBrazilPhone } from "@/lib/format";
import { ProfileForm } from "@/features/profile/ProfileForm";
import { buttonClass } from "@/components/ui/Button";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("account.profile.title") };
}

export default async function ProfilePage() {
  const t = await getT();
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;
  const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">{t("account.eyebrow")}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{t("account.profile.title")}</h1>
      </header>
      <section className="max-w-xl space-y-4">
        <p className="text-sm text-cocoa">{t("account.profile.email")} <strong className="font-medium text-espresso">{user.email}</strong></p>
        <ProfileForm initial={{ fullName: data?.full_name ?? "", phone: data?.phone ? formatBrazilPhone(data.phone) : "" }} />
      </section>
      <section className="max-w-xl space-y-4 border-t border-line pt-8">
        <h2 className="text-3xl">{t("account.profile.dataTitle")}</h2>
        <p className="text-sm text-cocoa">{t("account.profile.dataText")}</p>
        <div className="flex flex-wrap gap-3">
          <a href="/api/account/export" className={buttonClass("outline")}><Download size={16} aria-hidden /> {t("account.profile.download")}</a>
          <Link href="/privacidade#direitos" className={buttonClass("outline")}>{t("account.profile.privacyRequests")}</Link>
        </div>
      </section>
    </div>
  );
}
