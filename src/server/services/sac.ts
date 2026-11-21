import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ticketTypeLabels, type SacInput } from "@/lib/validation/schemas";
import { CONSENT_TEXT_VERSION, sacConsent } from "@/features/privacy/consents";
import { notifyStudio } from "./notifications";

export type CreateTicketResult =
  | { ok: true; protocol: string }
  | { ok: false; reason: "unavailable" | "db_error" };

/** Registra o ticket (service_role, após validação+rate limit) e avisa o Studio. */
export async function createSacTicket(
  input: SacInput,
  userId: string | null,
): Promise<CreateTicketResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "unavailable" };

  const { data, error } = await admin
    .from("sac_tickets")
    .insert({
      user_id: userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      type: input.type,
      message: input.message,
      contact_consent: true,
    })
    .select("id, protocol")
    .single();
  if (error || !data) return { ok: false, reason: "db_error" };

  if (userId) {
    await admin.from("intake_consents").insert({
      user_id: userId,
      kind: sacConsent.kind,
      granted: true,
      text_version: CONSENT_TEXT_VERSION,
      consent_text: sacConsent.text,
      context: "sac_form",
    });
  }

  await notifyStudio({
    kind: "sac_new",
    refTable: "sac_tickets",
    refId: data.id,
    context: { protocol: data.protocol, typeLabel: ticketTypeLabels[input.type] },
  });
  return { ok: true, protocol: data.protocol };
}
