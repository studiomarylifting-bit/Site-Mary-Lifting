"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";

const types = ["access", "correction", "deletion", "consent_revocation", "export"] as const;

interface Values { email: string; type: string; details: string; website: string }

export function PrivacyRequestForm({ defaultEmail }: { defaultEmail?: string }) {
  const { t, locale } = useI18n();
  const renderedAt = useRef(Date.now());
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } =
    useForm<Values>({ defaultValues: { email: defaultEmail ?? "", website: "" } });

  async function onSubmit(v: Values) {
    setError(null);
    const r = await sendJson("/api/privacy", { ...v, renderedAt: renderedAt.current });
    if (r.ok) return setDone(true);
    if (r.fields) for (const [k, m] of Object.entries(r.fields)) setFieldError(k as keyof Values, { message: translateMessage(m, locale) });
    setError(translateMessage(r.message ?? "Não foi possível enviar.", locale));
  }

  if (done) return <Alert tone="success" title={t("account.privacyForm.doneTitle")}>{t("account.privacyForm.doneText")}</Alert>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      <TextField id="email" type="email" label={t("account.privacyForm.email")} autoComplete="email" required error={errors.email?.message} {...register("email", { required: t("account.privacyForm.reqEmail") })} />
      <SelectField id="type" label={t("account.privacyForm.type")} required placeholder={t("app.select")} options={types.map((value) => ({ value, label: t(`account.privacyForm.${value}`) }))} error={errors.type?.message} {...register("type", { required: t("account.privacyForm.reqType") })} />
      <TextAreaField id="details" label={t("account.privacyForm.details")} rows={4} hint={t("account.privacyForm.detailsHint")} error={errors.details?.message} {...register("details")} />
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">{t("sac.form.honeypot")}</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>{isSubmitting ? t("app.sending") : t("account.privacyForm.submit")}</button>
    </form>
  );
}
