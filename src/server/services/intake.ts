import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IntakeInput } from "@/lib/validation/schemas";
import {
  CONSENT_TEXT_VERSION,
  getConsentDefinition,
  type ConsentKind,
} from "@/features/privacy/consents";
import { notifyStudio } from "./notifications";

/**
 * Salva a ficha com o cliente Supabase DO USUÁRIO: quem garante que ela só grava
 * a própria ficha é a RLS, não este código. Os consentimentos são gravados como
 * eventos independentes e append-only, com versão e texto exatos.
 */
export async function saveIntake(
  input: IntakeInput,
  userId: string,
): Promise<{ ok: true } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false };

  const { data: form, error } = await supabase
    .from("intake_forms")
    .upsert(
      {
        user_id: userId,
        status: "submitted",
        full_name: input.fullName,
        phone: input.phone,
        birth_date: input.birthDate,
        instagram: input.noInstagram ? null : input.instagram || null,
        no_instagram: input.noInstagram,
        allergies: input.allergies,
        medications: input.medications,
        health_conditions: input.healthConditions,
        pregnancy_breastfeeding: input.pregnancyBreastfeeding,
        skin_sensitivity: input.skinSensitivity,
        eye_sensitivity: input.eyeSensitivity,
        contact_lenses: input.contactLenses,
        recent_procedures: input.recentProcedures,
        previous_reactions: input.previousReactions,
        goals_preferences: input.goalsPreferences,
        other_information: input.otherInformation,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();
  if (error || !form) return { ok: false };

  const states: Record<Exclude<ConsentKind, "terms_privacy" | "sac_contact">, boolean> = {
    health_data_processing: input.consentHealth,
    whatsapp_followup: input.consentWhatsappFollowup,
    whatsapp_marketing: input.consentWhatsappMarketing,
    ranking_name: input.consentRanking,
    image_use: input.consentImage,
    instagram_mention: input.consentInstagramMention,
  };
  const rows = (Object.keys(states) as (keyof typeof states)[]).map((kind) => ({
    user_id: userId,
    intake_form_id: form.id,
    kind,
    granted: states[kind],
    text_version: CONSENT_TEXT_VERSION,
    consent_text: getConsentDefinition(kind)?.text ?? "",
    context: "intake_form" as const,
  }));
  const { error: consentError } = await supabase.from("intake_consents").insert(rows);
  if (consentError) return { ok: false };

  // Notificação minimizada (sem nada da ficha). Idempotente por ficha: reenvios/edições não duplicam o aviso.
  await notifyStudio({ kind: "intake_submitted", refTable: "intake_forms", refId: form.id });
  return { ok: true };
}
