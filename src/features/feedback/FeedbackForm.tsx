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

interface Values {
  rating: string; comment: string; procedureSlug: string; displayName: string;
  anonymize: boolean; publishConsent: boolean; website: string;
}

export function FeedbackForm({ procedures }: { procedures: { slug: string; name: string }[] }) {
  const { t, locale } = useI18n();
  const renderedAt = useRef(Date.now());
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } =
    useForm<Values>({ defaultValues: { rating: "", anonymize: true, publishConsent: false, website: "" } });
  const anonymize = watch("anonymize");

  async function onSubmit(v: Values) {
    setError(null);
    const result = await sendJson("/api/feedback", {
      ...v, rating: Number(v.rating), renderedAt: renderedAt.current,
      displayName: v.anonymize ? undefined : v.displayName,
    });
    if (result.ok) return setDone(true);
    if (result.fields) for (const [k, m] of Object.entries(result.fields)) setFieldError(k as keyof Values, { message: translateMessage(m, locale) });
    setError(translateMessage(result.message ?? "Não foi possível enviar.", locale));
  }

  if (done) {
    return (
      <Alert tone="success" title={t("feedback.form.doneTitle")}>
        {t("feedback.form.doneText")}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6" aria-busy={isSubmitting}>
      {error && <Alert tone="error">{error}</Alert>}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-cocoa">{t("feedback.form.rating")} <span aria-hidden className="text-rose-deep">*</span></legend>
        <div className="flex gap-2" role="radiogroup" aria-label={t("feedback.form.ratingAria")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" value={n} className="peer sr-only" {...register("rating", { required: t("feedback.form.reqRating") })} />
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-ivory font-display text-xl transition-colors hover:border-espresso peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-deep motion-reduce:transition-none">{n}</span>
            </label>
          ))}
        </div>
        {errors.rating && <p className="text-xs text-rose-deep">{errors.rating.message}</p>}
      </fieldset>

      <SelectField id="procedureSlug" label={t("feedback.form.procedure")} placeholder={t("feedback.form.procedurePh")}
        options={procedures.map((p) => ({ value: p.slug, label: p.name }))} {...register("procedureSlug")} />
      <TextAreaField id="comment" label={t("feedback.form.comment")} rows={5} required error={errors.comment?.message}
        {...register("comment", { required: t("feedback.form.reqComment") })} />

      <div className="space-y-4 rounded-card bg-ivory p-5 shadow-soft">
        <CheckField id="anonymize" label={t("feedback.form.anonymize")} {...register("anonymize")} />
        {!anonymize && (
          <TextField id="displayName" label={t("feedback.form.displayName")} autoComplete="given-name" error={errors.displayName?.message}
            hint={t("feedback.form.displayNameHint")} {...register("displayName")} />
        )}
        <CheckField id="publishConsent" label={t("feedback.form.publishConsent")} {...register("publishConsent")} />
        <p className="text-xs text-cocoa/85">{t("feedback.form.privateNote")}</p>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">{t("sac.form.honeypot")}</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? t("app.sending") : t("feedback.form.submit")}
      </button>
    </form>
  );
}
