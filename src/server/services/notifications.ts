import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";
import { sendTextToStudio } from "@/server/integrations/uazapi/client";
import {
  buildNotificationText,
  type NotificationContext,
  type NotificationKind,
} from "@/server/integrations/uazapi/messages";

export interface NotifyParams {
  kind: NotificationKind;
  refTable: string;
  refId: string;
  context?: Omit<NotificationContext, "adminUrl">;
}

/**
 * Registra e envia a notificação ao Studio. Garantias:
 *  - Idempotência: chave `${kind}:${refId}` única no banco; um segundo disparo
 *    para o mesmo registro não duplica a mensagem.
 *  - Falha de notificação NUNCA derruba o fluxo principal (registro já salvo).
 *  - Logs sem conteúdo: apenas kind, status e códigos de erro.
 */
export async function notifyStudio(params: NotifyParams): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const idempotencyKey = `${params.kind}:${params.refId}`;
  const { data: created, error: insertError } = await admin
    .from("notification_events")
    .insert({
      kind: params.kind,
      ref_table: params.refTable,
      ref_id: params.refId,
      idempotency_key: idempotencyKey,
    })
    .select("id")
    .single();

  // 23505 = unique_violation: já existe evento para este registro.
  if (insertError || !created) return;

  const text = buildNotificationText(params.kind, {
    ...params.context,
    adminUrl: getSiteUrl(),
  });
  const result = await sendTextToStudio(text);

  if (result.ok) {
    await admin
      .from("notification_events")
      .update({ status: "sent", attempts: 1, sent_at: new Date().toISOString() })
      .eq("id", created.id);
    return;
  }

  const skipped = result.reason === "not_configured";
  await admin
    .from("notification_events")
    .update({
      status: skipped ? "skipped" : "failed",
      attempts: skipped ? 0 : 1,
      error_code: result.reason === "http_error" ? `http_${result.status}` : result.reason,
    })
    .eq("id", created.id);
  console.warn("[notify]", { kind: params.kind, status: skipped ? "skipped" : "failed", reason: result.reason });
}
