"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";

const types = ["duvida", "agendamento", "procedimento", "pos_atendimento", "financeiro", "privacidade", "reclamacao", "sugestao", "outro"] as const;

interface Values {
  name: string; email: string; phone: string; subject: string; type: string;
  message: string; contactConsent: boolean; website: string;
}

export function SacForm({
  defaults,
  signedIn,
}: {
  defaults?: Partial<Pick<Values, "name" | "email" | "phone" | "subject" | "type">>;
  signedIn: boolean;
}) {
  const { t, locale } = useI18n();
  const renderedAt = useRef(Date.now());
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register, handleSubmit, setError: setFieldError, reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { ...defaults, contactConsent: false, website: "" } });

  async function onSubmit(values: Values) {
    setError(null);
    const result = await sendJson("/api/sac", { ...values, renderedAt: renderedAt.current });
    if (result.ok) {
      setProtocol(String(result.protocol ?? ""));
      reset();
      return;
    }
    if (result.fields) {
      for (const [k, msg] of Object.entries(result.fields)) setFieldError(k as keyof Values, { message: translateMessage(msg, locale) });
    }
    setError(translateMessage(result.message ?? "Não foi possível enviar.", locale));
  }

  if (protocol) {
    return (
      <Alert tone="success" title={t("sac.form.doneTitle")}>
        {t("sac.form.doneKeep")}<strong className="font-medium">{protocol}</strong>.
        {signedIn ? t("sac.form.doneSigned") : t("sac.form.doneAnon")}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6" aria-busy={isSubmitting}>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-6 md:grid-cols-2">
        <TextField id="name" label={t("sac.form.name")} autoComplete="name" required error={errors.name?.message} {...register("name", { required: t("sac.form.reqName") })} />
        <TextField id="email" type="email" label={t("sac.form.email")} autoComplete="email" required error={errors.email?.message} {...register("email", { required: t("sac.form.reqEmail") })} />
        <TextField id="phone" type="tel" label={t("sac.form.phone")} autoComplete="tel" placeholder="(11) 99999-9999" required error={errors.phone?.message} {...register("phone", { required: t("sac.form.reqPhone") })} />
        <SelectField id="type" label={t("sac.form.type")} required placeholder={t("app.select")} options={types.map((value) => ({ value, label: t(`sac.types.${value}`) }))} error={errors.type?.message} {...register("type", { required: t("sac.form.reqType") })} />
      </div>
      <TextField id="subject" label={t("sac.form.subject")} required error={errors.subject?.message} {...register("subject", { required: t("sac.form.reqSubject") })} />
      <TextAreaField id="message" label={t("sac.form.message")} rows={6} required hint={t("sac.form.messageHint")} error={errors.message?.message} {...register("message", { required: t("sac.form.reqMessage") })} />
      <CheckField id="contactConsent" label={t("consent.sac_contact")} error={errors.contactConsent?.message} {...register("contactConsent", { required: t("sac.form.reqConsent") })} />
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">{t("sac.form.honeypot")}</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? t("app.sending") : t("sac.form.submit")}
      </button>
    </form>
  );
}
