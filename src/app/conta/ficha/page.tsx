import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { formatBrazilPhone } from "@/lib/format";
import { IntakeForm, type IntakeValues } from "@/features/intake/IntakeForm";
import { DeleteIntakeButton } from "@/features/intake/DeleteIntakeButton";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("account.intake.title") };
}

export default async function IntakePage() {
  const t = await getT();
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;

  const [{ data: form }, { data: profile }] = await Promise.all([
    supabase.from("intake_forms").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
  ]);

  const initial: Partial<IntakeValues> = form
    ? {
        fullName: form.full_name, phone: formatBrazilPhone(form.phone), birthDate: form.birth_date,
        instagram: form.instagram ?? "", noInstagram: form.no_instagram,
        allergies: form.allergies, medications: form.medications, healthConditions: form.health_conditions,
        pregnancyBreastfeeding: form.pregnancy_breastfeeding, skinSensitivity: form.skin_sensitivity,
        eyeSensitivity: form.eye_sensitivity, contactLenses: form.contact_lenses,
        recentProcedures: form.recent_procedures, previousReactions: form.previous_reactions,
        goalsPreferences: form.goals_preferences, otherInformation: form.other_information,
      }
    : { fullName: profile?.full_name ?? "", phone: profile?.phone ? formatBrazilPhone(profile.phone) : "" };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-rose-deep">{t("account.eyebrow")}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{t("account.intake.title")}</h1>
      </header>
      <IntakeForm initial={initial} hasExisting={Boolean(form)} />
      {form && (
        <section className="border-t border-line pt-8">
          <h2 className="text-2xl">{t("account.intake.deleteTitle")}</h2>
          <p className="mt-2 max-w-xl text-sm text-cocoa">{t("account.intake.deleteText")}</p>
          <div className="mt-4"><DeleteIntakeButton /></div>
        </section>
      )}
    </div>
  );
}
