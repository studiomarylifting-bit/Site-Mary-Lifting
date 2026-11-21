import { z } from "zod";
import { normalizeBrazilPhone } from "@/lib/format";

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} é obrigatório` })
    .trim()
    .min(min, `${label}: mínimo de ${min} caracteres`)
    .max(max, `${label}: máximo de ${max} caracteres`);

/** Celular com DDD -> "55DDDNUMERO". */
export const phoneSchema = z
  .string({ required_error: "Celular é obrigatório" })
  .transform((v, ctx) => {
    const n = normalizeBrazilPhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Informe um celular válido com DDD" });
      return z.NEVER;
    }
    return n;
  });

export const emailSchema = z
  .string({ required_error: "E-mail é obrigatório" })
  .trim()
  .toLowerCase()
  .email("E-mail inválido")
  .max(254);

export const passwordSchema = z
  .string({ required_error: "Senha é obrigatória" })
  .min(10, "A senha deve ter ao menos 10 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .regex(/[a-z]/, "Inclua uma letra minúscula")
  .regex(/[A-Z]/, "Inclua uma letra maiúscula")
  .regex(/\d/, "Inclua um número");

const instagramSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^@/, ""))
  .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), "Instagram inválido");

// ------------------------------------------------------------------ auth
export const signUpSchema = z
  .object({
    fullName: trimmed(2, 120, "Nome completo").refine(
      (v) => v.split(/\s+/).length >= 2,
      "Informe nome e sobrenome",
    ),
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "É necessário aceitar a política e os termos" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha").max(72),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

// ------------------------------------------------------------------- SAC
export const ticketTypes = [
  "duvida",
  "agendamento",
  "procedimento",
  "pos_atendimento",
  "financeiro",
  "privacidade",
  "reclamacao",
  "sugestao",
  "outro",
] as const;

export const ticketTypeLabels: Record<(typeof ticketTypes)[number], string> = {
  duvida: "Dúvida",
  agendamento: "Agendamento",
  procedimento: "Procedimento",
  pos_atendimento: "Pós-atendimento",
  financeiro: "Financeiro",
  privacidade: "Privacidade e dados",
  reclamacao: "Reclamação",
  sugestao: "Sugestão",
  outro: "Outro",
};

export const sacSchema = z.object({
  name: trimmed(2, 120, "Nome"),
  email: emailSchema,
  phone: phoneSchema,
  subject: trimmed(3, 140, "Assunto"),
  type: z.enum(ticketTypes, { errorMap: () => ({ message: "Selecione o tipo" }) }),
  message: trimmed(10, 3000, "Mensagem"),
  contactConsent: z.literal(true, {
    errorMap: () => ({ message: "O consentimento é necessário para responder" }),
  }),
  // anti-spam
  website: z.string().optional(),
  renderedAt: z.number().optional(),
});
export type SacInput = z.infer<typeof sacSchema>;

export const ticketReplySchema = z.object({ body: trimmed(1, 3000, "Resposta") });

export const ticketStatuses = ["open", "in_progress", "answered", "closed"] as const;
export const ticketStatusSchema = z.object({ status: z.enum(ticketStatuses) });

// -------------------------------------------------------------- feedback
export const feedbackSchema = z
  .object({
    rating: z.coerce.number().int().min(1, "Selecione uma nota").max(5),
    comment: trimmed(10, 1500, "Comentário"),
    procedureSlug: z.string().regex(/^[a-z0-9-]+$/).max(80).optional().or(z.literal("")),
    displayName: z.string().trim().max(60).optional(),
    anonymize: z.boolean().default(true),
    publishConsent: z.boolean().default(false),
    website: z.string().optional(),
    renderedAt: z.number().optional(),
  })
  .refine((d) => d.anonymize || (d.displayName && d.displayName.length >= 2), {
    path: ["displayName"],
    message: "Informe um nome ou escolha a opção anônima",
  });
export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const feedbackModerationSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
  anonymize: z.boolean().optional(),
});

// --------------------------------------------------------------- ficha
const answer = (label: string) => trimmed(2, 1000, label);

export const intakeSchema = z
  .object({
    fullName: trimmed(2, 120, "Nome completo"),
    phone: phoneSchema,
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
      .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`);
        const now = new Date();
        return !Number.isNaN(d.getTime()) && d < now && d.getUTCFullYear() > 1900;
      }, "Data de nascimento inválida"),
    instagram: instagramSchema.optional(),
    noInstagram: z.boolean().default(false),
    allergies: answer("Alergias"),
    medications: answer("Medicamentos ou tratamentos"),
    healthConditions: answer("Condições de saúde"),
    pregnancyBreastfeeding: answer("Gestação ou amamentação"),
    skinSensitivity: answer("Sensibilidade da pele"),
    eyeSensitivity: answer("Sensibilidade dos olhos"),
    contactLenses: answer("Lentes de contato"),
    recentProcedures: answer("Cirurgias ou procedimentos recentes"),
    previousReactions: answer("Reação anterior"),
    goalsPreferences: answer("Objetivo e preferências"),
    otherInformation: answer("Outras informações"),
    // Consentimentos independentes
    consentHealth: z.literal(true, {
      errorMap: () => ({
        message: "A autorização de uso dos dados de saúde é obrigatória para enviar a ficha",
      }),
    }),
    consentWhatsappFollowup: z.boolean().default(false),
    consentWhatsappMarketing: z.boolean().default(false),
    consentRanking: z.boolean().default(false),
    consentImage: z.boolean().default(false),
    consentInstagramMention: z.boolean().default(false),
  })
  .refine((d) => !d.noInstagram || !d.instagram, {
    path: ["instagram"],
    message: "Remova o Instagram ou desmarque “não possuo”",
  })
  .refine((d) => !d.consentInstagramMention || (!d.noInstagram && !!d.instagram), {
    path: ["consentInstagramMention"],
    message: "Para autorizar a menção, informe seu Instagram",
  });
export type IntakeInput = z.infer<typeof intakeSchema>;

// ----------------------------------------------------------- privacidade
export const privacyRequestSchema = z.object({
  email: emailSchema,
  type: z.enum(["access", "correction", "deletion", "consent_revocation", "export"]),
  details: z.string().trim().max(2000).optional(),
  website: z.string().optional(),
  renderedAt: z.number().optional(),
});

export const consentUpdateSchema = z.object({
  kind: z.enum([
    "whatsapp_followup",
    "whatsapp_marketing",
    "ranking_name",
    "image_use",
    "instagram_mention",
  ]),
  granted: z.boolean(),
});

export const profileUpdateSchema = z.object({
  fullName: trimmed(2, 120, "Nome completo"),
  phone: phoneSchema,
});
