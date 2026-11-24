"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { intakeConsents } from "@/features/privacy/consents";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";

export interface IntakeValues {
  fullName: string; phone: string; birthDate: string; instagram: string; noInstagram: boolean;
  allergies: string; medications: string; healthConditions: string; pregnancyBreastfeeding: string;
  skinSensitivity: string; eyeSensitivity: string; contactLenses: string; recentProcedures: string;
  previousReactions: string; goalsPreferences: string; otherInformation: string;
  consentHealth: boolean; consentWhatsappFollowup: boolean; consentWhatsappMarketing: boolean;
  consentRanking: boolean; consentImage: boolean; consentInstagramMention: boolean;
}

const questions = ["allergies", "medications", "healthConditions", "pregnancyBreastfeeding", "skinSensitivity", "eyeSensitivity", "contactLenses", "recentProcedures", "previousReactions", "goalsPreferences", "otherInformation"] as const;

const consentFields: Record<string, keyof IntakeValues> = {
  health_data_processing: "consentHealth",
  whatsapp_followup: "consentWhatsappFollowup",
  whatsapp_marketing: "consentWhatsappMarketing",
  ranking_name: "consentRanking",
  image_use: "consentImage",
  instagram_mention: "consentInstagramMention",
};

export function IntakeForm({ initial, hasExisting }: { initial: Partial<IntakeValues>; hasExisting: boolean }) {
  const { t, locale } = useI18n();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } =
    useForm<IntakeValues>({ defaultValues: { noInstagram: false, ...initial } });
  const noInstagram = watch("noInstagram");

  async function onSubmit(v: IntakeValues) {
    setError(null);
    const result = await sendJson("/api/intake", { ...v, instagram: v.noInstagram ? undefined : v.instagram });
    if (result.ok) { setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (result.fields) for (const [k, m] of Object.entries(result.fields)) setFieldError(k as keyof IntakeValues, { message: translateMessage(m, locale) });
    setError(translateMessage(result.message ?? "Não foi possível salvar.", locale));
  }

  if (done) {
    return (
      <Alert tone="success" title={t("intake.doneTitle")}>
        {t("intake.doneText")}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10" aria-busy={isSubmitting}>
      <Alert tone="info" title={t("intake.howTitle")}>{t("consent.intakeInstructions")}</Alert>
      {hasExisting && <Alert tone="info">{t("intake.existing")}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <fieldset className="space-y-5">
        <legend className="font-display text-3xl text-espresso">{t("intake.registration")}</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField id="fullName" label={t("intake.fullName")} autoComplete="name" required error={errors.fullName?.message} {...register("fullName", { required: t("intake.reqName") })} />
          <TextField id="phone" type="tel" label={t("intake.phone")} autoComplete="tel" required error={errors.phone?.message} {...register("phone", { required: t("intake.reqPhone") })} />
          <TextField id="birthDate" type="date" label={t("intake.birthDate")} required error={errors.birthDate?.message} {...register("birthDate", { required: t("intake.reqDate") })} />
          <TextField id="instagram" label={t("intake.instagram")} placeholder={t("intake.instagramPh")} disabled={noInstagram} error={errors.instagram?.message} {...register("instagram")} />
        </div>
        <CheckField id="noInstagram" label={t("intake.noInstagram")} {...register("noInstagram")} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-3xl text-espresso">{t("intake.anamnesis")}</legend>
        {questions.map((q) => (
          <TextAreaField key={q} id={q} label={t(`intake.q.${q}`)} rows={3} required error={errors[q]?.message as string | undefined}
            {...register(q, { required: t("intake.reqAnswer") })} />
        ))}
      </fieldset>

      <fieldset className="space-y-5 rounded-media bg-ivory p-6 shadow-soft md:p-8">
        <legend className="px-2 font-display text-3xl text-espresso">{t("intake.consentsTitle")}</legend>
        <p className="text-sm text-cocoa">{t("intake.consentsIntro")}</p>
        {locale !== "pt" && <p className="text-xs text-cocoa/85">{t("consent.note")}</p>}
        {intakeConsents.map((c) => {
          const field = consentFields[c.kind] as keyof IntakeValues;
          return (
            <CheckField key={c.kind} id={field} label={t(`consent.${c.kind}`)} badge={c.required ? t("intake.required") : t("intake.optional")}
              error={errors[field]?.message as string | undefined}
              {...register(field, c.required ? { required: t("intake.reqConsent") } : {})} />
          );
        })}
      </fieldset>

      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? t("app.sending") : hasExisting ? t("intake.update") : t("intake.submit")}
      </button>
    </form>
  );
}
