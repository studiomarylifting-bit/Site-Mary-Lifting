/**
 * DADOS JURÍDICOS NÃO FORNECIDOS. Não inventamos controlador, CNPJ, e-mail jurídico
 * ou encarregado (DPO). Preencha aqui (ou via variáveis de ambiente públicas) após
 * validação com o Studio/assessoria jurídica. Enquanto estiverem vazios, as páginas
 * exibem um aviso explícito de pendência.
 */
export const legal = {
  controllerName: process.env.NEXT_PUBLIC_LEGAL_CONTROLLER_NAME ?? "",
  controllerDocument: process.env.NEXT_PUBLIC_LEGAL_CONTROLLER_DOCUMENT ?? "", // CNPJ/CPF
  privacyEmail: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL ?? "",
  dpoName: process.env.NEXT_PUBLIC_LEGAL_DPO_NAME ?? "",
  /** Prazos de retenção a definir pelo Studio (ver docs/PRIVACY.md). */
  retentionIntake: process.env.NEXT_PUBLIC_LEGAL_RETENTION_INTAKE ?? "",
  lastUpdated: "2026-11-21",
  version: "2026-11-v1",
} as const;

export function pending(value: string, label: string): string {
  return value || `[${label} — a ser informado pelo Studio]`;
}
