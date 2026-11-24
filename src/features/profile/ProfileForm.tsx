"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { translateMessage } from "@/i18n/server-messages";


interface Values { fullName: string; phone: string }

export function ProfileForm({ initial }: { initial: Values }) {
  const { t, locale } = useI18n();
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ defaultValues: initial });

  async function onSubmit(v: Values) {
    setMsg(null);
    const r = await sendJson("/api/profile", v, "PATCH");
    if (r.ok) return setMsg({ tone: "success", text: t("account.profile.updated") });
    if (r.fields) for (const [k, m] of Object.entries(r.fields)) setError(k as keyof Values, { message: translateMessage(m, locale) });
    setMsg({ tone: "error", text: translateMessage(r.message ?? "Não foi possível salvar.", locale) });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <TextField id="fullName" label={t("account.profile.fullName")} autoComplete="name" required error={errors.fullName?.message} {...register("fullName", { required: t("account.profile.reqName") })} />
      <TextField id="phone" type="tel" label={t("account.profile.phone")} autoComplete="tel" required error={errors.phone?.message} {...register("phone", { required: t("account.profile.reqPhone") })} />
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>{isSubmitting ? t("account.profile.saving") : t("account.profile.save")}</button>
    </form>
  );
}
