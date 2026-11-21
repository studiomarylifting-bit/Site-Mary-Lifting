/**
 * Textos de consentimento versionados. Ao alterar QUALQUER texto, incremente
 * CONSENT_TEXT_VERSION: cada consentimento registrado guarda versão + texto
 * exatos que a cliente viu. Consentimentos são independentes entre si.
 */
export const CONSENT_TEXT_VERSION = "2026-11-v1";

export type ConsentKind =
  | "health_data_processing"
  | "whatsapp_followup"
  | "whatsapp_marketing"
  | "ranking_name"
  | "image_use"
  | "instagram_mention"
  | "terms_privacy"
  | "sac_contact";

export interface ConsentDefinition {
  kind: ConsentKind;
  required: boolean;
  text: string;
}

export const intakeConsents: ConsentDefinition[] = [
  {
    kind: "health_data_processing",
    required: true,
    text: "Autorizo o Studio Mary Lifting a utilizar meus dados cadastrais e as informações de saúde que forneci para avaliar e organizar meu atendimento.",
  },
  {
    kind: "whatsapp_followup",
    required: false,
    text: "Quero receber lembretes, manutenção e acompanhamento pós-atendimento pelo WhatsApp.",
  },
  {
    kind: "whatsapp_marketing",
    required: false,
    text: "Quero receber novidades, ofertas e mensagens de aniversário do Studio pelo WhatsApp.",
  },
  {
    kind: "ranking_name",
    required: false,
    text: "Autorizo que meu nome apareça no ranking anual compartilhado, sem valores gastos.",
  },
  {
    kind: "image_use",
    required: false,
    text: "Autorizo o Mary Lifting — Lash e Estética a publicar fotos e vídeos dos meus resultados nos canais do Studio, como Instagram e catálogo, para divulgação dos serviços.",
  },
  {
    kind: "instagram_mention",
    required: false,
    text: "Autorizo o Mary Lifting — Lash e Estética a mencionar ou marcar o perfil do Instagram que informei nas publicações relacionadas ao meu atendimento.",
  },
];

export const signupConsent: ConsentDefinition = {
  kind: "terms_privacy",
  required: true,
  text: "Li e aceito a Política de Privacidade e os Termos de Uso.",
};

export const sacConsent: ConsentDefinition = {
  kind: "sac_contact",
  required: true,
  text: "Autorizo o Studio a usar os dados informados para responder esta solicitação.",
};

export function getConsentDefinition(kind: ConsentKind): ConsentDefinition | undefined {
  return [...intakeConsents, signupConsent, sacConsent].find((c) => c.kind === kind);
}

export const INTAKE_INSTRUCTIONS =
  "Responda com suas próprias palavras. Preencha todos os campos. Quando não se aplicar ou não souber, você pode escrever “não”, “não sei” ou “prefiro conversar na avaliação”. A ficha será revisada e não substitui a avaliação do atendimento.";
