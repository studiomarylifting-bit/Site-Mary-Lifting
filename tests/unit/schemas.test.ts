import { describe, expect, it } from "vitest";
import {
  consentUpdateSchema,
  feedbackSchema,
  intakeSchema,
  passwordSchema,
  sacSchema,
  signUpSchema,
} from "@/lib/validation/schemas";

const validIntake = {
  fullName: "Maria da Silva",
  phone: "(11) 99999-9999",
  birthDate: "1990-05-10",
  instagram: "@maria",
  noInstagram: false,
  allergies: "não",
  medications: "não",
  healthConditions: "não",
  pregnancyBreastfeeding: "não",
  skinSensitivity: "não",
  eyeSensitivity: "não",
  contactLenses: "não",
  recentProcedures: "não",
  previousReactions: "não",
  goalsPreferences: "natural",
  otherInformation: "não",
  consentHealth: true,
};

describe("senha", () => {
  it("exige tamanho e complexidade mínima", () => {
    expect(passwordSchema.safeParse("curta1A").success).toBe(false);
    expect(passwordSchema.safeParse("semnumeroAAAA").success).toBe(false);
    expect(passwordSchema.safeParse("SEMMINUSCULA123").success).toBe(false);
    expect(passwordSchema.safeParse("Senha-Forte-123").success).toBe(true);
  });
});

describe("cadastro", () => {
  const base = {
    fullName: "Maria Silva",
    phone: "11999999999",
    email: "MARIA@Example.com",
    password: "Senha-Forte-123",
    confirmPassword: "Senha-Forte-123",
    acceptTerms: true as const,
  };
  it("normaliza e-mail e celular", () => {
    const r = signUpSchema.parse(base);
    expect(r.email).toBe("maria@example.com");
    expect(r.phone).toBe("5511999999999");
  });
  it("rejeita senhas diferentes, sem aceite e nome sem sobrenome", () => {
    expect(signUpSchema.safeParse({ ...base, confirmPassword: "outra" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, fullName: "Maria" }).success).toBe(false);
  });
});

describe("SAC", () => {
  const base = {
    name: "Maria",
    email: "m@example.com",
    phone: "11999999999",
    subject: "Dúvida",
    type: "duvida" as const,
    message: "Gostaria de saber mais sobre manutenção.",
    contactConsent: true as const,
  };
  it("aceita solicitação válida", () => {
    expect(sacSchema.safeParse(base).success).toBe(true);
  });
  it("exige consentimento e tipo válido", () => {
    expect(sacSchema.safeParse({ ...base, contactConsent: false }).success).toBe(false);
    expect(sacSchema.safeParse({ ...base, type: "hack" }).success).toBe(false);
  });
  it("limita o tamanho da mensagem", () => {
    expect(sacSchema.safeParse({ ...base, message: "a".repeat(3001) }).success).toBe(false);
  });
});

describe("feedback", () => {
  const base = { rating: 5, comment: "Atendimento excelente, adorei.", anonymize: true, publishConsent: true };
  it("aceita nota como string (coerção) dentro de 1..5", () => {
    expect(feedbackSchema.safeParse({ ...base, rating: "4" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
  });
  it("exige nome quando não anônimo", () => {
    expect(feedbackSchema.safeParse({ ...base, anonymize: false }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...base, anonymize: false, displayName: "Maria" }).success).toBe(true);
  });
  it("publishConsent é falso por padrão (nunca publica sem autorização)", () => {
    const r = feedbackSchema.parse({ rating: 5, comment: "Muito bom mesmo, recomendo." });
    expect(r.publishConsent).toBe(false);
  });
});

describe("ficha de anamnese", () => {
  it("aceita ficha completa", () => {
    expect(intakeSchema.safeParse(validIntake).success).toBe(true);
  });
  it("bloqueia envio sem consentimento de saúde", () => {
    expect(intakeSchema.safeParse({ ...validIntake, consentHealth: false }).success).toBe(false);
    const { consentHealth: _omit, ...rest } = validIntake;
    expect(intakeSchema.safeParse(rest).success).toBe(false);
  });
  it("consentimentos opcionais são independentes e falsos por padrão", () => {
    const r = intakeSchema.parse(validIntake);
    expect(r.consentWhatsappFollowup).toBe(false);
    expect(r.consentWhatsappMarketing).toBe(false);
    expect(r.consentRanking).toBe(false);
    expect(r.consentImage).toBe(false);
    expect(r.consentInstagramMention).toBe(false);
  });
  it("menção no Instagram exige Instagram informado", () => {
    expect(
      intakeSchema.safeParse({ ...validIntake, instagram: "", consentInstagramMention: true }).success,
    ).toBe(false);
    expect(
      intakeSchema.safeParse({ ...validIntake, noInstagram: true, instagram: "", consentInstagramMention: true }).success,
    ).toBe(false);
  });
  it("não aceita Instagram junto de 'não possuo'", () => {
    expect(intakeSchema.safeParse({ ...validIntake, noInstagram: true }).success).toBe(false);
  });
  it("rejeita data de nascimento futura ou inválida", () => {
    expect(intakeSchema.safeParse({ ...validIntake, birthDate: "2999-01-01" }).success).toBe(false);
    expect(intakeSchema.safeParse({ ...validIntake, birthDate: "10/05/1990" }).success).toBe(false);
  });
  it("exige resposta em todos os campos de anamnese", () => {
    expect(intakeSchema.safeParse({ ...validIntake, allergies: "" }).success).toBe(false);
  });
});

describe("consentimentos", () => {
  it("só aceita tipos conhecidos", () => {
    expect(consentUpdateSchema.safeParse({ kind: "image_use", granted: true }).success).toBe(true);
    expect(consentUpdateSchema.safeParse({ kind: "health", granted: false }).success).toBe(false);
  });
});
