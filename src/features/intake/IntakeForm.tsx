"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { INTAKE_INSTRUCTIONS, intakeConsents } from "@/features/privacy/consents";

export interface IntakeValues {
  fullName: string; phone: string; birthDate: string; instagram: string; noInstagram: boolean;
  allergies: string; medications: string; healthConditions: string; pregnancyBreastfeeding: string;
  skinSensitivity: string; eyeSensitivity: string; contactLenses: string; recentProcedures: string;
  previousReactions: string; goalsPreferences: string; otherInformation: string;
  consentHealth: boolean; consentWhatsappFollowup: boolean; consentWhatsappMarketing: boolean;
  consentRanking: boolean; consentImage: boolean; consentInstagramMention: boolean;
}

const questions: { name: keyof IntakeValues; label: string }[] = [
  { name: "allergies", label: "Alergias a cosméticos, cola, látex ou outros produtos" },
  { name: "medications", label: "Medicamentos ou tratamentos em uso" },
  { name: "healthConditions", label: "Condições de saúde que deseja informar" },
  { name: "pregnancyBreastfeeding", label: "Gestação ou amamentação" },
  { name: "skinSensitivity", label: "Sensibilidade, irritação ou alterações na pele" },
  { name: "eyeSensitivity", label: "Sensibilidade, irritação ou alterações nos olhos" },
  { name: "contactLenses", label: "Uso de lentes de contato" },
  { name: "recentProcedures", label: "Cirurgias ou procedimentos recentes" },
  { name: "previousReactions", label: "Reação anterior a cílios ou procedimentos estéticos" },
  { name: "goalsPreferences", label: "Objetivo e preferências do atendimento" },
  { name: "otherInformation", label: "Outras informações importantes" },
];

const consentFields: Record<string, keyof IntakeValues> = {
  health_data_processing: "consentHealth",
  whatsapp_followup: "consentWhatsappFollowup",
  whatsapp_marketing: "consentWhatsappMarketing",
  ranking_name: "consentRanking",
  image_use: "consentImage",
  instagram_mention: "consentInstagramMention",
};

export function IntakeForm({ initial, hasExisting }: { initial: Partial<IntakeValues>; hasExisting: boolean }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } =
    useForm<IntakeValues>({ defaultValues: { noInstagram: false, ...initial } });
  const noInstagram = watch("noInstagram");

  async function onSubmit(v: IntakeValues) {
    setError(null);
    const result = await sendJson("/api/intake", { ...v, instagram: v.noInstagram ? undefined : v.instagram });
    if (result.ok) { setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (result.fields) for (const [k, m] of Object.entries(result.fields)) setFieldError(k as keyof IntakeValues, { message: m });
    setError(result.message ?? "Não foi possível salvar.");
  }

  if (done) {
    return (
      <Alert tone="success" title="Ficha recebida">
        Obrigada! O Studio foi avisado de que uma nova ficha foi enviada. As informações de saúde não são enviadas por WhatsApp.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10" aria-busy={isSubmitting}>
      <Alert tone="info" title="Como preencher">{INTAKE_INSTRUCTIONS}</Alert>
      {hasExisting && <Alert tone="info">Você já enviou uma ficha. Ao salvar, ela será atualizada e seus consentimentos serão registrados novamente.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <fieldset className="space-y-5">
        <legend className="font-display text-3xl text-espresso">Dados cadastrais</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField id="fullName" label="Nome completo" autoComplete="name" required error={errors.fullName?.message} {...register("fullName", { required: "Informe seu nome" })} />
          <TextField id="phone" type="tel" label="Celular com DDD" autoComplete="tel" required error={errors.phone?.message} {...register("phone", { required: "Informe seu celular" })} />
          <TextField id="birthDate" type="date" label="Data de nascimento" required error={errors.birthDate?.message} {...register("birthDate", { required: "Informe a data" })} />
          <TextField id="instagram" label="Instagram (opcional)" placeholder="@seuperfil" disabled={noInstagram} error={errors.instagram?.message} {...register("instagram")} />
        </div>
        <CheckField id="noInstagram" label="Não possuo Instagram" {...register("noInstagram")} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-3xl text-espresso">Anamnese</legend>
        {questions.map((q) => (
          <TextAreaField key={q.name} id={q.name} label={q.label} rows={3} required error={errors[q.name]?.message as string | undefined}
            {...register(q.name, { required: "Preencha este campo (pode escrever “não” ou “não sei”)" })} />
        ))}
      </fieldset>

      <fieldset className="space-y-5 border border-line bg-ivory p-6">
        <legend className="px-2 font-display text-3xl text-espresso">Autorizações</legend>
        <p className="text-sm text-cocoa">Cada autorização é independente. Somente a primeira é necessária para enviar a ficha; as demais são opcionais e não condicionam o atendimento.</p>
        {intakeConsents.map((c) => {
          const field = consentFields[c.kind] as keyof IntakeValues;
          return (
            <CheckField key={c.kind} id={field} label={c.text} badge={c.required ? "Obrigatória" : "Opcional"}
              error={errors[field]?.message as string | undefined}
              {...register(field, c.required ? { required: "Esta autorização é obrigatória para enviar a ficha" } : {})} />
          );
        })}
      </fieldset>

      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? "Enviando..." : hasExisting ? "Atualizar ficha" : "Enviar ficha"}
      </button>
    </form>
  );
}
