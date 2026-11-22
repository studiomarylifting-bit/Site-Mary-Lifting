"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";

interface Values { fullName: string; phone: string }

export function ProfileForm({ initial }: { initial: Values }) {
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ defaultValues: initial });

  async function onSubmit(v: Values) {
    setMsg(null);
    const r = await sendJson("/api/profile", v, "PATCH");
    if (r.ok) return setMsg({ tone: "success", text: "Dados atualizados." });
    if (r.fields) for (const [k, m] of Object.entries(r.fields)) setError(k as keyof Values, { message: m });
    setMsg({ tone: "error", text: r.message ?? "Não foi possível salvar." });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <TextField id="fullName" label="Nome completo" autoComplete="name" required error={errors.fullName?.message} {...register("fullName", { required: "Informe seu nome" })} />
      <TextField id="phone" type="tel" label="Celular com DDD" autoComplete="tel" required error={errors.phone?.message} {...register("phone", { required: "Informe seu celular" })} />
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>{isSubmitting ? "Salvando..." : "Salvar alterações"}</button>
    </form>
  );
}
