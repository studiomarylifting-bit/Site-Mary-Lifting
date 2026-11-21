import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FeedbackInput } from "@/lib/validation/schemas";
import { notifyStudio } from "./notifications";

/**
 * Todo feedback nasce 'pending'. Publicação exige aprovação do admin E
 * publish_consent = true (a view public_feedback aplica as duas condições).
 * user_id é guardado só internamente; nunca exposto na view pública.
 */
export async function createFeedback(
  input: FeedbackInput,
  userId: string | null,
): Promise<{ ok: boolean }> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false };

  const { data, error } = await admin
    .from("feedback")
    .insert({
      user_id: userId,
      rating: input.rating,
      comment: input.comment,
      procedure_slug: input.procedureSlug ? input.procedureSlug : null,
      display_name: input.anonymize ? null : (input.displayName ?? null),
      anonymize: input.anonymize,
      publish_consent: input.publishConsent,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false };

  await notifyStudio({ kind: "feedback_new", refTable: "feedback", refId: data.id });
  return { ok: true };
}
