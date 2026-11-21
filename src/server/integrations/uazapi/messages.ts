/**
 * Templates das notificações administrativas ao WhatsApp do Studio.
 * REGRA: mensagens MINIMIZADAS. Proibido incluir: respostas da ficha, dados de
 * saúde, nome/telefone/e-mail da cliente, texto livre enviado por ela, senhas,
 * tokens. Apenas aviso + identificador não sensível.
 */
export type NotificationKind =
  | "sac_new"
  | "intake_submitted"
  | "feedback_new"
  | "privacy_request_new";

export interface NotificationContext {
  /** Protocolo do SAC (ex.: SAC-2026-000001). Não sensível. */
  protocol?: string;
  /** Rótulo do tipo de solicitação (ex.: "Dúvida"). Não sensível. */
  typeLabel?: string;
  adminUrl: string;
}

export function buildNotificationText(
  kind: NotificationKind,
  ctx: NotificationContext,
): string {
  switch (kind) {
    case "sac_new":
      return [
        "Mary Lifting · Nova solicitação de SAC",
        ctx.protocol ? `Protocolo: ${ctx.protocol}` : null,
        ctx.typeLabel ? `Tipo: ${ctx.typeLabel}` : null,
        `Acesse o painel: ${ctx.adminUrl}/admin/sac`,
      ]
        .filter(Boolean)
        .join("\n");
    case "intake_submitted":
      return [
        "Mary Lifting · Nova ficha de atendimento enviada",
        `Acesse o painel: ${ctx.adminUrl}/admin/clientes`,
      ].join("\n");
    case "feedback_new":
      return [
        "Mary Lifting · Novo feedback aguardando moderação",
        `Acesse o painel: ${ctx.adminUrl}/admin/feedback`,
      ].join("\n");
    case "privacy_request_new":
      return [
        "Mary Lifting · Nova solicitação de privacidade",
        `Acesse o painel: ${ctx.adminUrl}/admin`,
      ].join("\n");
  }
}
